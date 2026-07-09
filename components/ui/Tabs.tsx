"use client";

import { ReactNode } from "react";
import clsx from "clsx";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export function Tabs({
  tabs,
  active,
  onChange,
  className,
  variant = "underline",
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pills";
}) {
  if (variant === "pills") {
    return (
      <div
        className={clsx(
          "flex gap-1 p-1 rounded-xl bg-bg border border-border-soft overflow-x-auto scrollbar-none",
          className
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "shrink-0 flex-1 min-w-0 px-3 py-2.5 rounded-lg text-[12.5px] sm:text-[13px] font-semibold transition-all",
                isActive
                  ? "bg-surface text-emerald card-shadow"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
              )}
            >
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={clsx(
                    "ms-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold",
                    isActive ? "bg-emerald/15 text-emerald" : "bg-surface-hover text-text-tertiary"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex gap-1 overflow-x-auto scrollbar-none border-b border-border-soft",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "shrink-0 px-4 py-2.5 text-[13px] font-medium transition-colors relative",
              isActive
                ? "text-emerald"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={clsx(
                  "ms-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-bold",
                  isActive ? "bg-emerald/15 text-emerald" : "bg-surface-hover text-text-tertiary"
                )}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-emerald rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  active,
  id,
  children,
}: {
  active: string;
  id: string;
  children: ReactNode;
}) {
  if (active !== id) return null;
  return <div role="tabpanel">{children}</div>;
}
