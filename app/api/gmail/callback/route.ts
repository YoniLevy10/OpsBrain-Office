import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertAppAccess } from "@/lib/app-access";
import { exchangeGmailCode, getGmailAppBaseUrl } from "@/lib/gmail";
import { saveGmailConnection } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const base = getGmailAppBaseUrl();

  if (error) {
    return NextResponse.redirect(`${base}/email?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${base}/email?error=missing_code`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gmail_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${base}/email?error=invalid_state`);
  }

  try {
    await assertAppAccess();
    const tokens = await exchangeGmailCode(code);
    await saveGmailConnection(tokens);
    const res = NextResponse.redirect(`${base}/email?connected=1`);
    res.cookies.delete("gmail_oauth_state");
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "oauth_failed";
    return NextResponse.redirect(`${base}/email?error=${encodeURIComponent(msg)}`);
  }
}
