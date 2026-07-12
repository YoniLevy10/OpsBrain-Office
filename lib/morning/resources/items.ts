import type { MorningClient } from "../client";
import { searchAllPages } from "../pagination";
import type { ItemRecord, ItemSearchRequest, SearchResult } from "../types";

export class ItemsResource {
  constructor(private readonly client: MorningClient) {}

  /** POST /items */
  create(payload: ItemRecord): Promise<ItemRecord> {
    return this.client.post<ItemRecord>("/items", payload);
  }

  /** GET /items/{id} */
  get(id: string): Promise<ItemRecord> {
    return this.client.get<ItemRecord>(`/items/${id}`);
  }

  /** PUT /items/{id} */
  update(id: string, payload: Partial<ItemRecord>): Promise<ItemRecord> {
    return this.client.put<ItemRecord>(`/items/${id}`, payload);
  }

  /** DELETE /items/{id} */
  delete(id: string): Promise<unknown> {
    return this.client.delete(`/items/${id}`);
  }

  /** POST /items/search */
  search(body: ItemSearchRequest): Promise<SearchResult<ItemRecord>> {
    return this.client.post<SearchResult<ItemRecord>>("/items/search", body);
  }

  /** POST /items/search — all pages */
  searchAll(body: Omit<ItemSearchRequest, "page" | "pageSize"> = {}): Promise<ItemRecord[]> {
    return searchAllPages<ItemRecord>(this.client, "/items/search", body);
  }
}
