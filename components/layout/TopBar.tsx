import { ReactNode } from "react";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import type { Notification } from "@/lib/analytics";

export function TopBar({
  title,
  subtitle,
  action,
  live,
  notifications = [],
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  live?: boolean;
  notifications?: Notification[];
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 md:px-9 pt-6 sm:pt-8 pb-4 sm:pb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight">{title}</h1>
          {live !== undefined && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                live ? "bg-emerald/10 text-emerald" : "bg-brass/10 text-brass"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-emerald" : "bg-brass"}`} />
              {live ? "נתונים חיים" : "נתוני דמו"}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[13px] sm:text-[13.5px] text-text-secondary mt-1 truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <GlobalSearch />
        <NotificationsButton notifications={notifications} />
        {action}
      </div>
    </header>
  );
}
