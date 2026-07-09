"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft, Calendar } from "lucide-react";
import { formatMonthLabel, getCurrentMonthKey } from "@/lib/analytics";

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isCurrent = month === getCurrentMonthKey();

  function navigate(next: string) {
    const params = new URLSearchParams();
    if (next !== getCurrentMonthKey()) params.set("month", next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex items-center gap-1 bg-surface border border-border-soft rounded-lg p-1">
      <button
        type="button"
        onClick={() => navigate(shiftMonth(month, -1))}
        aria-label="חודש קודם"
        className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1.5 px-2 min-w-[120px] justify-center">
        <Calendar className="w-3.5 h-3.5 text-text-tertiary hidden sm:block" />
        <span className="text-[13px] font-semibold">{formatMonthLabel(month)}</span>
      </div>
      <button
        type="button"
        onClick={() => navigate(shiftMonth(month, 1))}
        disabled={isCurrent}
        aria-label="חודש הבא"
        className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {!isCurrent && (
        <button
          type="button"
          onClick={() => navigate(getCurrentMonthKey())}
          className="text-[11px] font-semibold text-emerald hover:text-emerald/80 px-2 py-1 ms-1"
        >
          היום
        </button>
      )}
    </div>
  );
}
