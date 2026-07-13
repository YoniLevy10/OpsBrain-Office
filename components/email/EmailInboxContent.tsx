"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Inbox,
  Send,
  RefreshCw,
  Search,
  X,
  Loader2,
  Wifi,
  ExternalLink,
  Reply,
  ChevronDown,
  User,
} from "lucide-react";
import { Card, Badge, SectionHeading } from "@/components/ui/Primitives";
import Link from "next/link";
import {
  disconnectGmailAccount,
  fetchInboxMessage,
  fetchInboxMessages,
  sendInboxEmail,
} from "@/app/email/actions";
import { extractEmailAddress } from "@/lib/gmail/sanitize";
import { GmailDiagnosticsPanel } from "@/components/gmail/GmailDiagnosticsPanel";
import type { GmailDiagnostics } from "@/lib/gmail/diagnostics";

type MessageItem = {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  unread?: boolean;
  messageId?: string;
};

type MessageDetail = MessageItem & {
  bodyHtml?: string;
  bodyText?: string;
  references?: string;
};

type ClientLink = { id: string; company: string; email: string };

type Props = {
  configured: boolean;
  connected: boolean;
  email?: string;
  statusError?: string;
  diagnostics?: GmailDiagnostics;
  clients?: ClientLink[];
  accessDenied?: boolean;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function parseFrom(from?: string) {
  if (!from) return "—";
  const match = from.match(/^([^<]+)/);
  return (match?.[1] ?? from).trim().replace(/"/g, "");
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "ההתחברות נכשלה (סשן פג) — נסה שוב מ«הגדרות» או «מייל»",
  missing_code: "Google לא החזיר קוד אישור — נסה שוב",
  redirect_uri_mismatch:
    "כתובת Callback לא תואמת — ודא ש-GOOGLE_REDIRECT_URI ו-NEXT_PUBLIC_APP_URL מוגדרים ל-ops-brain-office.vercel.app",
  missing_service_role:
    "חסר SUPABASE_SERVICE_ROLE_KEY ב-Vercel — הוסף מ-Supabase והרץ Redeploy",
  oauth_failed: "שגיאה בהשלמת החיבור ל-Google",
  access_denied: "הגישה נדחתה — אשר את ההרשאות ב-Google",
  access_required: "נדרשת סיסמת גישה — היכנס להגדרות והזן OPSBRAIN_ACCESS_SECRET",
  setup_incomplete: "ההגדרות לא הושלמו — ראה רשימת בדיקה בהגדרות",
  not_configured: "Gmail לא מוגדר ב-Vercel",
};

function formatOAuthError(code: string, detail?: string | null): string {
  const base = OAUTH_ERROR_MESSAGES[code] ?? decodeURIComponent(code);
  if (detail && !OAUTH_ERROR_MESSAGES[code]) {
    return `${base}: ${decodeURIComponent(detail)}`;
  }
  if (detail && code === "oauth_failed") {
    return `${base}: ${decodeURIComponent(detail)}`;
  }
  return base;
}

export function EmailInboxContent({
  configured,
  connected,
  email,
  statusError,
  diagnostics,
  clients = [],
  accessDenied = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState("");

  const clientByEmail = useMemo(() => {
    const map = new Map<string, ClientLink>();
    for (const c of clients) {
      if (c.email) map.set(c.email.toLowerCase(), c);
    }
    return map;
  }, [clients]);

  const urlError = searchParams.get("error");
  const urlErrorDetail = searchParams.get("detail");
  const urlConnected = searchParams.get("connected");

  useEffect(() => {
    if (urlError) setError(formatOAuthError(urlError, urlErrorDetail));
    if (urlConnected) {
      if (connected) {
        setSendSuccess("Gmail חובר בהצלחה!");
      } else {
        setError(
          statusError ??
            "Google אישר אבל החיבור לא נשמר — בדוק SUPABASE_SERVICE_ROLE_KEY והרץ migration-gmail.sql"
        );
      }
      router.replace("/email");
    }
  }, [urlError, urlErrorDetail, urlConnected, connected, statusError, router]);

  useEffect(() => {
    if (statusError && !connected && !urlError) setError(statusError);
  }, [statusError, connected, urlError]);

  const loadMessages = useCallback(async (q?: string, append = false, pageToken?: string) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const data = await fetchInboxMessages({ q, pageToken });
      if (!data.ok) {
        setError(data.error ?? "שגיאה בטעינה");
        if (!append) setMessages([]);
        return;
      }
      setMessages((prev) => (append ? [...prev, ...(data.messages ?? [])] : data.messages ?? []));
      setNextPageToken(data.nextPageToken);
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (connected && !accessDenied) loadMessages();
  }, [connected, accessDenied, loadMessages]);

  async function openMessage(id: string) {
    setDetailLoading(true);
    setSelected(null);
    try {
      const data = await fetchInboxMessage(id);
      if (data.ok && data.message) {
        setSelected(data.message);
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, unread: false } : m))
        );
      } else if (data.error) {
        setError(data.error);
      }
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSend() {
    setSending(true);
    setSendSuccess("");
    setError("");
    try {
      const data = await sendInboxEmail({
        to: composeTo,
        subject: composeSubject,
        body: composeBody,
        replyToMessageId: selected?.messageId ?? selected?.id,
      });
      if (!data.ok) {
        setError(data.error ?? "שגיאה בשליחה");
        return;
      }
      setSendSuccess("המייל נשלח!");
      setComposeOpen(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      loadMessages(search);
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSending(false);
    }
  }

  async function disconnect() {
    const res = await disconnectGmailAccount();
    if (!res.ok) setError(res.error ?? "שגיאה בניתוק");
    else router.refresh();
  }

  function startReply() {
    if (!selected) return;
    setComposeTo(parseFrom(selected.from));
    setComposeSubject(selected.subject?.startsWith("Re:") ? selected.subject : `Re: ${selected.subject ?? ""}`);
    setComposeBody(`\n\n---\n${selected.bodyText ?? selected.snippet ?? ""}`);
    setComposeOpen(true);
  }

  function matchedClient(from?: string) {
    const addr = extractEmailAddress(from);
    return addr ? clientByEmail.get(addr) : undefined;
  }

  if (accessDenied) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <Mail className="w-12 h-12 text-brass mx-auto mb-4" />
        <h2 className="text-[17px] font-bold mb-2">נדרשת סיסמת גישה</h2>
        <p className="text-[13px] text-text-secondary mb-4">
          הזן את <code className="text-[12px]">OPSBRAIN_ACCESS_SECRET</code> בהגדרות כדי לגשת למייל.
        </p>
        <Link href="/settings" className="text-emerald text-[13px] font-semibold hover:underline">
          להגדרות →
        </Link>
      </Card>
    );
  }

  if (!configured) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <Mail className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
        <h2 className="text-[17px] font-bold mb-2">Gmail לא מוגדר</h2>
        <p className="text-[13px] text-text-secondary mb-4">
          הוסף ב-Vercel: <code className="text-[12px]">GOOGLE_CLIENT_ID</code> ו-{" "}
          <code className="text-[12px]">GOOGLE_CLIENT_SECRET</code>
        </p>
        <Link href="/settings" className="text-emerald text-[13px] font-semibold hover:underline">
          להגדרות →
        </Link>
      </Card>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        {error && (
          <div className="p-3 rounded-xl bg-rose/10 text-rose text-[13px]">{error}</div>
        )}
        <Card className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-blue" />
          </div>
          <h2 className="text-[17px] font-bold mb-2">חבר את מייל החברה</h2>
          <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
            התחברות חד-פעמית עם Google OAuth.
          </p>
          {diagnostics?.ready ? (
            <a
              href="/api/gmail/auth"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue text-white text-[14px] font-semibold hover:bg-blue/90 transition-colors"
            >
              התחבר עם Google
            </a>
          ) : (
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brass text-white text-[14px] font-semibold hover:bg-brass/90"
            >
              להגדרות — תקן חיבור
            </Link>
          )}
        </Card>
        {diagnostics && (
          <Card className="p-5">
            <h3 className="text-[14px] font-bold mb-3">בדיקת מוכנות</h3>
            <GmailDiagnosticsPanel diagnostics={diagnostics} />
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-l from-blue/[0.06] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold">מייל החברה</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-[11px] font-semibold">
                  <Wifi className="w-3 h-3" />
                  מחובר
                </span>
              </div>
              <p className="text-[12px] text-text-secondary" dir="ltr">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { setComposeOpen(true); setComposeTo(""); setComposeSubject(""); setComposeBody(""); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue text-white text-[12.5px] font-semibold hover:bg-blue/90"
            >
              <Send className="w-3.5 h-3.5" />
              כתוב מייל
            </button>
            <button
              type="button"
              onClick={() => loadMessages(search)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-[12.5px] font-medium hover:bg-surface-hover"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              רענן
            </button>
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-[12px] text-text-secondary hover:bg-surface-hover"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Gmail
            </a>
            <button
              type="button"
              onClick={disconnect}
              className="text-[11px] text-text-tertiary hover:text-rose px-2"
            >
              נתק
            </button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-3 rounded-xl bg-rose/10 text-rose text-[13px]">{error}</div>
      )}
      {sendSuccess && (
        <div className="p-3 rounded-xl bg-emerald/10 text-emerald text-[13px]">{sendSuccess}</div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadMessages(search)}
            placeholder="חיפוש במייל (לדוגמה: from:client@example.com)"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-bg text-[13px] outline-none focus:border-blue/40"
            dir="ltr"
          />
        </div>
        <button
          type="button"
          onClick={() => loadMessages(search)}
          className="px-4 py-2.5 rounded-xl border border-border text-[13px] font-medium hover:bg-surface-hover"
        >
          חפש
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-4 min-h-[min(70dvh,640px)]">
        <Card className="overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border-soft flex items-center gap-2">
            <Inbox className="w-4 h-4 text-text-tertiary" />
            <span className="text-[13px] font-semibold">תיבת דואר נכנס</span>
            <Badge label={String(messages.length)} />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border-soft">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-text-tertiary">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-[13px] text-text-tertiary py-12">אין הודעות</p>
            ) : (
              messages.map((m) => {
                const client = matchedClient(m.from);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openMessage(m.id)}
                    className={`w-full text-start px-4 py-3 hover:bg-surface-hover transition-colors ${
                      selected?.id === m.id ? "bg-blue/[0.06] border-r-2 border-blue" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-[13px] truncate ${m.unread ? "font-bold" : "font-medium"}`}>
                        {client ? client.company : parseFrom(m.from)}
                      </span>
                      <span className="text-[10px] text-text-tertiary shrink-0">{formatDate(m.date)}</span>
                    </div>
                    <div className={`text-[12.5px] truncate ${m.unread ? "font-semibold" : ""}`}>
                      {m.subject || "(ללא נושא)"}
                    </div>
                    <div className="text-[11px] text-text-tertiary truncate mt-0.5">{m.snippet}</div>
                  </button>
                );
              })
            )}
          </div>
          {nextPageToken && (
            <div className="p-3 border-t border-border-soft">
              <button
                type="button"
                onClick={() => loadMessages(search, true, nextPageToken)}
                disabled={loadingMore}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-[12px] font-medium hover:bg-surface-hover disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                טען עוד
              </button>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden flex flex-col">
          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
            </div>
          ) : !selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-tertiary">
              <Mail className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-[14px]">בחר הודעה מהרשימה לצפייה</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-border-soft">
                <h3 className="text-[15px] font-bold leading-snug">{selected.subject || "(ללא נושא)"}</h3>
                <div className="mt-2 space-y-1 text-[12px] text-text-secondary">
                  <div><span className="text-text-tertiary">מ: </span>{selected.from}</div>
                  <div><span className="text-text-tertiary">אל: </span>{selected.to}</div>
                  <div className="text-text-tertiary">{formatDate(selected.date)}</div>
                </div>
                {matchedClient(selected.from) && (
                  <Link
                    href={`/clients/${matchedClient(selected.from)!.id}`}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald/10 text-emerald text-[11px] font-semibold hover:bg-emerald/15"
                  >
                    <User className="w-3 h-3" />
                    {matchedClient(selected.from)!.company}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={startReply}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium hover:bg-surface-hover"
                >
                  <Reply className="w-3.5 h-3.5" />
                  השב
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 email-body">
                {selected.bodyHtml ? (
                  <div
                    className="prose prose-sm max-w-none text-[13px] leading-relaxed email-html"
                    dangerouslySetInnerHTML={{ __html: selected.bodyHtml }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-[13px] font-sans leading-relaxed text-text-primary">
                    {selected.bodyText ?? selected.snippet ?? ""}
                  </pre>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {composeOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/35 p-4">
          <Card className="w-full max-w-lg p-5 space-y-4 max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <SectionHeading title="כתיבת מייל" subtitle={`מ: ${email}`} />
              <button type="button" onClick={() => setComposeOpen(false)} className="p-2 rounded-lg hover:bg-surface-hover">
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block">
              <span className="text-[12px] text-text-secondary">אל</span>
              <input
                type="email"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-[13px]"
                dir="ltr"
              />
            </label>
            <label className="block">
              <span className="text-[12px] text-text-secondary">נושא</span>
              <input
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-[13px]"
              />
            </label>
            <label className="block">
              <span className="text-[12px] text-text-secondary">תוכן</span>
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={8}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-[13px] resize-y"
              />
            </label>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue text-white text-[14px] font-semibold hover:bg-blue/90 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              שלח
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
