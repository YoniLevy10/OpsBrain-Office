"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderSync, Loader2 } from "lucide-react";

export function SyncButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSync() {
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setState("done");
        setMessage(
          `סונכרן: ${data.synced.income} הכנסות, ${data.synced.clients} לקוחות, ${data.synced.expenses} הוצאות${data.synced.subscriptions ? `, ${data.synced.subscriptions} מנויים` : ""}`
        );
        router.refresh();
      } else {
        setState("error");
        setMessage(data.error ?? "שגיאה בסנכרון");
      }
    } catch {
      setState("error");
      setMessage("שגיאת רשת בסנכרון");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
      {message && (
        <span
          className={`text-[11.5px] sm:text-[12px] max-w-full sm:max-w-48 lg:max-w-72 truncate px-2 py-1 rounded-lg ${
            state === "error" ? "text-rose bg-rose/10" : "text-emerald bg-emerald/10"
          }`}
          title={message}
        >
          {message}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={state === "loading"}
        aria-label="סנכרון חשבונית ירוקה"
        className="flex items-center gap-1.5 bg-surface border border-border text-text-primary font-semibold text-[13px] px-3 sm:px-4 py-2.5 rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50 shrink-0"
      >
        {state === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FolderSync className="w-4 h-4" strokeWidth={2} />
        )}
        <span className="hidden sm:inline">סנכרון חשבונית ירוקה</span>
      </button>
    </div>
  );
}
