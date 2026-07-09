import { TopBar } from "@/components/layout/TopBar";
import { Card, KpiCard } from "@/components/ui/Primitives";
import { expenseEntries, formatCurrency } from "@/lib/data";
import { TrendingDown, RefreshCw, Receipt } from "lucide-react";

const categoryColors: Record<string, string> = {
  AI: "text-blue bg-blue/10",
  "אחסון": "text-emerald bg-emerald/10",
  "תוכנה": "text-brass bg-brass/10",
  "מאגר מידע": "text-rose bg-rose/10",
  "משרד": "text-text-secondary bg-text-tertiary/10",
  "שכר": "text-text-secondary bg-text-tertiary/10",
  "שיווק": "text-text-secondary bg-text-tertiary/10",
  "הנהלת חשבונות": "text-text-secondary bg-text-tertiary/10",
  "מיסים": "text-text-secondary bg-text-tertiary/10",
  "אחר": "text-text-secondary bg-text-tertiary/10",
};

export default function ExpensesPage() {
  const total = expenseEntries.reduce((s, e) => s + e.amountILS, 0);
  const recurringTotal = expenseEntries.filter((e) => e.recurring).reduce((s, e) => s + e.amountILS, 0);
  const oneTime = total - recurringTotal;

  return (
    <div className="pb-16">
      <TopBar title="הוצאות" subtitle="כל ההוצאות והספקים" actionLabel="הוצאה חדשה" />

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
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold ${categoryColors[e.category]}`}>
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
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
