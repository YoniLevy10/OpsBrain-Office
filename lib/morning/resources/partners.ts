import type { MorningClient } from "../client";
import type { PartnerConnectionRequest, PartnerUser } from "../types";

export class PartnersResource {
  constructor(private readonly client: MorningClient) {}

  /** GET /partners/users */
  listUsers(): Promise<PartnerUser[]> {
    return this.client.get<PartnerUser[]>("/partners/users");
  }

  /** GET /partners/users?email= */
  getUserByEmail(email: string): Promise<PartnerUser> {
    return this.client.get<PartnerUser>("/partners/users", { email });
  }

  /** POST /partners/users/connection — request approval */
  requestConnection(payload: PartnerConnectionRequest): Promise<unknown> {
    return this.client.post("/partners/users/connection", payload);
  }

  /** DELETE /partners/users/connection?email= */
  disconnect(email: string): Promise<unknown> {
    return this.client.delete("/partners/users/connection", undefined, { email });
  }
}
