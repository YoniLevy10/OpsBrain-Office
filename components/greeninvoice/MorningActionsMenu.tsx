"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Receipt, Link2 } from "lucide-react";
import { CreateReceiptModal } from "./CreateReceiptModal";
import { PaymentLinkModal } from "./PaymentLinkModal";

type Props = {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  outstanding?: number;
  compact?: boolean;
};

export function MorningActionsMenu({
  clientId,
  clientName,
  clientEmail,
  outstanding = 0,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <CreateReceiptModal
          clientId={clientId}
          clientName={clientName}
          clientEmail={clientEmail}
          triggerClassName="flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg bg-emerald text-white font-semibold"
        />
        {outstanding > 0 && (
          <PaymentLinkModal
            clientId={clientId}
            clientName={clientName}
            clientEmail={clientEmail}
            defaultAmount={outstanding}
            defaultDescription={`תשלום עבור ${clientName}`}
            triggerClassName="flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg border border-emerald/30 text-emerald font-semibold"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" ref={ref}>
      <CreateReceiptModal clientId={clientId} clientName={clientName} clientEmail={clientEmail} />
      <PaymentLinkModal
        clientId={clientId}
        clientName={clientName}
        clientEmail={clientEmail}
        defaultAmount={outstanding > 0 ? outstanding : undefined}
        defaultDescription={outstanding > 0 ? `יתרה פתוחה — ${clientName}` : ""}
      />
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover"
          aria-label="פעולות נוספות"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 min-w-[180px] bg-surface border border-border rounded-lg shadow-lg py-1">
            <div className="px-3 py-2 text-[11px] text-text-tertiary border-b border-border-soft">
              פעולות Morning
            </div>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-surface-hover text-start"
              onClick={() => setOpen(false)}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald" />
              הנפק קבלה
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-surface-hover text-start"
              onClick={() => setOpen(false)}
            >
              <Link2 className="w-3.5 h-3.5 text-emerald" />
              קישור תשלום
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
