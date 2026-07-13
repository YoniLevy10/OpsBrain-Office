"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

export function GmailConnectButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  function startConnect() {
    setLoading(true);
    // Full navigation — required for OAuth on mobile/PWA (not client-side router)
    window.location.assign("/api/gmail/auth");
  }

  return (
    <button
      type="button"
      onClick={startConnect}
      disabled={loading}
      className={
        className ??
        "flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue text-white text-[14px] font-semibold hover:bg-blue/90 disabled:opacity-60"
      }
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
      התחבר עם Google
    </button>
  );
}
