import Image from "next/image";
import { BrainMark } from "@/components/brand/BrainMark";
import { cn } from "@/lib/cn";

export function BrandLogo({
  size = 32,
  showText = true,
  subtitle = "Finance",
  className,
  useImage = true,
  variant = "compact",
}: {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
  useImage?: boolean;
  variant?: "compact" | "full";
}) {
  if (variant === "full") {
    return (
      <div className={cn("min-w-0", className)}>
        <Image
          src="/brand/opsbrain-logo.png"
          alt="OpsBrain Office"
          width={240}
          height={240}
          className="h-auto w-full max-w-[220px] object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5 min-w-0", className)}>
      <div
        className="relative shrink-0 overflow-hidden rounded-lg"
        style={{ width: size, height: size }}
      >
        {useImage ? (
          <Image
            src="/brand/brain-icon.png"
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
            <span className="text-text-primary">Ops</span>
            <span className="text-[#3B8FD9]">Brain</span>
          </div>
          {subtitle && (
            <div className="text-[11px] text-text-tertiary mt-1 leading-none truncate">{subtitle}</div>
          )}
        </div>
      )}
    </div>
  );
}
