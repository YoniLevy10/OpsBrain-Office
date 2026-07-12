import { getMorningClient } from "../morning";
import type { BusinessRecord } from "../morning/types";

export type GiBusiness = BusinessRecord;

export async function getCurrentBusiness(): Promise<GiBusiness | null> {
  try {
    return await getMorningClient().businesses.me();
  } catch {
    return null;
  }
}
