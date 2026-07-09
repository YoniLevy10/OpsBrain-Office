// Green Invoice (Morning) API client.
// Docs: https://developers.morning.co / https://greeninvoice.docs.apiary.io
// Requires GREENINVOICE_API_ID + GREENINVOICE_API_SECRET env vars (server-only secrets).
// Set GREENINVOICE_SANDBOX=true to hit the sandbox environment.

const BASE_URL =
  process.env.GREENINVOICE_SANDBOX === "true"
    ? "https://sandbox.d.greeninvoice.co.il/api/v1"
    : "https://api.greeninvoice.co.il/api/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;

export function isGreenInvoiceConfigured() {
  return Boolean(process.env.GREENINVOICE_API_ID && process.env.GREENINVOICE_API_SECRET);
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const res = await fetch(`${BASE_URL}/account/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: process.env.GREENINVOICE_API_ID,
      secret: process.env.GREENINVOICE_API_SECRET,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Green Invoice auth failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  // Token is valid ~30-60 minutes; cache for 25.
  cachedToken = { token: data.token, expiresAt: Date.now() + 25 * 60_000 };
  return data.token;
}

export async function giFetch(path: string, init?: RequestInit): Promise<unknown> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Green Invoice ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Income-generating document types in Green Invoice:
// 305 = tax invoice, 320 = tax invoice-receipt, 330 = credit note,
// 400 = receipt, 405 = donation receipt, 300 = transaction invoice
export const INCOME_DOC_TYPES = [300, 305, 320, 400, 405];

// Doc types that imply the money was actually received
export const PAID_DOC_TYPES = new Set([320, 400, 405]);

export async function searchDocuments(fromDate?: string) {
  const body: Record<string, unknown> = {
    type: INCOME_DOC_TYPES,
    pageSize: 100,
    sort: "documentDate",
  };
  if (fromDate) body.fromDate = fromDate;
  const data = (await giFetch("/documents/search", {
    method: "POST",
    body: JSON.stringify(body),
  })) as { items?: unknown[] };
  return data.items ?? [];
}

export async function searchClients() {
  const data = (await giFetch("/clients/search", {
    method: "POST",
    body: JSON.stringify({ pageSize: 100, active: true }),
  })) as { items?: unknown[] };
  return data.items ?? [];
}

export async function searchExpenses(fromDate?: string) {
  const body: Record<string, unknown> = { pageSize: 100 };
  if (fromDate) body.fromDate = fromDate;
  const data = (await giFetch("/expenses/search", {
    method: "POST",
    body: JSON.stringify(body),
  })) as { items?: unknown[] };
  return data.items ?? [];
}
