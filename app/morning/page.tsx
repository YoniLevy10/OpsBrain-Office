import { TopBar } from "@/components/layout/TopBar";
import { MorningHubContent } from "@/components/greeninvoice/MorningHubContent";
import { getFinanceBundle } from "@/lib/queries";
import { getLastSyncTime } from "@/lib/meta";
import {
  isGreenInvoiceConfigured,
  testGreenInvoiceConnection,
  getGreenInvoiceEnvLabel,
} from "@/lib/greeninvoice";
import { getCurrentBusiness } from "@/lib/greeninvoice/business";
import { fetchRecentGiActions } from "@/lib/greeninvoice/action-log";
import { withResolvedStatus, buildNotifications, isAllLive } from "@/lib/analytics";

export const revalidate = 30;

function formatSyncTime(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function MorningPage() {
  const [bundle, lastSync, business, actions] = await Promise.all([
    getFinanceBundle(),
    getLastSyncTime(),
    isGreenInvoiceConfigured() ? getCurrentBusiness() : Promise.resolve(null),
    fetchRecentGiActions(30),
  ]);

  const giConfigured = isGreenInvoiceConfigured();
  const giTest = giConfigured ? await testGreenInvoiceConnection() : { ok: false as const };
  const connected = giConfigured && giTest.ok;

  const incomeEntries = withResolvedStatus(bundle.income);
  const live = isAllLive([bundle.live.income, bundle.live.clients]);
  const notifications = buildNotifications(incomeEntries, bundle.subscriptions);

  const clients = bundle.clients.map((c) => ({
    id: c.id,
    company: c.company,
    email: c.email,
  }));

  return (
    <div>
      <TopBar
        title="חשבונית ירוקה"
        subtitle="Morning — קבלות, חשבוניות, תשלומים וניהול"
        live={live}
        notifications={notifications}
      />

      <div className="px-4 sm:px-6 md:px-9 pb-8">
        <MorningHubContent
          clients={clients}
          income={incomeEntries}
          connected={connected}
          envLabel={getGreenInvoiceEnvLabel()}
          businessName={business?.name}
          lastSync={formatSyncTime(lastSync)}
          actions={actions}
        />
      </div>
    </div>
  );
}
