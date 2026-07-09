import { cn } from "@/lib/cn";

export function BrainMark({
  className,
  variant = "on-dark",
}: {
  className?: string;
  variant?: "on-dark" | "on-light";
}) {
  const bg = variant === "on-dark" ? "#000000" : "transparent";
  const brain = variant === "on-dark" ? "#FFFFFF" : "#1A2233";
  const sulci = variant === "on-dark" ? "#000000" : "#F5F7FA";

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      aria-hidden
    >
      {variant === "on-dark" && <rect width="512" height="512" fill={bg} />}
      <g fill={brain}>
        <path d="M136 352c-24-8-44-32-48-64-4-36 16-72 48-88-8-48 24-92 72-100 28-4 54 6 74 26 20-22 52-34 84-26 48 12 80 56 76 104 32 12 52 44 48 80-4 40-36 68-76 72 0 44-36 78-82 82-52 4-98-28-112-76-36 0-68-24-76-58-10-38 12-78 48-92z" />
      </g>
      <g fill="none" stroke={sulci} strokeLinecap="round">
        <path d="M180 290c16-32 48-48 80-44" strokeWidth="16" />
        <path d="M204 242c24-14 54-16 78-4" strokeWidth="14" />
        <path d="M252 324c-12 20-36 32-60 28" strokeWidth="14" />
        <path d="M300 276c14 12 24 30 26 50" strokeWidth="12" />
        <path d="M332 340c-6 10-18 16-30 14" strokeWidth="10" />
      </g>
    </svg>
  );
}
