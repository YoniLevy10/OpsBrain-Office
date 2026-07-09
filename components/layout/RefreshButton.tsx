"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { refreshPageData } from "@/lib/refresh-data";

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    if (loading) return;
    setLoading(true);
    await refreshPageData(router);
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
      aria-label="רענון נתונים"
      title="רענון נתונים"
      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-hover hover:text-emerald transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald" : ""}`} strokeWidth={2} />
    </button>
  );
}
