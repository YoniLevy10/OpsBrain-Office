import { hasAppAccess, isAppAccessRequired } from "../app-access";
import { getSupabaseAdmin } from "../supabase-admin";
import { gmailConfigFromEnv, getGmailAppBaseUrl, isGmailConfigured } from "./config";

export type DiagnosticSeverity = "ok" | "blocker" | "pending" | "warning";

export type GmailDiagnosticItem = {
  id: string;
  label: string;
  severity: DiagnosticSeverity;
  detail: string;
};

export type GmailDiagnostics = {
  /** True when infra is ready — OAuth can start (connection may still be pending). */
  ready: boolean;
  /** True when a Gmail account is stored in DB. */
  connected: boolean;
  items: GmailDiagnosticItem[];
  redirectUri?: string;
  connectedEmail?: string;
  supabaseUrl?: string;
};

function item(
  id: string,
  label: string,
  severity: DiagnosticSeverity,
  detail: string
): GmailDiagnosticItem {
  return { id, label, severity, detail };
}

export async function getGmailDiagnostics(): Promise<GmailDiagnostics> {
  const items: GmailDiagnosticItem[] = [];
  const config = gmailConfigFromEnv();
  const baseUrl = getGmailAppBaseUrl();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  items.push(
    item(
      "google_keys",
      "מפתחות Google",
      isGmailConfigured() ? "ok" : "blocker",
      isGmailConfigured() ? "מוגדר" : "חסר GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET"
    )
  );

  const hasAppUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL);
  items.push(
    item(
      "app_url",
      "כתובת האפליקציה",
      hasAppUrl ? "ok" : "warning",
      hasAppUrl
        ? process.env.NEXT_PUBLIC_APP_URL!
        : `לא הוגדר NEXT_PUBLIC_APP_URL (משתמש ב-${baseUrl})`
    )
  );

  const redirectUri = config?.redirectUri;
  items.push(
    item(
      "redirect_uri",
      "Redirect URI",
      redirectUri ? "ok" : "blocker",
      redirectUri ?? "לא ניתן לחשב"
    )
  );

  items.push(
    item(
      "supabase_url",
      "פרויקט Supabase",
      supabaseUrl ? "ok" : "blocker",
      supabaseUrl ?? "חסר NEXT_PUBLIC_SUPABASE_URL"
    )
  );

  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  items.push(
    item(
      "service_role",
      "Supabase Service Role",
      hasServiceRole ? "ok" : "blocker",
      hasServiceRole ? "מוגדר ב-Vercel" : "חסר SUPABASE_SERVICE_ROLE_KEY"
    )
  );

  let tableOk = false;
  let rowCount = 0;

  if (hasServiceRole && supabaseUrl) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { count, error } = await admin
        .from("ob_gmail_connection")
        .select("id", { count: "exact", head: true });

      if (error) {
        items.push(
          item(
            "gmail_table",
            "טבלת ob_gmail_connection",
            "blocker",
            error.message.includes("does not exist") || error.code === "42P01"
              ? "טבלה חסרה — הרץ migration-gmail.sql בפרויקט Supabase שמופיע למעלה"
              : `שגיאה: ${error.message} — ודא שה-Service Role שייך לאותו פרויקט`
          )
        );
      } else {
        tableOk = true;
        rowCount = count ?? 0;
        items.push(
          item(
            "gmail_table",
            "טבלת ob_gmail_connection",
            "ok",
            rowCount > 0 ? `קיימת · ${rowCount} חיבור/ים` : "קיימת · ריקה (מוכנה לחיבור)"
          )
        );
      }
    }
  } else {
    items.push(
      item(
        "gmail_table",
        "טבלת ob_gmail_connection",
        "blocker",
        "לא ניתן לבדוק — חסר Service Role או Supabase URL"
      )
    );
  }

  const accessRequired = isAppAccessRequired();
  const accessOk = await hasAppAccess();
  items.push(
    item(
      "access",
      "סיסמת גישה",
      !accessRequired ? "ok" : accessOk ? "ok" : "warning",
      !accessRequired
        ? "לא מוגדרת (אופציונלי)"
        : accessOk
          ? "מאומת"
          : "לא הוזן בסשן הנוכחי — הזן בהגדרות (לא חוסם OAuth)"
    )
  );

  let connected = false;
  let connectedEmail: string | undefined;

  if (tableOk && hasServiceRole) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const SINGLETON_ID = "00000000-0000-4000-8000-000000000001";
      const { data, error } = await admin
        .from("ob_gmail_connection")
        .select("email")
        .eq("id", SINGLETON_ID)
        .maybeSingle();

      if (error) {
        items.push(
          item("stored_connection", "חיבור Gmail", "warning", `שגיאת קריאה: ${error.message}`)
        );
      } else if (data?.email) {
        connected = true;
        connectedEmail = data.email;
        items.push(item("stored_connection", "חיבור Gmail", "ok", data.email));
      } else {
        items.push(
          item(
            "stored_connection",
            "חיבור Gmail",
            "pending",
            "טרם חובר — זה תקין. לחץ «התחבר עם Google» למטה"
          )
        );
      }
    }
  }

  const blockerIds = ["google_keys", "redirect_uri", "supabase_url", "service_role", "gmail_table"];
  const ready = blockerIds.every((id) => {
    const found = items.find((i) => i.id === id);
    return found?.severity === "ok";
  });

  return { ready, connected, items, redirectUri, connectedEmail, supabaseUrl };
}
