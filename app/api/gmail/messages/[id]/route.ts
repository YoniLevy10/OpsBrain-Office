import { NextResponse } from "next/server";
import { getInboxMessage } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const message = await getInboxMessage(id);
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאה" },
      { status: 500 }
    );
  }
}
