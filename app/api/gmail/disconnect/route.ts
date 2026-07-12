import { NextResponse } from "next/server";
import { deleteGmailConnection, loadGmailConnection } from "@/lib/gmail/store";
import { revokeGmailToken } from "@/lib/gmail";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
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
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאה" },
      { status: 500 }
    );
  }
}
