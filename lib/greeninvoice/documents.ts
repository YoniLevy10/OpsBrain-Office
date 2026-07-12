import { giFetch } from "../greeninvoice";
import { parseGiApiError } from "./errors";
import type {
  GiCreateDocumentRequest,
  GiDocumentResponse,
  GiDownloadLinks,
  GiPreviewResponse,
  GiSendDocumentRequest,
} from "./types";

async function giFetchSafe<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await giFetch<T>(path, init);
  } catch (err) {
    if (err instanceof Error && err.message.includes("failed:")) {
      const match = err.message.match(/failed: (\d+) (.+)/);
      if (match) {
        throw new Error(parseGiApiError(match[2], Number(match[1])));
      }
    }
    throw err;
  }
}

export async function createDocument(payload: GiCreateDocumentRequest): Promise<GiDocumentResponse> {
  return giFetchSafe<GiDocumentResponse>("/documents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function previewDocument(payload: GiCreateDocumentRequest): Promise<GiPreviewResponse> {
  return giFetchSafe<GiPreviewResponse>("/documents/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getDocument(id: string): Promise<GiDocumentResponse> {
  return giFetchSafe<GiDocumentResponse>(`/documents/${id}`, { method: "GET" });
}

export async function sendDocument(
  id: string,
  payload: GiSendDocumentRequest
): Promise<unknown> {
  return giFetchSafe(`/documents/${id}/send`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getDocumentDownloadLinks(id: string): Promise<GiDownloadLinks> {
  return giFetchSafe<GiDownloadLinks>(`/documents/${id}/download/links`, { method: "GET" });
}

export async function addDocumentPayment(
  id: string,
  payment: { date: string; type: number; price: number; currency: string }
): Promise<unknown> {
  return giFetchSafe(`/documents/${id}/payment`, {
    method: "POST",
    body: JSON.stringify({ payment: [payment] }),
  });
}
