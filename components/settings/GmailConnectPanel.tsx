import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { isGmailConfigured, gmailConfigFromEnv } from "@/lib/gmail/config";
import { getGmailConnectionStatus } from "@/lib/gmail/store";
import { hasAppAccess, isAppAccessRequired } from "@/lib/app-access";

export async function GmailConnectPanel() {
  const configured = isGmailConfigured();
  const status = configured ? await getGmailConnectionStatus() : { connected: false, configured: false };
  const accessRequired = isAppAccessRequired();
  const accessOk = await hasAppAccess();
  const redirectUri = gmailConfigFromEnv()?.redirectUri;

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
        {accessRequired && !accessOk && (
          <p className="text-[12px] text-brass p-3 rounded-xl bg-brass/10">
            נדרשת סיסמת גישה לפני חיבור Gmail — הזן <code className="text-[11px]">OPSBRAIN_ACCESS_SECRET</code> למעלה.
          </p>
        )}
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
          accessOk ? (
          <a
            href="/api/gmail/auth"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue text-white text-[13px] font-semibold hover:bg-blue/90"
          >
            התחבר עם Google
          </a>
          ) : null
        ) : null}
        {redirectUri && (
          <div className="p-3 rounded-xl bg-bg border border-border-soft">
            <p className="text-[11px] text-text-tertiary mb-1">Redirect URI (העתק ל-Google Cloud בדיוק):</p>
            <code className="text-[10px] text-text-primary break-all" dir="ltr">{redirectUri}</code>
          </div>
        )}
        <p className="text-[11px] text-text-tertiary leading-relaxed">
          הגדר ב-{" "}
          <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-blue hover:underline inline-flex items-center gap-0.5">
            Google Cloud Console
            <ExternalLink className="w-3 h-3" />
          </a>
          : Gmail API + OAuth Client → Credentials → OAuth Client → Authorized redirect URIs
          {" · "}
          ב-Vercel: <code className="text-[10px]">NEXT_PUBLIC_APP_URL</code> + <code className="text-[10px]">GOOGLE_REDIRECT_URI</code> (אותו ערך)
        </p>
      </div>
    </Card>
  );
}
