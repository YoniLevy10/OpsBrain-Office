"use server";

import { revalidatePath, updateTag, revalidateTag } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { getUsdRate, setUsdRate } from "@/lib/meta";
import { parseBankCsv } from "@/lib/bank-import";
import { FINANCE_CACHE_TAG, META_CACHE_TAG } from "@/lib/cache-tags";
import { resolveClientId } from "@/lib/client-match";

type ActionResult = { ok: boolean; error?: string };

const NOT_CONFIGURED = "Supabase לא מחובר עדיין — הנתונים במצב דמו";

function parseDateField(raw: FormDataEntryValue | null, fallback?: string): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return fallback ?? null;
  return value;
}

function friendlyDbError(message: string): string {
  if (message.includes("invalid input syntax for type date")) {
    return "תאריך לא תקין — בחר תאריך או השאר ריק";
  }
  return message;
}

function invalidateFinance() {
  updateTag(FINANCE_CACHE_TAG);
  revalidatePath("/");
}

function invalidateMeta() {
  updateTag(META_CACHE_TAG);
}

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
  if (error) return { ok: false, error: friendlyDbError(error.message) };
  invalidateFinance();
  revalidatePath("/clients");
  return { ok: true };
}

export async function addIncome(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };

  const clientName = String(formData.get("client_name") || "").trim();
  const { data: clients } = await sb.from("ob_clients").select("id, company");
  const clientId = resolveClientId(
    String(formData.get("client_id") || ""),
    clientName,
    clients ?? []
  );

  const { error } = await sb.from("ob_income").insert({
    client_id: clientId,
    client_name: clientName,
    project: String(formData.get("project") || "").trim(),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "ILS"),
    invoice_number: String(formData.get("invoice_number") || "").trim(),
    status: String(formData.get("status") || "ממתין"),
    date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
  });
  if (error) return { ok: false, error: error.message };
  invalidateFinance();
  revalidatePath("/income");
  if (clientId) revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}

export async function addExpense(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const amount = Number(formData.get("amount") || 0);
  const currency = String(formData.get("currency") || "ILS");
  const rate = Number(formData.get("rate") || 0) || (await getUsdRate());
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
  invalidateFinance();
  revalidatePath("/expenses");
  return { ok: true };
}

export async function addSubscription(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const vendor = String(formData.get("vendor") || "").trim();
  if (!vendor) return { ok: false, error: "יש להזין שם ספק" };
  const price = Number(formData.get("price") || 0);
  if (!Number.isFinite(price) || price <= 0) return { ok: false, error: "יש להזין מחיר" };
  const currency = String(formData.get("currency") || "USD");
  const rate = Number(formData.get("rate") || 0) || (await getUsdRate());
  const { error } = await sb.from("ob_subscriptions").insert({
    vendor,
    category: String(formData.get("category") || "תוכנה"),
    price,
    currency,
    price_ils: currency === "USD" ? Math.round(price * rate) : price,
    billing_cycle: String(formData.get("billing_cycle") || "חודשי"),
    next_charge: parseDateField(formData.get("next_charge")),
    status: "פעיל",
  });
  if (error) return { ok: false, error: friendlyDbError(error.message) };
  invalidateFinance();
  revalidatePath("/subscriptions");
  return { ok: true };
}

export async function updateIncomeStatus(id: string, status: string): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const { error } = await sb.from("ob_income").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  invalidateFinance();
  revalidatePath("/income");
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
    active_since: parseDateField(formData.get("active_since")),
    status: String(formData.get("status") || "פעיל"),
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  invalidateFinance();
  revalidatePath("/clients");
  return { ok: true };
}

export async function updateIncome(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const id = String(formData.get("id"));
  const clientName = String(formData.get("client_name") || "").trim();
  const { data: clients } = await sb.from("ob_clients").select("id, company");
  const clientId = resolveClientId(
    String(formData.get("client_id") || ""),
    clientName,
    clients ?? []
  );

  const { error } = await sb.from("ob_income").update({
    client_id: clientId,
    client_name: clientName,
    project: String(formData.get("project") || "").trim(),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "ILS"),
    invoice_number: String(formData.get("invoice_number") || "").trim(),
    status: String(formData.get("status") || "ממתין"),
    date: parseDateField(formData.get("date")) ?? new Date().toISOString().slice(0, 10),
  }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error.message) };
  invalidateFinance();
  revalidatePath("/income");
  if (clientId) revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}

export async function updateExpense(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const id = String(formData.get("id"));
  const amount = Number(formData.get("amount") || 0);
  const currency = String(formData.get("currency") || "ILS");
  const rate = Number(formData.get("rate") || 0) || (await getUsdRate());
  const { error } = await sb.from("ob_expenses").update({
    vendor: String(formData.get("vendor") || "").trim(),
    category: String(formData.get("category") || "אחר"),
    amount,
    currency,
    amount_ils: currency === "USD" ? Math.round(amount * rate) : amount,
    date: parseDateField(formData.get("date")) ?? new Date().toISOString().slice(0, 10),
    recurring: formData.get("recurring") === "on",
  }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error.message) };
  invalidateFinance();
  revalidatePath("/expenses");
  return { ok: true };
}

export async function updateSubscription(formData: FormData): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const id = String(formData.get("id"));
  const price = Number(formData.get("price") || 0);
  const currency = String(formData.get("currency") || "USD");
  const rate = Number(formData.get("rate") || 0) || (await getUsdRate());
  const { error } = await sb.from("ob_subscriptions").update({
    vendor: String(formData.get("vendor") || "").trim(),
    category: String(formData.get("category") || "תוכנה"),
    price,
    currency,
    price_ils: currency === "USD" ? Math.round(price * rate) : price,
    billing_cycle: String(formData.get("billing_cycle") || "חודשי"),
    next_charge: parseDateField(formData.get("next_charge")),
    status: String(formData.get("status") || "פעיל"),
  }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error.message) };
  invalidateFinance();
  revalidatePath("/subscriptions");
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
  invalidateFinance();
  revalidatePath("/" + (table === "clients" ? "clients" : table));
  return { ok: true };
}

export async function saveUsdRate(rate: number): Promise<ActionResult> {
  if (!Number.isFinite(rate) || rate <= 0) {
    return { ok: false, error: "שער לא תקין" };
  }
  await setUsdRate(rate);
  invalidateMeta();
  revalidatePath("/settings");
  revalidatePath("/expenses");
  revalidatePath("/subscriptions");
  return { ok: true };
}

export async function importBankCsv(formData: FormData): Promise<ActionResult & { imported?: number; skipped?: number }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "לא נבחר קובץ" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "הקובץ גדול מדי (מקסימום 5MB)" };
  }

  const text = await file.text();
  const bank = String(formData.get("bank") || "discount");
  const { rows, errors } = parseBankCsv(text, bank);

  if (rows.length === 0) {
    return { ok: false, error: errors[0] ?? "לא נמצאו תנועות בקובץ" };
  }

  let imported = 0;

  for (const row of rows) {
    const { data, error } = await sb
      .from("ob_bank_transactions")
      .upsert(
        {
          bank,
          date: row.date,
          description: row.description,
          amount: row.amount,
          balance: row.balance,
          reference: row.reference,
          import_hash: row.importHash,
        },
        { onConflict: "import_hash", ignoreDuplicates: true }
      )
      .select("id");

    if (error) return { ok: false, error: error.message };
    if (data && data.length > 0) imported++;
  }

  invalidateFinance();
  revalidatePath("/bank");
  revalidatePath("/settings");

  return {
    ok: true,
    imported,
    skipped: rows.length - imported,
  };
}

export async function deleteBankTransaction(id: string): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const { error } = await sb.from("ob_bank_transactions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  invalidateFinance();
  revalidatePath("/bank");
  return { ok: true };
}
