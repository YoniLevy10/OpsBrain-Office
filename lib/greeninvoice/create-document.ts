import { createDocument } from "./documents";
import { buildDocumentPayload } from "./build-payload";
import type { IssuableDocumentKind } from "./catalog";
import type {
  CreateInvoiceInput,
  CreateReceiptInput,
  GiCreateDocumentRequest,
  GiPaymentTypeCode,
} from "./types";

type IssueDocumentInput = CreateReceiptInput &
  CreateInvoiceInput & { paymentType?: GiPaymentTypeCode };
import { MorningError } from "../morning/errors";

function isRetryableCreateError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("לא צפויה") ||
    lower.includes("unexpected") ||
    lower.includes("חתימה") ||
    lower.includes("signature") ||
    lower.includes("1111") ||
    lower.includes("לקוח") ||
    lower.includes("client")
  );
}

type CreateOptions = {
  kind: IssuableDocumentKind;
  input: IssueDocumentInput;
  giClientId?: string;
};

async function tryCreate(payload: GiCreateDocumentRequest) {
  return createDocument(payload);
}

/**
 * Morning create with fallbacks for common payload issues:
 * 1. unsigned if signed fails
 * 2. new client (add) if linked giClientId is stale
 */
export async function createDocumentResilient(opts: CreateOptions) {
  const { kind, input, giClientId } = opts;
  const baseInput = { ...input, giClientId };

  const attempts: GiCreateDocumentRequest[] = [
    buildDocumentPayload(kind, baseInput),
    buildDocumentPayload(kind, { ...baseInput, signed: false }),
    giClientId
      ? buildDocumentPayload(kind, { ...baseInput, giClientId: undefined, forceAddClient: true, signed: false })
      : null,
  ].filter(Boolean) as GiCreateDocumentRequest[];

  let lastError: Error | null = null;

  for (let i = 0; i < attempts.length; i++) {
    try {
      return await tryCreate(attempts[i]);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message;
      if (i < attempts.length - 1 && isRetryableCreateError(msg)) continue;
      throw lastError;
    }
  }

  throw lastError ?? new MorningError("יצירת מסמך נכשלה");
}
