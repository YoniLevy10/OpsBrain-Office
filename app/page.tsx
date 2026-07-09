import { TopBar } from "@/components/layout/TopBar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SyncButton } from "@/components/ui/SyncButton";
import { formatCurrency } from "@/lib/data";
import {
  fetchClients,
  fetchIncome,
  fetchExpenses,
  fetchSubscriptions,
} from "@/lib/queries";
import {
  withResolvedStatus,
  filterIncomeByMonth,
  filterExpensesByMonth,
  sumPaidIncome,
  sumExpenses,
  sumByStatus,
  percentDelta,
  deltaDirection,
  buildCashFlowSeries,
  enrichClients,
  expenseByCategory,
  isAllLive,
  getCurrentMonthKey,
  getPreviousMonthKey,
  buildNotifications,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

const donutPalette = ["#2F6FED", "#0D9B73", "#C98A1A", "#DC4A62", "#8B95A8", "#7C5FD4", "#1A9FB0"];

export default async function DashboardPage() {
  const [clientsRes, incomeRes, expensesRes, subsRes] = await Promise.all([
    fetchClients(),
    fetchIncome(),
    fetchExpenses(),
    fetchSubscriptions(),
  ]);

  const live = isAllLive([clientsRes.live, incomeRes.live, expensesRes.live, subsRes.live]);
  const incomeEntries = withResolvedStatus(incomeRes.rows);
  const expenseEntries = expensesRes.rows;
  const subscriptions = subsRes.rows;
  const clients = enrichClients(clientsRes.rows, incomeEntries);

  const currentMonth = getCurrentMonthKey();
  const prevMonth = getPreviousMonthKey(currentMonth);

  const monthIncome = filterIncomeByMonth(incomeEntries, currentMonth);
  const monthExpenses = filterExpensesByMonth(expenseEntries, currentMonth);
  const prevIncome = filterIncomeByMonth(incomeEntries, prevMonth);
  const prevExpenses = filterExpensesByMonth(expenseEntries, prevMonth);

  const income = sumPaidIncome(monthIncome);
  const expenses = sumExpenses(monthExpenses);
  const profit = income - expenses;
  const prevIncomeSum = sumPaidIncome(prevIncome);
  const prevExpensesSum = sumExpenses(prevExpenses);

  const recurring = subscriptions
    .filter((s) => s.status === "פעיל" && s.billingCycle === "חודשי")
    .reduce((sum, s) => sum + s.priceILS, 0);
  const outstanding = clients.reduce((s, c) => s + c.outstanding, 0);
  const activeClients = clients.filter((c) => c.status === "פעיל").length;
  const overdueSum = sumByStatus(monthIncome, "באיחור");

  const cashFlowSeries = buildCashFlowSeries(incomeEntries, expenseEntries);
  const expenseCategoryData = expenseByCategory(monthExpenses, donutPalette);

  const insights: string[] = [];
  if (profit > 0) insights.push(`רווח נקי חיובי של ${formatCurrency(profit)} החודש.`);
  else if (profit < 0) insights.push(`שים לב: ההוצאות (${formatCurrency(expenses)}) גבוהות מההכנסות ששולמו (${formatCurrency(income)}).`);
  const aiSpend = expenseCategoryData.find((c) => c.name === "AI")?.value ?? 0;
  if (aiSpend > 0) insights.push(`ההוצאה החודשית על כלי AI: ${formatCurrency(aiSpend)}.`);
  if (overdueSum > 0) insights.push(`${formatCurrency(overdueSum)} בחשבוניות באיחור — שווה לשלוח תזכורת.`);
  if (recurring > 0) insights.push(`המנויים הקבועים מסתכמים ב-${formatCurrency(recurring)}/חודש.`);
  if (insights.length === 0) insights.push("הוסף נתונים או סנכרן מחשבונית ירוקה כדי לקבל תובנות.");

  const notifications = buildNotifications(incomeEntries, subscriptions);

  return (
    <div>
      <TopBar
        title="לוח בקרה"
        subtitle="סקירה כללית של מצב העסק"
        live={live}
        notifications={notifications}
        action={<SyncButton />}
      />

      <div className="px-4 sm:px-6 md:px-9">
        <DashboardContent
          incomeEntries={incomeEntries}
          expenseEntries={expenseEntries}
          subscriptions={subscriptions}
          cashFlowSeries={cashFlowSeries}
          expenseByCategory={expenseCategoryData}
          insights={insights}
          kpis={{
            income,
            incomeDelta: percentDelta(income, prevIncomeSum),
            incomeDeltaDir: deltaDirection(income, prevIncomeSum),
            expenses,
            expensesDelta: percentDelta(expenses, prevExpensesSum),
            expensesDeltaDir: deltaDirection(prevExpensesSum, expenses),
            profit,
            activeClients,
            outstanding,
            overdueSum,
            recurring,
          }}
        />
      </div>
    </div>
  );
}
