import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ results: [], live: false });
  }

  const like = `%${q}%`;

  const [clientsRes, incomeRes, expensesRes] = await Promise.all([
    sb.from("ob_clients").select("id, company, contact, email").ilike("company", like).limit(5),
    sb.from("ob_income").select("id, client_name, project, invoice_number, amount, status").ilike("client_name", like).limit(5),
    sb.from("ob_expenses").select("id, vendor, category, amount_ils").ilike("vendor", like).limit(5),
  ]);

  const results: {
    type: string;
    id: string;
    title: string;
    subtitle: string;
    href: string;
  }[] = [];

  for (const c of clientsRes.data ?? []) {
    results.push({
      type: "לקוח",
      id: c.id,
      title: c.company,
      subtitle: c.contact || c.email || "",
      href: "/clients",
    });
  }
  for (const i of incomeRes.data ?? []) {
    results.push({
      type: "הכנסה",
      id: i.id,
      title: i.client_name,
      subtitle: `${i.project || i.invoice_number || ""} · ₪${Number(i.amount).toLocaleString()} · ${i.status}`,
      href: "/income",
    });
  }
  for (const e of expensesRes.data ?? []) {
    results.push({
      type: "הוצאה",
      id: e.id,
      title: e.vendor,
      subtitle: `${e.category} · ₪${Number(e.amount_ils).toLocaleString()}`,
      href: "/expenses",
    });
  }

  return NextResponse.json({ results: results.slice(0, 12), live: true });
}
