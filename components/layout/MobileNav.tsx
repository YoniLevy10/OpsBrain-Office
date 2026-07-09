"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

const navItems = [
  { href: "/", label: "בקרה", icon: LayoutDashboard },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/income", label: "הכנסות", icon: TrendingUp },
  { href: "/expenses", label: "הוצאות", icon: TrendingDown },
  { href: "/subscriptions", label: "מנויים", icon: RefreshCw },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border-soft bg-bg-elevated/95 backdrop-blur-lg"
      style={{ paddingBottom: "var(--safe-area-bottom)" }}
      aria-label="ניווט ראשי"
    >
      <div className="flex items-stretch justify-around h-[4.5rem]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 px-1 transition-colors ${
                isActive ? "text-emerald" : "text-text-tertiary"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 2} />
              <span className={`text-[10.5px] leading-none truncate max-w-full ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-[calc(var(--safe-area-bottom)+6px)] w-1 h-1 rounded-full bg-emerald" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
