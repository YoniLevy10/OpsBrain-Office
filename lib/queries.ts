import { getSupabase } from "./supabase";
import {
  Client,
  IncomeEntry,
  ExpenseEntry,
  Subscription,
  clients as mockClients,
  incomeEntries as mockIncome,
  expenseEntries as mockExpenses,
  subscriptions as mockSubscriptions,
} from "./data";

// Each fetcher tries Supabase first and silently falls back to demo data
// when the DB isn't configured or a table is empty/unreachable.

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function fetchClients(): Promise<{ rows: Client[]; live: boolean }> {
  const sb = getSupabase();
  if (!sb) return { rows: mockClients, live: false };
  const { data, error } = await sb
    .from("ob_clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return { rows: mockClients, live: false };
  const rows: Client[] = data.map((r: any) => ({
    id: r.id,
    company: r.company,
    contact: r.contact ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    vat: r.vat ?? "",
    revenue: Number(r.revenue ?? 0),
    outstanding: Number(r.outstanding ?? 0),
    activeSince: r.active_since ?? "",
    status: r.status ?? "פעיל",
  }));
  return { rows, live: true };
}

export async function fetchIncome(): Promise<{ rows: IncomeEntry[]; live: boolean }> {
  const sb = getSupabase();
  if (!sb) return { rows: mockIncome, live: false };
  const { data, error } = await sb
    .from("ob_income")
    .select("*")
    .order("date", { ascending: false });
  if (error || !data) return { rows: mockIncome, live: false };
  const rows: IncomeEntry[] = data.map((r: any) => ({
    id: r.id,
    clientId: r.client_id ?? "",
    clientName: r.client_name,
    project: r.project ?? "",
    amount: Number(r.amount ?? 0),
    currency: r.currency ?? "ILS",
    invoiceNumber: r.invoice_number ?? "",
    status: r.status ?? "ממתין",
    date: r.date ?? "",
  }));
  return { rows, live: true };
}

export async function fetchExpenses(): Promise<{ rows: ExpenseEntry[]; live: boolean }> {
  const sb = getSupabase();
  if (!sb) return { rows: mockExpenses, live: false };
  const { data, error } = await sb
    .from("ob_expenses")
    .select("*")
    .order("date", { ascending: false });
  if (error || !data) return { rows: mockExpenses, live: false };
  const rows: ExpenseEntry[] = data.map((r: any) => ({
    id: r.id,
    vendor: r.vendor,
    category: r.category ?? "אחר",
    amount: Number(r.amount ?? 0),
    currency: r.currency ?? "ILS",
    amountILS: Number(r.amount_ils ?? r.amount ?? 0),
    date: r.date ?? "",
    recurring: Boolean(r.recurring),
  }));
  return { rows, live: true };
}

export async function fetchSubscriptions(): Promise<{ rows: Subscription[]; live: boolean }> {
  const sb = getSupabase();
  if (!sb) return { rows: mockSubscriptions, live: false };
  const { data, error } = await sb
    .from("ob_subscriptions")
    .select("*")
    .order("next_charge", { ascending: true });
  if (error || !data) return { rows: mockSubscriptions, live: false };
  const rows: Subscription[] = data.map((r: any) => ({
    id: r.id,
    vendor: r.vendor,
    category: r.category ?? "תוכנה",
    price: Number(r.price ?? 0),
    currency: r.currency ?? "USD",
    priceILS: Number(r.price_ils ?? 0),
    billingCycle: r.billing_cycle ?? "חודשי",
    nextCharge: r.next_charge ?? "",
    status: r.status ?? "פעיל",
  }));
  return { rows, live: true };
}
