"use client";

import { ReactNode } from "react";
import { Loader2, LucideIcon } from "lucide-react";

const inputClass =
  "mt-1.5 w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none transition-colors placeholder:text-text-tertiary focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10";

export function MorningField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-text-secondary font-medium">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-text-tertiary mt-1 block">{hint}</span>}
    </label>
  );
}

export function MorningInput({
  type = "text",
  value,
  onChange,
  placeholder,
  dir,
  required,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      required={required}
      className={inputClass}
    />
  );
}

export function MorningSelect({
  value,
  onChange,
  children,
}: {
  value: string | number;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      {children}
    </select>
  );
}

export function MorningAlert({
  type,
  children,
}: {
  type: "error" | "success" | "info";
  children: ReactNode;
}) {
  const styles = {
    error: "text-rose bg-rose/10 border-rose/20",
    success: "text-emerald bg-emerald/10 border-emerald/20",
    info: "text-blue bg-blue/10 border-blue/20",
  };
  return (
    <p className={`text-[12.5px] px-3.5 py-2.5 rounded-xl border ${styles[type]}`}>{children}</p>
  );
}

export function MorningBtn({
  children,
  onClick,
  disabled,
  variant = "primary",
  loading,
  icon: Icon,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  const variants = {
    primary: "bg-emerald text-white hover:bg-emerald/90 shadow-sm shadow-emerald/20",
    secondary: "bg-surface border border-border text-text-primary hover:bg-surface-hover",
    ghost: "text-text-secondary hover:text-emerald hover:bg-emerald/5",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-45 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function MorningActionTile({
  icon: Icon,
  title,
  desc,
  active,
  onClick,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
  accent: "emerald" | "blue" | "brass";
}) {
  const accents = {
    emerald: { ring: "ring-emerald/40", bg: "bg-emerald/10", text: "text-emerald" },
    blue: { ring: "ring-blue/40", bg: "bg-blue/10", text: "text-blue" },
    brass: { ring: "ring-brass/40", bg: "bg-brass/10", text: "text-brass" },
  };
  const a = accents[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-start p-4 rounded-2xl border transition-all ${
        active
          ? `border-emerald/30 bg-emerald/[0.04] ring-2 ${a.ring}`
          : "border-border-soft bg-surface hover:border-border hover:bg-surface-hover"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${a.bg}`}>
        <Icon className={`w-5 h-5 ${a.text}`} strokeWidth={2} />
      </div>
      <div className="text-[14px] font-bold">{title}</div>
      <div className="text-[12px] text-text-tertiary mt-0.5 leading-snug">{desc}</div>
    </button>
  );
}

export function MorningEmpty({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-bg border border-border-soft flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-text-tertiary" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-semibold">{title}</p>
      <p className="text-[13px] text-text-secondary mt-1 max-w-sm">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function MorningToggle({
  checked,
  onChange,
  label,
  disabled,
  icon: Icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-xl border border-border-soft cursor-pointer transition-colors ${
        checked ? "bg-emerald/[0.04] border-emerald/20" : "bg-bg hover:bg-surface-hover"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded accent-emerald"
      />
      {Icon && <Icon className="w-4 h-4 text-text-tertiary shrink-0" />}
      <span className="text-[13px] font-medium">{label}</span>
    </label>
  );
}
