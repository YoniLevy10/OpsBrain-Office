"use client";

import type { IncomeEntry } from "@/lib/data";
import { MorningBadge } from "./MorningBadge";
import { SendDocumentButton } from "./SendDocumentButton";
import { DownloadPdfButton } from "./DownloadPdfButton";
import { PaymentLinkModal } from "./PaymentLinkModal";

export function MorningIncomeActions({
  entry,
  clientEmail,
}: {
  entry: IncomeEntry;
  clientEmail?: string;
}) {
  const isPending = entry.status === "ממתין" || entry.status === "באיחור";

  return (
    <div className="flex items-center gap-0.5">
      <MorningBadge source={entry.source} />
      {entry.giId && (
        <>
          <DownloadPdfButton documentId={entry.giId} pdfUrl={entry.giPdfUrl} />
          <SendDocumentButton
            documentId={entry.giId}
            email={clientEmail}
            incomeId={entry.id}
            clientId={entry.clientId}
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
          triggerClassName="p-1.5 rounded-lg text-text-tertiary hover:text-emerald hover:bg-emerald/5 transition-colors"
        />
      )}
      {entry.giPaymentLink && (
        <a
          href={entry.giPaymentLink}
          target="_blank"
          rel="noopener noreferrer"
          title="קישור תשלום פעיל"
          className="text-[10px] text-emerald font-medium px-1"
        >
          קישור
        </a>
      )}
    </div>
  );
}
