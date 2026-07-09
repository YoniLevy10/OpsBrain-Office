import { ReactNode } from "react";
import { Bell, Search } from "lucide-react";

export function TopBar({
  title,
  subtitle,
  action,
  live,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  live?: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 md:px-9 pt-8 pb-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
          {live !== undefined && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                live ? "bg-emerald/10 text-emerald" : "bg-brass/10 text-brass"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-emerald" : "bg-brass"}`} />
              {live ? "נתונים חיים" : "נתוני דמו"}
            </span>
          )}
        </div>
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
        {action}
      </div>
    </header>
  );
}
