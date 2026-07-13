import { Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { EmailInboxContent } from "@/components/email/EmailInboxContent";
import { getGmailConnectionStatus } from "@/lib/gmail/store";
import { getGmailDiagnostics } from "@/lib/gmail/diagnostics";
import { fetchClients } from "@/lib/queries";
import { hasAppAccess, isAppAccessRequired } from "@/lib/app-access";

export const dynamic = "force-dynamic";

export default async function EmailPage() {
  const status = await getGmailConnectionStatus();
  const diagnostics = await getGmailDiagnostics();
  const accessOk = await hasAppAccess();
  const { rows: clients } = await fetchClients();

  return (
    <div>
      <TopBar title="מייל" subtitle="תיבת דואר Gmail של החברה" />
      <div className="px-4 sm:px-6 md:px-9 pb-8">
        <Suspense fallback={<div className="text-center py-12 text-text-tertiary">טוען...</div>}>
          <EmailInboxContent
            configured={status.configured}
            connected={status.connected}
            email={status.email}
            statusError={status.error}
            diagnostics={diagnostics}
            clients={clients.map((c) => ({ id: c.id, company: c.company, email: c.email }))}
            accessDenied={isAppAccessRequired() && !accessOk}
          />
        </Suspense>
      </div>
    </div>
  );
}
