import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { FINANCE_CACHE_TAG, META_CACHE_TAG } from "@/lib/cache-tags";

export const dynamic = "force-dynamic";

/** Lightweight cache bust — reload page data without Green Invoice sync. */
export async function POST() {
  revalidateTag(FINANCE_CACHE_TAG, "max");
  revalidateTag(META_CACHE_TAG, "max");
  return NextResponse.json({ ok: true });
}
