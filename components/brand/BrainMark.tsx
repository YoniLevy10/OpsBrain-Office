import { cn } from "@/lib/cn";

export function BrainMark({
  className,
  variant = "on-dark",
}: {
  className?: string;
  variant?: "on-dark" | "on-light";
}) {
  const bg = variant === "on-dark" ? "#121820" : "transparent";
  const brain = "#FFFFFF";
  const digital = "#3B8FD9";

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      aria-hidden
    >
      {variant === "on-dark" && <rect width="512" height="512" fill={bg} />}
      <g clipPath="url(#brainMarkLeft)">
        <path
          d="M256 96c-52 0-96 36-104 88-28 8-48 32-48 64s20 56 48 64c8 36 36 64 72 72 12 4 24 4 36 0 8-2 16-6 24-10"
          stroke={brain}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M168 200c20-16 48-24 76-20" stroke={brain} strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M176 248c24-8 52-8 76 4" stroke={brain} strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M188 296c16 12 28 28 32 48" stroke={brain} strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M208 340c12 8 24 12 40 12" stroke={brain} strokeWidth="8" strokeLinecap="round" fill="none"/>
      </g>
      <g clipPath="url(#brainMarkRight)">
        <path d="M272 128v72" stroke={digital} strokeWidth="8" strokeLinecap="round"/>
        <circle cx="272" cy="120" r="10" fill={digital}/>
        <path d="M304 144v96l16-16 16 16V144" stroke={digital} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="304" cy="136" r="10" fill={digital}/>
        <path d="M336 112v128" stroke={digital} strokeWidth="8" strokeLinecap="round"/>
        <circle cx="336" cy="104" r="10" fill={digital}/>
        <path d="M368 152v88l12-12 12 12V152" stroke={digital} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="368" cy="144" r="10" fill={digital}/>
        <rect x="268" y="352" width="20" height="32" rx="3" fill={digital}/>
        <rect x="296" y="336" width="20" height="48" rx="3" fill={digital}/>
        <rect x="324" y="320" width="20" height="64" rx="3" fill={digital}/>
        <rect x="352" y="304" width="20" height="80" rx="3" fill={digital}/>
      </g>
      <defs>
        <clipPath id="brainMarkLeft">
          <rect x="0" y="0" width="256" height="512"/>
        </clipPath>
        <clipPath id="brainMarkRight">
          <rect x="256" y="0" width="256" height="512"/>
        </clipPath>
      </defs>
    </svg>
  );
}
