"use client";

import { Badge } from "@/components/ui/Primitives";
import type { IncomeSource } from "@/lib/greeninvoice/types";

const LABELS: Record<IncomeSource, string> = {
  sync: "Morning",
  created: "נוצר",
  manual: "מקומי",
};

export function MorningBadge({ source }: { source?: IncomeSource }) {
  const s = source ?? "manual";
  return <Badge label={LABELS[s]} />;
}
