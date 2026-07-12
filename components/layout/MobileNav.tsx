"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  MoreHorizontal,
  FileSpreadsheet,
  Settings,
  Landmark,
  BarChart3,
  FileText,
  Mail,
  X,
} from "lucide-react";

const mainItems = [
  { href: "/", label: "בקרה", icon: LayoutDashboard },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/morning", label: "חשבונית", icon: FileText, featured: true },
  { href: "/income", label: "הכנסות", icon: TrendingUp },
];

const moreItems = [
  { href: "/email", label: "מייל", icon: Mail },
  { href: "/expenses", label: "הוצאות", icon: TrendingDown },
  { href: "/analytics", label: "אנליטיקה", icon: BarChart3 },
  { href: "/bank", label: "בנק", icon: Landmark },
  { href: "/subscriptions", label: "מנויים", icon: RefreshCw },
  { href: "/reports", label: "דוחות", icon: FileSpreadsheet },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreItems.some((i) => pathname === i.href);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-bg-elevated/95 backdrop-blur-md card-shadow"
        style={{ paddingBottom: "var(--safe-area-bottom)" }}
        aria-label="ניווט ראשי"
      >
        <div className="flex items-end justify-around h-[4.75rem] px-1">
          {mainItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            if (item.featured) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label="חשבונית ירוקה"
                  className="relative flex flex-col items-center justify-end gap-1 flex-1 min-w-0 pb-2 min-h-[44px] -mt-3"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all ${
                      isActive
                        ? "bg-emerald text-white shadow-emerald/30 scale-105"
                        : "bg-emerald/90 text-white shadow-emerald/20 hover:bg-emerald"
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.25} />
                  </div>
                  <span
                    className={`text-[10px] leading-none truncate max-w-full ${
                      isActive ? "font-bold text-emerald" : "font-semibold text-text-secondary"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 px-1 pb-2.5 min-h-[44px] transition-colors ${
                  isActive ? "text-emerald" : "text-text-tertiary"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 2} />
                <span
                  className={`text-[10px] leading-none truncate max-w-full ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 px-1 pb-2.5 min-h-[44px] transition-colors ${
              moreActive ? "text-emerald" : "text-text-tertiary"
            }`}
            aria-label="עוד"
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={moreActive ? 2.25 : 2} />
            <span className={`text-[10px] leading-none ${moreActive ? "font-semibold" : "font-medium"}`}>
              עוד
            </span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-surface border-t border-border rounded-t-2xl card-shadow p-4"
            style={{ paddingBottom: "calc(1rem + var(--safe-area-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-bold">עוד</span>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="סגור"
                className="w-9 h-9 flex items-center justify-center text-text-tertiary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl min-h-[44px] transition-colors ${
                      isActive
                        ? "bg-emerald/10 text-emerald font-semibold"
                        : "hover:bg-surface-hover text-text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[14px]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
