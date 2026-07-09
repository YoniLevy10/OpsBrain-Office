"use client";

import { deleteBankTransaction } from "@/app/actions";
import { Card } from "@/components/ui/Primitives";
import { MobileCard, MobileCardList, MobileCardRow } from "@/components/ui/MobileCard";
import { formatCurrency } from "@/lib/data";
import type { BankTransaction } from "@/lib/data";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BankTransactionList({ transactions }: { transactions: BankTransaction[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("למחוק תנועה זו?")) return;
    setDeleting(id);
    await deleteBankTransaction(id);
    setDeleting(null);
    router.refresh();
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center text-text-secondary text-[13.5px]">
        אין תנועות בנק. ייבא קובץ CSV מהגדרות.
      </Card>
    );
  }

  return (
    <>
      <MobileCardList isEmpty={false} emptyMessage="">
        {transactions.map((t) => (
          <MobileCard key={t.id}>
            <MobileCardRow label="תיאור" value={t.description} />
            <MobileCardRow label="תאריך" value={t.date} />
            <MobileCardRow label="בנק" value={t.bank} />
            {t.reference && <MobileCardRow label="אסמכתא" value={t.reference} />}
            <MobileCardRow
              label="סכום"
              value={
                <span className={`font-nums font-semibold ${t.amount >= 0 ? "text-emerald" : "text-rose"}`}>
                  {t.amount >= 0 ? "+" : ""}
                  {formatCurrency(t.amount)}
                </span>
              }
            />
            {t.balance != null && (
              <MobileCardRow label="יתרה" value={<span className="font-nums">{formatCurrency(t.balance)}</span>} />
            )}
            <button
              type="button"
              onClick={() => handleDelete(t.id)}
              disabled={deleting === t.id}
              className="mt-2 text-[12.5px] text-rose font-medium"
            >
              מחיקה
            </button>
          </MobileCard>
        ))}
      </MobileCardList>

      <Card className="hidden md:block overflow-hidden">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-border-soft text-text-secondary text-[12px]">
              <th className="px-5 py-3 text-right font-semibold">תאריך</th>
              <th className="px-5 py-3 text-right font-semibold">תיאור</th>
              <th className="px-5 py-3 text-right font-semibold">בנק</th>
              <th className="px-5 py-3 text-right font-semibold">סכום</th>
              <th className="px-5 py-3 text-right font-semibold">יתרה</th>
              <th className="px-5 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/50">
                <td className="px-5 py-4 text-text-secondary">{t.date}</td>
                <td className="px-5 py-4">
                  <div className="font-medium">{t.description}</div>
                  {t.reference && <div className="text-[12px] text-text-tertiary">{t.reference}</div>}
                </td>
                <td className="px-5 py-4 text-text-secondary">{t.bank}</td>
                <td className={`px-5 py-4 font-nums font-semibold ${t.amount >= 0 ? "text-emerald" : "text-rose"}`}>
                  {t.amount >= 0 ? "+" : ""}
                  {formatCurrency(t.amount)}
                </td>
                <td className="px-5 py-4 font-nums text-text-secondary">
                  {t.balance != null ? formatCurrency(t.balance) : "—"}
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="w-8 h-8 flex items-center justify-center text-rose hover:bg-rose/10 rounded-lg"
                    aria-label="מחיקה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
