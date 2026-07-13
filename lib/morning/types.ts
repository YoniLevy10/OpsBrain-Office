import type { CurrencyCode, DocumentTypeCode, PaymentTypeCode, VatTypeCode } from "./constants";

export type MorningLang = "he" | "en";

export type SearchResult<T> = {
  items?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
};

// ─── Shared ───────────────────────────────────────────────────────────────────

export type MorningClientPayload = {
  id?: string;
  name: string;
  emails?: string[];
  taxId?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  add?: boolean;
  labels?: string[];
  accountingKey?: string;
};

export type MorningIncomeLine = {
  description: string;
  quantity: number;
  price: number;
  currency: string;
  vatType?: VatTypeCode;
  sku?: string;
};

export type MorningPaymentLine = {
  date: string;
  type: PaymentTypeCode;
  price: number;
  currency: string;
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;
  chequeNum?: string;
  cardNum?: string;
  cardType?: number;
  dealType?: number;
  numPayments?: number;
};

// ─── Documents ────────────────────────────────────────────────────────────────

export type CreateDocumentRequest = {
  type: DocumentTypeCode;
  description: string;
  remarks?: string;
  lang: MorningLang;
  currency: CurrencyCode;
  vatType: VatTypeCode;
  date?: string;
  dueDate?: string;
  signed?: boolean;
  rounding?: boolean;
  client: MorningClientPayload;
  income: MorningIncomeLine[];
  payment?: MorningPaymentLine[];
  emailContent?: string;
  linkedDocumentIds?: string[];
  discount?: { amount?: number; type?: number };
};

export type DocumentResponse = {
  id: string;
  number?: number | string;
  type?: DocumentTypeCode;
  status?: number;
  signed?: boolean;
  lang?: MorningLang;
  url?: { origin?: string; he?: string; en?: string };
  client?: MorningClientPayload;
  amount?: number;
  vat?: number;
  documentDate?: string;
};

export type DocumentSearchRequest = {
  type?: DocumentTypeCode | DocumentTypeCode[];
  fromDate?: string;
  toDate?: string;
  clientId?: string;
  clientName?: string;
  status?: number | number[];
  sort?: string;
  page?: number;
  pageSize?: number;
};

export type DocumentPaymentSearchRequest = {
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
};

export type SendDocumentRequest = {
  emails?: string[];
  emailContent?: string;
};

export type PreviewResponse = { file?: string };

export type DownloadLinks = { he?: string; en?: string; origin?: string };

// ─── Clients ──────────────────────────────────────────────────────────────────

export type ClientRecord = MorningClientPayload & {
  id: string;
  active?: boolean;
  balance?: number;
  incomeAmount?: number;
  paymentAmount?: number;
};

export type ClientSearchRequest = {
  active?: boolean;
  name?: string;
  taxId?: string;
  page?: number;
  pageSize?: number;
};

export type ClientAssocRequest = { documentIds: string[] };
export type ClientMergeRequest = { sourceClientId: string };
export type ClientBalanceRequest = { balance: number };

// ─── Businesses ───────────────────────────────────────────────────────────────

export type BusinessRecord = {
  id?: string;
  name?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  type?: number;
  address?: string;
  city?: string;
};

export type BusinessFileUpload = {
  type: "logo" | "signature" | "deduction" | "bookkeeping";
  file: string;
  extension?: string;
};

export type BusinessNumbering = Record<string, number>;

// ─── Suppliers ────────────────────────────────────────────────────────────────

export type SupplierRecord = {
  id?: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  active?: boolean;
};

export type SupplierSearchRequest = {
  active?: boolean;
  name?: string;
  page?: number;
  pageSize?: number;
};

// ─── Items ────────────────────────────────────────────────────────────────────

export type ItemRecord = {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  currency?: CurrencyCode;
  vatType?: VatTypeCode;
  sku?: string;
};

export type ItemSearchRequest = {
  name?: string;
  sku?: string;
  page?: number;
  pageSize?: number;
};

// ─── Expenses ─────────────────────────────────────────────────────────────────

export type ExpenseRecord = {
  id?: string;
  number?: string;
  status?: number;
  documentType?: number;
  amount?: number;
  vat?: number;
  currency?: CurrencyCode;
  description?: string;
  supplierName?: string;
  documentDate?: string;
};

export type ExpenseSearchRequest = {
  fromDate?: string;
  toDate?: string;
  status?: number;
  page?: number;
  pageSize?: number;
};

export type ExpenseDraftSearchRequest = {
  page?: number;
  pageSize?: number;
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentFormRequest = {
  description: string;
  type: 305 | 320;
  lang: MorningLang;
  currency: CurrencyCode;
  vatType: VatTypeCode;
  amount: number;
  maxPayments?: number;
  pluginId?: string;
  group?: number;
  client: MorningClientPayload;
  income: MorningIncomeLine[];
  remarks?: string;
  successUrl?: string;
  failureUrl?: string;
  notifyUrl?: string;
  custom?: string;
};

export type PaymentFormResponse = {
  errorCode?: number;
  url?: string;
  errorMessage?: string;
};

export type PaymentTokenSearchRequest = {
  page?: number;
  pageSize?: number;
};

export type ChargeTokenRequest = {
  amount: number;
  currency: CurrencyCode;
  description?: string;
};

// ─── Partners ─────────────────────────────────────────────────────────────────

export type PartnerUser = {
  email?: string;
  name?: string;
  status?: string;
};

export type PartnerConnectionRequest = { email: string };

// ─── Reference (cache API) ────────────────────────────────────────────────────

export type Occupation = { id: number; name: string };
export type Country = { code: string; name: string };
export type City = { id: number; name: string };
export type ExchangeRate = { base: string; rates: Record<string, number> };

// ─── High-level app types (OpsBrain helpers) ──────────────────────────────────

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

export type CreateReceiptInput = {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
  amount: number;
  currency?: CurrencyCode;
  description: string;
  project?: string;
  paymentType?: PaymentTypeCode;
  paymentDate?: string;
  sendEmail?: boolean;
  incomeId?: string;
};

export type CreateInvoiceInput = {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
  amount: number;
  currency?: CurrencyCode;
  description: string;
  project?: string;
  sendEmail?: boolean;
  incomeId?: string;
};

export type PaymentLinkInput = {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  giClientId?: string;
  amount: number;
  currency?: CurrencyCode;
  description: string;
  project?: string;
  incomeId?: string;
  giDocumentId?: string;
};

export type GiActionResult = {
  ok: boolean;
  error?: string;
  documentId?: string;
  documentNumber?: string;
  paymentLinkUrl?: string;
  pdfUrl?: string;
  incomeId?: string;
  sent?: boolean;
};
