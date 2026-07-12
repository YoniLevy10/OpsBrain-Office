/**
 * @deprecated Import from `@/lib/morning` instead.
 * Backward-compatible adapter for existing OpsBrain code.
 */
import {
  getMorningClient,
  isMorningConfigured,
  testMorningConnection,
  searchDocuments,
  searchClients,
  searchExpenses,
  INCOME_DOCUMENT_TYPES,
  PAID_DOCUMENT_TYPES,
  getMorningEnvLabel,
} from "./morning";

export const isGreenInvoiceConfigured = isMorningConfigured;
export const testGreenInvoiceConnection = testMorningConnection;
export const INCOME_DOC_TYPES = INCOME_DOCUMENT_TYPES;
export const PAID_DOC_TYPES = PAID_DOCUMENT_TYPES;
export const getGreenInvoiceEnvLabel = getMorningEnvLabel;

export { searchDocuments, searchClients, searchExpenses };

/** @deprecated Use `getMorningClient().get/post` or resource APIs */
export async function giFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const client = getMorningClient();
  const method = (init?.method ?? "GET").toUpperCase();
  let body: unknown;
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string);
    } catch {
      body = init.body;
    }
  }

  switch (method) {
    case "POST":
      return client.post<T>(path, body);
    case "PUT":
      return client.put<T>(path, body);
    case "DELETE":
      return client.delete<T>(path, body);
    default:
      return client.get<T>(path);
  }
}
