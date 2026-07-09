import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { runGreenInvoiceSync } from "@/lib/sync";
import { FINANCE_CACHE_TAG, META_CACHE_TAG } from "@/lib/cache-tags";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await runGreenInvoiceSync();
  if (!result.ok) {
    return NextResponse.json(result, { status: result.error?.includes("לא מחובר") ? 400 : 500 });
  }
  revalidateTag(FINANCE_CACHE_TAG, "max");
  revalidateTag(META_CACHE_TAG, "max");
  return NextResponse.json(result);
}
