import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { runGreenInvoiceSync } from "@/lib/sync";
import { FINANCE_CACHE_TAG, META_CACHE_TAG } from "@/lib/cache-tags";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runGreenInvoiceSync();
  if (result.ok) {
    revalidateTag(FINANCE_CACHE_TAG, "max");
    revalidateTag(META_CACHE_TAG, "max");
  }
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
