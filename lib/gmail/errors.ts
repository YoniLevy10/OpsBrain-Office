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
    const msg = data.error?.message || body.slice(0, 200);
    return new GmailError(msg, status);
  } catch {
    return new GmailError(`שגיאת Gmail API (${status})`, status);
  }
}
