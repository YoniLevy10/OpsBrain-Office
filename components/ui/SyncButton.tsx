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
          `סונכרן: ${data.synced.income} הכנסות, ${data.synced.clients} לקוחות, ${data.synced.expenses} הוצאות`
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
    <div className="flex items-center gap-3">
      {message && (
        <span
          className={`text-[12px] max-w-72 truncate ${
            state === "error" ? "text-rose" : "text-emerald"
          }`}
          title={message}
        >
          {message}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={state === "loading"}
        className="flex items-center gap-1.5 bg-surface border border-border text-text-primary font-semibold text-[13px] px-4 py-2.5 rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50"
      >
        {state === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FolderSync className="w-4 h-4" strokeWidth={2} />
        )}
        סנכרון חשבונית ירוקה
      </button>
    </div>
  );
}
