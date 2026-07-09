"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { refreshPageData } from "@/lib/refresh-data";

const THRESHOLD = 64;
const MAX_PULL = 96;

export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const atScrollTop = useCallback(() => {
    return window.scrollY <= 2;
  }, []);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (refreshing || !atScrollTop()) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && atScrollTop()) {
        const next = Math.min(dy * 0.45, MAX_PULL);
        setPull(next);
        if (next > 12) e.preventDefault();
      } else {
        pulling.current = false;
        setPull(0);
      }
    }

    async function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      const shouldRefresh = pull >= THRESHOLD;
      if (!shouldRefresh) {
        setPull(0);
        return;
      }
      setRefreshing(true);
      setPull(THRESHOLD);
      await refreshPageData(router);
      setRefreshing(false);
      setPull(0);
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [atScrollTop, pull, refreshing, router]);

  const visible = pull > 0 || refreshing;
  const progress = Math.min(pull / THRESHOLD, 1);

  return (
    <>
      <div
        aria-hidden
        className="md:hidden fixed top-0 inset-x-0 z-30 flex justify-center pointer-events-none transition-opacity duration-150"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translateY(${Math.max(pull - 28, 0)}px)`,
        }}
      >
        <div className="mt-2 flex items-center gap-2 rounded-full bg-surface border border-border-soft px-3 py-1.5 card-shadow text-[12px] text-text-secondary">
          <RefreshCw
            className={`w-4 h-4 text-emerald ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: refreshing ? undefined : `rotate(${progress * 180}deg)` }}
          />
          <span>{refreshing ? "מרענן..." : progress >= 1 ? "שחרר לרענון" : "משוך לרענון"}</span>
        </div>
      </div>
      {children}
    </>
  );
}
