"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, Copy, Check, MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Primitives";

type Props = {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  defaultAmount?: number;
  defaultDescription?: string;
  incomeId?: string;
  giDocumentId?: string;
  triggerClassName?: string;
  label?: string;
};

export function PaymentLinkModal({
  clientId,
  clientName,
  clientEmail,
  defaultAmount,
  defaultDescription = "",
  incomeId,
  giDocumentId,
  triggerClassName,
  label = "קישור לתשלום",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "");
  const [description, setDescription] = useState(defaultDescription);
  const [project, setProject] = useState(defaultDescription);

  async function createLink() {
    setLoading(true);
    setError("");
    setPaymentUrl("");

    try {
      const res = await fetch("/api/greeninvoice/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientName,
          clientEmail,
          amount: Number(amount),
          description,
          project,
          incomeId,
          giDocumentId,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "שגיאה");
        return;
      }
      setPaymentUrl(data.paymentLinkUrl ?? "");
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!paymentUrl) return;
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappUrl = paymentUrl
    ? `https://wa.me/?text=${encodeURIComponent(`שלום, מצורף קישור לתשלום: ${paymentUrl}`)}`
    : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-lg border border-emerald/30 text-emerald hover:bg-emerald/5 transition-colors"
        }
      >
        <Link2 className="w-4 h-4" />
        {label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} panelClassName="max-w-lg">
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-[16px] font-bold">קישור תשלום — Morning</h3>
            <p className="text-[12.5px] text-text-secondary mt-1">לקוח: {clientName}</p>
          </div>

          {!paymentUrl && (
            <>
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
                <span className="text-[12px] text-text-secondary font-medium">פרויקט</span>
                <input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
                />
              </label>
            </>
          )}

          {paymentUrl && (
            <div className="space-y-2">
              <p className="text-[12.5px] text-emerald font-medium">קישור התשלום נוצר בהצלחה</p>
              <div className="bg-bg border border-border rounded-lg p-3 text-[12px] break-all font-mono" dir="ltr">
                {paymentUrl}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[13px] hover:bg-surface-hover"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4" />}
                  {copied ? "הועתק" : "העתק"}
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald/10 text-emerald text-[13px] font-medium hover:bg-emerald/15"
                >
                  <MessageCircle className="w-4 h-4" />
                  שלח ב-WhatsApp
                </a>
              </div>
            </div>
          )}

          {error && <p className="text-[12.5px] text-rose bg-rose/10 px-3 py-2 rounded-lg">{error}</p>}

          {!paymentUrl && (
            <button
              type="button"
              onClick={createLink}
              disabled={loading || !amount || !description}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald text-white text-[13px] font-semibold hover:bg-emerald/90 disabled:opacity-50 w-full justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              צור קישור תשלום
            </button>
          )}
        </Card>
      </Modal>
    </>
  );
}
