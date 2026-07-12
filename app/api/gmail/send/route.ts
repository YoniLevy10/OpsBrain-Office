import { NextResponse } from "next/server";
import { assertAppAccess } from "@/lib/app-access";
import { sendCompanyEmail } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await assertAppAccess();
    const body = (await req.json()) as {
      to?: string;
      subject?: string;
      body?: string;
      html?: boolean;
      cc?: string;
      replyToMessageId?: string;
    };

    if (!body.to?.trim()) {
      return NextResponse.json({ ok: false, error: "יש להזין נמען" }, { status: 400 });
    }
    if (!body.subject?.trim()) {
      return NextResponse.json({ ok: false, error: "יש להזין נושא" }, { status: 400 });
    }
    if (!body.body?.trim()) {
      return NextResponse.json({ ok: false, error: "יש להזין תוכן" }, { status: 400 });
    }

    const result = await sendCompanyEmail({
      to: body.to.trim(),
      subject: body.subject.trim(),
      body: body.body,
      html: body.html,
      cc: body.cc,
      replyToMessageId: body.replyToMessageId,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה בשליחה";
    const denied = msg.includes("גישה נדחתה");
    return NextResponse.json(
      { ok: false, error: msg },
      { status: denied ? 403 : 500 }
    );
  }
}
