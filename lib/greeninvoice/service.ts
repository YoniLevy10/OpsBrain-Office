import { isGreenInvoiceConfigured } from "../greeninvoice";
import {
  buildInvoicePayload,
  buildPaymentFormPayload,
  buildReceiptPayload,
} from "./build-payload";
import {
  createDocument,
  getDocumentDownloadLinks,
  previewDocument,
  sendDocument,
} from "./documents";
import { getPaymentFormUrl, getWebhookNotifyUrl } from "./payments";
import {
  getClientGiId,
  logGiAction,
  persistCreatedIncome,
} from "./action-log";
import type {
  CreateInvoiceInput,
  CreateReceiptInput,
  GiActionResult,
  GiCreateDocumentRequest,
  PaymentLinkInput,
} from "./types";

function notConfigured(): GiActionResult {
  return { ok: false, error: "חשבונית ירוקה לא מחוברת" };
}

async function resolveGiClientId(clientId?: string): Promise<string | undefined> {
  if (!clientId) return undefined;
  const giId = await getClientGiId(clientId);
  return giId ?? undefined;
}

async function afterDocumentCreated(
  doc: { id: string; number?: number | string; url?: { origin?: string; he?: string; en?: string } },
  params: {
    actionType: "receipt" | "invoice" | "payment_link";
    clientId?: string;
    clientName: string;
    project?: string;
    amount: number;
    currency: string;
    documentType: number;
    status: string;
    incomeId?: string;
    paymentLinkUrl?: string;
    sendEmail?: boolean;
    clientEmail?: string;
  }
): Promise<GiActionResult> {
  const pdfUrl = doc.url?.he || doc.url?.origin || doc.url?.en;
  let sent = false;

  if (params.sendEmail && params.clientEmail) {
    try {
      await sendDocument(doc.id, {
        emails: [params.clientEmail],
        emailContent: `מסמך מספר ${doc.number ?? ""} מצורף`,
      });
      sent = true;
      await logGiAction({
        incomeId: params.incomeId,
        clientId: params.clientId,
        giDocumentId: doc.id,
        actionType: "send_email",
        status: "sent",
        sentTo: [params.clientEmail],
        amount: params.amount,
        currency: params.currency,
      });
    } catch {
      /* send is best-effort */
    }
  }

  const incomeId = await persistCreatedIncome({
    giDocumentId: doc.id,
    giDocumentType: params.documentType,
    clientId: params.clientId,
    clientName: params.clientName,
    project: params.project,
    amount: params.amount,
    currency: params.currency,
    invoiceNumber: doc.number != null ? String(doc.number) : undefined,
    status: params.status,
    paymentLinkUrl: params.paymentLinkUrl,
    pdfUrl,
    incomeId: params.incomeId,
  });

  await logGiAction({
    incomeId: incomeId ?? params.incomeId,
    clientId: params.clientId,
    giDocumentId: doc.id,
    actionType: params.actionType,
    status: sent ? "sent" : "issued",
    paymentLinkUrl: params.paymentLinkUrl,
    amount: params.amount,
    currency: params.currency,
    metadata: { number: doc.number },
  });

  return {
    ok: true,
    documentId: doc.id,
    documentNumber: doc.number != null ? String(doc.number) : undefined,
    paymentLinkUrl: params.paymentLinkUrl,
    pdfUrl,
    incomeId: incomeId ?? params.incomeId,
    sent,
  };
}

export async function issueReceipt(input: CreateReceiptInput): Promise<GiActionResult> {
  if (!isGreenInvoiceConfigured()) return notConfigured();

  const giClientId = input.giClientId ?? (await resolveGiClientId(input.clientId));
  const payload = buildReceiptPayload({ ...input, giClientId });

  try {
    const doc = await createDocument(payload);
    return afterDocumentCreated(doc, {
      actionType: "receipt",
      clientId: input.clientId,
      clientName: input.clientName,
      project: input.project ?? input.description,
      amount: input.amount,
      currency: input.currency ?? "ILS",
      documentType: 400,
      status: "שולם",
      incomeId: input.incomeId,
      sendEmail: input.sendEmail,
      clientEmail: input.clientEmail,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה ביצירת קבלה";
    await logGiAction({
      incomeId: input.incomeId,
      clientId: input.clientId,
      actionType: "receipt",
      status: "failed",
      amount: input.amount,
      currency: input.currency ?? "ILS",
      errorMessage: msg,
    });
    return { ok: false, error: msg };
  }
}

export async function issueInvoice(input: CreateInvoiceInput): Promise<GiActionResult> {
  if (!isGreenInvoiceConfigured()) return notConfigured();

  const giClientId = input.giClientId ?? (await resolveGiClientId(input.clientId));
  const payload = buildInvoicePayload({ ...input, giClientId });

  try {
    const doc = await createDocument(payload);
    return afterDocumentCreated(doc, {
      actionType: "invoice",
      clientId: input.clientId,
      clientName: input.clientName,
      project: input.project ?? input.description,
      amount: input.amount,
      currency: input.currency ?? "ILS",
      documentType: 305,
      status: "ממתין",
      incomeId: input.incomeId,
      sendEmail: input.sendEmail,
      clientEmail: input.clientEmail,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה ביצירת חשבונית";
    await logGiAction({
      incomeId: input.incomeId,
      clientId: input.clientId,
      actionType: "invoice",
      status: "failed",
      amount: input.amount,
      currency: input.currency ?? "ILS",
      errorMessage: msg,
    });
    return { ok: false, error: msg };
  }
}

export async function createPaymentLink(input: PaymentLinkInput): Promise<GiActionResult> {
  if (!isGreenInvoiceConfigured()) return notConfigured();

  const giClientId = input.giClientId ?? (await resolveGiClientId(input.clientId));
  const notifyUrl = getWebhookNotifyUrl();

  try {
    let documentId = input.giDocumentId;
    let documentNumber: string | undefined;

    if (!documentId) {
      const invoiceResult = await issueInvoice({
        clientId: input.clientId,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        giClientId,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        project: input.project,
        incomeId: input.incomeId,
      });
      if (!invoiceResult.ok || !invoiceResult.documentId) {
        return invoiceResult;
      }
      documentId = invoiceResult.documentId;
      documentNumber = invoiceResult.documentNumber;
    }

    const formPayload = buildPaymentFormPayload(
      { ...input, giClientId },
      notifyUrl
    );

    const paymentUrl = await getPaymentFormUrl(formPayload);

    const incomeId = await persistCreatedIncome({
      giDocumentId: documentId!,
      giDocumentType: 305,
      clientId: input.clientId,
      clientName: input.clientName,
      project: input.project ?? input.description,
      amount: input.amount,
      currency: input.currency ?? "ILS",
      invoiceNumber: documentNumber,
      status: "ממתין",
      paymentLinkUrl: paymentUrl,
      incomeId: input.incomeId,
    });

    await logGiAction({
      incomeId: incomeId ?? input.incomeId,
      clientId: input.clientId,
      giDocumentId: documentId,
      actionType: "payment_link",
      status: "issued",
      paymentLinkUrl: paymentUrl,
      amount: input.amount,
      currency: input.currency ?? "ILS",
    });

    return {
      ok: true,
      documentId,
      documentNumber,
      paymentLinkUrl: paymentUrl,
      incomeId: incomeId ?? input.incomeId,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה ביצירת קישור תשלום";
    await logGiAction({
      incomeId: input.incomeId,
      clientId: input.clientId,
      actionType: "payment_link",
      status: "failed",
      amount: input.amount,
      currency: input.currency ?? "ILS",
      errorMessage: msg,
    });
    return { ok: false, error: msg };
  }
}

export async function previewGiDocument(payload: GiCreateDocumentRequest): Promise<GiActionResult & { previewBase64?: string }> {
  if (!isGreenInvoiceConfigured()) return notConfigured();
  try {
    const res = await previewDocument(payload);
    return { ok: true, previewBase64: res.file };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה בתצוגה מקדימה" };
  }
}

export async function sendGiDocument(
  documentId: string,
  emails: string[],
  incomeId?: string,
  clientId?: string
): Promise<GiActionResult> {
  if (!isGreenInvoiceConfigured()) return notConfigured();
  try {
    await sendDocument(documentId, { emails });
    await logGiAction({
      incomeId,
      clientId,
      giDocumentId: documentId,
      actionType: "send_email",
      status: "sent",
      sentTo: emails,
    });
    return { ok: true, documentId, sent: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה בשליחה" };
  }
}

export async function fetchGiPdfUrl(documentId: string): Promise<GiActionResult> {
  if (!isGreenInvoiceConfigured()) return notConfigured();
  try {
    const links = await getDocumentDownloadLinks(documentId);
    const pdfUrl = links.he || links.origin || links.en;
    if (!pdfUrl) return { ok: false, error: "לא נמצא קישור PDF" };
    return { ok: true, documentId, pdfUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה בהורדה" };
  }
}
