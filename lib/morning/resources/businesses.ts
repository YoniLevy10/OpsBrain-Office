import type { MorningClient } from "../client";
import type {
  BusinessFileUpload,
  BusinessNumbering,
  BusinessRecord,
  SearchResult,
} from "../types";

export class BusinessesResource {
  constructor(private readonly client: MorningClient) {}

  /** GET /businesses — list all user businesses */
  list(): Promise<BusinessRecord[]> {
    return this.client.get<BusinessRecord[]>("/businesses");
  }

  /** GET /businesses/me — current business */
  me(): Promise<BusinessRecord> {
    return this.client.get<BusinessRecord>("/businesses/me");
  }

  /** GET /businesses/{id} */
  get(id: string): Promise<BusinessRecord> {
    return this.client.get<BusinessRecord>(`/businesses/${id}`);
  }

  /** PUT /businesses — update business */
  update(payload: Partial<BusinessRecord>): Promise<BusinessRecord> {
    return this.client.put<BusinessRecord>("/businesses", payload);
  }

  /** POST /businesses/file — upload logo/signature/doc (base64) */
  uploadFile(payload: BusinessFileUpload): Promise<unknown> {
    return this.client.post("/businesses/file", payload);
  }

  /** DELETE /businesses/file */
  deleteFile(payload: { type: BusinessFileUpload["type"] }): Promise<unknown> {
    return this.client.delete("/businesses/file", payload);
  }

  /** GET /businesses/numbering */
  getNumbering(): Promise<BusinessNumbering> {
    return this.client.get<BusinessNumbering>("/businesses/numbering");
  }

  /** PUT /businesses/numbering */
  setNumbering(payload: BusinessNumbering): Promise<BusinessNumbering> {
    return this.client.put<BusinessNumbering>("/businesses/numbering", payload);
  }

  /** GET /businesses/footer */
  getFooter(): Promise<{ footer?: string }> {
    return this.client.get("/businesses/footer");
  }

  /** GET /businesses/types */
  getTypes(lang: "he" | "en" = "he"): Promise<SearchResult<{ id: number; name: string }>> {
    return this.client.get("/businesses/types", { lang });
  }
}
