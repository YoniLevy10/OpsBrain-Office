import {
  getMorningUrls,
  isMorningConfigured,
  morningConfigFromEnv,
  type MorningConfig,
  type MorningUrls,
} from "./config";
import { MorningError, parseMorningApiError, parseMorningAuthError } from "./errors";
import { BusinessesResource } from "./resources/businesses";
import { ClientsResource } from "./resources/clients";
import { DocumentsResource } from "./resources/documents";
import { ExpensesResource } from "./resources/expenses";
import { ItemsResource } from "./resources/items";
import { PartnersResource } from "./resources/partners";
import { PaymentsResource } from "./resources/payments";
import { ReferenceResource } from "./resources/reference";
import { SuppliersResource } from "./resources/suppliers";

export type MorningRequestInit = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

type TokenCache = { token: string; expiresAt: number };

let defaultClient: MorningClient | null = null;

export class MorningClient {
  readonly config: MorningConfig;
  readonly urls: MorningUrls;

  readonly businesses: BusinessesResource;
  readonly clients: ClientsResource;
  readonly suppliers: SuppliersResource;
  readonly items: ItemsResource;
  readonly documents: DocumentsResource;
  readonly expenses: ExpensesResource;
  readonly payments: PaymentsResource;
  readonly partners: PartnersResource;
  readonly reference: ReferenceResource;

  private tokenCache: TokenCache | null = null;

  constructor(config: MorningConfig) {
    if (!config.clientId || !config.clientSecret) {
      throw new MorningError("חסרים clientId ו-clientSecret");
    }
    this.config = config;
    this.urls = getMorningUrls(config.environment);

    this.businesses = new BusinessesResource(this);
    this.clients = new ClientsResource(this);
    this.suppliers = new SuppliersResource(this);
    this.items = new ItemsResource(this);
    this.documents = new DocumentsResource(this);
    this.expenses = new ExpensesResource(this);
    this.payments = new PaymentsResource(this);
    this.partners = new PartnersResource(this);
    this.reference = new ReferenceResource(this);
  }

  static fromEnv(): MorningClient {
    const config = morningConfigFromEnv();
    if (!config) throw new MorningError("Morning לא מוגדר — חסרים משתני סביבה");
    return new MorningClient(config);
  }

  async getToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 60_000) {
      return this.tokenCache.token;
    }

    const res = await fetch(this.urls.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
      cache: "no-store",
    });

    const body = await res.text();
    if (!res.ok) {
      throw parseMorningAuthError(res.status, body, this.urls.environment === "sandbox");
    }

    const data = JSON.parse(body) as {
      accessToken?: string;
      token?: string;
      expiresAt?: number;
      expires?: number;
    };

    const token = data.accessToken ?? data.token;
    if (!token) throw new MorningError("תגובת אימות לא תקינה — חסר accessToken");

    const expiresAtSec = data.expiresAt ?? data.expires;
    const expiresAtMs = expiresAtSec
      ? expiresAtSec * (expiresAtSec > 1e12 ? 1 : 1000)
      : Date.now() + 55 * 60_000;

    this.tokenCache = { token, expiresAt: expiresAtMs };
    return token;
  }

  clearToken(): void {
    this.tokenCache = null;
  }

  private buildUrl(path: string, query?: MorningRequestInit["query"]): string {
    const url = new URL(`${this.urls.apiBase}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value != null) url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private async request<T>(path: string, init: MorningRequestInit = {}): Promise<T> {
    const { body, query, headers, ...rest } = init;
    const token = await this.getToken();

    const doFetch = async (bearer: string) =>
      fetch(this.buildUrl(path, query), {
        ...rest,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearer}`,
          ...(headers ?? {}),
        },
        body: body != null ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

    let res = await doFetch(token);

    if (res.status === 401) {
      this.clearToken();
      res = await doFetch(await this.getToken());
    }

    if (!res.ok) {
      const text = await res.text();
      throw parseMorningApiError(text, res.status);
    }

    if (res.status === 204) return undefined as T;
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  get<T>(path: string, query?: MorningRequestInit["query"]): Promise<T> {
    return this.request<T>(path, { method: "GET", query });
  }

  post<T>(path: string, body?: unknown, query?: MorningRequestInit["query"]): Promise<T> {
    return this.request<T>(path, { method: "POST", body, query });
  }

  put<T>(path: string, body?: unknown, query?: MorningRequestInit["query"]): Promise<T> {
    return this.request<T>(path, { method: "PUT", body, query });
  }

  delete<T>(path: string, body?: unknown, query?: MorningRequestInit["query"]): Promise<T> {
    return this.request<T>(path, { method: "DELETE", body, query });
  }

  /** Fetch from cache.greeninvoice.co.il (no auth required) */
  async cacheGet<T>(path: string, query?: MorningRequestInit["query"]): Promise<T> {
    const url = new URL(`${this.urls.cacheBase}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value != null) url.searchParams.set(key, String(value));
      }
    }
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      throw parseMorningApiError(text, res.status);
    }
    return res.json() as Promise<T>;
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.documents.getTypes("he");
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "שגיאת חיבור" };
    }
  }
}

export function getMorningClient(config?: MorningConfig): MorningClient {
  if (config) return new MorningClient(config);
  if (!defaultClient) {
    const envConfig = morningConfigFromEnv();
    if (!envConfig) throw new MorningError("Morning לא מוגדר");
    defaultClient = new MorningClient(envConfig);
  }
  return defaultClient;
}

export function resetMorningClient(): void {
  defaultClient = null;
}

export { isMorningConfigured, morningConfigFromEnv };
