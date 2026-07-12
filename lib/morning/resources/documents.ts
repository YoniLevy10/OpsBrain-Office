import type { MorningClient } from "../client";
import { INCOME_DOCUMENT_TYPES } from "../constants";
import { searchAllPages } from "../pagination";
import type {
  CreateDocumentRequest,
  DocumentPaymentSearchRequest,
  DocumentResponse,
  DocumentSearchRequest,
  DownloadLinks,
  MorningLang,
  MorningPaymentLine,
  PreviewResponse,
  SearchResult,
  SendDocumentRequest,
} from "../types";

export class DocumentsResource {
  constructor(private readonly client: MorningClient) {}

  /** POST /documents — create document */
  create(payload: CreateDocumentRequest): Promise<DocumentResponse> {
    return this.client.post<DocumentResponse>("/documents", payload);
  }

  /** POST /documents/preview — returns base64 PDF */
  preview(payload: CreateDocumentRequest): Promise<PreviewResponse> {
    return this.client.post<PreviewResponse>("/documents/preview", payload);
  }

  /** GET /documents/{id} */
  get(id: string): Promise<DocumentResponse> {
    return this.client.get<DocumentResponse>(`/documents/${id}`);
  }

  /** POST /documents/search */
  search(body: DocumentSearchRequest): Promise<SearchResult<DocumentResponse>> {
    return this.client.post<SearchResult<DocumentResponse>>("/documents/search", body);
  }

  /** POST /documents/search — all pages (default: income doc types) */
  searchAll(
    body: Omit<DocumentSearchRequest, "page" | "pageSize"> = {}
  ): Promise<DocumentResponse[]> {
    return searchAllPages<DocumentResponse>(this.client, "/documents/search", {
      type: body.type ?? INCOME_DOCUMENT_TYPES,
      sort: body.sort ?? "documentDate",
      ...body,
    });
  }

  /** POST /documents/payments/search */
  searchPayments(
    body: DocumentPaymentSearchRequest
  ): Promise<SearchResult<unknown>> {
    return this.client.post("/documents/payments/search", body);
  }

  /** POST /documents/{id}/close */
  close(id: string): Promise<unknown> {
    return this.client.post(`/documents/${id}/close`);
  }

  /** POST /documents/{id}/open */
  open(id: string): Promise<unknown> {
    return this.client.post(`/documents/${id}/open`);
  }

  /** GET /documents/{id}/linked */
  getLinked(id: string): Promise<DocumentResponse[]> {
    return this.client.get<DocumentResponse[]>(`/documents/${id}/linked`);
  }

  /** GET /documents/{id}/download/links */
  getDownloadLinks(id: string): Promise<DownloadLinks> {
    return this.client.get<DownloadLinks>(`/documents/${id}/download/links`);
  }

  /** GET /documents/info?type= */
  getInfo(type: number): Promise<unknown> {
    return this.client.get("/documents/info", { type });
  }

  /** GET /documents/templates */
  getTemplates(): Promise<unknown> {
    return this.client.get("/documents/templates");
  }

  /** GET /documents/types?lang= */
  getTypes(lang: MorningLang = "he"): Promise<unknown> {
    return this.client.get("/documents/types", { lang });
  }

  /** GET /documents/statuses?lang= */
  getStatuses(lang: MorningLang = "he"): Promise<unknown> {
    return this.client.get("/documents/statuses", { lang });
  }

  /** POST /documents/{id}/payment — add payment to open invoice */
  addPayment(id: string, payment: MorningPaymentLine | MorningPaymentLine[]): Promise<unknown> {
    const lines = Array.isArray(payment) ? payment : [payment];
    return this.client.post(`/documents/${id}/payment`, { payment: lines });
  }

  /** POST /documents/{id}/send — email document */
  send(id: string, payload: SendDocumentRequest): Promise<unknown> {
    return this.client.post(`/documents/${id}/send`, payload);
  }
}
