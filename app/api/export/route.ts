import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  getCurrentMonthKey,
  filterIncomeByMonth,
  filterExpensesByMonth,
  sumPaidIncome,
  sumExpenses,
  withResolvedStatus,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

function csvEscape(val: string | number | boolean | null | undefined): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const bom = "\uFEFF";
  const lines = [
    headers.join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ];
  return bom + lines.join("\n");
}

function parseMonthParam(raw: string | null): string {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) return raw;
  return getCurrentMonthKey();
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "summary";
  const month = parseMonthParam(request.nextUrl.searchParams.get("month"));
  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: "Supabase לא מחובר" }, { status: 500 });
  }

  if (type === "income") {
    const { data } = await sb.from("ob_income").select("*").order("date", { ascending: false });
    const rows = month
      ? (data ?? []).filter((r) => String(r.date ?? "").startsWith(month))
      : data ?? [];
    const csv = toCsv(
      ["לקוח", "פרויקט", "סכום", "מטבע", "מס׳ חשבונית", "סטטוס", "תאריך"],
      rows.map((r) => [
        r.client_name,
        r.project,
        r.amount,
        r.currency,
        r.invoice_number,
        r.status,
        r.date,
      ])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="income-${month}.csv"`,
      },
    });
  }

  if (type === "expenses") {
    const { data } = await sb.from("ob_expenses").select("*").order("date", { ascending: false });
    const rows = month
      ? (data ?? []).filter((r) => String(r.date ?? "").startsWith(month))
      : data ?? [];
    const csv = toCsv(
      ["ספק", "קטגוריה", "סכום", "מטבע", "סכום ב-₪", "תאריך", "חוזר"],
      rows.map((r) => [
        r.vendor,
        r.category,
        r.amount,
        r.currency,
        r.amount_ils,
        r.date,
        r.recurring ? "כן" : "לא",
      ])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenses-${month}.csv"`,
      },
    });
  }

  if (type === "clients") {
    const { data } = await sb.from("ob_clients").select("*").order("company");
    const csv = toCsv(
      ["חברה", "איש קשר", "אימייל", "טלפון", "הכנסה", "יתרה פתוחה", "סטטוס"],
      (data ?? []).map((r) => [
        r.company,
        r.contact,
        r.email,
        r.phone,
        r.revenue,
        r.outstanding,
        r.status,
      ])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="clients.csv"`,
      },
    });
  }

  const [incomeRes, expensesRes, clientsRes, subsRes] = await Promise.all([
    sb.from("ob_income").select("*"),
    sb.from("ob_expenses").select("*"),
    sb.from("ob_clients").select("*"),
    sb.from("ob_subscriptions").select("*").eq("status", "פעיל"),
  ]);

  const income = withResolvedStatus(
    (incomeRes.data ?? []).map((r) => ({
      id: r.id,
      clientId: r.client_id ?? "",
      clientName: r.client_name,
      project: r.project ?? "",
      amount: Number(r.amount),
      currency: r.currency ?? "ILS",
      invoiceNumber: r.invoice_number ?? "",
      status: r.status,
      date: r.date ?? "",
    }))
  );
  const expenses = (expensesRes.data ?? []).map((r) => ({
    id: r.id,
    vendor: r.vendor,
    category: r.category,
    amount: Number(r.amount),
    currency: r.currency ?? "ILS",
    amountILS: Number(r.amount_ils),
    date: r.date ?? "",
    recurring: Boolean(r.recurring),
  }));

  const monthIncome = filterIncomeByMonth(income, month);
  const monthExpenses = filterExpensesByMonth(expenses, month);
  const paid = sumPaidIncome(monthIncome);
  const expTotal = sumExpenses(monthExpenses);
  const profit = paid - expTotal;
  const subsMonthly = (subsRes.data ?? [])
    .filter((s) => s.billing_cycle === "חודשי")
    .reduce((s, x) => s + Number(x.price_ils), 0);

  const csv = toCsv(
    ["מדד", "ערך"],
    [
      ["חודש", month],
      ["הכנסות ששולמו (₪)", paid],
      ["הוצאות (₪)", expTotal],
      ["רווח נקי (₪)", profit],
      ["לקוחות פעילים", (clientsRes.data ?? []).filter((c) => c.status === "פעיל").length],
      ["מנויים חודשיים (₪)", subsMonthly],
      ["סה״כ רשומות הכנסה", income.length],
      ["סה״כ רשומות הוצאה", expenses.length],
    ]
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="summary-${month}.csv"`,
    },
  });
}
