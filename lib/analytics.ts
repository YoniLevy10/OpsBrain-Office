import type { Client, ExpenseEntry, IncomeEntry, IncomeStatus } from "./data";

const HEBREW_MONTHS = [
  "ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני",
  "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳",
];

export function getMonthKey(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getPreviousMonthKey(monthKey = getCurrentMonthKey()): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isInMonth(dateStr: string, monthKey: string): boolean {
  return getMonthKey(dateStr) === monthKey;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${HEBREW_MONTHS[month - 1]} ${year}`;
}

/** Resolve effective status — pending invoices older than 30 days become overdue */
export function resolveIncomeStatus(entry: IncomeEntry, overdueDays = 30): IncomeStatus {
  if (entry.status === "שולם" || entry.status === "בוטל") return entry.status;
  if (entry.status === "באיחור") return "באיחור";
  if (!entry.date) return entry.status;
  const daysSince = (Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24);
  if (entry.status === "ממתין" && daysSince > overdueDays) return "באיחור";
  return entry.status;
}

export function withResolvedStatus(income: IncomeEntry[]): IncomeEntry[] {
  return income.map((i) => ({ ...i, status: resolveIncomeStatus(i) }));
}

export function filterIncomeByMonth(income: IncomeEntry[], monthKey: string): IncomeEntry[] {
  return income.filter((i) => isInMonth(i.date, monthKey));
}

export function filterExpensesByMonth(expenses: ExpenseEntry[], monthKey: string): ExpenseEntry[] {
  return expenses.filter((e) => isInMonth(e.date, monthKey));
}

export function sumPaidIncome(income: IncomeEntry[]): number {
  return income
    .filter((i) => resolveIncomeStatus(i) === "שולם")
    .reduce((s, i) => s + i.amount, 0);
}

export function sumExpenses(expenses: ExpenseEntry[]): number {
  return expenses.reduce((s, e) => s + e.amountILS, 0);
}

export function sumByStatus(income: IncomeEntry[], status: IncomeStatus): number {
  return income
    .filter((i) => resolveIncomeStatus(i) === status)
    .reduce((s, i) => s + i.amount, 0);
}

export function percentDelta(current: number, previous: number): string | undefined {
  if (previous === 0) return current > 0 ? "+100%" : undefined;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return undefined;
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

export function deltaDirection(current: number, previous: number): "up" | "down" {
  return current >= previous ? "up" : "down";
}

export interface CashFlowPoint {
  month: string;
  income: number;
  expenses: number;
}

export function buildCashFlowSeries(
  income: IncomeEntry[],
  expenses: ExpenseEntry[],
  months = 7
): CashFlowPoint[] {
  const resolved = withResolvedStatus(income);
  const now = new Date();
  const series: CashFlowPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthIncome = filterIncomeByMonth(resolved, key)
      .filter((i) => resolveIncomeStatus(i) === "שולם")
      .reduce((s, i) => s + i.amount, 0);
    const monthExpenses = filterExpensesByMonth(expenses, key)
      .reduce((s, e) => s + e.amountILS, 0);
    series.push({
      month: HEBREW_MONTHS[d.getMonth()],
      income: monthIncome,
      expenses: monthExpenses,
    });
  }
  return series;
}

/** Compute client revenue & outstanding from income records */
export function enrichClients(clients: Client[], income: IncomeEntry[]): Client[] {
  const resolved = withResolvedStatus(income);
  return clients.map((c) => {
    const related = resolved.filter(
      (i) =>
        i.clientId === c.id ||
        i.clientName === c.company ||
        (c.company && i.clientName.includes(c.company.split(" ")[0]))
    );
    if (related.length === 0) return c;
    const revenue = related
      .filter((i) => resolveIncomeStatus(i) === "שולם")
      .reduce((s, i) => s + i.amount, 0);
    const outstanding = related
      .filter((i) => {
        const st = resolveIncomeStatus(i);
        return st === "ממתין" || st === "באיחור";
      })
      .reduce((s, i) => s + i.amount, 0);
    return {
      ...c,
      revenue: revenue > 0 ? revenue : c.revenue,
      outstanding: outstanding > 0 ? outstanding : c.outstanding,
    };
  });
}

export function expenseByCategory(
  expenses: ExpenseEntry[],
  palette: string[]
): { name: string; value: number; color: string }[] {
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amountILS);
  }
  return Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value], i) => ({
      name,
      value,
      color: palette[i % palette.length],
    }));
}

export function isAllLive(flags: boolean[]): boolean {
  return flags.every(Boolean);
}

export interface Notification {
  id: string;
  type: "overdue" | "upcoming" | "info";
  title: string;
  body: string;
  amount?: number;
}

export function buildNotifications(
  income: IncomeEntry[],
  subscriptions: { vendor: string; nextCharge: string; priceILS: number; status: string }[]
): Notification[] {
  const notifications: Notification[] = [];
  const resolved = withResolvedStatus(income);

  for (const i of resolved.filter((x) => resolveIncomeStatus(x) === "באיחור")) {
    notifications.push({
      id: `overdue-${i.id}`,
      type: "overdue",
      title: `חשבונית באיחור — ${i.clientName}`,
      body: i.project || i.invoiceNumber,
      amount: i.amount,
    });
  }

  const today = new Date();
  const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  for (const s of subscriptions.filter((x) => x.status === "פעיל")) {
    const chargeDate = new Date(s.nextCharge);
    if (chargeDate <= in7days && chargeDate >= today) {
      notifications.push({
        id: `sub-${s.vendor}`,
        type: "upcoming",
        title: `חיוב קרוב — ${s.vendor}`,
        body: `בתאריך ${s.nextCharge}`,
        amount: s.priceILS,
      });
    }
  }

  return notifications.slice(0, 8);
}
