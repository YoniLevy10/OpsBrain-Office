import type { MorningClient } from "../client";
import { searchAllPages } from "../pagination";
import type { SearchResult, SupplierRecord, SupplierSearchRequest } from "../types";

export class SuppliersResource {
  constructor(private readonly client: MorningClient) {}

  /** POST /suppliers */
  create(payload: SupplierRecord): Promise<SupplierRecord> {
    return this.client.post<SupplierRecord>("/suppliers", payload);
  }

  /** GET /suppliers/{id} */
  get(id: string): Promise<SupplierRecord> {
    return this.client.get<SupplierRecord>(`/suppliers/${id}`);
  }

  /** PUT /suppliers/{id} */
  update(id: string, payload: Partial<SupplierRecord>): Promise<SupplierRecord> {
    return this.client.put<SupplierRecord>(`/suppliers/${id}`, payload);
  }

  /** DELETE /suppliers/{id} */
  delete(id: string): Promise<unknown> {
    return this.client.delete(`/suppliers/${id}`);
  }

  /** POST /suppliers/search */
  search(body: SupplierSearchRequest): Promise<SearchResult<SupplierRecord>> {
    return this.client.post<SearchResult<SupplierRecord>>("/suppliers/search", body);
  }

  /** POST /suppliers/search — all pages */
  searchAll(body: Omit<SupplierSearchRequest, "page" | "pageSize"> = {}): Promise<SupplierRecord[]> {
    return searchAllPages<SupplierRecord>(this.client, "/suppliers/search", body);
  }

  /** POST /suppliers/{id}/merge */
  merge(id: string, payload: { sourceSupplierId: string }): Promise<unknown> {
    return this.client.post(`/suppliers/${id}/merge`, payload);
  }
}
