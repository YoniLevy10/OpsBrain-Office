"use client";

import { useState } from "react";
import { Card, KpiCard, Badge, SectionHeading } from "@/components/ui/Primitives";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/data";
import type { ExpenseEntry, IncomeEntry, Subscription } from "@/lib/data";
import type { CashFlowPoint, Notification } from "@/lib/analytics";

interface DashboardContentProps {
  incomeEntries: IncomeEntry[];
  expenseEntries: ExpenseEntry[];
  subscriptions: Subscription[];
  cashFlowSeries: CashFlowPoint[];
  expenseByCategory: { name: string; value: number; color: string }[];
  insights: string[];
  kpis: {
    income: number;
    incomeDelta?: string;
    incomeDeltaDir: "up" | "down";
    expenses: number;
    expensesDelta?: string;
    expensesDeltaDir: "up" | "down";
    profit: number;
    activeClients: number;
    outstanding: number;
    overdueSum: number;
    recurring: number;
  };
}

export function DashboardContent({
  incomeEntries,
  expenseEntries,
  subscriptions,
  cashFlowSeries,
  expenseByCategory,
  insights,
  kpis,
}: DashboardContentProps) {
  const [tab, setTab] = useState("overview");

  const upcomingSubs = [...subscriptions]
    .filter((s) => s.status === "פעיל")
    .sort((a, b) => (a.nextCharge > b.nextCharge ? 1 : -1))
    .slice(0, 4);

  const recentIncome = incomeEntries.slice(0, 4);

  return (
    <div className="space-y-6">
      <Tabs
        tabs={[
          { id: "overview", label: "סקירה" },
          { id: "charts", label: "גרפים" },
          { id: "activity", label: "פעילות", count: recentIncome.length + upcomingSubs.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <TabPanel active={tab} id="overview">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            label="הכנסה חודשית (שולם)"
            value={formatCurrency(kpis.income)}
            delta={kpis.incomeDelta}
            deltaDirection={kpis.incomeDeltaDir}
            icon={TrendingUp}
            accent="emerald"
          />
          <KpiCard
            label="הוצאה חודשית"
            value={formatCurrency(kpis.expenses)}
            delta={kpis.expensesDelta}
            deltaDirection={kpis.expensesDeltaDir}
            icon={TrendingDown}
            accent="rose"
          />
          <KpiCard label="רווח נקי" value={formatCurrency(kpis.profit)} icon={Wallet} accent="brass" />
          <KpiCard label="לקוחות פעילים" value={String(kpis.activeClients)} icon={Users} accent="blue" />
        </div>

        <Card className="p-5 flex items-start gap-4 border-emerald/20 bg-gradient-to-l from-emerald/[0.06] to-transparent mt-6">
          <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-[18px] h-[18px] text-emerald" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold mb-1">תובנות</div>
            <p className="text-[13.5px] text-text-secondary leading-relaxed">{insights.join(" ")}</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">יתרה פתוחה מלקוחות</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(kpis.outstanding)}</div>
            </div>
            <Badge label={kpis.outstanding > 0 ? "ממתין" : "פעיל"} />
          </Card>
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">חשבוניות באיחור</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(kpis.overdueSum)}</div>
            </div>
            <Badge label={kpis.overdueSum > 0 ? "באיחור" : "פעיל"} />
          </Card>
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">מנויים חוזרים חודשיים</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(kpis.recurring)}</div>
            </div>
            <Badge label="פעיל" />
          </Card>
        </div>
      </TabPanel>

      <TabPanel active={tab} id="charts">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <SectionHeading title="מגמת תזרים מזומנים" subtitle="הכנסות מול הוצאות — 7 חודשים אחרונים (נתונים חיים)" />
            {cashFlowSeries.some((p) => p.income > 0 || p.expenses > 0) ? (
              <CashFlowChart data={cashFlowSeries} />
            ) : (
              <p className="text-[13px] text-text-tertiary py-10 text-center">
                אין עדיין מספיק נתונים לגרף — סנכרן מחשבונית ירוקה או הוסף רשומות
              </p>
            )}
          </Card>
          <Card className="p-5">
            <SectionHeading title="פילוח הוצאות" subtitle="לפי קטגוריה, החודש הנוכחי" />
            {expenseByCategory.length > 0 ? (
              <CategoryDonut data={expenseByCategory} />
            ) : (
              <p className="text-[13px] text-text-tertiary py-10 text-center">אין הוצאות החודש</p>
            )}
          </Card>
        </div>
      </TabPanel>

      <TabPanel active={tab} id="activity">
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
                  <span className="font-nums text-[13px] font-semibold">{formatCurrency(s.priceILS)}</span>
                </div>
              ))}
              {upcomingSubs.length === 0 && (
                <p className="text-[13px] text-text-tertiary py-6 text-center">אין מנויים פעילים</p>
              )}
            </div>
            <Link href="/subscriptions" className="mt-4 flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-emerald transition-colors w-fit">
              כל המנויים <ArrowLeft className="w-3.5 h-3.5" />
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
            <Link href="/income" className="mt-4 flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-emerald transition-colors w-fit">
              כל ההכנסות <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </TabPanel>
    </div>
  );
}
