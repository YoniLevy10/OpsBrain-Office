"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Receipt,
  FileText,
  Link2,
  Mail,
  Eye,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  PenLine,
  Palette,
  CreditCard,
  Wifi,
  WifiOff,
  Clock,
  Settings,
  ChevronLeft,
  Sparkles,
  FolderOpen,
  History,
} from "lucide-react";
import { Card, Badge, SectionHeading } from "@/components/ui/Primitives";
import { MobileCard, MobileCardList, MobileCardRow } from "@/components/ui/MobileCard";
import { SyncButton } from "@/components/ui/SyncButton";
import { MorningClientPicker, type MorningClient } from "./MorningClientPicker";
import { MorningIncomeActions } from "./MorningIncomeActions";
import {
  MorningField,
  MorningInput,
  MorningSelect,
  MorningAlert,
  MorningBtn,
  MorningActionTile,
  MorningEmpty,
  MorningToggle,
} from "./MorningUi";
import { formatCurrency } from "@/lib/data";
import type { IncomeEntry } from "@/lib/data";
import { mapPaymentTypeLabel } from "@/lib/greeninvoice/errors";
import { DOCUMENT_CATALOG, getCatalogItem, type DocumentKind, type IssuableDocumentKind } from "@/lib/greeninvoice/catalog";
import type { GiPaymentTypeCode } from "@/lib/greeninvoice/types";

const PAYMENT_TYPES: { value: GiPaymentTypeCode; label: string }[] = [
  { value: 4, label: "העברה בנקאית" },
  { value: 3, label: "אשראי" },
  { value: 1, label: "מזומן" },
  { value: 2, label: "צ'ק" },
];

const MORNING_LINKS = [
  { href: "https://app.greeninvoice.co.il", label: "ממשק Morning", desc: "ניהול מלא", icon: ExternalLink },
  { href: "https://app.greeninvoice.co.il/settings/business", label: "חתימה ולוגו", desc: "חתימה דיגיטלית", icon: PenLine },
  { href: "https://app.greeninvoice.co.il/settings/templates", label: "תבניות", desc: "עיצוב מסמכים", icon: Palette },
  { href: "https://app.greeninvoice.co.il/settings/plugins", label: "סליקה", desc: "Cardcom, Isracard", icon: CreditCard },
];

const ACTION_LABELS: Record<string, string> = {
  receipt: "קבלה",
  invoice: "חשבונית",
  invoice_receipt: "חשבונית+קבלה",
  quote: "הצעת מחיר",
  credit: "זיכוי",
  payment_link: "קישור תשלום",
  send_email: "שליחה במייל",
};

const DOC_ICONS: Record<DocumentKind, typeof Receipt> = {
  receipt: Receipt,
  invoice: FileText,
  invoice_receipt: FileText,
  quote: FileText,
  credit: FileText,
  payment_link: Link2,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין",
  issued: "הונפק",
  sent: "נשלח",
  paid: "שולם",
  failed: "נכשל",
};

type TabId = "create" | "payment" | "documents" | "manage";

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

function ClientContextPanel({
  clients,
  clientId,
  clientEmail,
  onClientChange,
  onEmailChange,
}: {
  clients: MorningClient[];
  clientId: string;
  clientEmail: string;
  onClientChange: (c: MorningClient | null, freeText?: string) => void;
  onEmailChange: (email: string) => void;
}) {
  return (
    <div className="space-y-4 lg:sticky lg:top-28">
      <MorningClientPicker clients={clients} value={clientId} onChange={onClientChange} />
      <MorningField label="מייל לשליחה" hint="נדרש לשליחת מסמך במייל">
        <MorningInput
          type="email"
          value={clientEmail}
          onChange={onEmailChange}
          placeholder="client@example.com"
          dir="ltr"
        />
      </MorningField>
    </div>
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
  const [tab, setTab] = useState<TabId>("create");
  const [docKind, setDocKind] = useState<IssuableDocumentKind>("receipt");

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

  const [dAmount, setDAmount] = useState("");
  const [dDesc, setDDesc] = useState("");
  const [dProject, setDProject] = useState("");
  const [dPaymentType, setDPaymentType] = useState<GiPaymentTypeCode>(4);
  const [dSendEmail, setDSendEmail] = useState(true);
  const [dLoading, setDLoading] = useState(false);
  const [dError, setDError] = useState("");
  const [dSuccess, setDSuccess] = useState("");

  const catalog = getCatalogItem(docKind);

  const [pAmount, setPAmount] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pProject, setPProject] = useState("");
  const [pLoading, setPLoading] = useState(false);
  const [pError, setPError] = useState("");
  const [pUrl, setPUrl] = useState("");
  const [pCopied, setPCopied] = useState(false);

  async function submitDocument(preview = false) {
    if (!clientName.trim()) {
      setDError("יש לבחור או להזין שם לקוח");
      return;
    }
    if (!dAmount || !dDesc.trim()) {
      setDError("יש למלא סכום ותיאור");
      return;
    }

    setDLoading(!preview);
    setDError("");
    setDSuccess("");
    try {
      const res = await fetch("/api/greeninvoice/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: preview ? `preview_${docKind}` : docKind,
          clientId: clientId || undefined,
          clientName: clientName.trim(),
          clientEmail: clientEmail || undefined,
          amount: Number(dAmount),
          description: dDesc.trim(),
          project: dProject.trim() || undefined,
          paymentType: catalog.needsPayment ? dPaymentType : undefined,
          sendEmail: !preview && dSendEmail && Boolean(clientEmail),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setDError(data.error ?? "שגיאה ביצירת מסמך");
        return;
      }
      if (preview && data.previewBase64) {
        const w = window.open();
        if (w) {
          w.document.write(
            `<iframe width="100%" height="100%" src="data:application/pdf;base64,${data.previewBase64}"></iframe>`
          );
        }
        return;
      }
      setDSuccess(
        `${catalog.label} ${data.documentNumber ?? ""} הונפקה${data.sent ? " ונשלחה במייל" : ""}`
      );
      router.refresh();
    } catch {
      setDError("שגיאת רשת — נסה שוב");
    } finally {
      setDLoading(false);
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

  const isFormTab = tab === "create" || tab === "payment";
  const canSubmitDoc = Boolean(dAmount && dDesc.trim() && clientName.trim() && connected);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-emerald/15">
        <div className="relative p-5 sm:p-6 bg-gradient-to-l from-emerald/[0.08] via-transparent to-blue/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald/15 border border-emerald/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-emerald" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[17px] sm:text-[18px] font-bold">מרכז חשבונית ירוקה</h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      connected ? "bg-emerald/10 text-emerald" : "bg-rose/10 text-rose"
                    }`}
                  >
                    {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {connected ? "מחובר" : "לא מחובר"}
                  </span>
                  <Badge label={envLabel.split(" ")[0]} />
                </div>
                <p className="text-[13px] text-text-secondary mt-1">
                  {businessName ? (
                    <>
                      <span className="font-medium text-text-primary">{businessName}</span>
                      {lastSync && (
                        <span className="inline-flex items-center gap-1 mr-2 text-text-tertiary">
                          <Clock className="w-3 h-3" />
                          סנכרון: {lastSync}
                        </span>
                      )}
                    </>
                  ) : (
                    "הנפקת מסמכים, קישורי תשלום וסנכרון — הכל ממקום אחד"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SyncButton />
              <Link
                href="/settings"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-[12.5px] font-medium text-text-secondary hover:bg-surface-hover transition-colors"
              >
                <Settings className="w-4 h-4" />
                הגדרות
              </Link>
            </div>
          </div>

          {!connected && (
            <div className="mt-4">
              <MorningAlert type="error">
              חסרים מפתחות API — הוסף GREENINVOICE_API_ID ו-SECRET ב-Vercel.{" "}
              <Link href="/settings" className="underline font-medium">למדריך הגדרה</Link>
              </MorningAlert>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 border-t border-border-soft divide-x divide-border-soft rtl:divide-x-reverse">
          {[
            { label: "מסמכים", value: morningIncome.length },
            { label: "ממתין", value: pending.length },
            { label: "פעולות", value: actions.length },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <div className="font-nums text-[20px] font-bold">{s.value}</div>
              <div className="text-[11px] text-text-tertiary">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick actions — כל סוגי המסמכים */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {DOCUMENT_CATALOG.map((item) => {
          const Icon = DOC_ICONS[item.kind];
          return (
            <MorningActionTile
              key={item.kind}
              icon={Icon}
              title={item.shortLabel}
              desc={`${item.desc} · ${item.type}`}
              active={tab === "create" && docKind === item.kind}
              onClick={() => {
                setDocKind(item.kind);
                setTab("create");
              }}
              accent={item.accent}
            />
          );
        })}
        <MorningActionTile
          icon={Link2}
          title="קישור תשלום"
          desc="סליקה מקוונת ללקוח"
          active={tab === "payment"}
          onClick={() => setTab("payment")}
          accent="brass"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: "documents" as const, label: "מסמכים", icon: FolderOpen, count: morningIncome.length },
          { id: "manage" as const, label: "ניהול", icon: History },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
              tab === id
                ? "bg-surface border border-border text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {count != null && count > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald/10 text-emerald text-[10px]">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Unified document form */}
      {tab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr] gap-5">
          <ClientContextPanel
            clients={clients}
            clientId={clientId}
            clientEmail={clientEmail}
            onClientChange={onClientChange}
            onEmailChange={setClientEmail}
          />
          <Card className="p-5 sm:p-6">
            <SectionHeading
              title={`הנפקת ${catalog.label}`}
              subtitle={`מסמך ${catalog.type} · ${catalog.desc}`}
            />
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MorningField label="סכום (₪)" hint={catalog.amountHint}>
                  <MorningInput type="number" value={dAmount} onChange={setDAmount} placeholder="0" />
                </MorningField>
                {catalog.needsPayment ? (
                  <MorningField label="סוג תשלום" hint={mapPaymentTypeLabel(dPaymentType)}>
                    <MorningSelect
                      value={dPaymentType}
                      onChange={(v) => setDPaymentType(Number(v) as GiPaymentTypeCode)}
                    >
                      {PAYMENT_TYPES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </MorningSelect>
                  </MorningField>
                ) : (
                  <MorningField label="מע״מ" hint="מחושב אוטומטית לפי סוג המסמך">
                    <div className="px-3 py-2.5 rounded-xl border border-border-soft bg-bg text-[13px] text-text-secondary">
                      {catalog.vatIncluded ? "כולל מע״מ" : "לפני מע״מ"}
                    </div>
                  </MorningField>
                )}
              </div>
              <MorningField label="תיאור (מופיע במסמך)">
                <MorningInput value={dDesc} onChange={setDDesc} placeholder="לדוגמה: מנוי חודשי / פרויקט X" required />
              </MorningField>
              <MorningField label="פרויקט (אופציונלי)">
                <MorningInput value={dProject} onChange={setDProject} placeholder="שם פרויקט פנימי" />
              </MorningField>
              <MorningToggle
                checked={dSendEmail}
                onChange={setDSendEmail}
                label={`שלח ${catalog.label} במייל לאחר הנפקה`}
                disabled={!clientEmail}
                icon={Mail}
              />
              {dError && <MorningAlert type="error">{dError}</MorningAlert>}
              {dSuccess && <MorningAlert type="success">{dSuccess}</MorningAlert>}
              <div className="flex flex-wrap gap-2 pt-2">
                <MorningBtn
                  variant="secondary"
                  icon={Eye}
                  onClick={() => submitDocument(true)}
                  disabled={dLoading || !canSubmitDoc}
                >
                  תצוגה מקדימה
                </MorningBtn>
                <MorningBtn
                  icon={DOC_ICONS[docKind]}
                  onClick={() => submitDocument(false)}
                  loading={dLoading}
                  disabled={!canSubmitDoc}
                >
                  הנפק {catalog.label}
                </MorningBtn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment link */}
      {tab === "payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr] gap-5">
          <ClientContextPanel clients={clients} clientId={clientId} clientEmail={clientEmail} onClientChange={onClientChange} onEmailChange={setClientEmail} />
          <Card className="p-5 sm:p-6">
            <SectionHeading title="קישור תשלום מקוון" subtitle="יוצר חשבונית + דף סליקה" />
            {!pUrl ? (
              <div className="space-y-4 mt-2">
                <MorningAlert type="info">נדרשת סליקה פעילה ב-Morning + GREENINVOICE_PLUGIN_ID</MorningAlert>
                <MorningField label="סכום (₪)">
                  <MorningInput type="number" value={pAmount} onChange={setPAmount} />
                </MorningField>
                <MorningField label="תיאור">
                  <MorningInput value={pDesc} onChange={setPDesc} placeholder="מה הלקוח משלם?" />
                </MorningField>
                <MorningField label="פרויקט">
                  <MorningInput value={pProject} onChange={setPProject} />
                </MorningField>
                {pError && <MorningAlert type="error">{pError}</MorningAlert>}
                <MorningBtn icon={Link2} onClick={submitPaymentLink} loading={pLoading} disabled={!pAmount || !pDesc || !connected} className="w-full">
                  צור קישור תשלום
                </MorningBtn>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-emerald/25 bg-emerald/[0.06] p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald/15 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-emerald" />
                  </div>
                  <p className="font-bold text-[15px]">הקישור מוכן לשליחה</p>
                  <p className="text-[12.5px] text-text-secondary mt-1">שתף עם הלקוח לתשלום מאובטח</p>
                </div>
                <div className="bg-bg border border-border rounded-xl p-4 text-[12px] break-all font-mono leading-relaxed" dir="ltr">{pUrl}</div>
                <div className="flex flex-wrap gap-2">
                  <MorningBtn
                    variant="secondary"
                    icon={pCopied ? Check : Copy}
                    onClick={async () => {
                      await navigator.clipboard.writeText(pUrl);
                      setPCopied(true);
                      setTimeout(() => setPCopied(false), 2000);
                    }}
                  >
                    {pCopied ? "הועתק!" : "העתק קישור"}
                  </MorningBtn>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`שלום, מצורף קישור לתשלום:\n${pUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] text-[13px] font-semibold hover:bg-[#25D366]/15 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <MorningBtn variant="ghost" onClick={() => setPUrl("")}>קישור חדש</MorningBtn>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Documents */}
      {tab === "documents" && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-border-soft flex items-center justify-between gap-3">
            <SectionHeading title="מסמכי Morning" subtitle={`${morningIncome.length} רשומות`} />
          </div>
          {morningIncome.length === 0 ? (
            <MorningEmpty
              icon={FolderOpen}
              title="אין מסמכים עדיין"
              desc="הנפק קבלה או חשבונית בלשוניות למעלה — המסמכים יופיעו כאן אוטומטית"
              action={
                <MorningBtn icon={Receipt} onClick={() => { setDocKind("receipt"); setTab("create"); }}>
                  הנפק מסמך ראשון
                </MorningBtn>
              }
            />
          ) : (
            <>
              <MobileCardList isEmpty={false} emptyMessage="">
                {morningIncome.slice(0, 20).map((i) => (
                  <MobileCard key={i.id}>
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-[14px] truncate">{i.clientName}</div>
                        <div className="text-[12px] text-text-tertiary">{i.invoiceNumber || i.project || "—"}</div>
                      </div>
                      <Badge label={i.status} />
                    </div>
                    <MobileCardRow label="סכום" value={<span className="font-nums font-semibold">{formatCurrency(i.amount, i.currency)}</span>} />
                    <MobileCardRow label="פעולות" value={<MorningIncomeActions entry={i} clientEmail={emailByClient.get(i.clientId)} compact />} />
                  </MobileCard>
                ))}
              </MobileCardList>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-[13.5px]">
                  <thead>
                    <tr className="border-b border-border-soft text-text-tertiary text-[12px]">
                      <th className="text-start font-medium px-5 py-3">לקוח</th>
                      <th className="text-start font-medium px-5 py-3">מס׳ / פרויקט</th>
                      <th className="text-start font-medium px-5 py-3">סכום</th>
                      <th className="text-start font-medium px-5 py-3">תאריך</th>
                      <th className="text-start font-medium px-5 py-3">סטטוס</th>
                      <th className="text-start font-medium px-5 py-3">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {morningIncome.slice(0, 30).map((i) => (
                      <tr key={i.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium">{i.clientName}</td>
                        <td className="px-5 py-3.5 text-text-secondary">{i.invoiceNumber || i.project || "—"}</td>
                        <td className="px-5 py-3.5 font-nums font-semibold">{formatCurrency(i.amount, i.currency)}</td>
                        <td className="px-5 py-3.5 text-text-tertiary text-[12px]">{i.date}</td>
                        <td className="px-5 py-3.5"><Badge label={i.status} /></td>
                        <td className="px-5 py-3.5">
                          <MorningIncomeActions entry={i} clientEmail={emailByClient.get(i.clientId)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Manage */}
      {tab === "manage" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5 sm:p-6">
            <SectionHeading title="סנכרון" subtitle="משיכת נתונים מ-Morning" />
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border-soft">
                <span className="text-[13px] text-text-secondary">סטטוס API</span>
                <Badge label={connected ? "מחובר" : "לא מחובר"} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border-soft">
                <span className="text-[13px] text-text-secondary">סביבה</span>
                <span className="text-[13px] font-semibold">{envLabel}</span>
              </div>
              <SyncButton />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="חתימה, תבניות וסליקה" subtitle="ניהול ב-Morning" />
            <div className="mt-3 grid gap-2">
              {MORNING_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3.5 rounded-xl border border-border-soft hover:border-emerald/25 hover:bg-emerald/[0.03] transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-emerald" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold">{link.label}</div>
                      <div className="text-[11.5px] text-text-tertiary">{link.desc}</div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-text-tertiary group-hover:text-emerald transition-colors" />
                  </a>
                );
              })}
            </div>
          </Card>

          {actions.length > 0 && (
            <Card className="p-5 sm:p-6 lg:col-span-2">
              <SectionHeading title="יומן פעולות" subtitle="היסטוריית פעולות מהמערכת" />
              <div className="mt-3 divide-y divide-border-soft">
                {actions.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold">{ACTION_LABELS[a.action_type] ?? a.action_type}</span>
                        {a.amount != null && (
                          <span className="font-nums text-[13px] text-text-secondary">₪{Number(a.amount).toLocaleString("he-IL")}</span>
                        )}
                      </div>
                      {a.error_message && <p className="text-[11px] text-rose mt-0.5 truncate">{a.error_message}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge label={STATUS_LABELS[a.status] ?? a.status} />
                      <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                        {new Date(a.created_at).toLocaleString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {isFormTab && !connected && (
        <p className="text-center text-[12px] text-text-tertiary pb-2">
          חיבור API נדרש להנפקת מסמכים · <Link href="/settings" className="text-emerald hover:underline">הגדרות חיבור</Link>
        </p>
      )}
    </div>
  );
}
