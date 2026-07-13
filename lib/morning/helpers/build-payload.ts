import { getMorningPluginId, isMorningSignedEnabled } from "../config";
import { VAT_TYPES, type PaymentTypeCode } from "../constants";
import type {
  CreateDocumentRequest,
  CreateInvoiceInput,
  CreateReceiptInput,
  MorningClientPayload,
  MorningIncomeLine,
  PaymentFormRequest,
  PaymentLinkInput,
} from "../types";
import type { DocumentCatalogItem, DocumentKind } from "./catalog";
import { getCatalogItem } from "./catalog";
import type { DocumentTypeCode } from "../constants";

/** Israel business date — avoids UTC midnight shifting payment date to "tomorrow" */
function todayIsrael(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
}

export function buildClientPayload(input: {
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
  forceAdd?: boolean;
}): MorningClientPayload {
  const useExisting = Boolean(input.giClientId) && !input.forceAdd;
  const client: MorningClientPayload = {
    name: input.clientName.trim(),
    add: !useExisting,
  };
  if (useExisting && input.giClientId) client.id = input.giClientId;
  if (input.clientEmail?.trim()) client.emails = [input.clientEmail.trim()];
  return client;
}

export function buildIncomeLine(
  description: string,
  amount: number,
  currency: string,
  vatIncluded: boolean
): MorningIncomeLine {
  return {
    description,
    quantity: 1,
    price: roundMoney(amount),
    currency,
    /** Row-level: 1 = price includes VAT, 0 = before VAT */
    vatType: vatIncluded ? VAT_TYPES.VAT_INCLUDED : VAT_TYPES.BEFORE_VAT,
  };
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function baseDocumentFields(
  catalog: DocumentCatalogItem,
  input: {
    clientName: string;
    clientEmail?: string;
    giClientId?: string;
    forceAddClient?: boolean;
    amount: number;
    currency: string;
    description: string;
    project?: string;
    sendEmail?: boolean;
    linkedDocumentIds?: string[];
    signed?: boolean;
  }
): CreateDocumentRequest {
  const description = input.description.trim() || input.project?.trim() || catalog.label;
  const amount = roundMoney(input.amount);

  return {
    type: catalog.type,
    description,
    remarks: input.project?.trim() || undefined,
    lang: "he",
    currency: input.currency as "ILS" | "USD",
    /** Document-level: 0 = use business default VAT rules (Morning API requirement) */
    vatType: VAT_TYPES.BEFORE_VAT,
    date: todayIsrael(),
    signed: input.signed ?? isMorningSignedEnabled(),
    rounding: true,
    client: buildClientPayload({
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      giClientId: input.giClientId,
      forceAdd: input.forceAddClient,
    }),
    income: [buildIncomeLine(description, amount, input.currency, catalog.vatIncluded)],
    emailContent: input.sendEmail ? `מצורף ${catalog.label}: ${description}` : undefined,
    linkedDocumentIds: input.linkedDocumentIds,
  };
}

export function buildDocumentPayload(
  kind: DocumentKind,
  input: CreateReceiptInput &
    CreateInvoiceInput & {
      paymentType?: PaymentTypeCode;
      linkedDocumentIds?: string[];
      signed?: boolean;
      forceAddClient?: boolean;
    }
): CreateDocumentRequest {
  const catalog = getCatalogItem(kind);
  const currency = input.currency ?? "ILS";
  const amount = roundMoney(input.amount);
  const payload = baseDocumentFields(catalog, {
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    giClientId: input.giClientId,
    forceAddClient: input.forceAddClient,
    amount,
    currency,
    description: input.description,
    project: input.project,
    sendEmail: input.sendEmail,
    linkedDocumentIds: input.linkedDocumentIds,
    signed: input.signed,
  });

  if (catalog.needsPayment) {
    payload.payment = [
      {
        date: input.paymentDate ?? todayIsrael(),
        type: input.paymentType ?? 4,
        price: amount,
        currency,
      },
    ];
  }

  return payload;
}

export function buildRawDocumentPayload(
  type: DocumentTypeCode,
  input: CreateReceiptInput &
    CreateInvoiceInput & {
      paymentType?: PaymentTypeCode;
      vatIncluded?: boolean;
      needsPayment?: boolean;
    }
): CreateDocumentRequest {
  const vatIncluded = input.vatIncluded ?? false;
  const currency = input.currency ?? "ILS";
  const amount = roundMoney(input.amount);
  const description = input.description?.trim() || input.project?.trim() || "מסמך";
  const payload: CreateDocumentRequest = {
    type,
    description,
    remarks: input.project?.trim() || undefined,
    lang: "he",
    currency,
    vatType: VAT_TYPES.BEFORE_VAT,
    date: todayIsrael(),
    signed: isMorningSignedEnabled(),
    rounding: true,
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, amount, currency, vatIncluded)],
    emailContent: input.sendEmail ? `מצורף: ${description}` : undefined,
  };

  if (input.needsPayment) {
    payload.payment = [
      {
        date: input.paymentDate ?? todayIsrael(),
        type: input.paymentType ?? 4,
        price: amount,
        currency,
      },
    ];
  }

  return payload;
}

export function buildReceiptPayload(input: CreateReceiptInput): CreateDocumentRequest {
  return buildDocumentPayload("receipt", input);
}

export function buildInvoicePayload(input: CreateInvoiceInput): CreateDocumentRequest {
  return buildDocumentPayload("invoice", input);
}

export function buildPaymentFormPayload(
  input: PaymentLinkInput,
  notifyUrl?: string
): PaymentFormRequest {
  const currency = input.currency ?? "ILS";
  const description = input.description?.trim() || input.project?.trim() || "בקשת תשלום";
  const amount = roundMoney(input.amount);

  return {
    description,
    type: 305,
    lang: "he",
    currency,
    vatType: VAT_TYPES.BEFORE_VAT,
    amount,
    maxPayments: 1,
    pluginId: getMorningPluginId(),
    group: 100,
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, amount, currency, false)],
    remarks: input.project,
    notifyUrl,
    custom: input.incomeId ?? input.clientId ?? undefined,
  };
}

export function documentKindToType(kind: DocumentKind): DocumentTypeCode {
  return getCatalogItem(kind).type;
}
