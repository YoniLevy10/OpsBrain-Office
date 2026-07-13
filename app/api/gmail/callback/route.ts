import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeGmailCode, getGmailAppBaseUrl } from "@/lib/gmail";
import { saveGmailConnection } from "@/lib/gmail/store";
import { verifyOAuthState } from "@/lib/oauth-state";

export const dynamic = "force-dynamic";

function completeUrl(base: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params);
  return `${base}/connect/gmail/complete?${qs.toString()}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const base = getGmailAppBaseUrl();

  if (error) {
    return NextResponse.redirect(completeUrl(base, { status: "error", code: error }));
  }

  if (!code) {
    return NextResponse.redirect(completeUrl(base, { status: "error", code: "missing_code" }));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gmail_oauth_state")?.value;
  const stateOk = verifyOAuthState(state) || (savedState != null && savedState === state);

  if (!stateOk) {
    return NextResponse.redirect(completeUrl(base, { status: "error", code: "invalid_state" }));
  }

  try {
    const tokens = await exchangeGmailCode(code);
    await saveGmailConnection(tokens);
    const res = NextResponse.redirect(
      completeUrl(base, {
        status: "success",
        email: tokens.email,
      })
    );
    res.cookies.delete("gmail_oauth_state");
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "oauth_failed";
    let code = "oauth_failed";
    if (msg.includes("redirect_uri")) code = "redirect_uri_mismatch";
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY") || msg.includes("service role")) {
      code = "missing_service_role";
    }
    return NextResponse.redirect(
      completeUrl(base, { status: "error", code, detail: msg })
    );
  }
}
