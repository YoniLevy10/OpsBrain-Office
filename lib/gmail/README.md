# Gmail SDK

חיבור Gmail לחברה דרך **Google OAuth 2.0** + **Gmail API**.

## למה OAuth ולא SMTP?

| | Gmail API (OAuth) | SMTP + App Password |
|--|-------------------|---------------------|
| אבטחה | טוקנים מתחדשים, הרשאות מדויקות | סיסמת אפליקציה קבועה |
| Inbox | קריאת תיבת דואר מלאה | שליחה בלבד |
| UX | "התחבר עם Google" | הגדרה ידנית |
| Google | המלצה רשמית ל-Google Workspace | פחות מומלץ ליישומים |

## הגדרה ב-Google Cloud Console

1. [console.cloud.google.com](https://console.cloud.google.com) → פרויקט חדש
2. **APIs & Services** → Enable **Gmail API**
3. **OAuth consent screen** → External / Internal (Workspace)
4. **Credentials** → Create **OAuth client ID** → Web application
5. Authorized redirect URI: `https://your-app.vercel.app/api/gmail/callback`
6. העתק Client ID + Client Secret ל-Vercel

## משתני סביבה

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/gmail/callback  # אופציונלי — נגזר אוטומטית
```

## מיגרציה

הרץ `supabase/migration-gmail.sql` ב-Supabase SQL Editor.

## שימוש

```typescript
import { getGmailAuthUrl, listInboxMessages, sendCompanyEmail } from "@/lib/gmail";

// OAuth — redirect user to getGmailAuthUrl()
// After callback, tokens stored in ob_gmail_connection

const { messages } = await listInboxMessages({ q: "from:client@example.com" });
await sendCompanyEmail({ to: "client@example.com", subject: "שלום", body: "..." });
```

## הרשאות (Scopes)

- `gmail.readonly` — קריאת תיבת דואר
- `gmail.send` — שליחה
- `gmail.compose` — טיוטות

## העתקה לפרויקט אחר

```bash
cp -r lib/gmail /your-project/lib/gmail
# + migration-gmail.sql
# + API routes under app/api/gmail/
```
