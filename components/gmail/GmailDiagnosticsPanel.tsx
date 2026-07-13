import { CheckCircle2, XCircle, AlertCircle, Circle } from "lucide-react";
import type { GmailDiagnostics, DiagnosticSeverity } from "@/lib/gmail/diagnostics";

function SeverityIcon({ severity }: { severity: DiagnosticSeverity }) {
  switch (severity) {
    case "ok":
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case "blocker":
      return <XCircle className="w-3.5 h-3.5" />;
    case "warning":
      return <AlertCircle className="w-3.5 h-3.5" />;
    case "pending":
      return <Circle className="w-3.5 h-3.5" />;
  }
}

function severityStyles(severity: DiagnosticSeverity) {
  switch (severity) {
    case "ok":
      return "bg-emerald/10 text-emerald";
    case "blocker":
      return "bg-rose/10 text-rose";
    case "warning":
      return "bg-brass/10 text-brass";
    case "pending":
      return "bg-text-tertiary/10 text-text-tertiary";
  }
}

export function GmailDiagnosticsPanel({ diagnostics }: { diagnostics: GmailDiagnostics }) {
  const blockers = diagnostics.items.filter((i) => i.severity === "blocker");

  return (
    <div className="space-y-2">
      {blockers.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose/10 text-rose text-[12px] mb-3">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {blockers.length} בעיות תשתית — תקן את הסעיפים האדומים, Redeploy, ורענן.
            {diagnostics.supabaseUrl && (
              <> ודא שהמיגרציה רצה ב-<span dir="ltr">{diagnostics.supabaseUrl}</span></>
            )}
          </span>
        </div>
      )}

      {diagnostics.ready && !diagnostics.connected && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald/10 text-emerald text-[12px] mb-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>התשתית מוכנה! הסעיף האפור «טרם חובר» הוא נורמלי — לחץ התחבר למטה.</span>
        </div>
      )}

      {diagnostics.items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-xl bg-bg border border-border-soft"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${severityStyles(item.severity)}`}
          >
            <SeverityIcon severity={item.severity} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-medium">{item.label}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5 break-all" dir="auto">
              {item.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
