import { NextResponse } from "next/server";
import { assertAppAccess } from "@/lib/app-access";
import { deleteGmailConnection, loadGmailConnection } from "@/lib/gmail/store";
import { revokeGmailToken } from "@/lib/gmail";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await assertAppAccess();
    const row = await loadGmailConnection();
    if (row?.access_token) {
      try {
        await revokeGmailToken(row.access_token);
      } catch {
        /* best effort */
      }
    }
    await deleteGmailConnection();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: msg.includes("גישה נדחתה") ? 403 : 500 }
    );
  }
}
