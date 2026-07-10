"use client";

import { useState } from "react";
import { Card, KpiCard, Badge, SectionHeading } from "@/components/ui/Primitives";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { ArAgingChart } from "@/components/charts/ArAgingChart";
import { BankFlowChart } from "@/components/charts/BankFlowChart";
import { ActivityFeed, ActivityFeedFooter } from "@/components/dashboard/ActivityFeed";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/data";
import type { ExpenseEntry, IncomeEntry, Subscription } from "@/lib/data";
import type {
  ActivityItem,
  ArAgingBucket,
  BankFlowPoint,
  CashFlowPoint,
} from "@/lib/analytics";

interface DashboardContentProps {
  incomeEntries: IncomeEntry[];
  expenseEntries: ExpenseEntry[];
  subscriptions: Subscription[];
  cashFlowSeries: CashFlowPoint[];
  expenseByCategory: { name: string; value: number; color: string }[];
  arAging: ArAgingBucket[];
  bankFlow: BankFlowPoint[];
  activityFeed: ActivityItem[];
  insights: string[];
  monthLabel: string;
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

function StatChip({
  label,
  value,
  badge,
  accent,
}: {
  label: string;
  value: string;
  badge?: string;
  accent?: "rose" | "emerald" | "blue";
}) {
  const accentRing =
    accent === "rose" ? "border-rose/20" : accent === "blue" ? "border-blue/20" : "border-emerald/20";

  return (
    <Card className={`p-4 min-w-0 flex-1 border ${accentRing}`}>
      <p className="text-[11.5px] sm:text-[12.5px] text-text-secondary leading-snug">{label}</p>
      <div className="flex items-end justify-between gap-2 mt-2">
        <p className="font-nums text-[17px] sm:text-[20px] font-bold leading-none">{value}</p>
        {badge && <Badge label={badge} />}
      </div>
    </Card>
  );
}

export function DashboardContent({
  incomeEntries,
  subscriptions,
  cashFlowSeries,
  expenseByCategory,
  arAging,
  bankFlow,
  activityFeed,
  insights,
  monthLabel,
  kpis,
}: DashboardContentProps) {
  const [tab, setTab] = useState("overview");

  const today = new Date().toISOString().slice(0, 10);
  const upcomingSubs = [...subscriptions]
    .filter((s) => s.status === "פעיל" && s.nextCharge >= today)
    .sort((a, b) => (a.nextCharge > b.nextCharge ? 1 : -1))
    .slice(0, 4);

  const recentIncome = incomeEntries.slice(0, 4);

  return (
    <div className="space-y-5 sm:space-y-6">
      <Tabs
        variant="pills"
        tabs={[
          { id: "overview", label: "סקירה" },
          { id: "charts", label: "גרפים" },
          { id: "activity", label: "פעילות", count: activityFeed.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <TabPanel active={tab} id="overview">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <KpiCard
            label="הכנסה (שולם)"
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
            deltaInvert
            icon={TrendingDown}
            accent="rose"
          />
          <KpiCard label="רווח נקי" value={formatCurrency(kpis.profit)} icon={Wallet} accent="brass" />
          <KpiCard label="לקוחות פעילים" value={String(kpis.activeClients)} icon={Users} accent="blue" />
        </div>

        <Card className="p-4 sm:p-5 border-emerald/20 bg-gradient-to-l from-emerald/[0.06] to-transparent mt-4 sm:mt-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-[18px] h-[18px] text-emerald" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold mb-2">תובנה</div>
              <ul className="space-y-2">
                {insights.map((text) => (
                  <li key={text} className="flex gap-2 text-[12.5px] sm:text-[13.5px] text-text-secondary leading-relaxed">
                    <span className="text-emerald font-bold shrink-0 mt-0.5">•</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-4 sm:mt-6">
          <StatChip
            label="יתרה פתוחה"
            value={formatCurrency(kpis.outstanding)}
            badge={kpis.outstanding > 0 ? "פתוח" : undefined}
          />
          <StatChip
            label="באיחור"
            value={formatCurrency(kpis.overdueSum)}
            badge={kpis.overdueSum > 0 ? "באיחור" : undefined}
            accent="rose"
          />
          <StatChip
            label="מנויים חודשיים"
            value={formatCurrency(kpis.recurring)}
            badge="פעיל"
            accent="blue"
          />
        </div>
      </TabPanel>

      <TabPanel active={tab} id="charts">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-5 lg:col-span-2">
            <SectionHeading title="מגמת תזרים מזומנים" subtitle="הכנסות מול הוצאות — 7 חודשים אחרונים" />
            {cashFlowSeries.some((p) => p.income > 0 || p.expenses > 0) ? (
              <CashFlowChart data={cashFlowSeries} />
            ) : (
              <p className="text-[13px] text-text-tertiary py-10 text-center">
                אין עדיין מספיק נתונים לגרף — הוסף רשומות או ייבא CSV בנק
              </p>
            )}
          </Card>
          <Card className="p-4 sm:p-5">
            <SectionHeading title="פילוח הוצאות" subtitle={`לפי קטגוריה, ${monthLabel}`} />
            {expenseByCategory.length > 0 ? (
              <CategoryDonut data={expenseByCategory} />
            ) : (
              <p className="text-[13px] text-text-tertiary py-10 text-center">אין הוצאות החודש</p>
            )}
          </Card>
          <Card className="p-4 sm:p-5">
            <SectionHeading title="גיול חובות" subtitle="חשבוניות פתוחות לפי גיל" />
            <ArAgingChart data={arAging} />
          </Card>
          <Card className="p-4 sm:p-5 lg:col-span-2">
            <SectionHeading title="תזרים בנקאי" subtitle="מייבוא CSV — 6 חודשים" />
            <BankFlowChart data={bankFlow} />
          </Card>
        </div>
        <Link
          href="/analytics"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-emerald hover:underline"
        >
          כל הגרפים והאנליטיקה ←
        </Link>
      </TabPanel>

      <TabPanel active={tab} id="activity">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-5 lg:col-span-2">
            <SectionHeading title="פעילות אחרונה" subtitle="הכנסות, הוצאות, בנק וסנכרונים" />
            <ActivityFeed items={activityFeed} />
            <ActivityFeedFooter />
          </Card>
          <Card className="p-4 sm:p-5">
            <SectionHeading title="חיובים קרובים" subtitle="מנויים שיחויבו בקרוב" />
            <div className="divide-y divide-border-soft">
              {upcomingSubs.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue/10 flex items-center justify-center text-[11px] font-bold text-blue shrink-0">
                      {s.vendor.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium truncate">{s.vendor}</div>
                      <div className="text-[11.5px] text-text-tertiary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.nextCharge}
                      </div>
                    </div>
                  </div>
                  <span className="font-nums text-[13px] font-semibold shrink-0">{formatCurrency(s.priceILS)}</span>
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
              כל המנויים <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionHeading title="הכנסות אחרונות" />
            <div className="space-y-3">
              {recentIncome.map((i) => (
                <div key={i.id} className="flex items-start justify-between gap-2 py-1">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{i.clientName}</p>
                    <p className="text-[11.5px] text-text-tertiary truncate">{i.project}</p>
                  </div>
                  <div className="text-left shrink-0 space-y-1">
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
            <Link
              href="/income"
              className="mt-4 flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-emerald transition-colors w-fit"
            >
              כל ההכנסות <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </TabPanel>
    </div>
  );
}
