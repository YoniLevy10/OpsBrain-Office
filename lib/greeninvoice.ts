// Morning (חשבונית ירוקה) API client — OAuth 2.0 + pagination.
// Docs: https://developers.morning.co/api

const SANDBOX = process.env.GREENINVOICE_SANDBOX === "true";

const API_BASE = SANDBOX
  ? "https://sandbox.d.greeninvoice.co.il/api/v1"
  : "https://api.greeninvoice.co.il/api/v1";

const TOKEN_URL = SANDBOX
  ? "https://api.sandbox.morning.dev/idp/v1/oauth/token"
  : "https://api.morning.co/idp/v1/oauth/token";

let cachedToken: { token: string; expiresAt: number } | null = null;

export function isGreenInvoiceConfigured() {
  return Boolean(process.env.GREENINVOICE_API_ID && process.env.GREENINVOICE_API_SECRET);
}

function parseAuthError(status: number, body: string): string {
  try {
    const data = JSON.parse(body) as { error?: string; error_description?: string };
    const code = data.error ?? "";
    const desc = data.error_description ?? body;

    if (code === "unauthorized_client") {
      return "אין גישת API במנוי — נדרש מנוי Best ומעלה + מפתח API פעיל ב-Morning";
    }
    if (code === "invalid_client") {
      return "מפתח API שגוי — בדוק GREENINVOICE_API_ID ו-GREENINVOICE_API_SECRET ב-Vercel";
    }
    if (code === "invalid_grant") {
      return "מפתח API פג תוקף או בוטל — צור מפתח חדש ב-Morning → כלי מפתחים";
    }
    if (SANDBOX) {
      return `שגיאת אימות (sandbox): ${desc}`;
    }
    return `שגיאת אימות Morning: ${desc}`;
  } catch {
    return `שגיאת אימות Morning (${status}): ${body.slice(0, 200)}`;
  }
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const clientId = process.env.GREENINVOICE_API_ID;
  const clientSecret = process.env.GREENINVOICE_API_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("חשבונית ירוקה לא מחוברת — חסרים משתני סביבה");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(parseAuthError(res.status, body));
  }

  const data = JSON.parse(body) as {
    accessToken?: string;
    token?: string;
    expiresAt?: number;
    expires?: number;
  };

  const token = data.accessToken ?? data.token;
  if (!token) {
    throw new Error("תגובת אימות לא תקינה מ-Morning — חסר accessToken");
  }

  const expiresAtSec = data.expiresAt ?? data.expires;
  const expiresAtMs = expiresAtSec
    ? expiresAtSec * (expiresAtSec > 1e12 ? 1 : 1000)
    : Date.now() + 55 * 60_000;

  cachedToken = { token, expiresAt: expiresAtMs };
  return token;
}

export async function giFetch(path: string, init?: RequestInit): Promise<unknown> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    cachedToken = null;
    const retryToken = await getToken();
    const retry = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${retryToken}`,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    if (!retry.ok) {
      throw new Error(`Morning ${path} failed: ${retry.status} ${await retry.text()}`);
    }
    return retry.json();
  }

  if (!res.ok) {
    throw new Error(`Morning ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Quick connectivity check for settings / diagnostics */
export async function testGreenInvoiceConnection(): Promise<{ ok: boolean; error?: string }> {
  if (!isGreenInvoiceConfigured()) {
    return { ok: false, error: "משתני סביבה חסרים" };
  }
  try {
    await giFetch("/documents/types", { method: "GET" });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאת חיבור" };
  }
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

export function getGreenInvoiceEnvLabel(): string {
  return SANDBOX ? "Sandbox (בדיקות)" : "Production (אמת)";
}
