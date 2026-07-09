"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateIncomeStatus } from "@/app/actions";
import type { IncomeStatus } from "@/lib/data";

const statuses: IncomeStatus[] = ["שולם", "ממתין", "באיחור", "בוטל"];

export function IncomeStatusSelect({ id, status }: { id: string; status: IncomeStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(newStatus: string) {
    startTransition(async () => {
      await updateIncomeStatus(id, newStatus);
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      className="text-[12px] font-semibold bg-bg border border-border rounded-lg px-2 py-1 outline-none focus:border-emerald/50 disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
