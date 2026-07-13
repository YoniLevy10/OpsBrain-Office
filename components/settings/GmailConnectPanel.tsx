import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { GmailDiagnosticsPanel } from "@/components/gmail/GmailDiagnosticsPanel";
import { getGmailDiagnostics } from "@/lib/gmail/diagnostics";
import { getGmailConnectionStatus } from "@/lib/gmail/store";
import { isGmailConfigured } from "@/lib/gmail/config";

export async function GmailConnectPanel() {
  const configured = isGmailConfigured();
  const status = configured ? await getGmailConnectionStatus() : { connected: false, configured: false };
  const diagnostics = await getGmailDiagnostics();

  return (
    <Card className="p-5">
      <SectionHeading title="Gmail — מייל החברה" subtitle="OAuth 2.0 · קריאה ושליחה" />
      <div className="mt-4 space-y-4">
        {status.connected ? (
          <div className="p-3 rounded-xl bg-emerald/[0.06] border border-emerald/20">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald">
              <Mail className="w-4 h-4" />
              מחובר
            </div>
            <p className="text-[12px] text-text-secondary mt-1" dir="ltr">{status.email}</p>
            <Link href="/email" className="inline-block mt-2 text-[12px] font-semibold text-emerald hover:underline">
              פתח תיבת דואר →
            </Link>
          </div>
        ) : (
          <>
            <GmailDiagnosticsPanel diagnostics={diagnostics} />
            {diagnostics.ready ? (
              <Link
                href="/connect/gmail"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue text-white text-[13px] font-semibold hover:bg-blue/90"
              >
                מעבר למסך חיבור Gmail
              </Link>
            ) : (
              <p className="text-[12px] text-rose text-center py-2">
                תקן את הסעיפים האדומים, Redeploy, ורענן.
              </p>
            )}
          </>
        )}

        {diagnostics.redirectUri && !status.connected && (
          <div className="p-3 rounded-xl bg-blue/[0.04] border border-blue/15">
            <p className="text-[11px] font-semibold text-text-secondary mb-1">Redirect URI ל-Google Cloud:</p>
            <code className="text-[10px] text-text-primary break-all block" dir="ltr">
              {diagnostics.redirectUri}
            </code>
          </div>
        )}

        <p className="text-[11px] text-text-tertiary leading-relaxed">
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue hover:underline inline-flex items-center gap-0.5">
            Google Cloud Credentials
            <ExternalLink className="w-3 h-3" />
          </a>
          {" · "}
          OAuth consent screen → Test users
        </p>
      </div>
    </Card>
  );
}
