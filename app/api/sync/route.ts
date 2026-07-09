import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  isGreenInvoiceConfigured,
  searchDocuments,
  searchClients,
  searchExpenses,
  PAID_DOC_TYPES,
} from "@/lib/greeninvoice";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isGreenInvoiceConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "חשבונית ירוקה לא מחוברת. הוסף GREENINVOICE_API_ID ו-GREENINVOICE_API_SECRET במשתני הסביבה ב-Vercel.",
      },
      { status: 400 }
    );
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ ok: false, error: "Supabase לא מחובר" }, { status: 500 });
  }

  try {
    // Pull the last 12 months
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

    // --- Clients ---
    for (const c of clients as any[]) {
      const row = {
        gi_id: String(c.id),
        company: c.name ?? "ללא שם",
        contact: c.contactPerson ?? "",
        email: Array.isArray(c.emails) ? c.emails[0] ?? "" : c.email ?? "",
        phone: c.phone ?? c.mobile ?? "",
        vat: c.taxId ?? "",
        status: c.active === false ? "לא פעיל" : "פעיל",
      };
      const { error } = await sb
        .from("ob_clients")
        .upsert(row, { onConflict: "gi_id", ignoreDuplicates: false });
      if (!error) clientUpserts++;
    }

    // --- Income documents ---
    for (const d of documents as any[]) {
      const isPaid = PAID_DOC_TYPES.has(Number(d.type)) || d.status === 1;
      const row = {
        gi_id: String(d.id),
        client_name: d.client?.name ?? "ללא שם",
        project: d.description ?? d.remarks ?? "",
        amount: Number(d.amount ?? d.total ?? 0),
        currency: d.currency === "USD" ? "USD" : "ILS",
        invoice_number: d.number ? String(d.number) : "",
        status: isPaid ? "שולם" : "ממתין",
        date: d.documentDate ?? d.date ?? new Date().toISOString().slice(0, 10),
      };
      const { error } = await sb
        .from("ob_income")
        .upsert(row, { onConflict: "gi_id", ignoreDuplicates: false });
      if (!error) incomeUpserts++;
    }

    // --- Expenses ---
    for (const e of expenses as any[]) {
      const amount = Number(e.amount ?? e.total ?? 0);
      const row = {
        gi_id: String(e.id),
        vendor: e.supplier?.name ?? e.supplierName ?? "ספק לא ידוע",
        category: "אחר",
        amount,
        currency: e.currency === "USD" ? "USD" : "ILS",
        amount_ils: e.currency === "USD" ? Math.round(amount * 3.7) : amount,
        date: e.date ?? e.documentDate ?? new Date().toISOString().slice(0, 10),
        recurring: false,
      };
      const { error } = await sb
        .from("ob_expenses")
        .upsert(row, { onConflict: "gi_id", ignoreDuplicates: false });
      if (!error) expenseUpserts++;
    }

    return NextResponse.json({
      ok: true,
      synced: {
        clients: clientUpserts,
        income: incomeUpserts,
        expenses: expenseUpserts,
      },
      fetched: {
        clients: (clients as any[]).length,
        documents: (documents as any[]).length,
        expenses: (expenses as any[]).length,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "שגיאת סנכרון" },
      { status: 500 }
    );
  }
}
