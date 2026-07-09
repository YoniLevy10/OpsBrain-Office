import { ReactNode } from "react";

export function MobileCardList({
  children,
  emptyMessage,
  isEmpty,
}: {
  children: ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
}) {
  if (isEmpty) {
    return (
      <p className="md:hidden text-[13px] text-text-tertiary py-8 text-center">{emptyMessage}</p>
    );
  }

  return <div className="md:hidden space-y-3">{children}</div>;
}

export function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-border-soft rounded-xl p-4 space-y-2.5 ${className}`}
    >
      {children}
    </div>
  );
}

export function MobileCardRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 text-[13px] ${className}`}>
      <span className="text-text-tertiary shrink-0">{label}</span>
      <span className="text-text-primary text-end min-w-0">{value}</span>
    </div>
  );
}
