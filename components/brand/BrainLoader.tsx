import { cn } from "@/lib/cn";
import { BrainMark } from "@/components/brand/BrainMark";

export function BrainLoader({
  size = "md",
  text,
  className,
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}) {
  const box = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("brain-loader rounded-xl overflow-hidden", box)}>
        <BrainMark className="w-full h-full" variant="on-dark" />
      </div>
      {text && <p className="text-[13px] text-text-secondary animate-pulse">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = "טוען נתונים..." }: { text?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <BrainLoader size="lg" text={text} />
    </div>
  );
}
