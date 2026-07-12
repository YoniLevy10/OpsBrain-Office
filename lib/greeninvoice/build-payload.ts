import type {
  CreateInvoiceInput,
  CreateReceiptInput,
  GiClientPayload,
  GiCreateDocumentRequest,
  GiIncomeLine,
  GiPaymentFormRequest,
  GiPaymentLine,
  PaymentLinkInput,
  GiDocumentType,
  GiPaymentTypeCode,
} from "./types";
import type { DocumentCatalogItem } from "./catalog";
import { getCatalogItem, type DocumentKind } from "./catalog";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildClientPayload(input: {
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
}): GiClientPayload {
  const client: GiClientPayload = {
    name: input.clientName.trim(),
    add: !input.giClientId,
  };
  if (input.giClientId) client.id = input.giClientId;
  if (input.clientEmail?.trim()) client.emails = [input.clientEmail.trim()];
  return client;
}

export function buildIncomeLine(
  description: string,
  amount: number,
  currency: string,
  vatIncluded: boolean
): GiIncomeLine {
  return {
    description,
    quantity: 1,
    price: amount,
    currency,
    vatType: vatIncluded ? 1 : 0,
  };
}

function baseDocumentFields(
  catalog: DocumentCatalogItem,
  input: {
    clientName: string;
    clientEmail?: string;
    giClientId?: string;
    amount: number;
    currency: string;
    description: string;
    project?: string;
    sendEmail?: boolean;
  }
): GiCreateDocumentRequest {
  const description = input.description.trim() || input.project?.trim() || catalog.label;

  return {
    type: catalog.type,
    description,
    remarks: input.project?.trim() || undefined,
    lang: "he",
    currency: input.currency as "ILS" | "USD",
    vatType: catalog.vatIncluded ? 1 : 0,
    date: today(),
    signed: true,
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, input.amount, input.currency, catalog.vatIncluded)],
    emailContent: input.sendEmail ? `מצורף ${catalog.label}: ${description}` : undefined,
  };
}

export function buildDocumentPayload(
  kind: DocumentKind,
  input: CreateReceiptInput & CreateInvoiceInput & { paymentType?: GiPaymentTypeCode }
): GiCreateDocumentRequest {
  const catalog = getCatalogItem(kind);
  const currency = input.currency ?? "ILS";
  const payload = baseDocumentFields(catalog, {
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    giClientId: input.giClientId,
    amount: input.amount,
    currency,
    description: input.description,
    project: input.project,
    sendEmail: input.sendEmail,
  });

  if (catalog.needsPayment) {
    const paymentDate = input.paymentDate ?? today();
    payload.payment = [
      {
        date: paymentDate,
        type: input.paymentType ?? 4,
        price: input.amount,
        currency,
      },
    ];
  }

  return payload;
}

/** @deprecated use buildDocumentPayload('receipt', ...) */
export function buildReceiptPayload(input: CreateReceiptInput): GiCreateDocumentRequest {
  return buildDocumentPayload("receipt", input);
}

/** @deprecated use buildDocumentPayload('invoice', ...) */
export function buildInvoicePayload(input: CreateInvoiceInput): GiCreateDocumentRequest {
  return buildDocumentPayload("invoice", input);
}

export function buildPaymentFormPayload(
  input: PaymentLinkInput,
  notifyUrl?: string
): GiPaymentFormRequest {
  const currency = input.currency ?? "ILS";
  const description = input.description?.trim() || input.project?.trim() || "בקשת תשלום";

  return {
    description,
    type: 305,
    lang: "he",
    currency,
    vatType: 0,
    amount: input.amount,
    maxPayments: 1,
    pluginId: process.env.GREENINVOICE_PLUGIN_ID || undefined,
    group: 100,
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, input.amount, currency, false)],
    remarks: input.project,
    notifyUrl,
    custom: input.incomeId ?? input.clientId ?? undefined,
  };
}

export function documentKindToType(kind: DocumentKind): GiDocumentType {
  return getCatalogItem(kind).type;
}
