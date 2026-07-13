"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

const ERROR_LABELS: Record<string, string> = {
  redirect_uri_mismatch:
    "כתובת Callback לא תואמת — ודא ש-GOOGLE_REDIRECT_URI ב-Vercel זהה ל-Google Cloud",
  missing_service_role: "חסר SUPABASE_SERVICE_ROLE_KEY ב-Vercel",
  invalid_state: "הסשן פג — נסה שוב",
  setup_incomplete: "ההגדרות לא הושלמו",
  not_configured: "חסרים מפתחות Google",
  access_denied: "הגישה נדחתה ב-Google",
};

function GmailCompleteContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const email = params.get("email");
  const code = params.get("code");
  const detail = params.get("detail");
  const errorLabel = code ? ERROR_LABELS[code] : null;

  const isSuccess = status === "success";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function goToEmail() {
    window.location.href = "/email";
  }

  function tryAgain() {
    window.location.href = "/connect/gmail";
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center p-6 text-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gmail-complete-title"
    >
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
          isSuccess ? "bg-emerald/15 text-emerald" : "bg-rose/15 text-rose"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-10 h-10" />
        ) : (
          <XCircle className="w-10 h-10" />
        )}
      </div>

      <h1 id="gmail-complete-title" className="text-[22px] font-bold mb-2">
        {isSuccess ? "המייל חובר בהצלחה!" : "החיבור נכשל"}
      </h1>

      {isSuccess && email && (
        <p className="text-[14px] text-text-secondary mb-2" dir="ltr">
          {decodeURIComponent(email)}
        </p>
      )}

      {!isSuccess && (
        <p className="text-[13px] text-text-secondary mb-4 max-w-sm leading-relaxed">
          {errorLabel ?? (detail ? decodeURIComponent(detail) : code ?? "שגיאה לא ידועה")}
        </p>
      )}

      {isSuccess ? (
        <>
          <p className="text-[12px] text-text-tertiary mb-6 max-w-xs leading-relaxed">
            אם פתחת מ«אפליקציה במסך הבית» — לחץ על הכפתור למטה כדי לחזור לאפליקציה עם החיבור החדש.
          </p>
          <button
            type="button"
            onClick={goToEmail}
            className="inline-flex items-center justify-center gap-2 w-full max-w-xs py-3.5 rounded-xl bg-emerald text-white text-[15px] font-semibold"
          >
            <Mail className="w-5 h-5" />
            פתח תיבת דואר
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={tryAgain}
            className="py-3.5 rounded-xl bg-blue text-white text-[14px] font-semibold"
          >
            נסה שוב
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = "/settings"; }}
            className="py-3 rounded-xl border border-border text-[13px] font-medium"
          >
            להגדרות
          </button>
        </div>
      )}
    </div>
  );
}

export default function GmailCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[9999] bg-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-text-tertiary" />
        </div>
      }
    >
      <GmailCompleteContent />
    </Suspense>
  );
}
