import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function sanitizeQuery(q: string): string {
  return q.replace(/[%_,]/g, " ").trim();
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q")?.trim();
  if (!raw || raw.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ results: [], live: false });
  }

  const q = sanitizeQuery(raw);
  const like = `%${q}%`;

  const [clientsRes, incomeRes, expensesRes, bankRes] = await Promise.all([
    sb.from("ob_clients").select("id, company, contact, email").ilike("company", like).limit(5),
    sb
      .from("ob_income")
      .select("id, client_id, client_name, project, invoice_number, amount, status")
      .or(`client_name.ilike.${like},project.ilike.${like},invoice_number.ilike.${like}`)
      .limit(5),
    sb.from("ob_expenses").select("id, vendor, category, amount_ils").ilike("vendor", like).limit(5),
    sb.from("ob_bank_transactions").select("id, description, amount, date").ilike("description", like).limit(5),
  ]);

  const results: {
    type: string;
    id: string;
    title: string;
    subtitle: string;
    href: string;
  }[] = [];

  const seen = new Set<string>();

  function push(item: (typeof results)[number]) {
    const key = `${item.type}-${item.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(item);
  }

  for (const c of clientsRes.data ?? []) {
    push({
      type: "לקוח",
      id: c.id,
      title: c.company,
      subtitle: c.contact || c.email || "",
      href: `/clients/${c.id}`,
    });
  }
  for (const i of incomeRes.data ?? []) {
    push({
      type: "הכנסה",
      id: i.id,
      title: i.client_name,
      subtitle: `${i.project || i.invoice_number || ""} · ₪${Number(i.amount).toLocaleString()} · ${i.status}`,
      href: `/income?highlight=${i.id}`,
    });
  }
  for (const e of expensesRes.data ?? []) {
    push({
      type: "הוצאה",
      id: e.id,
      title: e.vendor,
      subtitle: `${e.category} · ₪${Number(e.amount_ils).toLocaleString()}`,
      href: `/expenses?highlight=${e.id}`,
    });
  }
  for (const t of bankRes.data ?? []) {
    push({
      type: "בנק",
      id: t.id,
      title: (t.description ?? "תנועת בנק").slice(0, 48),
      subtitle: `${t.date} · ₪${Number(t.amount).toLocaleString()}`,
      href: `/bank?highlight=${t.id}`,
    });
  }

  return NextResponse.json({ results: results.slice(0, 12), live: true });
}
