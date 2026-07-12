import { fetchRecentGiActions } from "@/lib/greeninvoice/action-log";
import { Card, SectionHeading, Badge } from "@/components/ui/Primitives";

const ACTION_LABELS: Record<string, string> = {
  receipt: "קבלה",
  invoice: "חשבונית",
  invoice_receipt: "חשבונית+קבלה",
  quote: "הצעת מחיר",
  credit: "זיכוי",
  payment_link: "קישור תשלום",
  send_email: "שליחה במייל",
  credit_note: "זיכוי",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין",
  issued: "הונפק",
  sent: "נשלח",
  paid: "שולם",
  failed: "נכשל",
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export async function GiActionsLog() {
  const actions = await fetchRecentGiActions(8);
  if (actions.length === 0) return null;

  return (
    <Card className="p-5">
      <SectionHeading title="פעולות Morning אחרונות" subtitle="יומן פעולות מהמערכת" />
      <div className="mt-3 space-y-2">
        {actions.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-2 py-2 border-b border-border-soft last:border-0 text-[13px]"
          >
            <div className="min-w-0">
              <span className="font-medium">{ACTION_LABELS[a.action_type] ?? a.action_type}</span>
              {a.amount != null && (
                <span className="text-text-secondary mr-2 font-nums">
                  ₪{Number(a.amount).toLocaleString("he-IL")}
                </span>
              )}
              {a.error_message && (
                <div className="text-[11px] text-rose truncate">{a.error_message}</div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge label={STATUS_LABELS[a.status] ?? a.status} />
              <span className="text-[11px] text-text-tertiary">{formatTime(a.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
