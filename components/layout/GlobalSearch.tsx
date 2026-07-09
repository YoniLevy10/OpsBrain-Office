"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Users, TrendingUp, TrendingDown } from "lucide-react";
import { BrainMark } from "@/components/brand/BrainMark";
import { Modal } from "@/components/ui/Modal";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const typeIcons: Record<string, typeof Users> = {
  לקוח: Users,
  הכנסה: TrendingUp,
  הוצאה: TrendingDown,
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 250);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 bg-bg border border-border-soft rounded-lg px-3 py-2 text-[13px] text-text-tertiary hover:text-text-secondary hover:border-border transition-colors w-48 lg:w-56"
        aria-label="חיפוש"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-start truncate">חיפוש...</span>
        <kbd className="hidden lg:inline text-[10px] bg-surface-hover px-1.5 py-0.5 rounded border border-border-soft font-mono">⌘K</kbd>
      </button>

      <button
        onClick={() => setOpen(true)}
        className="sm:hidden w-9 h-9 rounded-lg bg-surface border border-border-soft flex items-center justify-center text-text-secondary"
        aria-label="חיפוש"
      >
        <Search className="w-[17px] h-[17px]" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} align="top" panelClassName="max-w-lg">
        <div className="bg-surface border border-border rounded-2xl card-shadow overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-soft">
            <Search className="w-4 h-4 text-text-tertiary shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש לקוחות, הכנסות, הוצאות..."
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-text-tertiary min-w-0"
            />
            {loading && (
              <span className="w-4 h-4 brain-loader rounded overflow-hidden inline-flex shrink-0">
                <BrainMark className="w-full h-full" variant="on-dark" />
              </span>
            )}
            <button onClick={() => setOpen(false)} aria-label="סגור" className="text-text-tertiary hover:text-text-primary shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {query.length >= 2 && !loading && results.length === 0 && (
              <p className="text-[13px] text-text-tertiary px-4 py-8 text-center">לא נמצאו תוצאות</p>
            )}
            {query.length < 2 && (
              <p className="text-[13px] text-text-tertiary px-4 py-8 text-center">הקלד לפחות 2 תווים לחיפוש</p>
            )}
            {results.map((r) => {
              const Icon = typeIcons[r.type] ?? Search;
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleSelect(r.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover/70 transition-colors text-start border-b border-border-soft last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-blue" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{r.title}</div>
                    <div className="text-[11.5px] text-text-tertiary truncate">{r.subtitle}</div>
                  </div>
                  <span className="text-[10.5px] font-semibold text-text-tertiary bg-bg px-2 py-0.5 rounded-full shrink-0">
                    {r.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}
