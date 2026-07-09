import { getSupabase } from "./supabase";
import {
  isGreenInvoiceConfigured,
  searchDocuments,
  searchClients,
  searchExpenses,
  PAID_DOC_TYPES,
} from "./greeninvoice";
import { setLastSyncTime } from "./meta";

/* eslint-disable @typescript-eslint/no-explicit-any */

const OVERDUE_DAYS = 30;
const USD_RATE = 3.7;

export type SyncResult = {
  ok: boolean;
  error?: string;
  synced?: { clients: number; income: number; expenses: number; subscriptions: number };
  fetched?: { clients: number; documents: number; expenses: number };
};

function mapIncomeStatus(d: any): string {
  const isPaid = PAID_DOC_TYPES.has(Number(d.type)) || d.status === 1;
  if (isPaid) return "שולם";
  const docDate = d.documentDate ?? d.date;
  if (docDate) {
    const daysSince = (Date.now() - new Date(docDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > OVERDUE_DAYS) return "באיחור";
  }
  return "ממתין";
}

function mapExpenseCategory(e: any): string {
  const raw = e.category?.name ?? e.categoryName ?? e.classification ?? "";
  const map: Record<string, string> = {
    software: "תוכנה",
    ai: "AI",
    hosting: "אחסון",
    office: "משרד",
    marketing: "שיווק",
  };
  const lower = String(raw).toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return "אחר";
}

async function enrichClientFinancials(sb: NonNullable<ReturnType<typeof getSupabase>>) {
  const { data: income } = await sb.from("ob_income").select("*");
  const { data: clients } = await sb.from("ob_clients").select("*");
  if (!income || !clients) return;

  for (const c of clients) {
    const related = income.filter(
      (i: any) =>
        i.client_name === c.company ||
        (c.company && String(i.client_name).includes(String(c.company).split(" ")[0]))
    );
    if (related.length === 0) continue;

    const revenue = related
      .filter((i: any) => i.status === "שולם")
      .reduce((s: number, i: any) => s + Number(i.amount), 0);
    const outstanding = related
      .filter((i: any) => i.status === "ממתין" || i.status === "באיחור")
      .reduce((s: number, i: any) => s + Number(i.amount), 0);

    await sb.from("ob_clients").update({ revenue, outstanding }).eq("id", c.id);
  }
}

/** Create/update subscriptions from recurring expenses grouped by vendor */
async function syncSubscriptionsFromExpenses(sb: NonNullable<ReturnType<typeof getSupabase>>) {
  const { data: expenses } = await sb
    .from("ob_expenses")
    .select("*")
    .eq("recurring", true)
    .order("date", { ascending: false });

  if (!expenses || expenses.length === 0) return 0;

  const byVendor = new Map<string, any>();
  for (const e of expenses) {
    if (!byVendor.has(e.vendor)) byVendor.set(e.vendor, e);
  }

  let count = 0;
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextCharge = nextMonth.toISOString().slice(0, 10);

  for (const [vendor, e] of byVendor) {
    const row = {
      vendor,
      category: e.category ?? "אחר",
      price: Number(e.amount),
      currency: e.currency ?? "ILS",
      price_ils: Number(e.amount_ils ?? e.amount),
      billing_cycle: "חודשי",
      next_charge: nextCharge,
      status: "פעיל",
    };

    const { data: existing } = await sb
      .from("ob_subscriptions")
      .select("id")
      .eq("vendor", vendor)
      .maybeSingle();

    if (existing) {
      const { error } = await sb.from("ob_subscriptions").update(row).eq("id", existing.id);
      if (!error) count++;
    } else {
      const { error } = await sb.from("ob_subscriptions").insert(row);
      if (!error) count++;
    }
  }
  return count;
}

export async function runGreenInvoiceSync(): Promise<SyncResult> {
  if (!isGreenInvoiceConfigured()) {
    return {
      ok: false,
      error:
        "חשבונית ירוקה לא מחוברת. הוסף GREENINVOICE_API_ID ו-GREENINVOICE_API_SECRET במשתני הסביבה.",
    };
  }

  const sb = getSupabase();
  if (!sb) {
    return { ok: false, error: "Supabase לא מחובר" };
  }

  try {
    const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const [documents, clients, expenses] = await Promise.all([
      searchDocuments(fromDate),
      searchClients(),
      searchExpenses(fromDate),
    ]);

    let incomeUpserts = 0;
    let clientUpserts = 0;
    let expenseUpserts = 0;

    for (const c of clients as any[]) {
      const row = {
        gi_id: String(c.id),
        company: c.name ?? "ללא שם",
        contact: c.contactPerson ?? "",
        email: Array.isArray(c.emails) ? c.emails[0] ?? "" : c.email ?? "",
        phone: c.phone ?? c.mobile ?? "",
        vat: c.taxId ?? "",
        status: c.active === false ? "לא פעיל" : "פעיל",
        active_since: c.creationDate ?? c.createdAt ?? null,
      };
      const { error } = await sb
        .from("ob_clients")
        .upsert(row, { onConflict: "gi_id", ignoreDuplicates: false });
      if (!error) clientUpserts++;
    }

    for (const d of documents as any[]) {
      const amount = Number(d.amount ?? d.total ?? 0);
      const isCredit = Number(d.type) === 330;
      const row = {
        gi_id: String(d.id),
        client_name: d.client?.name ?? "ללא שם",
        project: d.description ?? d.remarks ?? "",
        amount: isCredit ? -Math.abs(amount) : amount,
        currency: d.currency === "USD" ? "USD" : "ILS",
        invoice_number: d.number ? String(d.number) : "",
        status: mapIncomeStatus(d),
        date: d.documentDate ?? d.date ?? new Date().toISOString().slice(0, 10),
      };
      const { error } = await sb
        .from("ob_income")
        .upsert(row, { onConflict: "gi_id", ignoreDuplicates: false });
      if (!error) incomeUpserts++;
    }

    for (const e of expenses as any[]) {
      const amount = Number(e.amount ?? e.total ?? 0);
      const currency = e.currency === "USD" ? "USD" : "ILS";
      const row = {
        gi_id: String(e.id),
        vendor: e.supplier?.name ?? e.supplierName ?? "ספק לא ידוע",
        category: mapExpenseCategory(e),
        amount,
        currency,
        amount_ils: currency === "USD" ? Math.round(amount * USD_RATE) : amount,
        date: e.date ?? e.documentDate ?? new Date().toISOString().slice(0, 10),
        recurring: Boolean(e.recurring ?? e.isRecurring),
      };
      const { error } = await sb
        .from("ob_expenses")
        .upsert(row, { onConflict: "gi_id", ignoreDuplicates: false });
      if (!error) expenseUpserts++;
    }

    await enrichClientFinancials(sb);
    const subscriptionUpserts = await syncSubscriptionsFromExpenses(sb);
    await setLastSyncTime(new Date().toISOString());

    return {
      ok: true,
      synced: {
        clients: clientUpserts,
        income: incomeUpserts,
        expenses: expenseUpserts,
        subscriptions: subscriptionUpserts,
      },
      fetched: {
        clients: (clients as any[]).length,
        documents: (documents as any[]).length,
        expenses: (expenses as any[]).length,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת סנכרון",
    };
  }
}
