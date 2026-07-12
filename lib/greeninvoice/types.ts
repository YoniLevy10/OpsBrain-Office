export type GiDocumentType = 10 | 305 | 320 | 330 | 400 | 405;

export type GiPaymentTypeCode = 0 | 1 | 2 | 3 | 4 | 5 | 10 | 11;

export type GiActionType =
  | "receipt"
  | "invoice"
  | "invoice_receipt"
  | "quote"
  | "credit"
  | "payment_link"
  | "send_email"
  | "credit_note";

export type GiActionStatus = "pending" | "issued" | "sent" | "paid" | "failed";

export type IncomeSource = "manual" | "sync" | "created";

export interface GiClientPayload {
  id?: string;
  name: string;
  emails?: string[];
  taxId?: string;
  phone?: string;
  mobile?: string;
  add?: boolean;
}

export interface GiIncomeLine {
  description: string;
  quantity: number;
  price: number;
  currency: string;
  vatType?: number;
}

export interface GiPaymentLine {
  date: string;
  type: GiPaymentTypeCode;
  price: number;
  currency: string;
}

export interface GiCreateDocumentRequest {
  type: GiDocumentType;
  description: string;
  remarks?: string;
  lang: "he" | "en";
  currency: "ILS" | "USD";
  vatType: 0 | 1 | 2;
  date?: string;
  signed?: boolean;
  client: GiClientPayload;
  income: GiIncomeLine[];
  payment?: GiPaymentLine[];
  emailContent?: string;
  linkedDocumentIds?: string[];
}

export interface GiDocumentResponse {
  id: string;
  number?: number | string;
  signed?: boolean;
  lang?: string;
  url?: { origin?: string; he?: string; en?: string };
}

export interface GiPreviewResponse {
  file?: string;
}

export interface GiDownloadLinks {
  he?: string;
  en?: string;
  origin?: string;
}

export interface GiPaymentFormRequest {
  description: string;
  type: 305 | 320;
  lang: "he" | "en";
  currency: "ILS" | "USD";
  vatType: 0 | 1 | 2;
  amount: number;
  maxPayments?: number;
  pluginId?: string;
  group?: number;
  client: GiClientPayload;
  income: GiIncomeLine[];
  remarks?: string;
  successUrl?: string;
  failureUrl?: string;
  notifyUrl?: string;
  custom?: string;
}

export interface GiPaymentFormResponse {
  errorCode?: number;
  url?: string;
  errorMessage?: string;
}

export interface GiSendDocumentRequest {
  emails?: string[];
  emailContent?: string;
}

export interface CreateReceiptInput {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
  amount: number;
  currency?: "ILS" | "USD";
  description: string;
  project?: string;
  paymentType?: GiPaymentTypeCode;
  paymentDate?: string;
  sendEmail?: boolean;
  incomeId?: string;
}

export interface CreateInvoiceInput {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
  amount: number;
  currency?: "ILS" | "USD";
  description: string;
  project?: string;
  sendEmail?: boolean;
  incomeId?: string;
}

export interface PaymentLinkInput {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
  amount: number;
  currency?: "ILS" | "USD";
  description: string;
  project?: string;
  incomeId?: string;
  giDocumentId?: string;
}

export interface GiActionResult {
  ok: boolean;
  error?: string;
  documentId?: string;
  documentNumber?: string;
  paymentLinkUrl?: string;
  pdfUrl?: string;
  incomeId?: string;
  sent?: boolean;
}
