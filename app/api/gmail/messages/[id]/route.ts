import { NextResponse } from "next/server";
import { assertAppAccess } from "@/lib/app-access";
import { getInboxMessage, markMessageAsRead } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAppAccess();
    const { id } = await params;
    const message = await getInboxMessage(id);
    void markMessageAsRead(id);
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה";
    const denied = msg.includes("גישה נדחתה");
    return NextResponse.json(
      { ok: false, error: msg },
      { status: denied ? 403 : 500 }
    );
  }
}
