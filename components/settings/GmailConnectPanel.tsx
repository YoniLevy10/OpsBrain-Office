import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { isGmailConfigured } from "@/lib/gmail";
import { getGmailConnectionStatus } from "@/lib/gmail/store";

export async function GmailConnectPanel() {
  const configured = isGmailConfigured();
  const status = configured ? await getGmailConnectionStatus() : { connected: false, configured: false };

  return (
    <Card className="p-5">
      <SectionHeading title="Gmail — מייל החברה" subtitle="OAuth 2.0 · קריאה ושליחה" />
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border-soft">
          <span className="text-[13px] text-text-secondary">מפתחות Google</span>
          <span className={`text-[12px] font-semibold ${configured ? "text-emerald" : "text-rose"}`}>
            {configured ? "מוגדר" : "חסר"}
          </span>
        </div>
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
        ) : configured ? (
          <a
            href="/api/gmail/auth"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue text-white text-[13px] font-semibold hover:bg-blue/90"
          >
            התחבר עם Google
          </a>
        ) : null}
        <p className="text-[11px] text-text-tertiary leading-relaxed">
          הגדר ב-{" "}
          <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-blue hover:underline inline-flex items-center gap-0.5">
            Google Cloud Console
            <ExternalLink className="w-3 h-3" />
          </a>
          : Gmail API + OAuth Client. Redirect: <code className="text-[10px]">/api/gmail/callback</code>
        </p>
      </div>
    </Card>
  );
}
