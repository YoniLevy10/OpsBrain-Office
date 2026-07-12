import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createPaymentLink } from "@/lib/greeninvoice/service";
import { FINANCE_CACHE_TAG } from "@/lib/cache-tags";
import type { PaymentLinkInput } from "@/lib/greeninvoice/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PaymentLinkInput;
    const result = await createPaymentLink(body);
    if (result.ok) revalidateTag(FINANCE_CACHE_TAG, "max");
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאה" },
      { status: 500 }
    );
  }
}
