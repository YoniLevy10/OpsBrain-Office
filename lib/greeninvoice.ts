// Green Invoice (Morning) API client with pagination support.

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

export const INCOME_DOC_TYPES = [300, 305, 320, 400, 405];
export const PAID_DOC_TYPES = new Set([320, 400, 405]);

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

async function searchPaginated(
  path: string,
  baseBody: Record<string, unknown>
): Promise<unknown[]> {
  const all: unknown[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = (await giFetch(path, {
      method: "POST",
      body: JSON.stringify({ ...baseBody, page, pageSize: PAGE_SIZE }),
    })) as { items?: unknown[] };
    const items = data.items ?? [];
    all.push(...items);
    if (items.length < PAGE_SIZE) break;
  }
  return all;
}

export async function searchDocuments(fromDate?: string) {
  const body: Record<string, unknown> = {
    type: INCOME_DOC_TYPES,
    sort: "documentDate",
  };
  if (fromDate) body.fromDate = fromDate;
  return searchPaginated("/documents/search", body);
}

export async function searchClients() {
  return searchPaginated("/clients/search", { active: true });
}

export async function searchExpenses(fromDate?: string) {
  const body: Record<string, unknown> = {};
  if (fromDate) body.fromDate = fromDate;
  return searchPaginated("/expenses/search", body);
}
