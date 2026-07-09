import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-border-soft rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  שולם: "bg-emerald/10 text-emerald",
  פעיל: "bg-emerald/10 text-emerald",
  ממתין: "bg-brass/10 text-brass",
  מושהה: "bg-text-tertiary/10 text-text-secondary",
  באיחור: "bg-rose/10 text-rose",
  "לא פעיל": "bg-text-tertiary/10 text-text-tertiary",
  בוטל: "bg-text-tertiary/10 text-text-tertiary",
};

export function Badge({ label }: { label: string }) {
  const style = statusStyles[label] ?? "bg-blue/10 text-blue";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  icon: Icon,
  accent = "emerald",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  icon: LucideIcon;
  accent?: "emerald" | "brass" | "rose" | "blue";
}) {
  const accentClasses: Record<string, string> = {
    emerald: "bg-emerald/10 text-emerald",
    brass: "bg-brass/10 text-brass",
    rose: "bg-rose/10 text-rose",
    blue: "bg-blue/10 text-blue",
  };

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-text-secondary font-medium">{label}</span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentClasses[accent]}`}
        >
          <Icon className="w-4 h-4" strokeWidth={2.25} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-nums text-[26px] font-semibold tracking-tight">
          {value}
        </span>
        {delta && (
          <span
            className={`flex items-center gap-0.5 text-[12.5px] font-semibold ${
              deltaDirection === "up" ? "text-emerald" : "text-rose"
            }`}
          >
            {deltaDirection === "up" ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-bold">{title}</h2>
      {subtitle && <p className="text-[12.5px] text-text-secondary mt-0.5">{subtitle}</p>}
    </div>
  );
}
