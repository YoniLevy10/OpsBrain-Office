"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveUsdRate } from "@/app/actions";

export function UsdRateForm({ currentRate }: { currentRate: number }) {
  const [rate, setRate] = useState(String(currentRate));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await saveUsdRate(Number(rate));
      if (result.ok) setMessage("נשמר");
      else setMessage(result.error ?? "שגיאה");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mt-3">
      <label className="block flex-1 min-w-[140px]">
        <span className="text-[12px] text-text-secondary font-medium">שער דולר (₪)</span>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 bg-emerald text-white font-semibold text-[13px] px-4 py-2.5 rounded-lg hover:bg-emerald/90 disabled:opacity-50"
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        שמירה
      </button>
      {message && (
        <span className={`text-[12px] ${message === "נשמר" ? "text-emerald" : "text-rose"}`}>
          {message}
        </span>
      )}
    </form>
  );
}
