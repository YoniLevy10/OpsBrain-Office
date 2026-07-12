"use client";

import type { IncomeEntry } from "@/lib/data";
import { Link2 } from "lucide-react";
import { MorningBadge } from "./MorningBadge";
import { SendDocumentButton } from "./SendDocumentButton";
import { DownloadPdfButton } from "./DownloadPdfButton";
import { PaymentLinkModal } from "./PaymentLinkModal";

export function MorningIncomeActions({
  entry,
  clientEmail,
  compact,
}: {
  entry: IncomeEntry;
  clientEmail?: string;
  compact?: boolean;
}) {
  const isPending = entry.status === "ממתין" || entry.status === "באיחור";

  return (
    <div className={`flex items-center gap-1 ${compact ? "flex-wrap" : ""}`}>
      <MorningBadge source={entry.source} />
      <div className="flex items-center gap-0.5 rounded-lg border border-border-soft bg-bg p-0.5">
        {entry.giId && (
          <>
            <DownloadPdfButton
              documentId={entry.giId}
              pdfUrl={entry.giPdfUrl}
              className="p-2 rounded-md text-text-tertiary hover:text-blue hover:bg-blue/5 transition-colors"
            />
            <SendDocumentButton
              documentId={entry.giId}
              email={clientEmail}
              incomeId={entry.id}
              clientId={entry.clientId}
              className="p-2 rounded-md text-text-tertiary hover:text-emerald hover:bg-emerald/5 transition-colors"
            />
          </>
        )}
        {isPending && (
          <PaymentLinkModal
            clientId={entry.clientId}
            clientName={entry.clientName}
            clientEmail={clientEmail}
            defaultAmount={entry.amount}
            defaultDescription={entry.project || entry.clientName}
            incomeId={entry.id}
            giDocumentId={entry.giId}
            label=""
            triggerClassName="p-2 rounded-md text-text-tertiary hover:text-emerald hover:bg-emerald/5 transition-colors"
          />
        )}
        {entry.giPaymentLink && (
          <a
            href={entry.giPaymentLink}
            target="_blank"
            rel="noopener noreferrer"
            title="קישור תשלום"
            className="p-2 rounded-md text-emerald hover:bg-emerald/5 transition-colors"
          >
            <Link2 className="w-4 h-4" />
          </a>
        )}
      </div>
      {!entry.giId && isPending && !entry.giPaymentLink && (
        <span className="text-[10px] text-text-tertiary">אין מסמך</span>
      )}
    </div>
  );
}
