import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { issueReceipt, issueInvoice } from "@/lib/greeninvoice/service";
import { buildReceiptPayload, buildInvoicePayload } from "@/lib/greeninvoice/build-payload";
import { previewGiDocument } from "@/lib/greeninvoice/service";
import { FINANCE_CACHE_TAG } from "@/lib/cache-tags";
import type { CreateInvoiceInput, CreateReceiptInput } from "@/lib/greeninvoice/types";

export const dynamic = "force-dynamic";

function bustCache() {
  revalidateTag(FINANCE_CACHE_TAG, "max");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action?: "receipt" | "invoice" | "preview_receipt" | "preview_invoice";
    } & Partial<CreateReceiptInput & CreateInvoiceInput>;

    const action = body.action ?? "receipt";

    if (action === "preview_receipt") {
      const payload = buildReceiptPayload(body as CreateReceiptInput);
      const result = await previewGiDocument(payload);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    if (action === "preview_invoice") {
      const payload = buildInvoicePayload(body as CreateInvoiceInput);
      const result = await previewGiDocument(payload);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    if (action === "invoice") {
      const result = await issueInvoice(body as CreateInvoiceInput);
      if (result.ok) bustCache();
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    const result = await issueReceipt(body as CreateReceiptInput);
    if (result.ok) bustCache();
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאה" },
      { status: 500 }
    );
  }
}
