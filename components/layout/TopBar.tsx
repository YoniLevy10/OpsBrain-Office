"use client";

import { Search, Bell, Plus } from "lucide-react";

export function TopBar({
  title,
  subtitle,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 md:px-9 pt-8 pb-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13.5px] text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 bg-surface border border-border-soft rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-text-tertiary" />
          <input
            placeholder="חיפוש..."
            className="bg-transparent text-[13px] outline-none w-full placeholder:text-text-tertiary"
          />
        </div>
        <button
          aria-label="התראות"
          className="w-9 h-9 rounded-lg bg-surface border border-border-soft flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <Bell className="w-[17px] h-[17px]" strokeWidth={2} />
        </button>
        {actionLabel && (
          <button className="flex items-center gap-1.5 bg-emerald text-bg font-semibold text-[13px] px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            {actionLabel}
          </button>
        )}
      </div>
    </header>
  );
}
