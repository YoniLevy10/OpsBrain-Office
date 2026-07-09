import { TopBar } from "@/components/layout/TopBar";
import { Card, Badge, KpiCard } from "@/components/ui/Primitives";
import { incomeEntries, formatCurrency } from "@/lib/data";
import { TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function IncomePage() {
  const total = incomeEntries.reduce((s, i) => s + i.amount, 0);
  const paid = incomeEntries.filter((i) => i.status === "שולם").reduce((s, i) => s + i.amount, 0);
  const pending = incomeEntries.filter((i) => i.status === "ממתין").reduce((s, i) => s + i.amount, 0);
  const overdue = incomeEntries.filter((i) => i.status === "באיחור").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="pb-16">
      <TopBar title="הכנסות" subtitle="כל התשלומים והחשבוניות" actionLabel="הכנסה חדשה" />

      <div className="px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="סה״כ החודש" value={formatCurrency(total)} icon={TrendingUp} accent="emerald" />
          <KpiCard label="שולם" value={formatCurrency(paid)} icon={CheckCircle2} accent="emerald" />
          <KpiCard label="ממתין" value={formatCurrency(pending)} icon={Clock} accent="brass" />
          <KpiCard label="באיחור" value={formatCurrency(overdue)} icon={AlertCircle} accent="rose" />
        </div>

        <Card className="overflow-hidden">
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
                </tr>
              </thead>
              <tbody>
                {incomeEntries.map((i) => (
                  <tr key={i.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/60 transition-colors">
                    <td className="px-5 py-4 font-medium">{i.clientName}</td>
                    <td className="px-5 py-4 text-text-secondary">{i.project}</td>
                    <td className="px-5 py-4 text-text-tertiary font-nums">{i.invoiceNumber}</td>
                    <td className="px-5 py-4 font-nums font-semibold">{formatCurrency(i.amount, i.currency)}</td>
                    <td className="px-5 py-4 text-text-secondary">{i.date}</td>
                    <td className="px-5 py-4">
                      <Badge label={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
