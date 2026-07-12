import { giFetch } from "../greeninvoice";
import { parseGiApiError } from "./errors";
import type { GiPaymentFormRequest, GiPaymentFormResponse } from "./types";

async function giFetchSafe<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await giFetch<T>(path, init);
  } catch (err) {
    if (err instanceof Error && err.message.includes("failed:")) {
      const match = err.message.match(/failed: (\d+) (.+)/);
      if (match) {
        throw new Error(parseGiApiError(match[2], Number(match[1])));
      }
    }
    throw err;
  }
}

export async function getPaymentFormUrl(payload: GiPaymentFormRequest): Promise<string> {
  const res = await giFetchSafe<GiPaymentFormResponse>("/payments/form", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.errorCode && res.errorCode !== 0) {
    throw new Error(res.errorMessage ?? `שגיאת תשלום (${res.errorCode})`);
  }
  if (!res.url) {
    throw new Error("לא התקבל קישור תשלום מ-Morning — ודא שסליקה מופעלת בחשבון");
  }
  return res.url;
}

export function getWebhookNotifyUrl(): string | undefined {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL;
  if (!base) return undefined;
  return `${base}/api/webhooks/greeninvoice`;
}
