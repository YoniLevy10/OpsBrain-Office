import { NextResponse } from "next/server";
import { fetchGiPdfUrl } from "@/lib/greeninvoice/service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await fetchGiPdfUrl(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
