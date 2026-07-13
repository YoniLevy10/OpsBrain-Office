export class GmailError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GmailError";
    this.status = status;
  }
}

export function parseGoogleOAuthError(body: string, status: number): GmailError {
  try {
    const data = JSON.parse(body) as { error?: string; error_description?: string };
    const msg = data.error_description || data.error || body;
    return new GmailError(`שגיאת Google OAuth: ${msg}`, status);
  } catch {
    return new GmailError(`שגיאת Google OAuth (${status})`, status);
  }
}

export function parseGmailApiError(body: string, status: number): GmailError {
  try {
    const data = JSON.parse(body) as {
      error?: { message?: string; code?: number; status?: string };
    };
    const raw = data.error?.message || body.slice(0, 200);

    if (raw.includes("Gmail API has not been used") || raw.includes("gmail.googleapis.com")) {
      const projectMatch = raw.match(/project (\d+)/);
      const projectId = projectMatch?.[1];
      const enableUrl = projectId
        ? `https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=${projectId}`
        : "https://console.cloud.google.com/apis/library/gmail.googleapis.com";
      return new GmailError(
        `Gmail API לא מופעל ב-Google Cloud — היכנס ל-APIs & Services → Library → Gmail API → Enable. אחרי הפעלה המתן 2–5 דקות ורענן. ${enableUrl}`,
        status
      );
    }

    return new GmailError(raw, status);
  } catch {
    return new GmailError(`שגיאת Gmail API (${status})`, status);
  }
}
