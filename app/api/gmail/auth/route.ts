import { NextResponse } from "next/server";
import { isGmailConfigured, getGmailAuthUrl, getGmailAppBaseUrl } from "@/lib/gmail";
import { createOAuthState } from "@/lib/oauth-state";
import { getGmailDiagnostics } from "@/lib/gmail/diagnostics";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = getGmailAppBaseUrl();

  if (!isGmailConfigured()) {
    return NextResponse.redirect(`${base}/email?error=not_configured`);
  }

  const diag = await getGmailDiagnostics();
  if (!diag.ready) {
    const failed = diag.items.filter((i) => !i.ok && ["google_keys", "service_role", "gmail_table", "access"].includes(i.id));
    const first = failed[0];
    const code = first?.id === "service_role" ? "missing_service_role" : first?.id === "access" ? "access_required" : "setup_incomplete";
    const detail = failed.map((f) => f.label).join(", ");
    return NextResponse.redirect(`${base}/email?error=${code}&detail=${encodeURIComponent(detail)}`);
  }

  const state = createOAuthState();
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
