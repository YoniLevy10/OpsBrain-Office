"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";

type ActionResult = { ok: boolean; error?: string };

const NOT_CONFIGURED = "Supabase לא מחובר עדיין — הנתונים במצב דמו";

export async function addClient(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const { error } = await sb.from("ob_clients").insert({
    company: String(formData.get("company") || "").trim(),
    contact: String(formData.get("contact") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    revenue: Number(formData.get("revenue") || 0),
    outstanding: Number(formData.get("outstanding") || 0),
    active_since: String(formData.get("active_since") || new Date().toISOString().slice(0, 10)),
    status: String(formData.get("status") || "פעיל"),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clients");
  revalidatePath("/");
  return { ok: true };
}

export async function addIncome(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const { error } = await sb.from("ob_income").insert({
    client_name: String(formData.get("client_name") || "").trim(),
    project: String(formData.get("project") || "").trim(),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "ILS"),
    invoice_number: String(formData.get("invoice_number") || "").trim(),
    status: String(formData.get("status") || "ממתין"),
    date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/income");
  revalidatePath("/");
  return { ok: true };
}

export async function addExpense(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const amount = Number(formData.get("amount") || 0);
  const currency = String(formData.get("currency") || "ILS");
  const rate = Number(formData.get("rate") || 3.7);
  const { error } = await sb.from("ob_expenses").insert({
    vendor: String(formData.get("vendor") || "").trim(),
    category: String(formData.get("category") || "אחר"),
    amount,
    currency,
    amount_ils: currency === "USD" ? Math.round(amount * rate) : amount,
    date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
    recurring: formData.get("recurring") === "on",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/");
  return { ok: true };
}

export async function addSubscription(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const price = Number(formData.get("price") || 0);
  const currency = String(formData.get("currency") || "USD");
  const rate = Number(formData.get("rate") || 3.7);
  const { error } = await sb.from("ob_subscriptions").insert({
    vendor: String(formData.get("vendor") || "").trim(),
    category: String(formData.get("category") || "תוכנה"),
    price,
    currency,
    price_ils: currency === "USD" ? Math.round(price * rate) : price,
    billing_cycle: String(formData.get("billing_cycle") || "חודשי"),
    next_charge: String(formData.get("next_charge") || ""),
    status: "פעיל",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/subscriptions");
  revalidatePath("/");
  return { ok: true };
}

export async function updateIncomeStatus(id: string, status: string): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const { error } = await sb.from("ob_income").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/income");
  revalidatePath("/");
  return { ok: true };
}

export async function updateClient(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const id = String(formData.get("id"));
  const { error } = await sb.from("ob_clients").update({
    company: String(formData.get("company") || "").trim(),
    contact: String(formData.get("contact") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    revenue: Number(formData.get("revenue") || 0),
    outstanding: Number(formData.get("outstanding") || 0),
    active_since: String(formData.get("active_since") || ""),
    status: String(formData.get("status") || "פעיל"),
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clients");
  revalidatePath("/");
  return { ok: true };
}

export async function updateIncome(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const id = String(formData.get("id"));
  const { error } = await sb.from("ob_income").update({
    client_name: String(formData.get("client_name") || "").trim(),
    project: String(formData.get("project") || "").trim(),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "ILS"),
    invoice_number: String(formData.get("invoice_number") || "").trim(),
    status: String(formData.get("status") || "ממתין"),
    date: String(formData.get("date") || ""),
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/income");
  revalidatePath("/");
  return { ok: true };
}

export async function updateExpense(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const id = String(formData.get("id"));
  const amount = Number(formData.get("amount") || 0);
  const currency = String(formData.get("currency") || "ILS");
  const rate = Number(formData.get("rate") || 3.7);
  const { error } = await sb.from("ob_expenses").update({
    vendor: String(formData.get("vendor") || "").trim(),
    category: String(formData.get("category") || "אחר"),
    amount,
    currency,
    amount_ils: currency === "USD" ? Math.round(amount * rate) : amount,
    date: String(formData.get("date") || ""),
    recurring: formData.get("recurring") === "on",
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/");
  return { ok: true };
}

export async function updateSubscription(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const id = String(formData.get("id"));
  const price = Number(formData.get("price") || 0);
  const currency = String(formData.get("currency") || "USD");
  const rate = Number(formData.get("rate") || 3.7);
  const { error } = await sb.from("ob_subscriptions").update({
    vendor: String(formData.get("vendor") || "").trim(),
    category: String(formData.get("category") || "תוכנה"),
    price,
    currency,
    price_ils: currency === "USD" ? Math.round(price * rate) : price,
    billing_cycle: String(formData.get("billing_cycle") || "חודשי"),
    next_charge: String(formData.get("next_charge") || ""),
    status: String(formData.get("status") || "פעיל"),
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/subscriptions");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteRecord(table: string, id: string): Promise<ActionResult> {
  const tableMap: Record<string, string> = {
    clients: "ob_clients",
    income: "ob_income",
    expenses: "ob_expenses",
    subscriptions: "ob_subscriptions",
  };
  const dbTable = tableMap[table];
  if (!dbTable) return { ok: false, error: "טבלה לא חוקית" };
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const { error } = await sb.from(dbTable).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/" + (table === "clients" ? "clients" : table));
  revalidatePath("/");
  return { ok: true };
}
