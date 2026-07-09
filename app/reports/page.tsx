import { TopBar } from "@/components/layout/TopBar";
import { Card, KpiCard, SectionHeading } from "@/components/ui/Primitives";
import { formatCurrency } from "@/lib/data";
import {
  fetchClients,
  fetchIncome,
  fetchExpenses,
  fetchSubscriptions,
} from "@/lib/queries";
import {
  withResolvedStatus,
  filterIncomeByMonth,
  filterExpensesByMonth,
  sumPaidIncome,
  sumExpenses,
  getCurrentMonthKey,
  formatMonthLabel,
  isAllLive,
} from "@/lib/analytics";
import { FileSpreadsheet, Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function ExportButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="flex items-center gap-3 p-4 rounded-xl border border-border-soft bg-surface hover:bg-surface-hover transition-colors card-shadow"
    >
      <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center shrink-0">
        <Download className="w-4 h-4 text-blue" />
      </div>
      <div>
        <div className="text-[13.5px] font-semibold">{label}</div>
        <div className="text-[11.5px] text-text-tertiary">הורדה כ-CSV (Excel)</div>
      </div>
    </a>
  );
}

export default async function ReportsPage() {
  const month = getCurrentMonthKey();
  const [clientsRes, incomeRes, expensesRes, subsRes] = await Promise.all([
    fetchClients(),
    fetchIncome(),
    fetchExpenses(),
    fetchSubscriptions(),
  ]);

  const live = isAllLive([clientsRes.live, incomeRes.live, expensesRes.live, subsRes.live]);
  const income = withResolvedStatus(incomeRes.rows);
  const monthIncome = filterIncomeByMonth(income, month);
  const monthExpenses = filterExpensesByMonth(expensesRes.rows, month);
  const paid = sumPaidIncome(monthIncome);
  const expTotal = sumExpenses(monthExpenses);
  const profit = paid - expTotal;
  const recurring = subsRes.rows
    .filter((s) => s.status === "פעיל" && s.billingCycle === "חודשי")
    .reduce((s, x) => s + x.priceILS, 0);

  return (
    <div>
      <TopBar
        title="דוחות"
        subtitle={`סיכום חודשי — ${formatMonthLabel(month)}`}
        live={live}
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard label="הכנסות ששולמו" value={formatCurrency(paid)} icon={TrendingUp} accent="emerald" />
          <KpiCard label="הוצאות" value={formatCurrency(expTotal)} icon={TrendingDown} accent="rose" />
          <KpiCard label="רווח נקי" value={formatCurrency(profit)} icon={Wallet} accent="brass" />
          <KpiCard label="מנויים חודשיים" value={formatCurrency(recurring)} icon={FileSpreadsheet} accent="blue" />
        </div>

        <Card className="p-5">
          <SectionHeading title="ייצוא נתונים" subtitle="הורדת קבצי CSV לפתיחה ב-Excel או Google Sheets" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <ExportButton href="/api/export?type=summary" label="סיכום חודשי" />
            <ExportButton href="/api/export?type=income" label="כל ההכנסות" />
            <ExportButton href="/api/export?type=expenses" label="כל ההוצאות" />
            <ExportButton href="/api/export?type=clients" label="כל הלקוחות" />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading title="פירוט מהיר" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-center">
            <div>
              <div className="font-nums text-[22px] font-bold">{income.length}</div>
              <div className="text-[12px] text-text-tertiary mt-1">רשומות הכנסה</div>
            </div>
            <div>
              <div className="font-nums text-[22px] font-bold">{expensesRes.rows.length}</div>
              <div className="text-[12px] text-text-tertiary mt-1">רשומות הוצאה</div>
            </div>
            <div>
              <div className="font-nums text-[22px] font-bold">{clientsRes.rows.length}</div>
              <div className="text-[12px] text-text-tertiary mt-1">לקוחות</div>
            </div>
            <div>
              <div className="font-nums text-[22px] font-bold">{subsRes.rows.length}</div>
              <div className="text-[12px] text-text-tertiary mt-1">מנויים</div>
            </div>
          </div>
          <Link href="/" className="inline-block mt-4 text-[13px] text-emerald hover:underline">
            חזרה ללוח הבקרה ←
          </Link>
        </Card>
      </div>
    </div>
  );
}
