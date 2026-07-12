import type { MorningClient } from "../client";
import { searchAllPages } from "../pagination";
import type {
  ClientAssocRequest,
  ClientBalanceRequest,
  ClientMergeRequest,
  ClientRecord,
  ClientSearchRequest,
  MorningClientPayload,
  SearchResult,
} from "../types";

export class ClientsResource {
  constructor(private readonly client: MorningClient) {}

  /** POST /clients — add client */
  create(payload: MorningClientPayload): Promise<ClientRecord> {
    return this.client.post<ClientRecord>("/clients", payload);
  }

  /** GET /clients/{id} */
  get(id: string): Promise<ClientRecord> {
    return this.client.get<ClientRecord>(`/clients/${id}`);
  }

  /** PUT /clients/{id} */
  update(id: string, payload: Partial<MorningClientPayload>): Promise<ClientRecord> {
    return this.client.put<ClientRecord>(`/clients/${id}`, payload);
  }

  /** DELETE /clients/{id} — client must be inactive */
  delete(id: string): Promise<unknown> {
    return this.client.delete(`/clients/${id}`);
  }

  /** POST /clients/search */
  search(body: ClientSearchRequest): Promise<SearchResult<ClientRecord>> {
    return this.client.post<SearchResult<ClientRecord>>("/clients/search", body);
  }

  /** POST /clients/search — all pages */
  searchAll(body: Omit<ClientSearchRequest, "page" | "pageSize"> = {}): Promise<ClientRecord[]> {
    return searchAllPages<ClientRecord>(this.client, "/clients/search", body);
  }

  /** POST /clients/{id}/assoc — associate documents */
  associateDocuments(id: string, payload: ClientAssocRequest): Promise<unknown> {
    return this.client.post(`/clients/${id}/assoc`, payload);
  }

  /** POST /clients/{id}/merge */
  merge(id: string, payload: ClientMergeRequest): Promise<unknown> {
    return this.client.post(`/clients/${id}/merge`, payload);
  }

  /** POST /clients/{id}/balance */
  updateBalance(id: string, payload: ClientBalanceRequest): Promise<unknown> {
    return this.client.post(`/clients/${id}/balance`, payload);
  }
}
