import { NextResponse } from "next/server";
import { assertAppAccess } from "@/lib/app-access";
import { isGmailConfigured, getGmailAuthUrl } from "@/lib/gmail";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAppAccess();
    if (!isGmailConfigured()) {
      return NextResponse.json(
        { error: "Gmail לא מוגדר — הוסף GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET" },
        { status: 400 }
      );
    }

    const state = crypto.randomUUID();
    const url = getGmailAuthUrl(state);

    const res = NextResponse.redirect(url);
    res.cookies.set("gmail_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה";
    return NextResponse.json({ error: msg }, { status: msg.includes("גישה נדחתה") ? 403 : 500 });
  }
}
