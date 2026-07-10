"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { formatCurrency } from "@/lib/data";
import type { ActivityItem } from "@/lib/analytics";

const icons = {
  income: TrendingUp,
  expense: TrendingDown,
  bank: Landmark,
  sync: RefreshCw,
};

const accent = {
  income: "text-emerald bg-emerald/10",
  expense: "text-rose bg-rose/10",
  bank: "text-blue bg-blue/10",
  sync: "text-brass bg-brass/10",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-[13px] text-text-tertiary py-6 text-center">אין פעילות אחרונה</p>
    );
  }

  return (
    <div className="divide-y divide-border-soft">
      {items.map((item) => {
        const Icon = icons[item.type];
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 py-3 hover:bg-surface-hover/50 -mx-2 px-2 rounded-lg transition-colors group"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent[item.type]}`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate group-hover:text-emerald transition-colors">
                {item.title}
              </div>
              <div className="text-[11.5px] text-text-tertiary truncate">{item.subtitle}</div>
            </div>
            <div className="text-left shrink-0">
              {item.amount != null && (
                <div
                  className={`font-nums text-[12.5px] font-semibold ${
                    item.amount >= 0 ? "text-emerald" : "text-rose"
                  }`}
                >
                  {item.amount >= 0 ? "+" : ""}
                  {formatCurrency(Math.abs(item.amount))}
                </div>
              )}
              <div className="text-[10.5px] text-text-tertiary mt-0.5">{item.date}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function ActivityFeedFooter() {
  return (
    <Link
      href="/analytics"
      className="mt-3 flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-emerald transition-colors w-fit"
    >
      כל האנליטיקה <ArrowLeft className="w-3.5 h-3.5" />
    </Link>
  );
}
