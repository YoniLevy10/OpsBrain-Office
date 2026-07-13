export type GmailEnvironment = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export const GMAIL_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
] as const;

export const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";
export const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";

/** Public app URL — always prefer explicit env over VERCEL_URL (deployment-specific). */
export function getGmailAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  return vercel ?? "http://localhost:3000";
}

export function gmailConfigFromEnv(): GmailEnvironment | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI?.replace(/\/$/, "") ||
    `${getGmailAppBaseUrl()}/api/gmail/callback`;

  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function isGmailConfigured(): boolean {
  return gmailConfigFromEnv() !== null;
}
