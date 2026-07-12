import { getSupabase } from "../supabase";
import { GmailClient, extractBody, getHeader, refreshGmailToken } from "./client";
import { isGmailConfigured } from "./config";
import { GmailError } from "./errors";
import type {
  GmailConnectionRow,
  GmailConnectionStatus,
  GmailMessageDetail,
  GmailMessageListItem,
  GmailTokenSet,
  SendEmailInput,
} from "./types";

const SINGLETON_ID = "00000000-0000-4000-8000-000000000001";

export async function saveGmailConnection(tokens: GmailTokenSet): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new GmailError("Supabase לא מחובר");

  const { error } = await sb.from("ob_gmail_connection").upsert(
    {
      id: SINGLETON_ID,
      email: tokens.email,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_at: new Date(tokens.expiresAt).toISOString(),
      scopes: tokens.scopes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw new GmailError(`שמירת חיבור Gmail נכשלה: ${error.message}`);
}

export async function loadGmailConnection(): Promise<GmailConnectionRow | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data } = await sb
    .from("ob_gmail_connection")
    .select("*")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  return (data as GmailConnectionRow | null) ?? null;
}

export async function deleteGmailConnection(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("ob_gmail_connection").delete().eq("id", SINGLETON_ID);
}

export async function getGmailConnectionStatus(): Promise<GmailConnectionStatus> {
  const configured = isGmailConfigured();
  if (!configured) {
    return { connected: false, configured: false, error: "חסרים GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET" };
  }

  const row = await loadGmailConnection();
  if (!row) return { connected: false, configured: true };

  return {
    connected: true,
    configured: true,
    email: row.email,
    connectedAt: row.connected_at,
  };
}

async function getValidAccessToken(row: GmailConnectionRow): Promise<string> {
  const expiresAt = new Date(row.expires_at).getTime();
  if (Date.now() < expiresAt - 60_000) return row.access_token;

  const refreshed = await refreshGmailToken(row.refresh_token);
  const sb = getSupabase();
  if (sb) {
    await sb
      .from("ob_gmail_connection")
      .update({
        access_token: refreshed.accessToken,
        expires_at: new Date(refreshed.expiresAt).toISOString(),
        scopes: refreshed.scopes ?? row.scopes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", SINGLETON_ID);
  }

  return refreshed.accessToken;
}

export async function getAuthenticatedGmailClient(): Promise<GmailClient | null> {
  const row = await loadGmailConnection();
  if (!row) return null;
  const accessToken = await getValidAccessToken(row);
  return GmailClient.withAccessToken(accessToken);
}

function toListItem(raw: Awaited<ReturnType<GmailClient["getMessage"]>>): GmailMessageListItem {
  const headers = raw.payload?.headers;
  return {
    id: raw.id,
    threadId: raw.threadId,
    snippet: raw.snippet,
    subject: getHeader(headers, "Subject"),
    from: getHeader(headers, "From"),
    to: getHeader(headers, "To"),
    date: getHeader(headers, "Date"),
    labelIds: raw.labelIds,
    unread: raw.labelIds?.includes("UNREAD"),
  };
}

export async function listInboxMessages(options?: {
  q?: string;
  maxResults?: number;
  pageToken?: string;
}): Promise<{ messages: GmailMessageListItem[]; nextPageToken?: string }> {
  const client = await getAuthenticatedGmailClient();
  if (!client) throw new GmailError("Gmail לא מחובר");

  const list = await client.listMessages({
    labelIds: ["INBOX"],
    q: options?.q,
    maxResults: options?.maxResults ?? 30,
    pageToken: options?.pageToken,
  });

  if (!list.messages?.length) return { messages: [], nextPageToken: list.nextPageToken };

  const messages = await Promise.all(
    list.messages.slice(0, options?.maxResults ?? 30).map(async (m) => {
      const detail = await client.getMessage(m.id, "metadata", [
        "Subject",
        "From",
        "To",
        "Date",
      ]);
      return toListItem(detail);
    })
  );

  return { messages, nextPageToken: list.nextPageToken };
}

export async function getInboxMessage(id: string): Promise<GmailMessageDetail> {
  const client = await getAuthenticatedGmailClient();
  if (!client) throw new GmailError("Gmail לא מחובר");

  const raw = await client.getMessage(id, "full");
  const bodies = extractBody(raw.payload);
  const base = toListItem(raw);

  return {
    ...base,
    bodyText: bodies.text,
    bodyHtml: bodies.html,
  };
}

export async function sendCompanyEmail(input: SendEmailInput): Promise<{ id: string }> {
  const client = await getAuthenticatedGmailClient();
  if (!client) throw new GmailError("Gmail לא מחובר");
  const res = await client.sendMessage(input);
  return { id: res.id };
}
