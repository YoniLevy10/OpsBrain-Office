"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteRecord } from "@/app/actions";

export function DeleteButton({
  table,
  id,
  label,
}: {
  table: "clients" | "income" | "expenses" | "subscriptions";
  id: string;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRecord(table, id);
      if (result.ok) {
        setConfirming(false);
        setError(null);
        router.refresh();
      } else {
        setError(result.error ?? "מחיקה נכשלה");
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            disabled={pending}
            className="text-[11px] font-semibold text-rose hover:text-rose/80 px-2 py-1 rounded bg-rose/10"
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : "אישור"}
          </button>
          <button
            onClick={() => { setConfirming(false); setError(null); }}
            className="text-[11px] text-text-tertiary hover:text-text-secondary px-2 py-1"
          >
            ביטול
          </button>
        </div>
        {error && <span className="text-[10px] text-rose max-w-[140px] text-end">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      aria-label={label ?? "מחק"}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-rose hover:bg-rose/10 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
