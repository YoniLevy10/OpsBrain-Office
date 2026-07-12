"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";

export function SendDocumentButton({
  documentId,
  email,
  incomeId,
  clientId,
  className,
}: {
  documentId: string;
  email?: string;
  incomeId?: string;
  clientId?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!email) {
      setError("אין מייל ללקוח");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/greeninvoice/documents/${documentId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [email], incomeId, clientId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "שגיאה");
        return;
      }
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={send}
        disabled={loading || !email}
        title={email ? `שלח ל-${email}` : "אין מייל"}
        className={
          className ??
          "p-1.5 rounded-lg text-text-tertiary hover:text-emerald hover:bg-emerald/5 disabled:opacity-40 transition-colors"
        }
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
      </button>
      {done && <span className="text-[10px] text-emerald">נשלח</span>}
      {error && <span className="text-[10px] text-rose">{error}</span>}
    </div>
  );
}
