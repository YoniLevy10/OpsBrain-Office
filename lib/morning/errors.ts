export class MorningError extends Error {
  readonly status?: number;
  readonly errorCode?: number;

  constructor(message: string, options?: { status?: number; errorCode?: number }) {
    super(message);
    this.name = "MorningError";
    this.status = options?.status;
    this.errorCode = options?.errorCode;
  }
}

const ERROR_MAP: Record<number, string> = {
  401: "פג תוקף האימות — נסה שוב",
  1003: "אין עסק פעיל בחשבון Morning",
  1006: "המנוי פג תוקף",
  1007: "אין הרשאה לפעולה זו",
  1012: "הפיצ'ר דורש מנוי גבוה יותר",
  1110: "מחיר לא תקין בשורת פריט",
  1111: "סכום התשלום לא תואם לסה״כ המסמך",
  1112: "חסר שם לקוח במסמך",
  1113: "חסר תיאור לשורת פריט",
  1200: "סוג מסמך לא נתמך במנוי שלך",
};

export function parseMorningApiError(body: string, status: number): MorningError {
  try {
    const data = JSON.parse(body) as {
      errorCode?: number;
      errorMessage?: string;
      error?: string;
      message?: string;
    };
    const code = data.errorCode;
    const message =
      (code != null && ERROR_MAP[code]) ||
      data.errorMessage ||
      data.message ||
      data.error ||
      `שגיאת Morning (${status})`;
    return new MorningError(message, { status, errorCode: code });
  } catch {
    return new MorningError(`שגיאת Morning (${status}): ${body.slice(0, 200)}`, { status });
  }
}

export function parseMorningAuthError(status: number, body: string, sandbox: boolean): MorningError {
  try {
    const data = JSON.parse(body) as { error?: string; error_description?: string };
    const code = data.error ?? "";
    const desc = data.error_description ?? body;

    if (code === "unauthorized_client") {
      return new MorningError("אין גישת API במנוי — נדרש מנוי Best ומעלה + מפתח API פעיל ב-Morning");
    }
    if (code === "invalid_client") {
      return new MorningError("מפתח API שגוי — בדוק clientId ו-clientSecret");
    }
    if (code === "invalid_grant") {
      return new MorningError("מפתח API פג תוקף או בוטל — צור מפתח חדש ב-Morning");
    }
    if (sandbox) {
      return new MorningError(`שגיאת אימות (sandbox): ${desc}`, { status });
    }
    return new MorningError(`שגיאת אימות Morning: ${desc}`, { status });
  } catch {
    return new MorningError(`שגיאת אימות Morning (${status}): ${body.slice(0, 200)}`, { status });
  }
}

export function mapPaymentTypeLabel(type: number): string {
  const labels: Record<number, string> = {
    [-1]: "לא שולם",
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
