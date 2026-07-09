import { TopBar } from "@/components/layout/TopBar";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { SyncButton } from "@/components/ui/SyncButton";
import { isGreenInvoiceConfigured } from "@/lib/greeninvoice";
import { getSupabase } from "@/lib/supabase";
import {
  CheckCircle2,
  XCircle,
  Database,
  Link2,
  RefreshCw,
} from "lucide-react";

export const dynamic = "force-dynamic";

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

export default async function SettingsPage() {
  const giConnected = isGreenInvoiceConfigured();
  const sb = getSupabase();
  const sbConnected = Boolean(sb);

  return (
    <div>
      <TopBar
        title="הגדרות"
        subtitle="חיבורים, סנכרון ותצורת המערכת"
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6">
        <Card className="p-5">
          <SectionHeading title="סטטוס חיבורים" subtitle="מצב האינטגרציות הפעילות" />
          <StatusRow
            label="חשבונית ירוקה (Morning)"
            connected={giConnected}
            detail={giConnected ? "API מוגדר — ניתן לסנכרן נתונים" : "הוסף GREENINVOICE_API_ID ו-SECRET ב-Vercel"}
          />
          <StatusRow
            label="Supabase"
            connected={sbConnected}
            detail={sbConnected ? "מסד נתונים פעיל — טבלאות ob_*" : "Supabase לא מוגדר"}
          />
        </Card>

        <Card className="p-5">
          <SectionHeading title="סנכרון נתונים" subtitle="משיכת לקוחות, הכנסות והוצאות מחשבונית ירוקה" />
          <div className="flex items-start gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-blue" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] text-text-secondary leading-relaxed">
                הסנכרון מושך את 12 החודשים האחרונים: חשבוניות, לקוחות והוצאות.
                הנתונים נשמרים ב-Supabase ומתעדכנים בכל ה-KPI בלוח הבקרה.
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
              <span>OpsBrain Finance v0.1 — Phase 1 MVP</span>
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
