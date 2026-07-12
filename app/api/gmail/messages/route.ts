import { NextResponse } from "next/server";
import { assertAppAccess } from "@/lib/app-access";
import { listInboxMessages } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await assertAppAccess();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const pageToken = searchParams.get("pageToken") ?? undefined;
    const maxResults = Number(searchParams.get("maxResults") ?? "30");

    const result = await listInboxMessages({ q, pageToken, maxResults });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה";
    const denied = msg.includes("גישה נדחתה");
    const unauthorized = msg.includes("לא מחובר");
    return NextResponse.json(
      { ok: false, error: msg, messages: [] },
      { status: denied ? 403 : unauthorized ? 401 : 500 }
    );
  }
}
