# Morning SDK (חשבונית ירוקה)

תשתית TypeScript מלאה ל-**Morning API** — 66 endpoints, מוכנה להעתקה לפרויקטים אחרים.

## העתקה לפרויקט חדש

```bash
# העתק את התיקייה
cp -r lib/morning /path/to/your-project/lib/morning
```

### דרישות

- Node.js 18+ / Next.js / כל פרויקט TypeScript עם `fetch`
- מנוי Morning **Best** ומעלה + מפתח API (OAuth client credentials)

### משתני סביבה

```env
GREENINVOICE_API_ID=your_client_id
GREENINVOICE_API_SECRET=your_client_secret
GREENINVOICE_SANDBOX=true          # אופציונלי — sandbox
GREENINVOICE_PLUGIN_ID=...         # נדרש לקישורי תשלום
GREENINVOICE_WEBHOOK_SECRET=...    # אופציונלי — אימות webhook
```

### שימוש בסיסי

```typescript
import { MorningClient, buildDocumentPayload } from "@/lib/morning";

// מתוך env
const morning = MorningClient.fromEnv();

// או הגדרה מפורשת (מומלץ לפרויקטים חדשים)
const morning = new MorningClient({
  clientId: "...",
  clientSecret: "...",
  environment: "sandbox",
});

// בדיקת חיבור
const { ok, error } = await morning.testConnection();

// עסק נוכחי
const business = await morning.businesses.me();

// חיפוש לקוחות
const clients = await morning.clients.searchAll({ active: true });

// יצירת קבלה
const payload = buildDocumentPayload("receipt", {
  clientName: "לקוח בע״מ",
  clientEmail: "client@example.com",
  amount: 1180,
  description: "שירות חודשי",
  paymentType: 4,
});
const doc = await morning.documents.create(payload);

// תצוגה מקדימה
const preview = await morning.documents.preview(payload);

// שליחה במייל
await morning.documents.send(doc.id, { emails: ["client@example.com"] });

// קישור תשלום
import { buildPaymentFormPayload } from "@/lib/morning";
const form = buildPaymentFormPayload({ ... }, notifyUrl);
const url = await morning.payments.getFormUrl(form);
```

## מבנה התיקייה

```
lib/morning/
├── README.md           ← מדריך זה
├── index.ts            ← ייצוא ראשי
├── client.ts           ← MorningClient + OAuth
├── config.ts           ← URLs, env, webhook helpers
├── constants.ts        ← enums (סוגי מסמכים, תשלומים, מע״מ)
├── types.ts            ← TypeScript types
├── errors.ts           ← שגיאות בעברית
├── pagination.ts       ← חיפוש עם דפדוף אוטומטי
├── helpers/
│   ├── catalog.ts      ← קטלוג מסמכים + ולידציה
│   └── build-payload.ts← בניית payloads מוכנים
└── resources/          ← 66 endpoints
    ├── businesses.ts   (10)
    ├── clients.ts      (8)
    ├── suppliers.ts    (6)
    ├── items.ts        (5)
    ├── documents.ts    (15)
    ├── expenses.ts     (13)
    ├── payments.ts     (3)
    ├── partners.ts     (4)
    └── reference.ts    (4 — cache API)
```

## כיסוי API מלא (66 endpoints)

| קבוצה | Endpoints | Resource |
|--------|-----------|----------|
| עסקים | 10 | `morning.businesses.*` |
| לקוחות | 8 | `morning.clients.*` |
| ספקים | 6 | `morning.suppliers.*` |
| פריטים | 5 | `morning.items.*` |
| מסמכים | 15 | `morning.documents.*` |
| הוצאות | 13 | `morning.expenses.*` |
| תשלומים | 3 | `morning.payments.*` |
| שותפים | 4 | `morning.partners.*` |
| נתוני עזר | 4 | `morning.reference.*` |

## סוגי מסמכים נתמכים

| קוד | סוג |
|-----|-----|
| 10 | הצעת מחיר |
| 100 | הזמנה |
| 200 | תעודת משלוח |
| 300 | חשבון עסקה |
| 305 | חשבונית מס |
| 320 | חשבונית מס + קבלה |
| 330 | חשבונית זיכוי |
| 400 | קבלה |
| 405 | קבלה על תרומה |
| ... | ראה `constants.ts` |

## הערות API חשובות

- שדות: `income` (לא items), `payment` (לא payments), `remarks`, `lang`, `emails[]`
- מסמכים 320, 400, 405 **חייבים** מערך `payment`
- `client.add = true` יוצר לקוח אוטומטית בעת הנפקת מסמך
- Rate limit: ~3 בקשות/שנייה
- OAuth token: ~30 דקות (מתרענן אוטומטית)

## שכבת OpsBrain (לא portable)

התיקייה `lib/greeninvoice/` מכילה אינטגרציה ספציפית ל-OpsBrain:
- `action-log.ts` — יומן פעולות ב-Supabase
- `service.ts` — הנפקה + שמירה ל-DB
- `lib/sync.ts` — סנכרון דו-כיווני חלקי

לפרויקט חדש: השתמש רק ב-`lib/morning/`.

## מקור

מבוסס על [Morning API](https://developers.morning.co/api) / Apiary Blueprint (עודכן 2026-03-11).
