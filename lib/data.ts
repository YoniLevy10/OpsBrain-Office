// Mock data layer for OpsBrain Finance MVP.
// In production this would be replaced by Supabase queries (see lib/supabase.ts stub).

export type Currency = "ILS" | "USD";

export type IncomeStatus = "שולם" | "ממתין" | "באיחור" | "בוטל";
export type ExpenseCategory =
  | "AI"
  | "אחסון"
  | "תוכנה"
  | "מאגר מידע"
  | "משרד"
  | "שכר"
  | "שיווק"
  | "הנהלת חשבונות"
  | "מיסים"
  | "אחר";

export interface Client {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  vat: string;
  revenue: number;
  outstanding: number;
  activeSince: string;
  status: "פעיל" | "לא פעיל";
}

export interface IncomeEntry {
  id: string;
  clientId: string;
  clientName: string;
  project: string;
  amount: number;
  currency: Currency;
  invoiceNumber: string;
  status: IncomeStatus;
  date: string;
}

export interface ExpenseEntry {
  id: string;
  vendor: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  amountILS: number;
  date: string;
  recurring: boolean;
}

export interface Subscription {
  id: string;
  vendor: string;
  category: ExpenseCategory;
  price: number;
  currency: Currency;
  priceILS: number;
  billingCycle: "חודשי" | "שנתי";
  nextCharge: string;
  status: "פעיל" | "מושהה";
}

export interface BankTransaction {
  id: string;
  bank: string;
  date: string;
  description: string;
  amount: number;
  balance: number | null;
  reference: string;
}

export const clients: Client[] = [
  { id: "c1", company: "שרה נבות – ניהול נכסים", contact: "שרה נבות", email: "sara@navot-props.co.il", phone: "050-1234567", vat: "512345678", revenue: 54000, outstanding: 4500, activeSince: "2025-02-01", status: "פעיל" },
  { id: "c2", company: "גבעת הפסגה בע\"מ", contact: "דוד כהן", email: "david@givathapisga.co.il", phone: "052-2345678", vat: "513456789", revenue: 18200, outstanding: 0, activeSince: "2025-06-10", status: "פעיל" },
  { id: "c3", company: "נכסי הרימון", contact: "מירי לוי", email: "miri@rimon-realestate.co.il", phone: "054-3456789", vat: "514567890", revenue: 9600, outstanding: 1600, activeSince: "2025-09-15", status: "פעיל" },
  { id: "c4", company: "אקסיוטה לוגיסטיקה", contact: "יובל שרון", email: "yuval@axiota.io", phone: "053-4567890", vat: "515678901", revenue: 32000, outstanding: 0, activeSince: "2025-11-01", status: "לא פעיל" },
];

export const incomeEntries: IncomeEntry[] = [
  { id: "i1", clientId: "c1", clientName: "שרה נבות – ניהול נכסים", project: "Bamakor – מנוי חודשי", amount: 500, currency: "ILS", invoiceNumber: "INV-1042", status: "שולם", date: "2026-07-01" },
  { id: "i2", clientId: "c2", clientName: "גבעת הפסגה בע\"מ", project: "Bamakor – מנוי חודשי", amount: 500, currency: "ILS", invoiceNumber: "INV-1043", status: "שולם", date: "2026-07-01" },
  { id: "i3", clientId: "c3", clientName: "נכסי הרימון", project: "Bamakor – הקמה", amount: 2400, currency: "ILS", invoiceNumber: "INV-1044", status: "ממתין", date: "2026-07-05" },
  { id: "i4", clientId: "c1", clientName: "שרה נבות – ניהול נכסים", project: "Bamakor – תוספת מבנים", amount: 1500, currency: "ILS", invoiceNumber: "INV-1039", status: "באיחור", date: "2026-06-15" },
  { id: "i5", clientId: "c4", clientName: "אקסיוטה לוגיסטיקה", project: "Axiota – ייעוץ טכני", amount: 3200, currency: "ILS", invoiceNumber: "INV-1030", status: "שולם", date: "2026-06-20" },
];

export const expenseEntries: ExpenseEntry[] = [
  { id: "e1", vendor: "Vercel", category: "אחסון", amount: 20, currency: "USD", amountILS: 74, date: "2026-07-01", recurring: true },
  { id: "e2", vendor: "Supabase", category: "מאגר מידע", amount: 25, currency: "USD", amountILS: 92, date: "2026-07-01", recurring: true },
  { id: "e3", vendor: "Anthropic (Claude)", category: "AI", amount: 20, currency: "USD", amountILS: 74, date: "2026-07-03", recurring: true },
  { id: "e4", vendor: "OpenAI", category: "AI", amount: 20, currency: "USD", amountILS: 74, date: "2026-07-03", recurring: true },
  { id: "e5", vendor: "Cursor", category: "תוכנה", amount: 20, currency: "USD", amountILS: 74, date: "2026-07-05", recurring: true },
  { id: "e6", vendor: "רו\"ח – דוח רבעוני", category: "הנהלת חשבונות", amount: 900, currency: "ILS", amountILS: 900, date: "2026-06-28", recurring: false },
  { id: "e7", vendor: "GoDaddy – דומיין", category: "אחר", amount: 45, currency: "USD", amountILS: 166, date: "2026-06-18", recurring: true },
];

export const subscriptions: Subscription[] = [
  { id: "s1", vendor: "Cursor", category: "תוכנה", price: 20, currency: "USD", priceILS: 74, billingCycle: "חודשי", nextCharge: "2026-08-05", status: "פעיל" },
  { id: "s2", vendor: "Claude (Anthropic)", category: "AI", price: 20, currency: "USD", priceILS: 74, billingCycle: "חודשי", nextCharge: "2026-08-03", status: "פעיל" },
  { id: "s3", vendor: "ChatGPT Plus", category: "AI", price: 20, currency: "USD", priceILS: 74, billingCycle: "חודשי", nextCharge: "2026-08-03", status: "פעיל" },
  { id: "s4", vendor: "Supabase Pro", category: "מאגר מידע", price: 25, currency: "USD", priceILS: 92, billingCycle: "חודשי", nextCharge: "2026-08-01", status: "פעיל" },
  { id: "s5", vendor: "Vercel Pro", category: "אחסון", price: 20, currency: "USD", priceILS: 74, billingCycle: "חודשי", nextCharge: "2026-08-01", status: "פעיל" },
  { id: "s6", vendor: "Google Workspace", category: "משרד", price: 7.2, currency: "USD", priceILS: 27, billingCycle: "חודשי", nextCharge: "2026-08-04", status: "פעיל" },
  { id: "s7", vendor: "GitHub Pro", category: "תוכנה", price: 4, currency: "USD", priceILS: 15, billingCycle: "חודשי", nextCharge: "2026-08-06", status: "פעיל" },
];

export const cashFlowSeries = [
  { month: "ינו׳", income: 6200, expenses: 3100 },
  { month: "פבר׳", income: 7100, expenses: 3400 },
  { month: "מרץ", income: 8300, expenses: 3600 },
  { month: "אפר׳", income: 9100, expenses: 3550 },
  { month: "מאי", income: 10400, expenses: 3800 },
  { month: "יוני", income: 12600, expenses: 4100 },
  { month: "יולי", income: 8300, expenses: 3950 },
];

export const expenseByCategory = [
  { name: "AI", value: 148, color: "#6C93E8" },
  { name: "אחסון", value: 148, color: "#35C79A" },
  { name: "תוכנה", value: 89, color: "#D4A857" },
  { name: "מאגר מידע", value: 92, color: "#E5677A" },
  { name: "הנהלת חשבונות", value: 900, color: "#8B93A6" },
];

export function formatCurrency(amount: number, currency: Currency = "ILS") {
  const symbol = currency === "ILS" ? "₪" : "$";
  return `${symbol}${amount.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

export function totalMonthlyRecurring() {
  return subscriptions
    .filter((s) => s.status === "פעיל" && s.billingCycle === "חודשי")
    .reduce((sum, s) => sum + s.priceILS, 0);
}

export function totalOutstanding() {
  return clients.reduce((sum, c) => sum + c.outstanding, 0);
}

export function totalMonthlyIncome() {
  return incomeEntries
    .filter((i) => i.status === "שולם")
    .reduce((sum, i) => sum + i.amount, 0);
}

export function totalMonthlyExpenses() {
  return expenseEntries.reduce((sum, e) => sum + e.amountILS, 0);
}
