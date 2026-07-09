import { NextResponse } from "next/server";
import { runGreenInvoiceSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await runGreenInvoiceSync();
  if (!result.ok) {
    return NextResponse.json(result, { status: result.error?.includes("לא מחובר") ? 400 : 500 });
  }
  return NextResponse.json(result);
}
