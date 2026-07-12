import { NextResponse } from "next/server";
import { getGmailConnectionStatus } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getGmailConnectionStatus();
  return NextResponse.json(status);
}
