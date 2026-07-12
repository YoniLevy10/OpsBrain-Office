import { DOCUMENT_TYPES, type DocumentTypeCode } from "../constants";

export type DocumentKind =
  | "receipt"
  | "invoice"
  | "invoice_receipt"
  | "quote"
  | "credit"
  | "payment_link";

export type IssuableDocumentKind = Exclude<DocumentKind, "payment_link">;

export type DocumentCatalogItem = {
  kind: IssuableDocumentKind;
  type: DocumentTypeCode;
  label: string;
  shortLabel: string;
  desc: string;
  amountHint: string;
  needsPayment: boolean;
  vatIncluded: boolean;
  accent: "emerald" | "blue" | "brass" | "rose";
};

export const DOCUMENT_CATALOG: DocumentCatalogItem[] = [
  {
    kind: "receipt",
    type: DOCUMENT_TYPES.RECEIPT,
    label: "קבלה",
    shortLabel: "קבלה",
    desc: "תשלום שהתקבל",
    amountHint: "סה״כ כולל מע״מ",
    needsPayment: true,
    vatIncluded: true,
    accent: "emerald",
  },
  {
    kind: "invoice",
    type: DOCUMENT_TYPES.TAX_INVOICE,
    label: "חשבונית מס",
    shortLabel: "חשבונית",
    desc: "חיוב לפני תשלום",
    amountHint: "לפני מע״מ (מע״מ יתווסף אוטומטית)",
    needsPayment: false,
    vatIncluded: false,
    accent: "blue",
  },
  {
    kind: "invoice_receipt",
    type: DOCUMENT_TYPES.TAX_INVOICE_RECEIPT,
    label: "חשבונית מס + קבלה",
    shortLabel: "חשבונית+קבלה",
    desc: "תשלום מיידי",
    amountHint: "סה״כ כולל מע״מ",
    needsPayment: true,
    vatIncluded: true,
    accent: "emerald",
  },
  {
    kind: "quote",
    type: DOCUMENT_TYPES.QUOTE,
    label: "הצעת מחיר",
    shortLabel: "הצעה",
    desc: "ללא חיוב",
    amountHint: "לפני מע״מ",
    needsPayment: false,
    vatIncluded: false,
    accent: "brass",
  },
  {
    kind: "credit",
    type: DOCUMENT_TYPES.CREDIT_INVOICE,
    label: "חשבונית זיכוי",
    shortLabel: "זיכוי",
    desc: "החזר ללקוח",
    amountHint: "סכום הזיכוי (לפני מע״מ)",
    needsPayment: false,
    vatIncluded: false,
    accent: "rose",
  },
];

/** Extended catalog for all Morning document types (beyond OpsBrain UI defaults) */
export const FULL_DOCUMENT_TYPE_CATALOG: Array<{
  type: DocumentTypeCode;
  label: string;
  needsPayment: boolean;
}> = [
  { type: 10, label: "הצעת מחיר", needsPayment: false },
  { type: 100, label: "הזמנה", needsPayment: false },
  { type: 200, label: "תעודת משלוח", needsPayment: false },
  { type: 210, label: "תעודת החזרה", needsPayment: false },
  { type: 300, label: "חשבון עסקה", needsPayment: false },
  { type: 305, label: "חשבונית מס", needsPayment: false },
  { type: 320, label: "חשבונית מס + קבלה", needsPayment: true },
  { type: 330, label: "חשבונית זיכוי", needsPayment: false },
  { type: 400, label: "קבלה", needsPayment: true },
  { type: 405, label: "קבלה על תרומה", needsPayment: true },
  { type: 500, label: "הזמנת רכש", needsPayment: false },
  { type: 600, label: "קבלת פיקדון", needsPayment: true },
  { type: 610, label: "משיכת פיקדון", needsPayment: false },
];

export function getCatalogItem(kind: DocumentKind): DocumentCatalogItem {
  return DOCUMENT_CATALOG.find((d) => d.kind === kind) ?? DOCUMENT_CATALOG[0];
}

export function validateDocumentInput(input: {
  clientName?: string;
  amount?: number;
  description?: string;
}): string | null {
  if (!input.clientName?.trim()) return "יש לבחור או להזין שם לקוח";
  if (!input.description?.trim()) return "יש להזין תיאור למסמך";
  if (!input.amount || !Number.isFinite(input.amount) || input.amount <= 0) {
    return "יש להזין סכום גדול מ-0";
  }
  return null;
}
