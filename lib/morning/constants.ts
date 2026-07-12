/** All document type codes supported by Morning API */
export const DOCUMENT_TYPES = {
  QUOTE: 10,
  ORDER: 100,
  DELIVERY_NOTE: 200,
  RETURN_DELIVERY_NOTE: 210,
  TRANSACTION_ACCOUNT: 300,
  TAX_INVOICE: 305,
  TAX_INVOICE_RECEIPT: 320,
  CREDIT_INVOICE: 330,
  RECEIPT: 400,
  DONATION_RECEIPT: 405,
  PURCHASE_ORDER: 500,
  DEPOSIT_RECEIPT: 600,
  DEPOSIT_WITHDRAWAL: 610,
} as const;

export type DocumentTypeCode = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

/** Document types typically synced as income */
export const INCOME_DOCUMENT_TYPES: DocumentTypeCode[] = [
  300, 305, 320, 330, 400, 405,
];

/** Document types that imply payment received */
export const PAID_DOCUMENT_TYPES = new Set<DocumentTypeCode>([320, 400, 405]);

/** Document types that require a payment array on create */
export const PAYMENT_REQUIRED_DOCUMENT_TYPES = new Set<DocumentTypeCode>([320, 400, 405]);

export const DOCUMENT_STATUSES = {
  OPEN: 0,
  CLOSED: 1,
  MANUALLY_CLOSED: 2,
  CANCELING: 3,
  CANCELED: 4,
} as const;

export const PAYMENT_TYPES = {
  UNPAID: -1,
  DEDUCTION: 0,
  CASH: 1,
  CHECK: 2,
  CREDIT_CARD: 3,
  BANK_TRANSFER: 4,
  PAYPAL: 5,
  PAYMENT_APP: 10,
  OTHER: 11,
} as const;

export type PaymentTypeCode = (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES];

export const VAT_TYPES = {
  BEFORE_VAT: 0,
  VAT_INCLUDED: 1,
  VAT_EXEMPT: 2,
} as const;

export type VatTypeCode = (typeof VAT_TYPES)[keyof typeof VAT_TYPES];

export const EXPENSE_STATUSES = {
  OPEN: 10,
  REPORTED: 20,
} as const;

export const EXPENSE_DOCUMENT_TYPES = {
  INVOICE: 10,
  RECEIPT: 20,
  INVOICE_RECEIPT: 30,
  OTHER: 40,
} as const;

export const CURRENCIES = [
  "ILS", "USD", "EUR", "GBP", "JPY", "CHF", "CNY", "AUD", "CAD", "DKK",
  "NOK", "ZAR", "SEK", "CZK", "IMP", "JOD", "LBP", "EGP", "HRK", "HUF",
  "INR", "RUB", "TRY", "UAH", "BRL", "PLN", "RON", "MXN",
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_MAX_PAGES = 50;
