import { getMorningClient } from "../morning";
import type { PaymentTypeCode } from "../morning/constants";
import type {
  CreateDocumentRequest,
  DocumentResponse,
  DownloadLinks,
  PreviewResponse,
  SendDocumentRequest,
} from "../morning/types";

export async function createDocument(payload: CreateDocumentRequest): Promise<DocumentResponse> {
  return getMorningClient().documents.create(payload);
}

export async function previewDocument(payload: CreateDocumentRequest): Promise<PreviewResponse> {
  return getMorningClient().documents.preview(payload);
}

export async function getDocument(id: string): Promise<DocumentResponse> {
  return getMorningClient().documents.get(id);
}

export async function sendDocument(id: string, payload: SendDocumentRequest): Promise<unknown> {
  return getMorningClient().documents.send(id, payload);
}

export async function getDocumentDownloadLinks(id: string): Promise<DownloadLinks> {
  return getMorningClient().documents.getDownloadLinks(id);
}

export async function addDocumentPayment(
  id: string,
  payment: { date: string; type: number; price: number; currency: string }
): Promise<unknown> {
  return getMorningClient().documents.addPayment(id, {
    date: payment.date,
    type: payment.type as PaymentTypeCode,
    price: payment.price,
    currency: payment.currency,
  });
}

// Re-export full documents resource for new code
export { DocumentsResource } from "../morning/resources/documents";
