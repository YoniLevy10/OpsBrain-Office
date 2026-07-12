import type { MorningClient } from "../client";
import { searchAllPages } from "../pagination";
import type {
  ExpenseDraftSearchRequest,
  ExpenseRecord,
  ExpenseSearchRequest,
  SearchResult,
} from "../types";

export class ExpensesResource {
  constructor(private readonly client: MorningClient) {}

  /** POST /expenses */
  create(payload: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
    return this.client.post<ExpenseRecord>("/expenses", payload);
  }

  /** GET /expenses/{id} */
  get(id: string): Promise<ExpenseRecord> {
    return this.client.get<ExpenseRecord>(`/expenses/${id}`);
  }

  /** PUT /expenses/{id} — not allowed if reported */
  update(id: string, payload: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
    return this.client.put<ExpenseRecord>(`/expenses/${id}`, payload);
  }

  /** DELETE /expenses/{id} */
  delete(id: string): Promise<unknown> {
    return this.client.delete(`/expenses/${id}`);
  }

  /** POST /expenses/search */
  search(body: ExpenseSearchRequest): Promise<SearchResult<ExpenseRecord>> {
    return this.client.post<SearchResult<ExpenseRecord>>("/expenses/search", body);
  }

  /** POST /expenses/search — all pages */
  searchAll(body: Omit<ExpenseSearchRequest, "page" | "pageSize"> = {}): Promise<ExpenseRecord[]> {
    return searchAllPages<ExpenseRecord>(this.client, "/expenses/search", body);
  }

  /** POST /expenses/{id}/open */
  open(id: string): Promise<unknown> {
    return this.client.post(`/expenses/${id}/open`);
  }

  /** POST /expenses/{id}/close — report expense */
  close(id: string): Promise<unknown> {
    return this.client.post(`/expenses/${id}/close`);
  }

  /** GET /expenses/statuses */
  getStatuses(): Promise<unknown> {
    return this.client.get("/expenses/statuses");
  }

  /** GET /accounting/classifications/map */
  getClassifications(): Promise<unknown> {
    return this.client.get("/accounting/classifications/map");
  }

  /** GET /expenses/file — S3 presigned upload URL */
  getFileUploadUrl(): Promise<{ url?: string }> {
    return this.client.get("/expenses/file");
  }

  /** POST /expenses/example — create draft from file */
  createFromFile(payload: { file: string; extension?: string }): Promise<ExpenseRecord> {
    return this.client.post<ExpenseRecord>("/expenses/example", payload);
  }

  /** POST /expenses/drafts/search */
  searchDrafts(body: ExpenseDraftSearchRequest): Promise<SearchResult<ExpenseRecord>> {
    return this.client.post<SearchResult<ExpenseRecord>>("/expenses/drafts/search", body);
  }
}
