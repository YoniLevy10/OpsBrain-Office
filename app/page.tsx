import { TopBar } from "@/components/layout/TopBar";
import { Card, KpiCard, Badge, SectionHeading } from "@/components/ui/Primitives";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, cashFlowSeries } from "@/lib/data";
import {
  fetchClients,
  fetchIncome,
  fetchExpenses,
  fetchSubscriptions,
} from "@/lib/queries";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { SyncButton } from "@/components/ui/SyncButton";
import { CategoryDonut } from "@/components/charts/CategoryDonut";

export const dynamic = "force-dynamic";

const donutPalette = ["#6C93E8", "#35C79A", "#D4A857", "#E5677A", "#8B93A6", "#7A6CE8", "#4FB8C7"];

export default function DashboardPageWrapper() {
  return <DashboardPage />;
}

async function DashboardPage() {
  const [clientsRes, incomeRes, expensesRes, subsRes] = await Promise.all([
    fetchClients(),
    fetchIncome(),
    fetchExpenses(),
    fetchSubscriptions(),
  ]);

  const live = clientsRes.live;
  const clients = clientsRes.rows;
  const incomeEntries = incomeRes.rows;
  const expenseEntries = expensesRes.rows;
  const subscriptions = subsRes.rows;

  const income = incomeEntries
    .filter((i) => i.status === "שולם")
    .reduce((s, i) => s + i.amount, 0);
  const expenses = expenseEntries.reduce((s, e) => s + e.amountILS, 0);
  const profit = income - expenses;
  const recurring = subscriptions
    .filter((s) => s.status === "פעיל" && s.billingCycle === "חודשי")
    .reduce((sum, s) => sum + s.priceILS, 0);
  const outstanding = clients.reduce((s, c) => s + c.outstanding, 0);
  const activeClients = clients.filter((c) => c.status === "פעיל").length;
  const overdueSum = incomeEntries
    .filter((i) => i.status === "באיחור")
    .reduce((s, i) => s + i.amount, 0);

  // Expense breakdown by category (live)
  const byCategory = new Map<string, number>();
  for (const e of expenseEntries) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amountILS);
  }
  const expenseByCategory = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value], i) => ({ name, value, color: donutPalette[i % donutPalette.length] }));

  // AI-style insight generated from real numbers (rule-based for now)
  const insights: string[] = [];
  if (profit > 0) insights.push(`רווח נקי חיובי של ${formatCurrency(profit)} החודש.`);
  else if (profit < 0) insights.push(`שים לב: ההוצאות (${formatCurrency(expenses)}) גבוהות מההכנסות ששולמו (${formatCurrency(income)}).`);
  const aiSpend = byCategory.get("AI") ?? 0;
  if (aiSpend > 0) insights.push(`ההוצאה החודשית על כלי AI: ${formatCurrency(aiSpend)}.`);
  if (overdueSum > 0) insights.push(`${formatCurrency(overdueSum)} בחשבוניות באיחור — שווה לשלוח תזכורת.`);
  if (recurring > 0) insights.push(`המנויים הקבועים מסתכמים ב-${formatCurrency(recurring)}/חודש (${formatCurrency(recurring * 12)}/שנה).`);
  const insightText = insights.length > 0 ? insights.join(" ") : "הוסף נתונים כדי לקבל תובנות על העסק.";

  const upcomingSubs = [...subscriptions]
    .filter((s) => s.status === "פעיל")
    .sort((a, b) => (a.nextCharge > b.nextCharge ? 1 : -1))
    .slice(0, 4);

  const recentIncome = incomeEntries.slice(0, 4);

  return (
    <div className="pb-16">
      <TopBar
        title="לוח בקרה"
        subtitle="סקירה כללית של מצב העסק"
        live={live}
        action={<SyncButton />}
      />

      <div className="px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="הכנסה חודשית (שולם)" value={formatCurrency(income)} icon={TrendingUp} accent="emerald" />
          <KpiCard label="הוצאה חודשית" value={formatCurrency(expenses)} icon={TrendingDown} accent="rose" />
          <KpiCard label="רווח נקי" value={formatCurrency(profit)} icon={Wallet} accent="brass" />
          <KpiCard label="לקוחות פעילים" value={String(activeClients)} icon={Users} accent="blue" />
        </div>

        <Card className="p-5 flex items-start gap-4 border-emerald/20 bg-gradient-to-l from-emerald/[0.06] to-transparent">
          <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-[18px] h-[18px] text-emerald" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold mb-1">תובנות</div>
            <p className="text-[13.5px] text-text-secondary leading-relaxed">{insightText}</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <SectionHeading title="מגמת תזרים מזומנים" subtitle="הכנסות מול הוצאות — חודשים אחרונים" />
            <CashFlowChart data={cashFlowSeries} />
          </Card>

          <Card className="p-5">
            <SectionHeading title="פילוח הוצאות" subtitle="לפי קטגוריה, החודש" />
            {expenseByCategory.length > 0 ? (
              <CategoryDonut data={expenseByCategory} />
            ) : (
              <p className="text-[13px] text-text-tertiary py-10 text-center">אין עדיין הוצאות</p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <SectionHeading title="חיובים קרובים" subtitle="המנויים הבאים שיחויבו" />
            <div className="divide-y divide-border-soft">
              {upcomingSubs.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-[11px] font-bold text-blue">
                      {s.vendor.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-medium">{s.vendor}</div>
                      <div className="text-[12px] text-text-tertiary">חיוב הבא: {s.nextCharge}</div>
                    </div>
                  </div>
                  <span className="font-nums text-[13px] font-semibold">
                    {formatCurrency(s.priceILS)}
                  </span>
                </div>
              ))}
              {upcomingSubs.length === 0 && (
                <p className="text-[13px] text-text-tertiary py-6 text-center">אין מנויים פעילים</p>
              )}
            </div>
            <Link
              href="/subscriptions"
              className="mt-4 flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-emerald transition-colors w-fit"
            >
              כל המנויים
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card className="p-5">
            <SectionHeading title="הכנסות אחרונות" />
            <div className="space-y-4">
              {recentIncome.map((i) => (
                <div key={i.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{i.clientName}</p>
                    <p className="text-[11.5px] text-text-tertiary truncate">{i.project}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="font-nums text-[12.5px] font-semibold block">
                      {formatCurrency(i.amount, i.currency)}
                    </span>
                    <Badge label={i.status} />
                  </div>
                </div>
              ))}
              {recentIncome.length === 0 && (
                <p className="text-[13px] text-text-tertiary py-6 text-center">אין עדיין הכנסות</p>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">יתרה פתוחה מלקוחות</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(outstanding)}</div>
            </div>
            <Badge label={outstanding > 0 ? "ממתין" : "פעיל"} />
          </Card>
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">חשבוניות באיחור</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(overdueSum)}</div>
            </div>
            <Badge label={overdueSum > 0 ? "באיחור" : "פעיל"} />
          </Card>
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">מנויים חוזרים חודשיים</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(recurring)}</div>
            </div>
            <Badge label="פעיל" />
          </Card>
        </div>
      </div>
    </div>
  );
}
