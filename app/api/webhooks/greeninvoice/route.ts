import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { markIncomePaidByGiId, logGiAction } from "@/lib/greeninvoice/action-log";
import { runGreenInvoiceSync } from "@/lib/sync";
import { FINANCE_CACHE_TAG, META_CACHE_TAG } from "@/lib/cache-tags";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.GREENINVOICE_WEBHOOK_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = (await req.json()) as {
      documentId?: string;
      id?: string;
      status?: string;
      custom?: string;
      amount?: number;
    };

    const documentId = body.documentId ?? body.id;
    if (documentId) {
      await markIncomePaidByGiId(documentId);
      await logGiAction({
        giDocumentId: documentId,
        actionType: "payment_link",
        status: "paid",
        amount: body.amount,
        metadata: body as Record<string, unknown>,
      });
    }

    await runGreenInvoiceSync();
    revalidateTag(FINANCE_CACHE_TAG, "max");
    revalidateTag(META_CACHE_TAG, "max");

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאה" },
      { status: 500 }
    );
  }
}
