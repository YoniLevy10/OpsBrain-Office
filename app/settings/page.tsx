import { TopBar } from "@/components/layout/TopBar";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { SyncButton } from "@/components/ui/SyncButton";
import { isGreenInvoiceConfigured, testGreenInvoiceConnection, getGreenInvoiceEnvLabel } from "@/lib/greeninvoice";
import { isGmailConfigured } from "@/lib/gmail";
import { getGmailConnectionStatus } from "@/lib/gmail/store";
import { getSupabase } from "@/lib/supabase";
import { getLastSyncTime, getUsdRate } from "@/lib/meta";
import {
  CheckCircle2,
  XCircle,
  Database,
  Link2,
  RefreshCw,
  Clock,
  DollarSign,
} from "lucide-react";
import { EnvChecklist } from "@/components/settings/EnvChecklist";
import { ThemeSettingsPanel } from "@/components/settings/ThemeSettingsPanel";
import { GiActionsLog } from "@/components/greeninvoice/GiActionsLog";
import { BankImportPanel } from "@/components/settings/BankImportPanel";
import { GmailConnectPanel } from "@/components/settings/GmailConnectPanel";
import { UsdRateForm } from "@/components/settings/UsdRateForm";

export const revalidate = 60;

function StatusRow({
  label,
  connected,
  detail,
}: {
  label: string;
  connected: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-soft last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connected ? "bg-emerald/10 text-emerald" : "bg-rose/10 text-rose"}`}>
          {connected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        </div>
        <div>
          <div className="text-[13.5px] font-medium">{label}</div>
          <div className="text-[12px] text-text-tertiary">{detail}</div>
        </div>
      </div>
      <span className={`text-[12px] font-semibold ${connected ? "text-emerald" : "text-rose"}`}>
        {connected ? "מחובר" : "לא מחובר"}
      </span>
    </div>
  );
}

function formatSyncTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function SettingsPage() {
  const giConnected = isGreenInvoiceConfigured();
  const giTest = giConnected ? await testGreenInvoiceConnection() : { ok: false as const };
  const gmailConfigured = isGmailConfigured();
  const gmailStatus = gmailConfigured ? await getGmailConnectionStatus() : { connected: false, configured: false };
  const sb = getSupabase();
  const sbConnected = Boolean(sb);
  const lastSync = await getLastSyncTime();
  const usdRate = await getUsdRate();

  return (
    <div>
      <TopBar
        title="הגדרות"
        subtitle="חיבורים, סנכרון ותצורת המערכת"
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6">
        <ThemeSettingsPanel />
        <EnvChecklist />

        <Card className="p-5">
          <SectionHeading title="סטטוס חיבורים" subtitle="מצב האינטגרציות הפעילות" />
          <StatusRow
            label="חשבונית ירוקה (Morning)"
            connected={giConnected && giTest.ok}
            detail={
              !giConnected
                ? "הוסף GREENINVOICE_API_ID ו-SECRET ב-Vercel"
                : giTest.ok
                  ? `API פעיל · ${getGreenInvoiceEnvLabel()}`
                  : giTest.error ?? "שגיאת חיבור"
            }
          />
          <StatusRow
            label="Supabase"
            connected={sbConnected}
            detail={sbConnected ? "מסד נתונים פעיל — טבלאות ob_*" : "Supabase לא מוגדר"}
          />
          <StatusRow
            label="Gmail — מייל החברה"
            connected={gmailStatus.connected}
            detail={
              !gmailConfigured
                ? "הוסף GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET"
                : gmailStatus.connected
                  ? gmailStatus.email ?? "מחובר"
                  : "לחץ התחבר בהגדרות Gmail"
            }
          />
          {lastSync && (
            <div className="flex items-center gap-3 py-3 border-b border-border-soft last:border-0">
              <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue" />
              </div>
              <div>
                <div className="text-[13.5px] font-medium">סנכרון אחרון</div>
                <div className="text-[12px] text-text-tertiary">{formatSyncTime(lastSync)}</div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionHeading title="שער דולר" subtitle="משמש להמרת מחירים ב-USD בטפסים ובסנכרון" />
          <div className="flex items-start gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-brass/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-brass" />
            </div>
            <div className="flex-1">
              <UsdRateForm currentRate={usdRate} />
            </div>
          </div>
        </Card>

        <BankImportPanel />

        <GmailConnectPanel />

        <GiActionsLog />

        <Card className="p-5">
          <SectionHeading title="סנכרון נתונים" subtitle="משיכת לקוחות, הכנסות והוצאות מחשבונית ירוקה" />
          <div className="flex items-start gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-blue" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] text-text-secondary leading-relaxed">
                הסנכרון מושך את 12 החודשים האחרונים: חשבוניות, לקוחות והוצאות.
                מנויים חוזרים נוצרים אוטומטית מהוצאות חוזרות. סנכרון אוטומטי יומי ב-05:00 UTC.
              </p>
              <p className="text-[12px] text-text-tertiary mt-2">
                להפעלת סנכרון אוטומטי: הוסף <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">CRON_SECRET</code> ב-Vercel והרץ את migration.sql (טבלת ob_meta).
              </p>
              <div className="mt-4">
                <SyncButton />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading title="מידע על המערכת" />
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-3 text-[13px] text-text-secondary">
              <Database className="w-4 h-4 text-text-tertiary" />
              <span>OpsBrain Finance v0.2 — Phase 1 MVP</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-text-secondary">
              <Link2 className="w-4 h-4 text-text-tertiary" />
              <span>נתונים: Supabase + חשבונית ירוקה + הזנה ידנית</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
