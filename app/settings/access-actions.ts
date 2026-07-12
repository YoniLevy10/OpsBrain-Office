"use server";

import { setAppAccessCookie, clearAppAccessCookie } from "@/lib/app-access";
import { revalidatePath } from "next/cache";

export async function unlockAppAccess(secret: string): Promise<{ ok: boolean; error?: string }> {
  const ok = await setAppAccessCookie(secret);
  if (ok) {
    revalidatePath("/");
    revalidatePath("/email");
    revalidatePath("/settings");
  }
  return ok ? { ok: true } : { ok: false, error: "סיסמת גישה שגויה" };
}

export async function logoutAppAccess(): Promise<{ ok: boolean }> {
  await clearAppAccessCookie();
  revalidatePath("/");
  return { ok: true };
}
