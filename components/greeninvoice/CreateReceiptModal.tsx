"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Loader2, Mail, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Primitives";
import { mapPaymentTypeLabel } from "@/lib/greeninvoice/errors";
import type { GiPaymentTypeCode } from "@/lib/greeninvoice/types";

type Props = {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  defaultAmount?: number;
  defaultDescription?: string;
  incomeId?: string;
  triggerClassName?: string;
};

const PAYMENT_TYPES: { value: GiPaymentTypeCode; label: string }[] = [
  { value: 4, label: "העברה בנקאית" },
  { value: 3, label: "אשראי" },
  { value: 1, label: "מזומן" },
  { value: 2, label: "צ'ק" },
];

export function CreateReceiptModal({
  clientId,
  clientName,
  clientEmail = "",
  defaultAmount,
  defaultDescription = "",
  incomeId,
  triggerClassName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "");
  const [description, setDescription] = useState(defaultDescription);
  const [project, setProject] = useState(defaultDescription);
  const [email, setEmail] = useState(clientEmail);
  const [paymentType, setPaymentType] = useState<GiPaymentTypeCode>(4);
  const [sendEmail, setSendEmail] = useState(Boolean(clientEmail));

  async function submit(preview = false) {
    setLoading(!preview);
    setPreviewing(preview);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/greeninvoice/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: preview ? "preview_receipt" : "receipt",
          clientId,
          clientName,
          clientEmail: email || undefined,
          amount: Number(amount),
          description,
          project,
          paymentType,
          sendEmail: !preview && sendEmail && Boolean(email),
          incomeId,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "שגיאה");
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
      setSuccess(
        data.sent
          ? `קבלה ${data.documentNumber ?? ""} הונפקה ונשלחה במייל`
          : `קבלה ${data.documentNumber ?? ""} הונפקה בהצלחה`
      );
      router.refresh();
      setTimeout(() => setOpen(false), 1500);
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
      setPreviewing(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-lg bg-emerald text-white hover:bg-emerald/90 transition-colors"
        }
      >
        <Receipt className="w-4 h-4" />
        הנפק קבלה
      </button>

      <Modal open={open} onClose={() => setOpen(false)} panelClassName="max-w-lg">
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-[16px] font-bold">הנפקת קבלה — Morning</h3>
            <p className="text-[12.5px] text-text-secondary mt-1">לקוח: {clientName}</p>
          </div>

          <label className="block">
            <span className="text-[12px] text-text-secondary font-medium">סכום (₪)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
              required
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-text-secondary font-medium">תיאור</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
              required
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-text-secondary font-medium">פרויקט (אופציונלי)</span>
            <input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-text-secondary font-medium">סוג תשלום</span>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(Number(e.target.value) as GiPaymentTypeCode)}
              className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
            >
              {PAYMENT_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-text-tertiary mt-0.5 block">
              {mapPaymentTypeLabel(paymentType)}
            </span>
          </label>

          <label className="block">
            <span className="text-[12px] text-text-secondary font-medium">מייל לקוח</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
              dir="ltr"
            />
          </label>

          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              disabled={!email}
            />
            <Mail className="w-3.5 h-3.5 text-text-tertiary" />
            שלח קבלה במייל לאחר הנפקה
          </label>

          {error && <p className="text-[12.5px] text-rose bg-rose/10 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-[12.5px] text-emerald bg-emerald/10 px-3 py-2 rounded-lg">{success}</p>}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={loading || !amount || !description}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[13px] font-medium hover:bg-surface-hover disabled:opacity-50"
            >
              {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              תצוגה מקדימה
            </button>
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={loading || !amount || !description}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald text-white text-[13px] font-semibold hover:bg-emerald/90 disabled:opacity-50"
            >
              {loading && !previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
              הנפק קבלה
            </button>
          </div>
        </Card>
      </Modal>
    </>
  );
}
