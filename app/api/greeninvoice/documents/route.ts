import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { issueDocument, previewGiDocument } from "@/lib/greeninvoice/service";
import { buildDocumentPayload } from "@/lib/greeninvoice/build-payload";
import {
  DOCUMENT_CATALOG,
  validateDocumentInput,
  type IssuableDocumentKind,
} from "@/lib/greeninvoice/catalog";
import { getClientGiId } from "@/lib/greeninvoice/action-log";
import { FINANCE_CACHE_TAG } from "@/lib/cache-tags";
import type { CreateInvoiceInput, CreateReceiptInput } from "@/lib/greeninvoice/types";

export const dynamic = "force-dynamic";

const ISSUE_KINDS = DOCUMENT_CATALOG.map((d) => d.kind);

type DocumentBody = {
  action?: string;
  giClientId?: string;
  clientId?: string;
} & Partial<CreateReceiptInput & CreateInvoiceInput>;

function bustCache() {
  revalidateTag(FINANCE_CACHE_TAG, "max");
}

function parseKind(action: string): IssuableDocumentKind | null {
  const previewPrefix = "preview_";
  const raw = action.startsWith(previewPrefix) ? action.slice(previewPrefix.length) : action;
  if (!ISSUE_KINDS.includes(raw as IssuableDocumentKind)) return null;
  return raw as IssuableDocumentKind;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DocumentBody;
    const action = body.action ?? "receipt";
    const kind = parseKind(action);

    if (!kind) {
      return NextResponse.json(
        { ok: false, error: `פעולה לא נתמכת: ${action}` },
        { status: 400 }
      );
    }

    const validationError = validateDocumentInput(body);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const giClientId =
      body.giClientId ?? (body.clientId ? (await getClientGiId(body.clientId)) ?? undefined : undefined);

    if (action.startsWith("preview_")) {
      const payload = buildDocumentPayload(kind, { ...body, giClientId } as CreateReceiptInput);
      const result = await previewGiDocument(payload);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    const result = await issueDocument(kind, { ...body, giClientId } as CreateReceiptInput);
    if (result.ok) bustCache();
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאה" },
      { status: 500 }
    );
  }
}
