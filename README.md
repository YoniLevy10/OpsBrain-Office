# OpsBrain Finance

MVP של המערכת התפעולית הפיננסית של OpsBrain — נבנה לפי ה-Blueprint v1.0.

## מה יש כאן (Phase 1 — MVP)
- לוח בקרה (Dashboard) עם KPIs, גרף תזרים מזומנים, פילוח הוצאות, ותובנת AI לדוגמה
- מודול לקוחות (Clients)
- מודול הכנסות (Income) עם סטטוסים: שולם / ממתין / באיחור
- מודול הוצאות (Expenses) לפי קטגוריה + המרת מטבע
- מודול מנויים (Subscriptions) עם תחזית עלות חודשית/שנתית

כרגע כל הנתונים הם **מוק (`lib/data.ts`)** — אין עדיין חיבור אמיתי ל-Supabase.

## סטאק
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Recharts · lucide-react

## מה עוד לא נבנה (מה-Blueprint) — Phase 2+
- חיבור Supabase אמיתי (auth, RLS, טבלאות בפועל)
- Reports + Analytics עם ייצוא PDF/Excel/CSV
- אינטגרציית Morning (import אוטומטי)
- AI Assistant אמיתי (כרגע רק כרטיס תובנה סטטי)
- Notifications בזמן אמת, Global Search פונקציונלי
- Auth (Google/Apple/Email) + 2FA
- Bank/credit card integrations, OCR קבלות, תכנון תקציב

## פריסה
פרויקט Next.js רגיל — git push → auto-deploy ב-Vercel, בדיוק כמו שאר הפרויקטים שלך.

---

Bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
