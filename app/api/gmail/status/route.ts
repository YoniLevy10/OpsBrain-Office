import { NextResponse } from "next/server";
import { assertAppAccess } from "@/lib/app-access";
import { getGmailConnectionStatus } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAppAccess();
    const status = await getGmailConnectionStatus();
    return NextResponse.json(status);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה";
    return NextResponse.json(
      { connected: false, configured: false, error: msg },
      { status: msg.includes("גישה נדחתה") ? 403 : 500 }
    );
  }
}
