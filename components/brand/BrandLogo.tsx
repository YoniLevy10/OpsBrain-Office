import Image from "next/image";
import { BrainMark } from "@/components/brand/BrainMark";
import { cn } from "@/lib/cn";

export function BrandLogo({
  size = 32,
  showText = true,
  subtitle = "Finance",
  className,
  useImage = true,
}: {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
  useImage?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 min-w-0", className)}>
      <div
        className="relative shrink-0 overflow-hidden rounded-lg"
        style={{ width: size, height: size }}
      >
        {useImage ? (
          <Image
            src="/brand/brain-icon.svg"
            alt="OpsBrain"
            width={size}
            height={size}
            className="object-cover"
            priority
          />
        ) : (
          <BrainMark className="w-full h-full" variant="on-dark" />
        )}
      </div>
      {showText && (
        <div className="min-w-0">
          <div className="font-display font-bold text-[15px] tracking-tight leading-none truncate">
            OpsBrain
          </div>
          {subtitle && (
            <div className="text-[11px] text-text-tertiary mt-1 leading-none truncate">{subtitle}</div>
          )}
        </div>
      )}
    </div>
  );
}
