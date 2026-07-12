"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  FileSpreadsheet,
  Landmark,
  BarChart3,
  FileText,
  Mail,
} from "lucide-react";

const navItems = [
  { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/morning", label: "חשבונית ירוקה", icon: FileText, highlight: true },
  { href: "/email", label: "מייל", icon: Mail },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/income", label: "הכנסות", icon: TrendingUp },
  { href: "/expenses", label: "הוצאות", icon: TrendingDown },
  { href: "/subscriptions", label: "מנויים", icon: RefreshCw },
  { href: "/bank", label: "בנק", icon: Landmark },
  { href: "/analytics", label: "אנליטיקה", icon: BarChart3 },
  { href: "/reports", label: "דוחות", icon: FileSpreadsheet },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-l border-border bg-bg-elevated h-screen sticky top-0 card-shadow">
      <div className="px-6 pt-7 pb-6">
        <Link href="/" className="block hover:opacity-90 transition-opacity">
          <BrandLogo size={32} />
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          const highlight = "highlight" in item && item.highlight;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${
                isActive
                  ? "bg-surface text-text-primary font-semibold"
                  : highlight
                    ? "text-text-primary hover:bg-emerald/5 border border-transparent hover:border-emerald/15"
                    : "text-text-secondary hover:bg-surface/60 hover:text-text-primary"
              }`}
            >
              <Icon
                className={`w-[17px] h-[17px] transition-colors ${
                  isActive || highlight ? "text-emerald" : "text-text-tertiary group-hover:text-text-secondary"
                }`}
                strokeWidth={2}
              />
              {item.label}
              {highlight && !isActive && (
                <span className="mr-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald/10 text-emerald">
                  ראשי
                </span>
              )}
              {isActive && <span className="mr-auto w-1 h-1 rounded-full bg-emerald" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <ThemeToggle className="w-full justify-center mx-1 mb-2" />
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${
            pathname === "/settings"
              ? "bg-surface text-text-primary font-semibold"
              : "text-text-secondary hover:bg-surface/60 hover:text-text-primary"
          }`}
        >
          <Settings
            className={`w-[17px] h-[17px] ${pathname === "/settings" ? "text-emerald" : "text-text-tertiary"}`}
            strokeWidth={2}
          />
          הגדרות
          {pathname === "/settings" && (
            <span className="mr-auto w-1 h-1 rounded-full bg-emerald" />
          )}
        </Link>
        <div className="mt-3 mx-1 px-3 py-3 rounded-xl bg-bg border border-border-soft">
          <div className="text-[11px] text-text-tertiary mb-1">מחובר כ־</div>
          <div className="text-[13px] font-semibold">Yoni Levy · OpsBrain</div>
        </div>
      </div>
    </aside>
  );
}
