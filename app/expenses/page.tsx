import { TopBar } from "@/components/layout/TopBar";
import { Card, KpiCard } from "@/components/ui/Primitives";
import { AddRecordPanel, Field, SelectField } from "@/components/ui/AddRecordPanel";
import { formatCurrency } from "@/lib/data";
import { fetchExpenses } from "@/lib/queries";
import { addExpense } from "@/app/actions";
import { TrendingDown, RefreshCw, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

const categories = ["AI", "אחסון", "תוכנה", "מאגר מידע", "משרד", "שכר", "שיווק", "הנהלת חשבונות", "מיסים", "אחר"];

const categoryColors: Record<string, string> = {
  AI: "text-blue bg-blue/10",
  "אחסון": "text-emerald bg-emerald/10",
  "תוכנה": "text-brass bg-brass/10",
  "מאגר מידע": "text-rose bg-rose/10",
};

export default async function ExpensesPage() {
  const { rows: expenseEntries, live } = await fetchExpenses();

  const total = expenseEntries.reduce((s, e) => s + e.amountILS, 0);
  const recurringTotal = expenseEntries.filter((e) => e.recurring).reduce((s, e) => s + e.amountILS, 0);
  const oneTime = total - recurringTotal;

  return (
    <div className="pb-16">
      <TopBar
        title="הוצאות"
        subtitle="כל ההוצאות והספקים"
        live={live}
        action={
          <AddRecordPanel buttonLabel="הוצאה חדשה" title="הוספת הוצאה" action={addExpense}>
            <Field label="ספק" name="vendor" required placeholder="לדוגמה: Vercel" />
            <SelectField label="קטגוריה" name="category" options={categories} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="סכום" name="amount" type="number" required />
              <SelectField label="מטבע" name="currency" options={["ILS", "USD"]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="שער המרה (אם USD)" name="rate" type="number" defaultValue="3.7" />
              <Field label="תאריך" name="date" type="date" />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-text-secondary">
              <input type="checkbox" name="recurring" className="accent-[#35C79A] w-4 h-4" />
              הוצאה חוזרת
            </label>
          </AddRecordPanel>
        }
      />

      <div className="px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="סה״כ הוצאות החודש" value={formatCurrency(total)} icon={TrendingDown} accent="rose" />
          <KpiCard label="הוצאות חוזרות" value={formatCurrency(recurringTotal)} icon={RefreshCw} accent="blue" />
          <KpiCard label="הוצאות חד-פעמיות" value={formatCurrency(oneTime)} icon={Receipt} accent="brass" />
        </div>

        <Card className="overflow-hidden">
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
                </tr>
              </thead>
              <tbody>
                {expenseEntries.map((e) => (
                  <tr key={e.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/60 transition-colors">
                    <td className="px-5 py-4 font-medium">{e.vendor}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold ${categoryColors[e.category] ?? "text-text-secondary bg-text-tertiary/10"}`}>
                        {e.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-nums text-text-secondary">
                      {e.currency === "USD" ? "$" : "₪"}
                      {e.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-nums font-semibold">{formatCurrency(e.amountILS)}</td>
                    <td className="px-5 py-4 text-text-secondary">{e.date}</td>
                    <td className="px-5 py-4 text-text-tertiary">{e.recurring ? "כן" : "לא"}</td>
                  </tr>
                ))}
                {expenseEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-text-tertiary text-[13px]">
                      אין עדיין הוצאות — הוסף את הראשונה עם הכפתור למעלה
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
