import { getMorningPluginId } from "../config";
import type { PaymentTypeCode } from "../constants";
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

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildClientPayload(input: {
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
}): MorningClientPayload {
  const client: MorningClientPayload = {
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
): MorningIncomeLine {
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
    linkedDocumentIds?: string[];
  }
): CreateDocumentRequest {
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
    linkedDocumentIds: input.linkedDocumentIds,
  };
}

export function buildDocumentPayload(
  kind: DocumentKind,
  input: CreateReceiptInput &
    CreateInvoiceInput & {
      paymentType?: PaymentTypeCode;
      linkedDocumentIds?: string[];
    }
): CreateDocumentRequest {
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
    linkedDocumentIds: input.linkedDocumentIds,
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
  const description = input.description?.trim() || input.project?.trim() || "מסמך";
  const payload: CreateDocumentRequest = {
    type,
    description,
    remarks: input.project?.trim() || undefined,
    lang: "he",
    currency,
    vatType: vatIncluded ? 1 : 0,
    date: today(),
    signed: true,
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, input.amount, currency, vatIncluded)],
    emailContent: input.sendEmail ? `מצורף: ${description}` : undefined,
  };

  if (input.needsPayment) {
    payload.payment = [
      {
        date: input.paymentDate ?? today(),
        type: input.paymentType ?? 4,
        price: input.amount,
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

  return {
    description,
    type: 305,
    lang: "he",
    currency,
    vatType: 0,
    amount: input.amount,
    maxPayments: 1,
    pluginId: getMorningPluginId(),
    group: 100,
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, input.amount, currency, false)],
    remarks: input.project,
    notifyUrl,
    custom: input.incomeId ?? input.clientId ?? undefined,
  };
}

export function documentKindToType(kind: DocumentKind): DocumentTypeCode {
  return getCatalogItem(kind).type;
}
