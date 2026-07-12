const ERROR_MAP: Record<number, string> = {
  401: "פג תוקף האימות — נסה שוב",
  1003: "אין עסק פעיל בחשבון Morning",
  1006: "המנוי פג תוקף",
  1007: "אין הרשאה לפעולה זו",
  1012: "הפיצ'ר דורש מנוי גבוה יותר",
  1110: "מחיר לא תקין בשורת פריט",
  1111: "סכום התשלום לא תואם לסה״כ המסמך — ודא שהסכום כולל מע״מ בקבלה",
  1112: "חסר שם לקוח במסמך",
  1113: "חסר תיאור לשורת פריט",
  1200: "סוג מסמך לא נתמך במנוי שלך",
  2002: "פרטי התחברות שגויים",
  2102: "לא ניתן להוסיף עסקים נוספים במנוי זה",
};

export function parseGiApiError(body: string, status: number): string {
  try {
    const data = JSON.parse(body) as {
      errorCode?: number;
      errorMessage?: string;
      error?: string;
      message?: string;
    };
    const code = data.errorCode;
    if (code != null && ERROR_MAP[code]) {
      return ERROR_MAP[code];
    }
    if (data.errorMessage) return data.errorMessage;
    if (data.message) return data.message;
    if (data.error) return data.error;
  } catch {
    /* fall through */
  }
  return `שגיאת Morning (${status}): ${body.slice(0, 200)}`;
}

export function mapPaymentTypeLabel(type: number): string {
  const labels: Record<number, string> = {
    0: "ניכוי במקור",
    1: "מזומן",
    2: "צ'ק",
    3: "אשראי",
    4: "העברה בנקאית",
    5: "PayPal",
    10: "אפליקציית תשלום",
    11: "אחר",
  };
  return labels[type] ?? "אחר";
}
