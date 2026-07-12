/**
 * Morning (חשבונית ירוקה) TypeScript SDK
 *
 * Full API coverage — 66 endpoints across 9 resource groups.
 * Portable: copy the `lib/morning/` folder to any Node/Next.js project.
 *
 * @see README.md
 * @see https://developers.morning.co/api
 */

// Client
export {
  MorningClient,
  getMorningClient,
  resetMorningClient,
  isMorningConfigured,
  morningConfigFromEnv,
} from "./client";

// Config
export {
  getMorningUrls,
  getMorningEnvLabel,
  getMorningPluginId,
  getMorningWebhookSecret,
  getMorningAppBaseUrl,
  getMorningWebhookNotifyUrl,
  resolveEnvironment,
  type MorningConfig,
  type MorningEnvironment,
  type MorningUrls,
} from "./config";

// Errors
export { MorningError, parseMorningApiError, parseMorningAuthError, mapPaymentTypeLabel } from "./errors";

// Constants
export {
  DOCUMENT_TYPES,
  INCOME_DOCUMENT_TYPES,
  PAID_DOCUMENT_TYPES,
  PAYMENT_REQUIRED_DOCUMENT_TYPES,
  DOCUMENT_STATUSES,
  PAYMENT_TYPES,
  VAT_TYPES,
  EXPENSE_STATUSES,
  EXPENSE_DOCUMENT_TYPES,
  CURRENCIES,
  DEFAULT_PAGE_SIZE,
  DEFAULT_MAX_PAGES,
  type DocumentTypeCode,
  type PaymentTypeCode,
  type VatTypeCode,
  type CurrencyCode,
} from "./constants";

// Types
export type * from "./types";

// Resources (for advanced tree-shaking imports)
export * from "./resources";

// Helpers
export * from "./helpers";

// Pagination utility
export { searchAllPages, type SearchPage, type PaginatedSearchBody } from "./pagination";

// Convenience sync functions (read-only)
import { getMorningClient } from "./client";
import { INCOME_DOCUMENT_TYPES } from "./constants";

export async function searchDocuments(fromDate?: string) {
  const client = getMorningClient();
  return client.documents.searchAll({
    type: INCOME_DOCUMENT_TYPES,
    sort: "documentDate",
    ...(fromDate ? { fromDate } : {}),
  });
}

export async function searchClients() {
  const client = getMorningClient();
  return client.clients.searchAll({ active: true });
}

export async function searchExpenses(fromDate?: string) {
  const client = getMorningClient();
  return client.expenses.searchAll(fromDate ? { fromDate } : {});
}

export async function testMorningConnection() {
  const client = getMorningClient();
  return client.testConnection();
}
