import { createHmac, randomUUID, timingSafeEqual } from "crypto";

function signingKey(): string {
  return (
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.OPSBRAIN_ACCESS_SECRET ||
    process.env.CRON_SECRET ||
    "opsbrain-oauth-fallback"
  );
}

/** Signed OAuth state — works without cookies (fixes mobile Safari OAuth). */
export function createOAuthState(): string {
  const nonce = randomUUID();
  const sig = createHmac("sha256", signingKey()).update(nonce).digest("base64url");
  return `${nonce}.${sig}`;
}

export function verifyOAuthState(state: string | null | undefined): boolean {
  if (!state) return false;
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return false;
  const nonce = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = createHmac("sha256", signingKey()).update(nonce).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
