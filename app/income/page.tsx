import { TopBar } from "@/components/layout/TopBar";
import { Card, Badge, KpiCard } from "@/components/ui/Primitives";
import { MobileCard, MobileCardList, MobileCardRow } from "@/components/ui/MobileCard";
import { AddRecordPanel, Field, SelectField } from "@/components/ui/AddRecordPanel";
import { formatCurrency } from "@/lib/data";
import { fetchIncome } from "@/lib/queries";
import { addIncome } from "@/app/actions";
import { TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const { rows: incomeEntries, live } = await fetchIncome();

  const total = incomeEntries.reduce((s, i) => s + i.amount, 0);
  const paid = incomeEntries.filter((i) => i.status === "שולם").reduce((s, i) => s + i.amount, 0);
  const pending = incomeEntries.filter((i) => i.status === "ממתין").reduce((s, i) => s + i.amount, 0);
  const overdue = incomeEntries.filter((i) => i.status === "באיחור").reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <TopBar
        title="הכנסות"
        subtitle="כל התשלומים והחשבוניות"
        live={live}
        action={
          <AddRecordPanel buttonLabel="הכנסה חדשה" title="הוספת הכנסה" action={addIncome}>
            <Field label="לקוח" name="client_name" required placeholder="שם הלקוח" />
            <Field label="פרויקט / תיאור" name="project" placeholder="לדוגמה: Bamakor – מנוי חודשי" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="סכום" name="amount" type="number" required />
              <SelectField label="מטבע" name="currency" options={["ILS", "USD"]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="מס׳ חשבונית" name="invoice_number" placeholder="INV-1045" />
              <Field label="תאריך" name="date" type="date" />
            </div>
            <SelectField label="סטטוס" name="status" options={["שולם", "ממתין", "באיחור", "בוטל"]} />
          </AddRecordPanel>
        }
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard label="סה״כ החודש" value={formatCurrency(total)} icon={TrendingUp} accent="emerald" />
          <KpiCard label="שולם" value={formatCurrency(paid)} icon={CheckCircle2} accent="emerald" />
          <KpiCard label="ממתין" value={formatCurrency(pending)} icon={Clock} accent="brass" />
          <KpiCard label="באיחור" value={formatCurrency(overdue)} icon={AlertCircle} accent="rose" />
        </div>

        <MobileCardList
          isEmpty={incomeEntries.length === 0}
          emptyMessage="אין עדיין הכנסות — הוסף את הראשונה עם הכפתור למעלה"
        >
          {incomeEntries.map((i) => (
            <MobileCard key={i.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-[14px]">{i.clientName}</div>
                  {i.project && (
                    <div className="text-[12px] text-text-secondary mt-0.5 truncate">{i.project}</div>
                  )}
                </div>
                <Badge label={i.status} />
              </div>
              <MobileCardRow
                label="סכום"
                value={
                  <span className="font-nums font-semibold">{formatCurrency(i.amount, i.currency)}</span>
                }
              />
              <MobileCardRow label="תאריך" value={i.date} />
              {i.invoiceNumber && (
                <MobileCardRow
                  label="מס׳ חשבונית"
                  value={<span className="font-nums">{i.invoiceNumber}</span>}
                />
              )}
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
                {incomeEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-text-tertiary text-[13px]">
                      אין עדיין הכנסות — הוסף את הראשונה עם הכפתור למעלה
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
