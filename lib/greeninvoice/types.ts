/**
 * @deprecated Import from `@/lib/morning/types` or `@/lib/morning/constants`
 * Legacy type aliases for OpsBrain backward compatibility.
 */
export type { DocumentTypeCode as GiDocumentType, PaymentTypeCode as GiPaymentTypeCode } from "../morning/constants";

export type {
  CreateDocumentRequest as GiCreateDocumentRequest,
  DocumentResponse as GiDocumentResponse,
  PreviewResponse as GiPreviewResponse,
  DownloadLinks as GiDownloadLinks,
  PaymentFormRequest as GiPaymentFormRequest,
  PaymentFormResponse as GiPaymentFormResponse,
  SendDocumentRequest as GiSendDocumentRequest,
  MorningClientPayload as GiClientPayload,
  MorningIncomeLine as GiIncomeLine,
  MorningPaymentLine as GiPaymentLine,
  CreateReceiptInput,
  CreateInvoiceInput,
  PaymentLinkInput,
  GiActionResult,
  GiActionType,
  GiActionStatus,
  IncomeSource,
} from "../morning/types";
