"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { formatCurrency } from "@/lib/data";
import type { IncomeEntry } from "@/lib/data";
import { PaymentLinkModal } from "./PaymentLinkModal";

export function PendingInvoicesWidget({ entries }: { entries: IncomeEntry[] }) {
  const pending = entries.filter((e) => e.status === "ממתין" || e.status === "באיחור").slice(0, 5);

  if (pending.length === 0) return null;

  return (
    <Card className="p-5">
      <SectionHeading
        title="חשבוניות ממתינות"
        subtitle="פעולות מהירות — קישורי תשלום"
      />
      <div className="mt-3 space-y-2">
        {pending.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between gap-3 py-2 border-b border-border-soft last:border-0"
          >
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium truncate">{e.clientName}</div>
              <div className="text-[12px] text-text-tertiary truncate">
                {e.project || e.invoiceNumber || "—"}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-nums font-semibold text-[13px]">
                {formatCurrency(e.amount, e.currency)}
              </span>
              {e.status === "באיחור" && <AlertCircle className="w-3.5 h-3.5 text-rose" />}
              <PaymentLinkModal
                clientId={e.clientId}
                clientName={e.clientName}
                defaultAmount={e.amount}
                defaultDescription={e.project || e.clientName}
                incomeId={e.id}
                giDocumentId={e.giId}
                triggerClassName="text-[11px] px-2 py-1 rounded-md bg-emerald/10 text-emerald font-semibold hover:bg-emerald/15"
                label="שלח קישור"
              />
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/income"
        className="inline-flex items-center gap-1 text-[12.5px] text-emerald font-medium mt-3 hover:underline"
      >
        כל ההכנסות
        <ArrowLeft className="w-3.5 h-3.5" />
      </Link>
    </Card>
  );
}
