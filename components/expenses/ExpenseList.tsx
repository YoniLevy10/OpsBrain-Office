"use client";

import { useState } from "react";
import { Card, KpiCard } from "@/components/ui/Primitives";
import { MobileCard, MobileCardList, MobileCardRow } from "@/components/ui/MobileCard";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Tabs } from "@/components/ui/Tabs";
import { formatCurrency } from "@/lib/data";
import type { ExpenseEntry } from "@/lib/data";
import { TrendingDown, RefreshCw, Receipt } from "lucide-react";

const categoryColors: Record<string, string> = {
  AI: "text-blue bg-blue/10",
  "אחסון": "text-emerald bg-emerald/10",
  "תוכנה": "text-brass bg-brass/10",
  "מאגר מידע": "text-rose bg-rose/10",
};

export function ExpenseList({ entries }: { entries: ExpenseEntry[] }) {
  const [filter, setFilter] = useState("all");

  const currentMonth = new Date();
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = entries.filter((e) => e.date.startsWith(monthKey));

  const filtered =
    filter === "all"
      ? entries
      : filter === "recurring"
        ? entries.filter((e) => e.recurring)
        : entries.filter((e) => e.category === filter);

  const total = thisMonth.reduce((s, e) => s + e.amountILS, 0);
  const recurringTotal = thisMonth.filter((e) => e.recurring).reduce((s, e) => s + e.amountILS, 0);
  const oneTime = total - recurringTotal;

  const categories = [...new Set(entries.map((e) => e.category))];
  const tabs = [
    { id: "all", label: "הכל", count: entries.length },
    { id: "recurring", label: "חוזרות", count: entries.filter((e) => e.recurring).length },
    ...categories.slice(0, 4).map((c) => ({
      id: c,
      label: c,
      count: entries.filter((e) => e.category === c).length,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard label="סה״כ הוצאות החודש" value={formatCurrency(total)} icon={TrendingDown} accent="rose" />
        <KpiCard label="הוצאות חוזרות" value={formatCurrency(recurringTotal)} icon={RefreshCw} accent="blue" />
        <KpiCard label="הוצאות חד-פעמיות" value={formatCurrency(oneTime)} icon={Receipt} accent="brass" />
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />

      <MobileCardList isEmpty={filtered.length === 0} emptyMessage="אין רשומות בסינון זה">
        {filtered.map((e) => (
          <MobileCard key={e.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-[14px]">{e.vendor}</div>
                <span className={`inline-flex mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryColors[e.category] ?? "text-text-secondary bg-text-tertiary/10"}`}>
                  {e.category}
                </span>
              </div>
              <div className="flex items-start gap-1 shrink-0">
                <div className="text-end">
                  <div className="font-nums font-semibold text-[14px]">{formatCurrency(e.amountILS)}</div>
                  {e.currency === "USD" && <div className="text-[11px] text-text-tertiary font-nums">${e.amount.toLocaleString()}</div>}
                </div>
                <DeleteButton table="expenses" id={e.id} />
              </div>
            </div>
            <MobileCardRow label="תאריך" value={e.date} />
            <MobileCardRow label="חוזר" value={e.recurring ? "כן" : "לא"} />
          </MobileCard>
        ))}
      </MobileCardList>

      <Card className="overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border-soft text-text-tertiary text-[12px]">
                <th className="text-start font-medium px-5 py-3.5">ספק</th>
                <th className="text-start font-medium px-5 py-3.5">קטגוריה</th>
                <th className="text-start font-medium px-5 py-3.5">סכום מקורי</th>
                <th className="text-start font-medium px-5 py-3.5">סכום ב-₪</th>
                <th className="text-start font-medium px-5 py-3.5">תאריך</th>
                <th className="text-start font-medium px-5 py-3.5">חוזר</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/60 transition-colors">
                  <td className="px-5 py-4 font-medium">{e.vendor}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold ${categoryColors[e.category] ?? "text-text-secondary bg-text-tertiary/10"}`}>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-nums text-text-secondary">
                    {e.currency === "USD" ? "$" : "₪"}{e.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 font-nums font-semibold">{formatCurrency(e.amountILS)}</td>
                  <td className="px-5 py-4 text-text-secondary">{e.date}</td>
                  <td className="px-5 py-4 text-text-tertiary">{e.recurring ? "כן" : "לא"}</td>
                  <td className="px-3 py-4">
                    <DeleteButton table="expenses" id={e.id} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-tertiary text-[13px]">אין רשומות בסינון זה</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
