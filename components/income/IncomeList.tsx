"use client";

import { useState } from "react";
import { Card, Badge, KpiCard } from "@/components/ui/Primitives";
import { MobileCard, MobileCardList, MobileCardRow } from "@/components/ui/MobileCard";
import { Tabs } from "@/components/ui/Tabs";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { IncomeStatusSelect } from "@/components/income/IncomeStatusSelect";
import { formatCurrency } from "@/lib/data";
import type { IncomeEntry } from "@/lib/data";
import { resolveIncomeStatus } from "@/lib/analytics";
import { TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export function IncomeList({ entries }: { entries: IncomeEntry[] }) {
  const [filter, setFilter] = useState("all");

  const resolved = entries.map((i) => ({ ...i, status: resolveIncomeStatus(i) }));

  const filtered =
    filter === "all"
      ? resolved
      : resolved.filter((i) => i.status === filter);

  const currentMonth = new Date();
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = resolved.filter((i) => i.date.startsWith(monthKey));

  const total = thisMonth.reduce((s, i) => s + i.amount, 0);
  const paid = thisMonth.filter((i) => i.status === "שולם").reduce((s, i) => s + i.amount, 0);
  const pending = thisMonth.filter((i) => i.status === "ממתין").reduce((s, i) => s + i.amount, 0);
  const overdue = thisMonth.filter((i) => i.status === "באיחור").reduce((s, i) => s + i.amount, 0);

  const tabs = [
    { id: "all", label: "הכל", count: resolved.length },
    { id: "שולם", label: "שולם", count: resolved.filter((i) => i.status === "שולם").length },
    { id: "ממתין", label: "ממתין", count: resolved.filter((i) => i.status === "ממתין").length },
    { id: "באיחור", label: "באיחור", count: resolved.filter((i) => i.status === "באיחור").length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="סה״כ החודש" value={formatCurrency(total)} icon={TrendingUp} accent="emerald" />
        <KpiCard label="שולם" value={formatCurrency(paid)} icon={CheckCircle2} accent="emerald" />
        <KpiCard label="ממתין" value={formatCurrency(pending)} icon={Clock} accent="brass" />
        <KpiCard label="באיחור" value={formatCurrency(overdue)} icon={AlertCircle} accent="rose" />
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />

      <MobileCardList isEmpty={filtered.length === 0} emptyMessage="אין רשומות בסינון זה">
        {filtered.map((i) => (
          <MobileCard key={i.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-[14px]">{i.clientName}</div>
                {i.project && <div className="text-[12px] text-text-secondary mt-0.5 truncate">{i.project}</div>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IncomeStatusSelect id={i.id} status={i.status} />
                <DeleteButton table="income" id={i.id} />
              </div>
            </div>
            <MobileCardRow label="סכום" value={<span className="font-nums font-semibold">{formatCurrency(i.amount, i.currency)}</span>} />
            <MobileCardRow label="תאריך" value={i.date} />
            {i.invoiceNumber && <MobileCardRow label="מס׳ חשבונית" value={<span className="font-nums">{i.invoiceNumber}</span>} />}
          </MobileCard>
        ))}
      </MobileCardList>

      <Card className="overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border-soft text-text-tertiary text-[12px]">
                <th className="text-start font-medium px-5 py-3.5">לקוח</th>
                <th className="text-start font-medium px-5 py-3.5">פרויקט</th>
                <th className="text-start font-medium px-5 py-3.5">מס׳ חשבונית</th>
                <th className="text-start font-medium px-5 py-3.5">סכום</th>
                <th className="text-start font-medium px-5 py-3.5">תאריך</th>
                <th className="text-start font-medium px-5 py-3.5">סטטוס</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/60 transition-colors">
                  <td className="px-5 py-4 font-medium">{i.clientName}</td>
                  <td className="px-5 py-4 text-text-secondary">{i.project}</td>
                  <td className="px-5 py-4 text-text-tertiary font-nums">{i.invoiceNumber}</td>
                  <td className="px-5 py-4 font-nums font-semibold">{formatCurrency(i.amount, i.currency)}</td>
                  <td className="px-5 py-4 text-text-secondary">{i.date}</td>
                  <td className="px-5 py-4">
                    <IncomeStatusSelect id={i.id} status={i.status} />
                  </td>
                  <td className="px-3 py-4">
                    <DeleteButton table="income" id={i.id} />
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
