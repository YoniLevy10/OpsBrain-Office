"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, resolveTheme, type ThemeMode } from "@/lib/theme";

type Props = {
  className?: string;
  /** Compact pill for top bar / mobile */
  variant?: "sidebar" | "pill";
};

export function ThemeToggle({ className = "", variant = "sidebar" }: Props) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    setMode(resolveTheme());
  }, []);

  function setTheme(next: ThemeMode) {
    setMode(next);
    applyTheme(next);
  }

  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-xl bg-bg border border-border-soft ${className}`}
        role="group"
        aria-label="מצב תצוגה"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={mode === "light"}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors ${
            mode === "light"
              ? "bg-blue text-white shadow-sm"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          בהיר
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={mode === "dark"}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors ${
            mode === "dark"
              ? "bg-emerald text-white shadow-sm"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          כהה
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(mode === "dark" ? "light" : "dark")}
      aria-label={mode === "dark" ? "עבור למצב בהיר" : "עבור למצב כהה"}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors ${className}`}
    >
      {mode === "dark" ? <Sun className="w-4 h-4 text-brass" /> : <Moon className="w-4 h-4 text-blue" />}
      <span>{mode === "dark" ? "מצב בהיר" : "מצב כהה"}</span>
    </button>
  );
}
