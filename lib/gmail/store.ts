import type { SupabaseClient } from "@supabase/supabase-js";
import { assertAppAccess } from "../app-access";
import { getSupabase } from "../supabase";
import { getSupabaseAdmin } from "../supabase-admin";
import { decryptSecret, encryptSecret } from "../token-crypto";
import { mapPool } from "./concurrency";
import { GmailClient, extractBody, getHeader, refreshGmailToken } from "./client";
import { isGmailConfigured } from "./config";
import { GmailError } from "./errors";
import { sanitizeEmailHtml } from "./sanitize";
import type {
  GmailConnectionRow,
  GmailConnectionStatus,
  GmailMessageDetail,
  GmailMessageListItem,
  GmailTokenSet,
  SendEmailInput,
} from "./types";

const SINGLETON_ID = "00000000-0000-4000-8000-000000000001";

function gmailDb(): SupabaseClient {
  const admin = getSupabaseAdmin();
  if (admin) return admin;
  const sb = getSupabase();
  if (!sb) throw new GmailError("Supabase לא מחובר");
  throw new GmailError(
    "נדרש SUPABASE_SERVICE_ROLE_KEY לאחסון מאובטח של טוקני Gmail — הוסף ב-Vercel והרץ supabase/migration-gmail.sql"
  );
}

function mapDbError(message: string): never {
  if (message.includes("ob_gmail_connection") && message.includes("does not exist")) {
    throw new GmailError("טבלת ob_gmail_connection חסרה — הרץ supabase/migration-gmail.sql ב-Supabase SQL Editor");
  }
  throw new GmailError(message);
}

function decryptRow(row: GmailConnectionRow): GmailConnectionRow {
  return {
    ...row,
    access_token: decryptSecret(row.access_token),
    refresh_token: decryptSecret(row.refresh_token),
  };
}

export async function saveGmailConnection(tokens: GmailTokenSet): Promise<void> {
  const sb = gmailDb();

  const { error } = await sb.from("ob_gmail_connection").upsert(
    {
      id: SINGLETON_ID,
      email: tokens.email,
      access_token: encryptSecret(tokens.accessToken),
      refresh_token: encryptSecret(tokens.refreshToken),
      expires_at: new Date(tokens.expiresAt).toISOString(),
      scopes: tokens.scopes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) mapDbError(`שמירת חיבור Gmail נכשלה: ${error.message}`);
}

export async function loadGmailConnection(): Promise<GmailConnectionRow | null> {
  const sb = gmailDb();

  const { data, error } = await sb
    .from("ob_gmail_connection")
    .select("*")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  if (error) mapDbError(`טעינת חיבור Gmail נכשלה: ${error.message}`);
  return data ? decryptRow(data as GmailConnectionRow) : null;
}

export async function deleteGmailConnection(): Promise<void> {
  await assertAppAccess();
  const sb = gmailDb();
  const { error } = await sb.from("ob_gmail_connection").delete().eq("id", SINGLETON_ID);
  if (error) mapDbError(`מחיקת חיבור Gmail נכשלה: ${error.message}`);
}

export async function getGmailConnectionStatus(): Promise<GmailConnectionStatus> {
  const configured = isGmailConfigured();
  if (!configured) {
    return { connected: false, configured: false, error: "חסרים GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET" };
  }

  try {
    const row = await loadGmailConnection();
    if (!row) return { connected: false, configured: true };
    return {
      connected: true,
      configured: true,
      email: row.email,
      connectedAt: row.connected_at,
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      error: err instanceof Error ? err.message : "שגיאה בבדיקת חיבור",
    };
  }
}

async function getValidAccessToken(row: GmailConnectionRow): Promise<string> {
  const expiresAt = new Date(row.expires_at).getTime();
  if (Date.now() < expiresAt - 60_000) return row.access_token;

  const refreshed = await refreshGmailToken(row.refresh_token);
  const sb = gmailDb();
  const { error } = await sb
    .from("ob_gmail_connection")
    .update({
      access_token: encryptSecret(refreshed.accessToken),
      expires_at: new Date(refreshed.expiresAt).toISOString(),
      scopes: refreshed.scopes ?? row.scopes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", SINGLETON_ID);

  if (error) mapDbError(`רענון טוקן Gmail נכשל: ${error.message}`);
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
    messageId: getHeader(headers, "Message-ID") || undefined,
  };
}

export async function listInboxMessages(options?: {
  q?: string;
  maxResults?: number;
  pageToken?: string;
}): Promise<{ messages: GmailMessageListItem[]; nextPageToken?: string }> {
  await assertAppAccess();
  const client = await getAuthenticatedGmailClient();
  if (!client) throw new GmailError("Gmail לא מחובר");

  const maxResults = options?.maxResults ?? 30;
  const list = await client.listMessages({
    labelIds: ["INBOX"],
    q: options?.q,
    maxResults,
    pageToken: options?.pageToken,
  });

  if (!list.messages?.length) return { messages: [], nextPageToken: list.nextPageToken };

  const messages = await mapPool(list.messages.slice(0, maxResults), 8, async (m) => {
    const detail = await client.getMessage(m.id, "metadata", ["Subject", "From", "To", "Date", "Message-ID"]);
    return toListItem(detail);
  });

  return { messages, nextPageToken: list.nextPageToken };
}

export async function getInboxMessage(id: string): Promise<GmailMessageDetail> {
  await assertAppAccess();
  const client = await getAuthenticatedGmailClient();
  if (!client) throw new GmailError("Gmail לא מחובר");

  const raw = await client.getMessage(id, "full");
  const bodies = extractBody(raw.payload);
  const base = toListItem(raw);
  const headers = raw.payload?.headers;

  return {
    ...base,
    references: getHeader(headers, "References") || undefined,
    bodyText: bodies.text,
    bodyHtml: bodies.html ? sanitizeEmailHtml(bodies.html) : undefined,
  };
}

export async function markMessageAsRead(id: string): Promise<void> {
  await assertAppAccess();
  const client = await getAuthenticatedGmailClient();
  if (!client) return;
  try {
    await client.modifyMessage(id, { removeLabelIds: ["UNREAD"] });
  } catch {
    /* best effort */
  }
}

async function resolveReplyHeaders(
  client: GmailClient,
  replyToMessageId?: string
): Promise<{ inReplyTo?: string; references?: string }> {
  if (!replyToMessageId) return {};
  if (replyToMessageId.includes("@")) {
    return { inReplyTo: replyToMessageId, references: replyToMessageId };
  }

  const msg = await client.getMessage(replyToMessageId, "metadata", ["Message-ID", "References"]);
  const messageId = getHeader(msg.payload?.headers, "Message-ID");
  const references = getHeader(msg.payload?.headers, "References");
  if (!messageId) return {};
  return {
    inReplyTo: messageId,
    references: references ? `${references} ${messageId}` : messageId,
  };
}

export async function sendCompanyEmail(input: SendEmailInput): Promise<{ id: string }> {
  await assertAppAccess();
  const client = await getAuthenticatedGmailClient();
  if (!client) throw new GmailError("Gmail לא מחובר");

  const replyHeaders = await resolveReplyHeaders(client, input.replyToMessageId);
  const res = await client.sendMessage({ ...input, ...replyHeaders });
  return { id: res.id };
}
