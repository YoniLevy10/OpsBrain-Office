import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { GmailConnectButton } from "@/components/gmail/GmailConnectButton";
import { GmailDiagnosticsPanel } from "@/components/gmail/GmailDiagnosticsPanel";
import { getGmailDiagnostics } from "@/lib/gmail/diagnostics";
import { getGmailConnectionStatus } from "@/lib/gmail/store";

export const dynamic = "force-dynamic";

export default async function GmailConnectPage() {
  const diagnostics = await getGmailDiagnostics();
  const status = await getGmailConnectionStatus();

  if (status.connected) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-emerald" />
        </div>
        <h1 className="text-[20px] font-bold">Gmail כבר מחובר</h1>
        <p className="text-[13px] text-text-secondary" dir="ltr">{status.email}</p>
        <Link
          href="/email"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald text-white text-[14px] font-semibold"
        >
          פתח תיבת דואר
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue" />
        </div>
        <h1 className="text-[20px] font-bold">חיבור מייל המשרד</h1>
        <p className="text-[13px] text-text-secondary mt-2 leading-relaxed">
          תועבר ל-Google לאישור. בסיום תראה מסך אישור — לחץ שם על «פתח תיבת דואר».
        </p>
      </div>

      <GmailDiagnosticsPanel diagnostics={diagnostics} />

      {diagnostics.ready ? (
        <>
          <GmailConnectButton />
          {!diagnostics.connected && (
            <p className="text-[11px] text-text-tertiary text-center">
              אחרי אישור Google יופיע מסך «הצליח» — לחץ «פתח תיבת דואר»
            </p>
          )}
        </>
      ) : (
        <p className="text-[12px] text-rose text-center">
          תקן את הסעיפים האדומים למעלה ב-Vercel, עשה Redeploy, ורענן דף זה.
        </p>
      )}

      {diagnostics.redirectUri && (
        <div className="p-3 rounded-xl bg-bg border border-border-soft text-[11px]">
          <span className="text-text-tertiary">Redirect URI ל-Google Cloud:</span>
          <code className="block mt-1 break-all text-[10px]" dir="ltr">
            {diagnostics.redirectUri}
          </code>
        </div>
      )}

      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-emerald"
      >
        <ArrowRight className="w-4 h-4" />
        חזרה להגדרות
      </Link>
    </div>
  );
}
