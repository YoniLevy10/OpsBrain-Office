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
      className={`bg-surface border border-border-soft rounded-2xl card-shadow ${className}`}
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
  Morning: "bg-blue/10 text-blue",
  נוצר: "bg-emerald/10 text-emerald",
  מקומי: "bg-brass/10 text-brass",
  הונפק: "bg-blue/10 text-blue",
  נשלח: "bg-emerald/10 text-emerald",
  נכשל: "bg-rose/10 text-rose",
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
  deltaInvert = false,
  icon: Icon,
  accent = "emerald",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  deltaInvert?: boolean;
  icon: LucideIcon;
  accent?: "emerald" | "brass" | "rose" | "blue";
}) {
  const accentClasses: Record<string, string> = {
    emerald: "bg-emerald/10 text-emerald",
    brass: "bg-brass/10 text-brass",
    rose: "bg-rose/10 text-rose",
    blue: "bg-blue/10 text-blue",
  };

  const isGood = deltaInvert ? deltaDirection === "down" : deltaDirection === "up";

  return (
    <Card className="p-3.5 sm:p-5 flex flex-col justify-between gap-3 min-h-[108px] sm:min-h-[124px]">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${accentClasses[accent]}`}
        >
          <Icon className="w-4 h-4" strokeWidth={2.25} />
        </div>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10.5px] sm:text-[12px] font-semibold px-1.5 py-0.5 rounded-md ${
              isGood ? "text-emerald bg-emerald/8" : "text-rose bg-rose/8"
            }`}
          >
            {deltaDirection === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {delta}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[11px] sm:text-[13px] text-text-secondary font-medium leading-snug line-clamp-2">
          {label}
        </p>
        <p className="font-nums text-[19px] sm:text-[25px] font-bold tracking-tight leading-none">{value}</p>
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
