import { NextRequest, NextResponse } from "next/server";
import { runGreenInvoiceSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runGreenInvoiceSync();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
