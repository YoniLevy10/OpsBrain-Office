import { NextResponse } from "next/server";
import { getGmailAuthUrl, isGmailConfigured } from "@/lib/gmail";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isGmailConfigured()) {
    return NextResponse.json({ error: "Gmail לא מוגדר — הוסף GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET" }, { status: 400 });
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
}
