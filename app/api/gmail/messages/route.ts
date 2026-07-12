import { NextResponse } from "next/server";
import { listInboxMessages } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const pageToken = searchParams.get("pageToken") ?? undefined;
    const maxResults = Number(searchParams.get("maxResults") ?? "30");

    const result = await listInboxMessages({ q, pageToken, maxResults });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאה", messages: [] },
      { status: err instanceof Error && err.message.includes("לא מחובר") ? 401 : 500 }
    );
  }
}
