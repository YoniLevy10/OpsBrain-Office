import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="px-4 sm:px-6 md:px-9 pt-6 sm:pt-8 pb-4 animate-pulse">
        <div className="h-7 w-40 rounded-lg bg-surface border border-border-soft" />
        <div className="h-4 w-56 rounded mt-2 bg-surface border border-border-soft" />
      </div>
      <PageSkeleton />
    </div>
  );
}
