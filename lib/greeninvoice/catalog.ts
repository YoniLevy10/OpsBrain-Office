import type { GiDocumentType } from "./types";

export type DocumentKind =
  | "receipt"
  | "invoice"
  | "invoice_receipt"
  | "quote"
  | "credit"
  | "payment_link";

/** Document kinds that can be issued via /documents (excludes payment_link) */
export type IssuableDocumentKind = Exclude<DocumentKind, "payment_link">;

export type DocumentCatalogItem = {
  kind: IssuableDocumentKind;
  type: GiDocumentType;
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
    type: 400,
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
    type: 305,
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
    type: 320,
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
    type: 10,
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
    type: 330,
    label: "חשבונית זיכוי",
    shortLabel: "זיכוי",
    desc: "החזר ללקוח",
    amountHint: "סכום הזיכוי (לפני מע״מ)",
    needsPayment: false,
    vatIncluded: false,
    accent: "rose",
  },
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
