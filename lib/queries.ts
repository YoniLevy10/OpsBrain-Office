import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSupabase } from "./supabase";
import { FINANCE_CACHE_TAG } from "./cache-tags";
import {
  Client,
  IncomeEntry,
  ExpenseEntry,
  Subscription,
  BankTransaction,
  clients as mockClients,
  incomeEntries as mockIncome,
  expenseEntries as mockExpenses,
  subscriptions as mockSubscriptions,
} from "./data";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type FinanceBundle = {
  clients: Client[];
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  subscriptions: Subscription[];
  live: {
    clients: boolean;
    income: boolean;
    expenses: boolean;
    subscriptions: boolean;
  };
};

const CLIENT_COLS =
  "id, company, contact, email, phone, vat, revenue, outstanding, active_since, status, created_at";
const INCOME_COLS =
  "id, client_id, client_name, project, amount, currency, invoice_number, status, date";
const EXPENSE_COLS = "id, vendor, category, amount, currency, amount_ils, date, recurring";
const SUB_COLS =
  "id, vendor, category, price, currency, price_ils, billing_cycle, next_charge, status";

function mapClient(r: any): Client {
  return {
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
  };
}

function mapIncome(r: any): IncomeEntry {
  return {
    id: r.id,
    clientId: r.client_id ?? "",
    clientName: r.client_name,
    project: r.project ?? "",
    amount: Number(r.amount ?? 0),
    currency: r.currency ?? "ILS",
    invoiceNumber: r.invoice_number ?? "",
    status: r.status ?? "ממתין",
    date: r.date ?? "",
  };
}

function mapExpense(r: any): ExpenseEntry {
  return {
    id: r.id,
    vendor: r.vendor,
    category: r.category ?? "אחר",
    amount: Number(r.amount ?? 0),
    currency: r.currency ?? "ILS",
    amountILS: Number(r.amount_ils ?? r.amount ?? 0),
    date: r.date ?? "",
    recurring: Boolean(r.recurring),
  };
}

function mapSubscription(r: any): Subscription {
  return {
    id: r.id,
    vendor: r.vendor,
    category: r.category ?? "תוכנה",
    price: Number(r.price ?? 0),
    currency: r.currency ?? "USD",
    priceILS: Number(r.price_ils ?? 0),
    billingCycle: r.billing_cycle ?? "חודשי",
    nextCharge: r.next_charge ?? "",
    status: r.status ?? "פעיל",
  };
}

async function loadFinanceBundle(): Promise<FinanceBundle> {
  const sb = getSupabase();
  if (!sb) {
    return {
      clients: mockClients,
      income: mockIncome,
      expenses: mockExpenses,
      subscriptions: mockSubscriptions,
      live: {
        clients: false,
        income: false,
        expenses: false,
        subscriptions: false,
      },
    };
  }

  const [clientsRes, incomeRes, expensesRes, subsRes] = await Promise.all([
    sb.from("ob_clients").select(CLIENT_COLS).order("created_at", { ascending: false }),
    sb.from("ob_income").select(INCOME_COLS).order("date", { ascending: false }),
    sb.from("ob_expenses").select(EXPENSE_COLS).order("date", { ascending: false }),
    sb.from("ob_subscriptions").select(SUB_COLS).order("next_charge", { ascending: true }),
  ]);

  return {
    clients:
      clientsRes.error || !clientsRes.data
        ? mockClients
        : clientsRes.data.map(mapClient),
    income:
      incomeRes.error || !incomeRes.data ? mockIncome : incomeRes.data.map(mapIncome),
    expenses:
      expensesRes.error || !expensesRes.data
        ? mockExpenses
        : expensesRes.data.map(mapExpense),
    subscriptions:
      subsRes.error || !subsRes.data
        ? mockSubscriptions
        : subsRes.data.map(mapSubscription),
    live: {
      clients: !clientsRes.error && Boolean(clientsRes.data),
      income: !incomeRes.error && Boolean(incomeRes.data),
      expenses: !expensesRes.error && Boolean(expensesRes.data),
      subscriptions: !subsRes.error && Boolean(subsRes.data),
    },
  };
}

const getCachedFinanceBundle = unstable_cache(loadFinanceBundle, ["finance-bundle-v1"], {
  revalidate: 45,
  tags: [FINANCE_CACHE_TAG],
});

/** Single cached fetch — all pages should use this instead of multiple table fetches. */
export const getFinanceBundle = cache(getCachedFinanceBundle);

export async function fetchClients(): Promise<{ rows: Client[]; live: boolean }> {
  const bundle = await getFinanceBundle();
  return { rows: bundle.clients, live: bundle.live.clients };
}

export async function fetchIncome(): Promise<{ rows: IncomeEntry[]; live: boolean }> {
  const bundle = await getFinanceBundle();
  return { rows: bundle.income, live: bundle.live.income };
}

export async function fetchExpenses(): Promise<{ rows: ExpenseEntry[]; live: boolean }> {
  const bundle = await getFinanceBundle();
  return { rows: bundle.expenses, live: bundle.live.expenses };
}

export async function fetchSubscriptions(): Promise<{ rows: Subscription[]; live: boolean }> {
  const bundle = await getFinanceBundle();
  return { rows: bundle.subscriptions, live: bundle.live.subscriptions };
}

const BANK_COLS = "id, bank, date, description, amount, balance, reference";

async function loadBankTransactions(): Promise<{ rows: BankTransaction[]; live: boolean }> {
  const sb = getSupabase();
  if (!sb) return { rows: [], live: false };
  const { data, error } = await sb
    .from("ob_bank_transactions")
    .select(BANK_COLS)
    .order("date", { ascending: false })
    .limit(2000);
  if (error || !data) return { rows: [], live: false };
  return {
    rows: data.map((r: any) => ({
      id: r.id,
      bank: r.bank ?? "discount",
      date: r.date ?? "",
      description: r.description ?? "",
      amount: Number(r.amount),
      balance: r.balance != null ? Number(r.balance) : null,
      reference: r.reference ?? "",
    })),
    live: true,
  };
}

const getCachedBankTransactions = unstable_cache(loadBankTransactions, ["bank-transactions-v1"], {
  revalidate: 45,
  tags: [FINANCE_CACHE_TAG],
});

export const getBankTransactions = cache(getCachedBankTransactions);
