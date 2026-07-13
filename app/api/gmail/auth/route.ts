import { NextResponse } from "next/server";
import { isGmailConfigured, getGmailAuthUrl, getGmailAppBaseUrl } from "@/lib/gmail";
import { createOAuthState } from "@/lib/oauth-state";
import { getGmailDiagnostics } from "@/lib/gmail/diagnostics";

export const dynamic = "force-dynamic";

function completeUrl(base: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params);
  return `${base}/connect/gmail/complete?${qs.toString()}`;
}

export async function GET() {
  const base = getGmailAppBaseUrl();

  if (!isGmailConfigured()) {
    return NextResponse.redirect(
      completeUrl(base, { status: "error", code: "not_configured", detail: "חסרים מפתחות Google ב-Vercel" })
    );
  }

  const diag = await getGmailDiagnostics();
  if (!diag.ready) {
    const failed = diag.items.filter((i) => !i.ok);
    return NextResponse.redirect(
      completeUrl(base, {
        status: "error",
        code: "setup_incomplete",
        detail: failed.map((f) => f.label).join(" · "),
      })
    );
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
