/**
 * Gmail SDK — OAuth 2.0 + Gmail API
 * Portable: copy `lib/gmail/` to any Next.js project.
 */
export {
  GmailClient,
  getGmailAuthUrl,
  exchangeGmailCode,
  refreshGmailToken,
  revokeGmailToken,
  base64UrlEncode,
  base64UrlDecode,
  getHeader,
  extractBody,
} from "./client";

export {
  isGmailConfigured,
  gmailConfigFromEnv,
  getGmailAppBaseUrl,
  GMAIL_SCOPES,
  type GmailEnvironment,
} from "./config";

export { GmailError, parseGmailApiError, parseGoogleOAuthError } from "./errors";

export type * from "./types";

export {
  saveGmailConnection,
  loadGmailConnection,
  deleteGmailConnection,
  getGmailConnectionStatus,
  getAuthenticatedGmailClient,
  listInboxMessages,
  getInboxMessage,
  sendCompanyEmail,
} from "./store";
