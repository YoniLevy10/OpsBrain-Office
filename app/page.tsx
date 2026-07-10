import { TopBar } from "@/components/layout/TopBar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SyncButton } from "@/components/ui/SyncButton";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { getFinanceBundle, getBankTransactions } from "@/lib/queries";
import { getLastSyncTime } from "@/lib/meta";
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
  formatMonthLabel,
  buildArAgingBuckets,
  buildBankFlowSeries,
  buildActivityFeed,
  buildInsights,
  isInMonth,
} from "@/lib/analytics";

export const revalidate = 45;

const donutPalette = ["#2F6FED", "#0D9B73", "#C98A1A", "#DC4A62", "#8B95A8", "#7C5FD4", "#1A9FB0"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const [bundle, bankData, lastSyncAt] = await Promise.all([
    getFinanceBundle(),
    getBankTransactions(),
    getLastSyncTime(),
  ]);
  const live = isAllLive([
    bundle.live.clients,
    bundle.live.income,
    bundle.live.expenses,
    bundle.live.subscriptions,
  ]);
  const incomeEntries = withResolvedStatus(bundle.income);
  const expenseEntries = bundle.expenses;
  const subscriptions = bundle.subscriptions;
  const clients = enrichClients(bundle.clients, incomeEntries);

  const currentMonth =
    params.month && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : getCurrentMonthKey();
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
  const prevProfit = prevIncomeSum - prevExpensesSum;

  const recurring = subscriptions
    .filter((s) => s.status === "פעיל" && s.billingCycle === "חודשי")
    .reduce((sum, s) => sum + s.priceILS, 0);
  const outstanding = clients.reduce((s, c) => s + c.outstanding, 0);
  const activeClients = clients.filter((c) => c.status === "פעיל").length;
  const overdueSum = sumByStatus(monthIncome, "באיחור");

  const cashFlowSeries = buildCashFlowSeries(incomeEntries, expenseEntries);
  const expenseCategoryData = expenseByCategory(monthExpenses, donutPalette);
  const arAging = buildArAgingBuckets(incomeEntries);
  const monthBankTx = bankData.rows.filter((t) => isInMonth(t.date, currentMonth));
  const bankNet = monthBankTx.reduce((s, t) => s + t.amount, 0);
  const activityFeed = buildActivityFeed({
    income: incomeEntries,
    expenses: expenseEntries,
    bank: bankData.rows,
    lastSyncAt,
    limit: 8,
  });

  const insights = buildInsights({
    profit,
    income,
    expenses,
    prevProfit,
    overdueSum,
    outstanding,
    recurring,
    expenseByCategory: expenseCategoryData,
    arAging,
    bankNet: bankData.rows.length > 0 ? bankNet : undefined,
  });

  const notifications = buildNotifications(incomeEntries, subscriptions);

  return (
    <div>
      <TopBar
        title="לוח בקרה"
        subtitle="סקירה כללית"
        live={live}
        notifications={notifications}
        action={<SyncButton />}
      />

      <div className="px-4 sm:px-6 md:px-9 pb-6">
        <div className="mb-4 mt-3 sm:mt-4">
          <MonthPicker month={currentMonth} fullWidth />
        </div>
        <DashboardContent
          monthLabel={formatMonthLabel(currentMonth)}
          incomeEntries={incomeEntries}
          expenseEntries={expenseEntries}
          subscriptions={subscriptions}
          cashFlowSeries={cashFlowSeries}
          expenseByCategory={expenseCategoryData}
          arAging={arAging}
          bankFlow={buildBankFlowSeries(bankData.rows, 6)}
          activityFeed={activityFeed}
          insights={insights}
          kpis={{
            income,
            incomeDelta: percentDelta(income, prevIncomeSum),
            incomeDeltaDir: deltaDirection(income, prevIncomeSum),
            expenses,
            expensesDelta: percentDelta(expenses, prevExpensesSum),
            expensesDeltaDir: deltaDirection(expenses, prevExpensesSum),
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
