import type { BankTransaction, Client, ExpenseEntry, IncomeEntry, IncomeStatus } from "./data";

const HEBREW_MONTHS = [
  "ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני",
  "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳",
];

export function getMonthKey(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m] = dateStr.slice(0, 10).split("-").map(Number);
  if (!y || !m) return "";
  return `${y}-${String(m).padStart(2, "0")}`;
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
  href?: string;
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
      href: "/income",
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
        href: "/subscriptions",
      });
    }
  }

  return notifications.slice(0, 8);
}

export interface ArAgingBucket {
  label: string;
  amount: number;
  count: number;
  color: string;
}

/** Open receivables grouped by age (0-30, 31-60, 61-90, 90+ days). */
export function buildArAgingBuckets(income: IncomeEntry[]): ArAgingBucket[] {
  const resolved = withResolvedStatus(income);
  const open = resolved.filter((i) => {
    const st = resolveIncomeStatus(i);
    return st === "ממתין" || st === "באיחור";
  });

  const buckets = [
    { label: "0–30 יום", min: 0, max: 30, color: "#2F6FED" },
    { label: "31–60 יום", min: 31, max: 60, color: "#C98A1A" },
    { label: "61–90 יום", min: 61, max: 90, color: "#DC4A62" },
    { label: "90+ יום", min: 91, max: Infinity, color: "#7C5FD4" },
  ];

  const now = Date.now();
  return buckets.map(({ label, min, max, color }) => {
    const items = open.filter((i) => {
      if (!i.date) return min === 0;
      const days = Math.floor((now - new Date(i.date).getTime()) / (1000 * 60 * 60 * 24));
      return days >= min && days <= max;
    });
    return {
      label,
      amount: items.reduce((s, i) => s + i.amount, 0),
      count: items.length,
      color,
    };
  });
}

export interface ClientRevenueRow {
  id: string;
  name: string;
  revenue: number;
  outstanding: number;
}

export function buildClientRevenueRanking(
  clients: Client[],
  income: IncomeEntry[],
  limit = 8
): ClientRevenueRow[] {
  const enriched = enrichClients(clients, income);
  return enriched
    .filter((c) => c.revenue > 0 || c.outstanding > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      name: c.company,
      revenue: c.revenue,
      outstanding: c.outstanding,
    }));
}

export interface ProfitTrendPoint {
  month: string;
  profit: number;
  income: number;
  expenses: number;
}

export function buildProfitTrend(
  income: IncomeEntry[],
  expenses: ExpenseEntry[],
  months = 12
): ProfitTrendPoint[] {
  const resolved = withResolvedStatus(income);
  const now = new Date();
  const series: ProfitTrendPoint[] = [];

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
      profit: monthIncome - monthExpenses,
    });
  }
  return series;
}

export interface BankFlowPoint {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export function buildBankFlowSeries(
  transactions: BankTransaction[],
  months = 6
): BankFlowPoint[] {
  const now = new Date();
  const series: BankFlowPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthTx = transactions.filter((t) => isInMonth(t.date, key));
    const inflow = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const outflow = monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    series.push({
      month: HEBREW_MONTHS[d.getMonth()],
      inflow,
      outflow,
      net: inflow - outflow,
    });
  }
  return series;
}

export function incomeForClient(income: IncomeEntry[], clientId: string, clientName: string): IncomeEntry[] {
  const resolved = withResolvedStatus(income);
  return resolved.filter(
    (i) =>
      i.clientId === clientId ||
      i.clientName === clientName ||
      (clientName && i.clientName.includes(clientName.split(" ")[0]))
  );
}

export interface ActivityItem {
  id: string;
  type: "income" | "expense" | "bank" | "sync";
  title: string;
  subtitle: string;
  amount?: number;
  date: string;
  href: string;
}

export function buildActivityFeed(input: {
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  bank: BankTransaction[];
  lastSyncAt?: string | null;
  limit?: number;
}): ActivityItem[] {
  const { income, expenses, bank, lastSyncAt, limit = 12 } = input;
  const items: ActivityItem[] = [];

  for (const i of income.slice(0, 20)) {
    items.push({
      id: `income-${i.id}`,
      type: "income",
      title: i.clientName,
      subtitle: i.project || i.invoiceNumber || i.status,
      amount: i.amount,
      date: i.date,
      href: `/income?highlight=${i.id}`,
    });
  }

  for (const e of expenses.slice(0, 20)) {
    items.push({
      id: `expense-${e.id}`,
      type: "expense",
      title: e.vendor,
      subtitle: e.category,
      amount: -e.amountILS,
      date: e.date,
      href: `/expenses?highlight=${e.id}`,
    });
  }

  for (const t of bank.slice(0, 20)) {
    items.push({
      id: `bank-${t.id}`,
      type: "bank",
      title: t.description.slice(0, 60) || "תנועת בנק",
      subtitle: t.bank,
      amount: t.amount,
      date: t.date,
      href: `/bank?highlight=${t.id}`,
    });
  }

  if (lastSyncAt) {
    items.push({
      id: "sync-last",
      type: "sync",
      title: "סנכרון חשבונית ירוקה",
      subtitle: "עודכן בהצלחה",
      date: lastSyncAt.slice(0, 10),
      href: "/settings",
    });
  }

  return items
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
    .slice(0, limit);
}

export function buildInsights(input: {
  profit: number;
  income: number;
  expenses: number;
  prevProfit: number;
  overdueSum: number;
  outstanding: number;
  recurring: number;
  expenseByCategory: { name: string; value: number }[];
  arAging: ArAgingBucket[];
  bankNet?: number;
}): string[] {
  const insights: string[] = [];
  const {
    profit,
    income,
    expenses,
    prevProfit,
    overdueSum,
    outstanding,
    recurring,
    expenseByCategory,
    arAging,
    bankNet,
  } = input;

  if (profit > 0) {
    insights.push(`רווח נקי חיובי של ₪${profit.toLocaleString()} החודש.`);
  } else if (profit < 0) {
    insights.push(
      `שים לב: ההוצאות (₪${expenses.toLocaleString()}) גבוהות מההכנסות ששולמו (₪${income.toLocaleString()}).`
    );
  }

  if (prevProfit !== 0 && profit !== prevProfit) {
    const pct = Math.round(((profit - prevProfit) / Math.abs(prevProfit)) * 100);
    if (Math.abs(pct) >= 5) {
      insights.push(
        `הרווח ${pct > 0 ? "עלה" : "ירד"} ב-${Math.abs(pct)}% לעומת החודש הקודם.`
      );
    }
  }

  const aiSpend = expenseByCategory.find((c) => c.name === "AI")?.value ?? 0;
  if (aiSpend > 0) insights.push(`ההוצאה החודשית על כלי AI: ₪${aiSpend.toLocaleString()}.`);

  if (overdueSum > 0) {
    insights.push(`₪${overdueSum.toLocaleString()} בחשבוניות באיחור — שווה לשלוח תזכורת.`);
  }

  if (outstanding > 0 && overdueSum === 0) {
    insights.push(`₪${outstanding.toLocaleString()} ממתינים לגבייה — הכל בזמן.`);
  }

  if (recurring > 0) {
    insights.push(`המנויים הקבועים מסתכמים ב-₪${recurring.toLocaleString()}/חודש.`);
  }

  const oldAr = arAging.find((b) => b.label === "90+ יום");
  if (oldAr && oldAr.amount > 0) {
    insights.push(
      `${oldAr.count} חשבוניות ישנות (90+ יום) בסך ₪${oldAr.amount.toLocaleString()} — דורש טיפול.`
    );
  }

  if (bankNet != null && bankNet !== 0) {
    insights.push(
      `תזרים בנקאי נטו החודש: ${bankNet > 0 ? "+" : ""}₪${Math.abs(bankNet).toLocaleString()}.`
    );
  }

  if (insights.length === 0) {
    insights.push("הוסף נתונים או ייבא CSV בנק כדי לקבל תובנות מלאות.");
  }

  return insights.slice(0, 6);
}
