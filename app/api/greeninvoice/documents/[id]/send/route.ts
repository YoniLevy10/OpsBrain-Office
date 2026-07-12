import { NextResponse } from "next/server";
import { sendGiDocument } from "@/lib/greeninvoice/service";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = (await req.json()) as {
      emails?: string[];
      incomeId?: string;
      clientId?: string;
    };
    if (!body.emails?.length) {
      return NextResponse.json({ ok: false, error: "חסרה כתובת מייל" }, { status: 400 });
    }
    const result = await sendGiDocument(id, body.emails, body.incomeId, body.clientId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאה" },
      { status: 500 }
    );
  }
}
