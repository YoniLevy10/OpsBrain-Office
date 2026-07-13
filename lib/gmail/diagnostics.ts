import { hasAppAccess, isAppAccessRequired } from "../app-access";
import { getSupabaseAdmin } from "../supabase-admin";
import { gmailConfigFromEnv, getGmailAppBaseUrl, isGmailConfigured } from "./config";
import { loadGmailConnection } from "./store";

export type GmailDiagnosticItem = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type GmailDiagnostics = {
  ready: boolean;
  items: GmailDiagnosticItem[];
  redirectUri?: string;
  connectedEmail?: string;
};

export async function getGmailDiagnostics(): Promise<GmailDiagnostics> {
  const items: GmailDiagnosticItem[] = [];
  const config = gmailConfigFromEnv();
  const baseUrl = getGmailAppBaseUrl();

  items.push({
    id: "google_keys",
    label: "מפתחות Google (CLIENT_ID + SECRET)",
    ok: isGmailConfigured(),
    detail: isGmailConfigured() ? "מוגדר" : "חסר GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET ב-Vercel",
  });

  items.push({
    id: "app_url",
    label: "כתובת האפליקציה",
    ok: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    detail: process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : `לא הוגדר NEXT_PUBLIC_APP_URL (משתמש ב-${baseUrl})`,
  });

  const redirectUri = config?.redirectUri;
  items.push({
    id: "redirect_uri",
    label: "Redirect URI (חייב להיות זהה ב-Google Cloud)",
    ok: Boolean(redirectUri),
    detail: redirectUri ?? "לא ניתן לחשב",
  });

  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  items.push({
    id: "service_role",
    label: "Supabase Service Role",
    ok: hasServiceRole,
    detail: hasServiceRole
      ? "מוגדר"
      : "חסר SUPABASE_SERVICE_ROLE_KEY — בלי זה הטוקן לא נשמר אחרי OAuth",
  });

  if (hasServiceRole) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { error } = await admin.from("ob_gmail_connection").select("id").limit(1);
      items.push({
        id: "gmail_table",
        label: "טבלת ob_gmail_connection",
        ok: !error,
        detail: error
          ? `שגיאה: ${error.message} — הרץ supabase/migration-gmail.sql`
          : "קיימת ונגישה",
      });
    }
  } else {
    items.push({
      id: "gmail_table",
      label: "טבלת ob_gmail_connection",
      ok: false,
      detail: "לא ניתן לבדוק בלי SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  const accessRequired = isAppAccessRequired();
  const accessOk = await hasAppAccess();
  items.push({
    id: "access",
    label: "סיסמת גישה",
    ok: !accessRequired || accessOk,
    detail: !accessRequired
      ? "לא מוגדרת (אופציונלי)"
      : accessOk
        ? "מאומת"
        : "הזן OPSBRAIN_ACCESS_SECRET בהגדרות לפני חיבור",
  });

  let connectedEmail: string | undefined;
  try {
    const row = await loadGmailConnection();
    if (row) {
      connectedEmail = row.email;
      items.push({
        id: "stored_connection",
        label: "חיבור שמור במסד",
        ok: true,
        detail: row.email,
      });
    } else {
      items.push({
        id: "stored_connection",
        label: "חיבור שמור במסד",
        ok: false,
        detail: "אין חיבור שמור — השלם OAuth",
      });
    }
  } catch (err) {
    items.push({
      id: "stored_connection",
      label: "חיבור שמור במסד",
      ok: false,
      detail: err instanceof Error ? err.message : "שגיאה בקריאה",
    });
  }

  const blockers = ["google_keys", "service_role", "gmail_table", "access"];
  const ready = blockers.every((id) => items.find((i) => i.id === id)?.ok);

  return { ready, items, redirectUri, connectedEmail };
}
