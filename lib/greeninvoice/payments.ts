import {
  getMorningPluginId,
  getMorningWebhookNotifyUrl,
} from "../morning/config";
import { getMorningClient } from "../morning";
import type { PaymentFormRequest } from "../morning/types";

export async function getPaymentFormUrl(payload: PaymentFormRequest): Promise<string> {
  return getMorningClient().payments.getFormUrl(payload);
}

export function getWebhookNotifyUrl(): string | undefined {
  return getMorningWebhookNotifyUrl();
}

export { getMorningPluginId };
