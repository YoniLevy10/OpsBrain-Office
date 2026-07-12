import type { MorningClient } from "../client";
import type {
  ChargeTokenRequest,
  PaymentFormRequest,
  PaymentFormResponse,
  PaymentTokenSearchRequest,
  SearchResult,
} from "../types";

export class PaymentsResource {
  constructor(private readonly client: MorningClient) {}

  /** POST /payments/form — get payment page URL */
  getFormUrl(payload: PaymentFormRequest): Promise<string> {
    return this.client.post<PaymentFormResponse>("/payments/form", payload).then((res) => {
      if (res.errorCode && res.errorCode !== 0) {
        throw new Error(res.errorMessage ?? `שגיאת תשלום (${res.errorCode})`);
      }
      if (!res.url) {
        throw new Error("לא התקבל קישור תשלום — ודא שסליקה מופעלת ב-Morning");
      }
      return res.url;
    });
  }

  /** POST /payments/form — raw response */
  getForm(payload: PaymentFormRequest): Promise<PaymentFormResponse> {
    return this.client.post<PaymentFormResponse>("/payments/form", payload);
  }

  /** POST /payments/tokens/search */
  searchTokens(body: PaymentTokenSearchRequest): Promise<SearchResult<unknown>> {
    return this.client.post("/payments/tokens/search", body);
  }

  /** POST /payments/tokens/{id}/charge */
  chargeToken(id: string, payload: ChargeTokenRequest): Promise<unknown> {
    return this.client.post(`/payments/tokens/${id}/charge`, payload);
  }
}
