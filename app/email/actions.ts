"use server";

import {
  deleteGmailConnection,
  getInboxMessage,
  listInboxMessages,
  loadGmailConnection,
  markMessageAsRead,
  sendCompanyEmail,
} from "@/lib/gmail/store";
import { revokeGmailToken } from "@/lib/gmail";
import type { GmailMessageDetail, GmailMessageListItem } from "@/lib/gmail/types";

export async function fetchInboxMessages(options?: {
  q?: string;
  pageToken?: string;
  maxResults?: number;
}): Promise<{
  ok: boolean;
  error?: string;
  messages: GmailMessageListItem[];
  nextPageToken?: string;
}> {
  try {
    const result = await listInboxMessages(options);
    return { ok: true, messages: result.messages, nextPageToken: result.nextPageToken };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה", messages: [] };
  }
}

export async function fetchInboxMessage(id: string): Promise<{
  ok: boolean;
  error?: string;
  message?: GmailMessageDetail;
}> {
  try {
    const message = await getInboxMessage(id);
    void markMessageAsRead(id);
    return { ok: true, message };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה" };
  }
}

export async function sendInboxEmail(input: {
  to: string;
  subject: string;
  body: string;
  replyToMessageId?: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const result = await sendCompanyEmail(input);
    return { ok: true, id: result.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה בשליחה" };
  }
}

export async function disconnectGmailAccount(): Promise<{ ok: boolean; error?: string }> {
  try {
    const row = await loadGmailConnection();
    if (row?.access_token) {
      try {
        await revokeGmailToken(row.access_token);
      } catch {
        /* best effort */
      }
    }
    await deleteGmailConnection();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה" };
  }
}
