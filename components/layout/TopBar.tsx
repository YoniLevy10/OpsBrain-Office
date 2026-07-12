import { ReactNode } from "react";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { RefreshButton } from "@/components/layout/RefreshButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
    <header className="sticky top-0 z-20 border-b border-border-soft bg-bg-elevated/98">
      <div className="px-4 sm:px-6 md:px-9 pt-5 sm:pt-7 pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[19px] sm:text-[22px] font-bold tracking-tight leading-tight">{title}</h1>
              {live !== undefined && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-semibold shrink-0 ${
                    live ? "bg-emerald/10 text-emerald" : "bg-brass/10 text-brass"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-emerald" : "bg-brass"}`} />
                  {live ? "מחובר" : "דמו"}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[12.5px] sm:text-[13.5px] text-text-secondary mt-1 leading-snug">{subtitle}</p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">{action}</div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border-soft/70">
          <div className="md:hidden min-w-0 flex-1">{action}</div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ms-auto">
            <div className="hidden md:flex">
              <ThemeToggle variant="pill" />
            </div>
            <RefreshButton />
            <GlobalSearch />
            <NotificationsButton notifications={notifications} />
          </div>
        </div>
      </div>
    </header>
  );
}
