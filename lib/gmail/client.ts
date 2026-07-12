import {
  GMAIL_API_BASE,
  GMAIL_SCOPES,
  GOOGLE_AUTH_BASE,
  GOOGLE_REVOKE_URL,
  GOOGLE_TOKEN_URL,
  gmailConfigFromEnv,
  type GmailEnvironment,
} from "./config";
import { GmailError, parseGmailApiError, parseGoogleOAuthError } from "./errors";
import type {
  GmailListResponse,
  GmailMessageRaw,
  GmailTokenSet,
  SendEmailInput,
} from "./types";

export function getGmailAuthUrl(state?: string): string {
  const config = gmailConfigFromEnv();
  if (!config) throw new GmailError("Gmail לא מוגדר — חסרים GOOGLE_CLIENT_ID/SECRET");

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  if (state) params.set("state", state);

  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeGmailCode(code: string): Promise<GmailTokenSet> {
  const config = gmailConfigFromEnv();
  if (!config) throw new GmailError("Gmail לא מוגדר");

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  const body = await res.text();
  if (!res.ok) throw parseGoogleOAuthError(body, res.status);

  const data = JSON.parse(body) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
    id_token?: string;
  };

  if (!data.refresh_token) {
    throw new GmailError("לא התקבל refresh token — נסה לנתק את האפליקציה ב-Google Account ולחבר מחדש");
  }

  const email = await fetchGoogleEmail(data.access_token);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    email,
    scopes: data.scope,
  };
}

export async function refreshGmailToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: number;
  scopes?: string;
}> {
  const config = gmailConfigFromEnv();
  if (!config) throw new GmailError("Gmail לא מוגדר");

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const body = await res.text();
  if (!res.ok) throw parseGoogleOAuthError(body, res.status);

  const data = JSON.parse(body) as {
    access_token: string;
    expires_in: number;
    scope?: string;
  };

  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scopes: data.scope,
  };
}

export async function revokeGmailToken(token: string): Promise<void> {
  await fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(token)}`, {
    method: "POST",
    cache: "no-store",
  });
}

async function fetchGoogleEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new GmailError("לא ניתן לקבל את כתובת המייל המחוברת");
  const data = (await res.json()) as { email?: string };
  if (!data.email) throw new GmailError("כתובת מייל חסרה בתגובת Google");
  return data.email;
}

export class GmailClient {
  constructor(
    private accessToken: string,
    private readonly config: GmailEnvironment = gmailConfigFromEnv()!
  ) {
    if (!this.config) throw new GmailError("Gmail לא מוגדר");
  }

  static withAccessToken(accessToken: string): GmailClient {
    return new GmailClient(accessToken);
  }

  private async gmailFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${GMAIL_API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      throw parseGmailApiError(body, res.status);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  listMessages(params?: {
    labelIds?: string[];
    q?: string;
    maxResults?: number;
    pageToken?: string;
  }): Promise<GmailListResponse> {
    const query = new URLSearchParams();
    if (params?.labelIds?.length) query.set("labelIds", params.labelIds.join(","));
    if (params?.q) query.set("q", params.q);
    if (params?.maxResults) query.set("maxResults", String(params.maxResults));
    if (params?.pageToken) query.set("pageToken", params.pageToken);
    const qs = query.toString();
    return this.gmailFetch<GmailListResponse>(`/users/me/messages${qs ? `?${qs}` : ""}`);
  }

  getMessage(
    id: string,
    format: "full" | "metadata" | "minimal" = "full",
    metadataHeaders?: string[]
  ): Promise<GmailMessageRaw> {
    const query = new URLSearchParams({ format });
    metadataHeaders?.forEach((h) => query.append("metadataHeaders", h));
    return this.gmailFetch<GmailMessageRaw>(`/users/me/messages/${id}?${query}`);
  }

  async sendMessage(input: SendEmailInput): Promise<{ id: string; threadId?: string }> {
    const raw = buildRawEmail(input);
    const encoded = base64UrlEncode(raw);
    return this.gmailFetch<{ id: string; threadId?: string }>("/users/me/messages/send", {
      method: "POST",
      body: JSON.stringify({ raw: encoded }),
    });
  }

  getProfile(): Promise<{ emailAddress: string }> {
    return this.gmailFetch<{ emailAddress: string }>("/users/me/profile");
  }
}

function buildRawEmail(input: SendEmailInput): string {
  const contentType = input.html ? "text/html; charset=UTF-8" : "text/plain; charset=UTF-8";
  const lines = [
    `To: ${input.to}`,
    input.cc ? `Cc: ${input.cc}` : null,
    input.bcc ? `Bcc: ${input.bcc}` : null,
    `Subject: =?UTF-8?B?${Buffer.from(input.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: ${contentType}`,
    "Content-Transfer-Encoding: base64",
  ].filter(Boolean) as string[];

  if (input.replyToMessageId) {
    lines.push(`In-Reply-To: ${input.replyToMessageId}`);
    lines.push(`References: ${input.replyToMessageId}`);
  }

  const bodyB64 = Buffer.from(input.body, "utf8").toString("base64");
  return `${lines.join("\r\n")}\r\n\r\n${bodyB64}`;
}

export function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function base64UrlDecode(data: string): string {
  const padded = data.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? padded : padded + "=".repeat(4 - (padded.length % 4));
  return Buffer.from(pad, "base64").toString("utf8");
}

export function getHeader(headers: { name: string; value: string }[] | undefined, name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function extractBody(payload: GmailMessageRaw["payload"]): { text?: string; html?: string } {
  if (!payload) return {};

  const result: { text?: string; html?: string } = {};

  function walk(part: NonNullable<GmailMessageRaw["payload"]>) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      result.text = base64UrlDecode(part.body.data);
    } else if (part.mimeType === "text/html" && part.body?.data) {
      result.html = base64UrlDecode(part.body.data);
    }
    part.parts?.forEach(walk);
  }

  walk(payload);
  return result;
}
