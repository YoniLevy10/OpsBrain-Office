export function PageSkeleton() {
  return (
    <div className="px-4 sm:px-6 md:px-9 space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-surface border border-border-soft" />
        ))}
      </div>
      <div className="h-28 rounded-xl bg-surface border border-border-soft" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface border border-border-soft" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-surface border border-border-soft" />
    </div>
  );
}
