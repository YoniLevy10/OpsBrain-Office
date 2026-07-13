import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { GmailDiagnostics } from "@/lib/gmail/diagnostics";

export function GmailDiagnosticsPanel({ diagnostics }: { diagnostics: GmailDiagnostics }) {
  return (
    <div className="space-y-2">
      {!diagnostics.ready && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-brass/10 text-brass text-[12px] mb-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>יש לתקן את הסעיפים האדומים לפני חיבור Gmail. אחרי תיקון ב-Vercel — Redeploy.</span>
        </div>
      )}
      {diagnostics.items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-xl bg-bg border border-border-soft"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              item.ok ? "bg-emerald/10 text-emerald" : "bg-rose/10 text-rose"
            }`}
          >
            {item.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-medium">{item.label}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5 break-all" dir="ltr">
              {item.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
