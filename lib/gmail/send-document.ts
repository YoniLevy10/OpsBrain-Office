import { getDocumentDownloadLinks } from "../greeninvoice/documents";
import { logGiAction } from "../greeninvoice/action-log";
import type { GiActionResult } from "../greeninvoice/types";
import { getGmailConnectionStatus, sendCompanyEmail } from "./store";

export async function sendGiDocumentViaGmail(
  documentId: string,
  emails: string[],
  options?: { incomeId?: string; clientId?: string; subject?: string }
): Promise<GiActionResult> {
  const status = await getGmailConnectionStatus();
  if (!status.connected) {
    return { ok: false, error: "Gmail לא מחובר — חבר מייל בהגדרות" };
  }

  try {
    const links = await getDocumentDownloadLinks(documentId);
    const pdfUrl = links.he || links.origin || links.en;
    if (!pdfUrl) return { ok: false, error: "לא נמצא קישור PDF" };

    const pdfRes = await fetch(pdfUrl, { cache: "no-store" });
    if (!pdfRes.ok) return { ok: false, error: "הורדת PDF נכשלה" };
    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    const subject = options?.subject ?? "מסמך מחשבונית ירוקה";
    const body = "שלום,\n\nמצורף המסמך שביקשת.\n\nבברכה";

    for (const to of emails) {
      await sendCompanyEmail({
        to,
        subject,
        body,
        attachments: [
          {
            filename: `document-${documentId}.pdf`,
            mimeType: "application/pdf",
            content: pdfBuffer,
          },
        ],
      });
    }

    await logGiAction({
      incomeId: options?.incomeId,
      clientId: options?.clientId,
      giDocumentId: documentId,
      actionType: "send_email",
      status: "sent",
      sentTo: emails,
    });

    return { ok: true, documentId, sent: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה בשליחה דרך Gmail" };
  }
}
