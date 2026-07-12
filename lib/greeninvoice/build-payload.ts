import type {
  CreateInvoiceInput,
  CreateReceiptInput,
  GiClientPayload,
  GiCreateDocumentRequest,
  GiIncomeLine,
  GiPaymentFormRequest,
  GiPaymentLine,
  PaymentLinkInput,
} from "./types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildClientPayload(input: {
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
}): GiClientPayload {
  const client: GiClientPayload = {
    name: input.clientName,
    add: !input.giClientId,
  };
  if (input.giClientId) client.id = input.giClientId;
  if (input.clientEmail) client.emails = [input.clientEmail];
  return client;
}

export function buildIncomeLine(description: string, amount: number, currency: string): GiIncomeLine {
  return {
    description,
    quantity: 1,
    price: amount,
    currency,
    vatType: 0,
  };
}

export function buildReceiptPayload(input: CreateReceiptInput): GiCreateDocumentRequest {
  const currency = input.currency ?? "ILS";
  const description = input.description || input.project || "קבלה";
  const paymentDate = input.paymentDate ?? today();

  return {
    type: 400,
    description,
    remarks: input.project,
    lang: "he",
    currency,
    vatType: 0,
    date: paymentDate,
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, input.amount, currency)],
    payment: [
      {
        date: paymentDate,
        type: input.paymentType ?? 4,
        price: input.amount,
        currency,
      },
    ],
    emailContent: input.sendEmail ? `מצורפת קבלה עבור: ${description}` : undefined,
  };
}

export function buildInvoicePayload(input: CreateInvoiceInput): GiCreateDocumentRequest {
  const currency = input.currency ?? "ILS";
  const description = input.description || input.project || "חשבונית מס";

  return {
    type: 305,
    description,
    remarks: input.project,
    lang: "he",
    currency,
    vatType: 0,
    date: today(),
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, input.amount, currency)],
    emailContent: input.sendEmail ? `מצורפת חשבונית עבור: ${description}` : undefined,
  };
}

export function buildPaymentFormPayload(
  input: PaymentLinkInput,
  notifyUrl?: string
): GiPaymentFormRequest {
  const currency = input.currency ?? "ILS";
  const description = input.description || input.project || "בקשת תשלום";

  return {
    description,
    type: 305,
    lang: "he",
    currency,
    vatType: 0,
    amount: input.amount,
    maxPayments: 1,
    pluginId: process.env.GREENINVOICE_PLUGIN_ID,
    group: 100,
    client: buildClientPayload(input),
    income: [buildIncomeLine(description, input.amount, currency)],
    remarks: input.project,
    notifyUrl,
    custom: input.incomeId ?? input.clientId ?? undefined,
  };
}
