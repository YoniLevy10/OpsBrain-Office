export type GmailTokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  scopes?: string;
};

export type GmailConnectionRow = {
  id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scopes: string | null;
  connected_at: string;
  updated_at: string;
};

export type GmailMessageHeader = { name: string; value: string };

export type GmailMessageListItem = {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  labelIds?: string[];
  unread?: boolean;
  /** RFC 822 Message-ID header — used for reply threading */
  messageId?: string;
};

export type GmailMessageDetail = GmailMessageListItem & {
  bodyHtml?: string;
  bodyText?: string;
  references?: string;
};

export type EmailAttachment = {
  filename: string;
  mimeType: string;
  content: Buffer;
};

export type GmailListResponse = {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

export type GmailMessageRaw = {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: GmailPayloadPart;
};

export type GmailPayloadPart = {
  mimeType?: string;
  body?: { data?: string; size?: number };
  headers?: GmailMessageHeader[];
  parts?: GmailPayloadPart[];
};

export type SendEmailInput = {
  to: string;
  subject: string;
  body: string;
  html?: boolean;
  cc?: string;
  bcc?: string;
  /** Gmail message id or RFC Message-ID header */
  replyToMessageId?: string;
  attachments?: EmailAttachment[];
};

export type GmailConnectionStatus = {
  connected: boolean;
  configured: boolean;
  email?: string;
  connectedAt?: string;
  error?: string;
};
