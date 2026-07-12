"use client";

import { useState, useTransition } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { unlockAppAccess } from "@/app/settings/access-actions";

export function AccessUnlockPanel() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await unlockAppAccess(secret);
      if (!res.ok) {
        setError(res.error ?? "שגיאה");
        return;
      }
      setSecret("");
      window.location.reload();
    });
  }

  return (
    <Card className="p-5 border-brass/30 bg-brass/[0.04]">
      <SectionHeading title="סיסמת גישה" subtitle="נדרשת לפעולות רגישות (Gmail, טוקנים)" />
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-[12px] text-text-secondary">
          <Lock className="w-4 h-4 text-brass shrink-0" />
          <span>הזן את <code className="text-[11px]">OPSBRAIN_ACCESS_SECRET</code> שהוגדר ב-Vercel</span>
        </div>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="סיסמת גישה"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-[13px]"
          autoComplete="current-password"
        />
        {error && <p className="text-[12px] text-rose">{error}</p>}
        <button
          type="submit"
          disabled={pending || !secret.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brass text-white text-[13px] font-semibold hover:bg-brass/90 disabled:opacity-50"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          אשר גישה
        </button>
      </form>
    </Card>
  );
}
