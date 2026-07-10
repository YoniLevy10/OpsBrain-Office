import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { ArAgingChart } from "@/components/charts/ArAgingChart";
import { ClientRevenueChart } from "@/components/charts/ClientRevenueChart";
import { ProfitTrendChart } from "@/components/charts/ProfitTrendChart";
import { BankFlowChart } from "@/components/charts/BankFlowChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { getFinanceBundle, getBankTransactions } from "@/lib/queries";
import { getLastSyncTime } from "@/lib/meta";
import {
  withResolvedStatus,
  enrichClients,
  buildArAgingBuckets,
  buildClientRevenueRanking,
  buildProfitTrend,
  buildBankFlowSeries,
  buildCashFlowSeries,
  expenseByCategory,
  filterExpensesByMonth,
  getCurrentMonthKey,
  formatMonthLabel,
  isAllLive,
  buildNotifications,
} from "@/lib/analytics";

export const revalidate = 45;

const donutPalette = ["#2F6FED", "#0D9B73", "#C98A1A", "#DC4A62", "#8B95A8", "#7C5FD4", "#1A9FB0"];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month =
    params.month && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : getCurrentMonthKey();

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
  const clients = enrichClients(bundle.clients, incomeEntries);
  const monthExpenses = filterExpensesByMonth(bundle.expenses, month);
  const notifications = buildNotifications(incomeEntries, bundle.subscriptions);

  const arAging = buildArAgingBuckets(incomeEntries);
  const clientRanking = buildClientRevenueRanking(clients, incomeEntries);
  const profitTrend = buildProfitTrend(incomeEntries, bundle.expenses, 12);
  const cashFlow = buildCashFlowSeries(incomeEntries, bundle.expenses, 12);
  const bankFlow = buildBankFlowSeries(bankData.rows, 6);
  const expenseCategories = expenseByCategory(monthExpenses, donutPalette);

  return (
    <div>
      <TopBar
        title="אנליטיקה"
        subtitle="גרפים ומגמות — מבוסס על הנתונים שלך"
        live={live}
        notifications={notifications}
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MonthPicker month={month} />
          <Link
            href="/reports"
            className="text-[13px] text-emerald hover:underline"
          >
            דוחות וייצוא ←
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-5">
            <SectionHeading title="מגמת רווחיות" subtitle="12 חודשים — הכנסות, הוצאות ורווח" />
            <ProfitTrendChart data={profitTrend} />
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionHeading title="תזרים מזומנים" subtitle="הכנסות מול הוצאות — 12 חודשים" />
            <CashFlowChart data={cashFlow} />
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionHeading title="גיול חובות (AR Aging)" subtitle="חשבוניות פתוחות לפי גיל" />
            <ArAgingChart data={arAging} />
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionHeading title="הכנסות לפי לקוח" subtitle="Top לקוחות לפי הכנסה מצטברת" />
            <ClientRevenueChart data={clientRanking} />
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionHeading title="תזרים בנקאי" subtitle="הכנסות והוצאות מייבוא CSV" />
            <BankFlowChart data={bankFlow} />
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionHeading title="פילוח הוצאות" subtitle={formatMonthLabel(month)} />
            {expenseCategories.length > 0 ? (
              <CategoryDonut data={expenseCategories} />
            ) : (
              <p className="text-[13px] text-text-tertiary py-10 text-center">אין הוצאות בחודש זה</p>
            )}
          </Card>
        </div>

        {lastSyncAt && (
          <p className="text-[12px] text-text-tertiary text-center pb-4">
            סנכרון אחרון: {new Date(lastSyncAt).toLocaleString("he-IL")}
          </p>
        )}
      </div>
    </div>
  );
}
