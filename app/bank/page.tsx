import { BankTransactionList } from "@/components/bank/BankTransactionList";
import { TopBar } from "@/components/layout/TopBar";
import { Card, KpiCard } from "@/components/ui/Primitives";
import { formatCurrency } from "@/lib/data";
import { getBankTransactions } from "@/lib/queries";
import { Landmark, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

export const revalidate = 45;

export default async function BankPage() {
  const { rows: transactions, live } = await getBankTransactions();

  const totalIn = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div>
      <TopBar
        title="תנועות בנק"
        subtitle="תנועות שיובאו מקובץ CSV (דיסקונט וכו')"
        live={live}
        action={
          <Link
            href="/settings"
            className="text-[13px] text-emerald font-semibold hover:underline"
          >
            ייבוא CSV
          </Link>
        }
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6 pb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard label="תנועות" value={String(transactions.length)} icon={Landmark} accent="blue" />
          <KpiCard label="זכויות (ייבוא)" value={formatCurrency(totalIn)} icon={TrendingUp} accent="emerald" />
          <KpiCard label="חובות (ייבוא)" value={formatCurrency(totalOut)} icon={TrendingDown} accent="rose" />
        </div>

        {!live && transactions.length === 0 && (
          <Card className="p-4 text-[13px] text-text-secondary">
            טבלת <code className="text-[11px]">ob_bank_transactions</code> לא קיימת עדיין — הרץ את{" "}
            <code className="text-[11px]">migration-bank.sql</code> ב-Supabase.
          </Card>
        )}

        <BankTransactionList transactions={transactions} />
      </div>
    </div>
  );
}
