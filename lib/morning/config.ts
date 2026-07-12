export type MorningEnvironment = "production" | "sandbox";

export type MorningConfig = {
  clientId: string;
  clientSecret: string;
  environment?: MorningEnvironment;
};

export type MorningUrls = {
  apiBase: string;
  tokenUrl: string;
  cacheBase: string;
  environment: MorningEnvironment;
};

const URLS: Record<MorningEnvironment, Omit<MorningUrls, "environment">> = {
  production: {
    apiBase: "https://api.greeninvoice.co.il/api/v1",
    tokenUrl: "https://api.morning.co/idp/v1/oauth/token",
    cacheBase: "https://cache.greeninvoice.co.il",
  },
  sandbox: {
    apiBase: "https://sandbox.d.greeninvoice.co.il/api/v1",
    tokenUrl: "https://api.sandbox.morning.dev/idp/v1/oauth/token",
    cacheBase: "https://cache.greeninvoice.co.il",
  },
};

export function resolveEnvironment(sandbox?: boolean): MorningEnvironment {
  if (sandbox === true) return "sandbox";
  if (sandbox === false) return "production";
  return process.env.GREENINVOICE_SANDBOX === "true" ? "sandbox" : "production";
}

export function getMorningUrls(environment?: MorningEnvironment): MorningUrls {
  const env = environment ?? resolveEnvironment();
  return { ...URLS[env], environment: env };
}

export function morningConfigFromEnv(): MorningConfig | null {
  const clientId = process.env.GREENINVOICE_API_ID;
  const clientSecret = process.env.GREENINVOICE_API_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    environment: resolveEnvironment(),
  };
}

export function isMorningConfigured(config?: MorningConfig | null): boolean {
  const c = config ?? morningConfigFromEnv();
  return Boolean(c?.clientId && c?.clientSecret);
}

export function getMorningEnvLabel(environment?: MorningEnvironment): string {
  const env = environment ?? resolveEnvironment();
  return env === "sandbox" ? "Sandbox (בדיקות)" : "Production (אמת)";
}

/** Plugin ID for payment forms — optional unless using /payments/form */
export function getMorningPluginId(): string | undefined {
  return process.env.GREENINVOICE_PLUGIN_ID || undefined;
}

/** Webhook secret for inbound payment notifications */
export function getMorningWebhookSecret(): string | undefined {
  return process.env.GREENINVOICE_WEBHOOK_SECRET || undefined;
}

/** Base app URL for notifyUrl on payment forms */
export function getMorningAppBaseUrl(): string | undefined {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL;
}

export function getMorningWebhookNotifyUrl(): string | undefined {
  const base = getMorningAppBaseUrl();
  if (!base) return undefined;
  return `${base}/api/webhooks/greeninvoice`;
}
