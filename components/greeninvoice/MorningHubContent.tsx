"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  FileText,
  Link2,
  Loader2,
  Mail,
  Eye,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  PenLine,
  Palette,
  CreditCard,
} from "lucide-react";
import { Card, KpiCard, SectionHeading, Badge } from "@/components/ui/Primitives";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { SyncButton } from "@/components/ui/SyncButton";
import { MorningClientPicker, type MorningClient } from "./MorningClientPicker";
import { MorningIncomeActions } from "./MorningIncomeActions";
import { formatCurrency } from "@/lib/data";
import type { IncomeEntry } from "@/lib/data";
import { mapPaymentTypeLabel } from "@/lib/greeninvoice/errors";
import type { GiPaymentTypeCode } from "@/lib/greeninvoice/types";

const PAYMENT_TYPES: { value: GiPaymentTypeCode; label: string }[] = [
  { value: 4, label: "העברה בנקאית" },
  { value: 3, label: "אשראי" },
  { value: 1, label: "מזומן" },
  { value: 2, label: "צ'ק" },
];

const MORNING_LINKS = [
  {
    href: "https://app.greeninvoice.co.il",
    label: "ממשק Morning",
    desc: "ניהול מלא — חתימות, תבניות, סליקה",
    icon: ExternalLink,
  },
  {
    href: "https://app.greeninvoice.co.il/settings/business",
    label: "חתימה ולוגו",
    desc: "העלאת חתימה דיגיטלית ולוגו לעסק",
    icon: PenLine,
  },
  {
    href: "https://app.greeninvoice.co.il/settings/templates",
    label: "תבניות מסמכים",
    desc: "עיצוב חשבוניות וקבלות",
    icon: Palette,
  },
  {
    href: "https://app.greeninvoice.co.il/settings/plugins",
    label: "סליקה ותשלומים",
    desc: "הגדרת Cardcom, Isracard, Grow",
    icon: CreditCard,
  },
];

type Props = {
  clients: MorningClient[];
  income: IncomeEntry[];
  connected: boolean;
  envLabel: string;
  businessName?: string;
  lastSync?: string | null;
  actions: Array<{
    id: string;
    action_type: string;
    status: string;
    amount: number | null;
    error_message: string | null;
    created_at: string;
  }>;
};

const ACTION_LABELS: Record<string, string> = {
  receipt: "קבלה",
  invoice: "חשבונית",
  payment_link: "קישור תשלום",
  send_email: "שליחה במייל",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין",
  issued: "הונפק",
  sent: "נשלח",
  paid: "שולם",
  failed: "נכשל",
};

function FormMessage({ error, success }: { error: string; success: string }) {
  return (
    <>
      {error && <p className="text-[12.5px] text-rose bg-rose/10 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-[12.5px] text-emerald bg-emerald/10 px-3 py-2 rounded-lg">{success}</p>}
    </>
  );
}

export function MorningHubContent({
  clients,
  income,
  connected,
  envLabel,
  businessName,
  lastSync,
  actions,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState("receipt");

  const morningIncome = income.filter((i) => i.giId || i.source === "created" || i.source === "sync");
  const pending = income.filter((i) => i.status === "ממתין" || i.status === "באיחור");
  const emailByClient = new Map(clients.map((c) => [c.id, c.email]));

  const defaultClient = clients[0] ?? null;
  const [clientId, setClientId] = useState(defaultClient?.id ?? "");
  const [clientName, setClientName] = useState(defaultClient?.company ?? "");
  const [clientEmail, setClientEmail] = useState(defaultClient?.email ?? "");

  function onClientChange(c: MorningClient | null, freeText?: string) {
    if (c) {
      setClientId(c.id);
      setClientName(c.company);
      setClientEmail(c.email);
    } else {
      setClientId("");
      setClientName(freeText ?? "");
      setClientEmail("");
    }
  }

  // Receipt form state
  const [rAmount, setRAmount] = useState("");
  const [rDesc, setRDesc] = useState("");
  const [rProject, setRProject] = useState("");
  const [rPaymentType, setRPaymentType] = useState<GiPaymentTypeCode>(4);
  const [rSendEmail, setRSendEmail] = useState(true);
  const [rLoading, setRLoading] = useState(false);
  const [rError, setRError] = useState("");
  const [rSuccess, setRSuccess] = useState("");

  // Invoice form state
  const [iAmount, setIAmount] = useState("");
  const [iDesc, setIDesc] = useState("");
  const [iProject, setIProject] = useState("");
  const [iSendEmail, setISendEmail] = useState(true);
  const [iLoading, setILoading] = useState(false);
  const [iError, setIError] = useState("");
  const [iSuccess, setISuccess] = useState("");

  // Payment link form state
  const [pAmount, setPAmount] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pProject, setPProject] = useState("");
  const [pLoading, setPLoading] = useState(false);
  const [pError, setPError] = useState("");
  const [pUrl, setPUrl] = useState("");
  const [pCopied, setPCopied] = useState(false);

  async function submitReceipt(preview = false) {
    setRLoading(!preview);
    setRError("");
    setRSuccess("");
    try {
      const res = await fetch("/api/greeninvoice/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: preview ? "preview_receipt" : "receipt",
          clientId: clientId || undefined,
          clientName,
          clientEmail: clientEmail || undefined,
          amount: Number(rAmount),
          description: rDesc,
          project: rProject,
          paymentType: rPaymentType,
          sendEmail: !preview && rSendEmail && Boolean(clientEmail),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setRError(data.error ?? "שגיאה");
        return;
      }
      if (preview && data.previewBase64) {
        const w = window.open();
        if (w) w.document.write(`<iframe width="100%" height="100%" src="data:application/pdf;base64,${data.previewBase64}"></iframe>`);
        return;
      }
      setRSuccess(`קבלה ${data.documentNumber ?? ""} הונפקה${data.sent ? " ונשלחה" : ""}`);
      router.refresh();
    } catch {
      setRError("שגיאת רשת");
    } finally {
      setRLoading(false);
    }
  }

  async function submitInvoice() {
    setILoading(true);
    setIError("");
    setISuccess("");
    try {
      const res = await fetch("/api/greeninvoice/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invoice",
          clientId: clientId || undefined,
          clientName,
          clientEmail: clientEmail || undefined,
          amount: Number(iAmount),
          description: iDesc,
          project: iProject,
          sendEmail: iSendEmail && Boolean(clientEmail),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setIError(data.error ?? "שגיאה");
        return;
      }
      setISuccess(`חשבונית ${data.documentNumber ?? ""} הונפקה${data.sent ? " ונשלחה" : ""}`);
      router.refresh();
    } catch {
      setIError("שגיאת רשת");
    } finally {
      setILoading(false);
    }
  }

  async function submitPaymentLink() {
    setPLoading(true);
    setPError("");
    setPUrl("");
    try {
      const res = await fetch("/api/greeninvoice/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || undefined,
          clientName,
          clientEmail: clientEmail || undefined,
          amount: Number(pAmount),
          description: pDesc,
          project: pProject,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setPError(data.error ?? "שגיאה");
        return;
      }
      setPUrl(data.paymentLinkUrl ?? "");
      router.refresh();
    } catch {
      setPError("שגיאת רשת");
    } finally {
      setPLoading(false);
    }
  }

  const tabs = [
    { id: "receipt", label: "קבלה", icon: Receipt },
    { id: "invoice", label: "חשבונית מס", icon: FileText },
    { id: "payment", label: "קישור תשלום", icon: Link2 },
    { id: "documents", label: "מסמכים", count: morningIncome.length },
    { id: "manage", label: "ניהול" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="חיבור API"
          value={connected ? "פעיל" : "לא מחובר"}
          icon={Receipt}
          accent={connected ? "emerald" : "rose"}
        />
        <KpiCard label="סביבה" value={envLabel} icon={FileText} accent="blue" />
        <KpiCard label="מסמכי Morning" value={String(morningIncome.length)} icon={FileText} accent="brass" />
        <KpiCard label="ממתין לתשלום" value={String(pending.length)} icon={Link2} accent="rose" />
      </div>

      {!connected && (
        <Card className="p-4 border-rose/20 bg-rose/5">
          <p className="text-[13.5px] text-rose">
            חשבונית ירוקה לא מחוברת. הוסף <code className="text-[12px]">GREENINVOICE_API_ID</code> ו-{" "}
            <code className="text-[12px]">GREENINVOICE_API_SECRET</code> ב-Vercel → הגדרות.
          </p>
        </Card>
      )}

      {businessName && (
        <p className="text-[13px] text-text-secondary">
          עסק מחובר: <span className="font-semibold text-text-primary">{businessName}</span>
          {lastSync && <span className="mr-3"> · סנכרון אחרון: {lastSync}</span>}
        </p>
      )}

      <Tabs
        variant="pills"
        tabs={tabs.map(({ id, label, count }) => ({ id, label, count }))}
        active={tab}
        onChange={setTab}
      />

      <TabPanel active={tab} id="receipt">
        <Card className="p-5 max-w-xl">
          <SectionHeading title="הנפקת קבלה" subtitle="מסמך 400 — תשלום שכבר התקבל" />
          <div className="mt-4 space-y-3">
            <MorningClientPicker clients={clients} value={clientId} onChange={onClientChange} />
            <label className="block">
              <span className="text-[12px] text-text-secondary font-medium">מייל לקוח</span>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
                dir="ltr"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[12px] text-text-secondary font-medium">סכום (₪)</span>
                <input type="number" value={rAmount} onChange={(e) => setRAmount(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
              </label>
              <label className="block">
                <span className="text-[12px] text-text-secondary font-medium">סוג תשלום</span>
                <select value={rPaymentType} onChange={(e) => setRPaymentType(Number(e.target.value) as GiPaymentTypeCode)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50">
                  {PAYMENT_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-[12px] text-text-secondary font-medium">תיאור</span>
              <input value={rDesc} onChange={(e) => setRDesc(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
            </label>
            <label className="block">
              <span className="text-[12px] text-text-secondary font-medium">פרויקט</span>
              <input value={rProject} onChange={(e) => setRProject(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={rSendEmail} onChange={(e) => setRSendEmail(e.target.checked)} disabled={!clientEmail} />
              <Mail className="w-3.5 h-3.5" /> שלח במייל לאחר הנפקה
            </label>
            <FormMessage error={rError} success={rSuccess} />
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => submitReceipt(true)} disabled={rLoading || !rAmount || !rDesc} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[13px] hover:bg-surface-hover disabled:opacity-50">
                <Eye className="w-4 h-4" /> תצוגה מקדימה
              </button>
              <button type="button" onClick={() => submitReceipt(false)} disabled={rLoading || !rAmount || !rDesc || !connected} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald text-white text-[13px] font-semibold disabled:opacity-50">
                {rLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                הנפק קבלה
              </button>
            </div>
            <p className="text-[11px] text-text-tertiary">{mapPaymentTypeLabel(rPaymentType)} · תאריך תשלום: היום</p>
          </div>
        </Card>
      </TabPanel>

      <TabPanel active={tab} id="invoice">
        <Card className="p-5 max-w-xl">
          <SectionHeading title="הנפקת חשבונית מס" subtitle="מסמך 305 — לפני תשלום" />
          <div className="mt-4 space-y-3">
            <MorningClientPicker clients={clients} value={clientId} onChange={onClientChange} />
            <label className="block">
              <span className="text-[12px] text-text-secondary font-medium">מייל לקוח</span>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" dir="ltr" />
            </label>
            <label className="block">
              <span className="text-[12px] text-text-secondary font-medium">סכום (₪)</span>
              <input type="number" value={iAmount} onChange={(e) => setIAmount(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
            </label>
            <label className="block">
              <span className="text-[12px] text-text-secondary font-medium">תיאור</span>
              <input value={iDesc} onChange={(e) => setIDesc(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
            </label>
            <label className="block">
              <span className="text-[12px] text-text-secondary font-medium">פרויקט</span>
              <input value={iProject} onChange={(e) => setIProject(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={iSendEmail} onChange={(e) => setISendEmail(e.target.checked)} disabled={!clientEmail} />
              <Mail className="w-3.5 h-3.5" /> שלח במייל לאחר הנפקה
            </label>
            <FormMessage error={iError} success={iSuccess} />
            <button type="button" onClick={submitInvoice} disabled={iLoading || !iAmount || !iDesc || !connected} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald text-white text-[13px] font-semibold disabled:opacity-50">
              {iLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              הנפק חשבונית
            </button>
          </div>
        </Card>
      </TabPanel>

      <TabPanel active={tab} id="payment">
        <Card className="p-5 max-w-xl">
          <SectionHeading title="קישור תשלום מקוון" subtitle="יוצר חשבונית + דף סליקה ללקוח" />
          <div className="mt-4 space-y-3">
            {!pUrl ? (
              <>
                <MorningClientPicker clients={clients} value={clientId} onChange={onClientChange} />
                <label className="block">
                  <span className="text-[12px] text-text-secondary font-medium">סכום (₪)</span>
                  <input type="number" value={pAmount} onChange={(e) => setPAmount(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
                </label>
                <label className="block">
                  <span className="text-[12px] text-text-secondary font-medium">תיאור</span>
                  <input value={pDesc} onChange={(e) => setPDesc(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
                </label>
                <label className="block">
                  <span className="text-[12px] text-text-secondary font-medium">פרויקט</span>
                  <input value={pProject} onChange={(e) => setPProject(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50" />
                </label>
                {pError && <p className="text-[12.5px] text-rose bg-rose/10 px-3 py-2 rounded-lg">{pError}</p>}
                <button type="button" onClick={submitPaymentLink} disabled={pLoading || !pAmount || !pDesc || !connected} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald text-white text-[13px] font-semibold disabled:opacity-50 w-full justify-center">
                  {pLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  צור קישור תשלום
                </button>
                <p className="text-[11px] text-text-tertiary">נדרשת סליקה פעילה ב-Morning + GREENINVOICE_PLUGIN_ID</p>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-emerald font-medium text-[13.5px]">הקישור נוצר בהצלחה</p>
                <div className="bg-bg border border-border rounded-lg p-3 text-[12px] break-all font-mono" dir="ltr">{pUrl}</div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={async () => { await navigator.clipboard.writeText(pUrl); setPCopied(true); setTimeout(() => setPCopied(false), 2000); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[13px]">
                    {pCopied ? <Check className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4" />}
                    {pCopied ? "הועתק" : "העתק"}
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`קישור לתשלום: ${pUrl}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald/10 text-emerald text-[13px] font-medium">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <button type="button" onClick={() => setPUrl("")} className="text-[13px] text-text-secondary hover:text-emerald">+ קישור חדש</button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </TabPanel>

      <TabPanel active={tab} id="documents">
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-border-soft">
            <SectionHeading title="מסמכי Morning" subtitle="מסונכרנים ונוצרו מהמערכת" />
          </div>
          {morningIncome.length === 0 ? (
            <p className="p-8 text-center text-text-tertiary text-[13px]">אין מסמכים עדיין — הנפק קבלה או חשבונית בלשונית הפעולות</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-border-soft text-text-tertiary text-[12px]">
                    <th className="text-start font-medium px-5 py-3">לקוח</th>
                    <th className="text-start font-medium px-5 py-3">מס׳</th>
                    <th className="text-start font-medium px-5 py-3">סכום</th>
                    <th className="text-start font-medium px-5 py-3">סטטוס</th>
                    <th className="text-start font-medium px-5 py-3">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {morningIncome.slice(0, 30).map((i) => (
                    <tr key={i.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/60">
                      <td className="px-5 py-3.5 font-medium">{i.clientName}</td>
                      <td className="px-5 py-3.5 font-mono text-[12px]">{i.invoiceNumber || "—"}</td>
                      <td className="px-5 py-3.5 font-nums font-semibold">{formatCurrency(i.amount, i.currency)}</td>
                      <td className="px-5 py-3.5"><Badge label={i.status} /></td>
                      <td className="px-5 py-3.5">
                        <MorningIncomeActions entry={i} clientEmail={emailByClient.get(i.clientId)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </TabPanel>

      <TabPanel active={tab} id="manage">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <SectionHeading title="סנכרון וחיבור" subtitle="משיכת נתונים מ-Morning" />
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-text-secondary">סטטוס API</span>
                <Badge label={connected ? "מחובר" : "לא מחובר"} />
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-text-secondary">סביבה</span>
                <span className="font-medium">{envLabel}</span>
              </div>
              <SyncButton />
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading title="חתימה, תבניות וסליקה" subtitle="מנוהלים בממשק Morning" />
            <div className="mt-3 space-y-2">
              {MORNING_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl border border-border-soft hover:bg-surface-hover transition-colors"
                  >
                    <Icon className="w-4 h-4 text-emerald shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[13.5px] font-semibold">{link.label}</div>
                      <div className="text-[12px] text-text-tertiary">{link.desc}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </Card>

          {actions.length > 0 && (
            <Card className="p-5 md:col-span-2">
              <SectionHeading title="יומן פעולות" subtitle="30 פעולות אחרונות" />
              <div className="mt-3 space-y-2">
                {actions.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0 text-[13px]">
                    <div>
                      <span className="font-medium">{ACTION_LABELS[a.action_type] ?? a.action_type}</span>
                      {a.amount != null && <span className="text-text-secondary mr-2 font-nums">₪{Number(a.amount).toLocaleString("he-IL")}</span>}
                      {a.error_message && <div className="text-[11px] text-rose">{a.error_message}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge label={STATUS_LABELS[a.status] ?? a.status} />
                      <span className="text-[11px] text-text-tertiary">
                        {new Date(a.created_at).toLocaleString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </TabPanel>
    </div>
  );
}
