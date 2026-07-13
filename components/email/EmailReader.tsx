"use client";

import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Reply,
  User,
  ExternalLink,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Card } from "@/components/ui/Primitives";
import { useEffect, useState } from "react";

export type EmailReaderMessage = {
  id: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  bodyHtml?: string;
  bodyText?: string;
  snippet?: string;
  unread?: boolean;
};

type ClientLink = { id: string; company: string } | undefined;

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("he-IL", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function senderInitial(from?: string) {
  const name = from?.match(/^([^<@]+)/)?.[1]?.trim().replace(/"/g, "") ?? from ?? "?";
  return name.charAt(0).toUpperCase();
}

type Props = {
  message: EmailReaderMessage | null;
  loading: boolean;
  client?: ClientLink;
  variant: "sheet" | "panel";
  onClose?: () => void;
  onReply: () => void;
};

export function EmailReader({ message, loading, client, variant, onClose, onReply }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  useEffect(() => {
    if (!message) {
      setExpanded(false);
      setShowMeta(false);
    }
  }, [message]);

  useEffect(() => {
    if (variant !== "sheet" || !message) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [variant, message]);

  useEffect(() => {
    if (!message || variant !== "sheet") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message, variant, onClose]);

  if (variant === "panel" && !message && !loading) {
    return (
      <Card className="overflow-hidden flex flex-col min-h-[min(70dvh,640px)]">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-tertiary">
          <p className="text-[14px]">בחר הודעה מהרשימה לצפייה</p>
          <p className="text-[12px] mt-1 opacity-70">לחיצה פותחת את המייל בגדול</p>
        </div>
      </Card>
    );
  }

  const shellClass =
    variant === "sheet"
      ? `fixed inset-0 z-[100] flex flex-col bg-bg email-reader-sheet ${expanded ? "email-reader-expanded" : ""}`
      : "flex flex-col min-h-0 h-full";

  const content = (
    <>
      {/* Toolbar */}
      <div
        className={`shrink-0 border-b border-border-soft bg-bg-elevated/98 backdrop-blur-md ${
          variant === "sheet" ? "pt-[max(0.75rem,env(safe-area-inset-top))]" : ""
        }`}
      >
        <div className="flex items-center gap-2 px-3 sm:px-4 py-3">
          {variant === "sheet" && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="חזרה לרשימה"
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-hover text-text-secondary shrink-0"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex items-center gap-2 text-text-tertiary text-[13px]">
                <Loader2 className="w-4 h-4 animate-spin" />
                טוען מייל...
              </div>
            ) : message ? (
              <h2 className="text-[15px] sm:text-[17px] font-bold leading-snug line-clamp-2">
                {message.subject || "(ללא נושא)"}
              </h2>
            ) : null}
          </div>
          {variant === "sheet" && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "צמצם" : "הרחב"}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-hover text-text-tertiary shrink-0"
            >
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {variant === "sheet" && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="סגור"
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-hover text-text-tertiary shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {message && !loading && (
          <div className="px-3 sm:px-4 pb-3">
            <button
              type="button"
              onClick={() => setShowMeta((v) => !v)}
              className="w-full flex items-center gap-3 text-start rounded-xl p-2.5 hover:bg-surface-hover transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-blue/15 text-blue font-bold text-[16px] flex items-center justify-center shrink-0">
                {senderInitial(message.from)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold truncate">
                  {client?.company ?? message.from?.split("<")[0]?.trim().replace(/"/g, "") ?? "—"}
                </div>
                <div className="text-[11px] text-text-tertiary">{formatDate(message.date)}</div>
              </div>
            </button>

            {showMeta && (
              <div className="mt-2 p-3 rounded-xl bg-bg border border-border-soft text-[12px] text-text-secondary space-y-1.5">
                <div className="break-all" dir="ltr">
                  <span className="text-text-tertiary">מ: </span>
                  {message.from}
                </div>
                <div className="break-all" dir="ltr">
                  <span className="text-text-tertiary">אל: </span>
                  {message.to}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {client && (
                <Link
                  href={`/clients/${client.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/10 text-emerald text-[11px] font-semibold hover:bg-emerald/15"
                >
                  <User className="w-3.5 h-3.5" />
                  {client.company}
                </Link>
              )}
              <button
                type="button"
                onClick={onReply}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue text-white text-[12px] font-semibold hover:bg-blue/90"
              >
                <Reply className="w-3.5 h-3.5" />
                השב
              </button>
              <a
                href={`https://mail.google.com/mail/u/0/#inbox/${message.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium hover:bg-surface-hover"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                ב-Gmail
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain email-reader-body">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-text-tertiary" />
          </div>
        ) : message ? (
          <div className={`p-4 sm:p-6 email-body ${expanded ? "email-body-expanded" : ""}`}>
            {message.bodyHtml ? (
              <div
                className="email-html prose max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans leading-relaxed text-text-primary email-plain-text">
                {message.bodyText ?? message.snippet ?? ""}
              </pre>
            )}
          </div>
        ) : null}
      </div>

      {/* Mobile sticky reply */}
      {variant === "sheet" && message && !loading && (
        <div
          className="shrink-0 border-t border-border-soft bg-bg-elevated/98 p-3 flex gap-2"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={onReply}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue text-white text-[14px] font-semibold"
          >
            <Reply className="w-4 h-4" />
            השב
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-border text-[13px] font-medium"
            >
              סגור
            </button>
          )}
        </div>
      )}
    </>
  );

  if (variant === "sheet") {
    if (!message && !loading) return null;
    return <div className={shellClass}>{content}</div>;
  }

  return (
    <Card className={`overflow-hidden flex flex-col min-h-[min(70dvh,640px)] ${shellClass}`}>
      {content}
    </Card>
  );
}
