import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeGmailCode, getGmailAppBaseUrl } from "@/lib/gmail";
import { saveGmailConnection } from "@/lib/gmail/store";
import { verifyOAuthState } from "@/lib/oauth-state";

export const dynamic = "force-dynamic";

function oauthErrorRedirect(base: string, code: string, detail?: string): NextResponse {
  const params = new URLSearchParams({ error: code });
  if (detail) params.set("detail", detail);
  return NextResponse.redirect(`${base}/email?${params.toString()}`);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const base = getGmailAppBaseUrl();

  if (error) {
    return oauthErrorRedirect(base, error);
  }

  if (!code) {
    return oauthErrorRedirect(base, "missing_code");
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gmail_oauth_state")?.value;
  const stateOk = verifyOAuthState(state) || (savedState != null && savedState === state);

  if (!stateOk) {
    return oauthErrorRedirect(base, "invalid_state");
  }

  try {
    const tokens = await exchangeGmailCode(code);
    await saveGmailConnection(tokens);
    const res = NextResponse.redirect(`${base}/email?connected=1`);
    res.cookies.delete("gmail_oauth_state");
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "oauth_failed";
    if (msg.includes("redirect_uri")) {
      return oauthErrorRedirect(base, "redirect_uri_mismatch", msg);
    }
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY") || msg.includes("service role")) {
      return oauthErrorRedirect(base, "missing_service_role", msg);
    }
    return oauthErrorRedirect(base, "oauth_failed", msg);
  }
}
