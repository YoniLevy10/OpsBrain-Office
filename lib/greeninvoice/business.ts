import { giFetch } from "../greeninvoice";

export type GiBusiness = {
  id?: string;
  name?: string;
  taxId?: string;
  email?: string;
  phone?: string;
};

export async function getCurrentBusiness(): Promise<GiBusiness | null> {
  try {
    return await giFetch<GiBusiness>("/businesses/me", { method: "GET" });
  } catch {
    return null;
  }
}
