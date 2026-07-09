"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Activity,
  FileSpreadsheet,
} from "lucide-react";

const navItems = [
  { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/income", label: "הכנסות", icon: TrendingUp },
  { href: "/expenses", label: "הוצאות", icon: TrendingDown },
  { href: "/subscriptions", label: "מנויים", icon: RefreshCw },
  { href: "/reports", label: "דוחות", icon: FileSpreadsheet },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-l border-border bg-bg-elevated h-screen sticky top-0 card-shadow">
      <div className="px-6 pt-7 pb-6 flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center">
          <Activity className="w-4.5 h-4.5 text-emerald" strokeWidth={2.25} />
        </div>
        <div>
          <div className="font-display font-bold text-[15px] tracking-tight leading-none">
            OpsBrain
          </div>
          <div className="text-[11px] text-text-tertiary mt-1 leading-none">Finance</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${
                isActive
                  ? "bg-surface text-text-primary font-semibold"
                  : "text-text-secondary hover:bg-surface/60 hover:text-text-primary"
              }`}
            >
              <Icon
                className={`w-[17px] h-[17px] transition-colors ${
                  isActive ? "text-emerald" : "text-text-tertiary group-hover:text-text-secondary"
                }`}
                strokeWidth={2}
              />
              {item.label}
              {isActive && (
                <span className="mr-auto w-1 h-1 rounded-full bg-emerald" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] text-text-secondary hover:bg-surface/60 hover:text-text-primary transition-colors"
        >
          <Settings className="w-[17px] h-[17px] text-text-tertiary" strokeWidth={2} />
          הגדרות
        </Link>
        <div className="mt-3 mx-1 px-3 py-3 rounded-xl bg-bg border border-border-soft">
          <div className="text-[11px] text-text-tertiary mb-1">מחובר כ־</div>
          <div className="text-[13px] font-semibold">Yoni Levy · OpsBrain</div>
        </div>
      </div>
    </aside>
  );
}
