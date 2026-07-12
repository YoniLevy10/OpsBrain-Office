import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card, Badge, KpiCard, SectionHeading } from "@/components/ui/Primitives";
import { MobileCard, MobileCardList, MobileCardRow } from "@/components/ui/MobileCard";
import { formatCurrency } from "@/lib/data";
import { getFinanceBundle } from "@/lib/queries";
import {
  withResolvedStatus,
  enrichClients,
  incomeForClient,
  buildNotifications,
  isAllLive,
  sumPaidIncome,
  sumByStatus,
  resolveIncomeStatus,
} from "@/lib/analytics";
import { Mail, Phone, ArrowRight, Wallet, AlertCircle, TrendingUp } from "lucide-react";
import { IncomeStatusSelect } from "@/components/income/IncomeStatusSelect";
import { ClientEditButton } from "@/components/records/ClientEditButton";

export const revalidate = 45;

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = await getFinanceBundle();
  const live = isAllLive([bundle.live.clients, bundle.live.income]);
  const incomeEntries = withResolvedStatus(bundle.income);
  const clients = enrichClients(bundle.clients, incomeEntries);
  const client = clients.find((c) => c.id === id);

  if (!client) notFound();

  const clientIncome = incomeForClient(incomeEntries, client.id, client.company);
  const paid = sumPaidIncome(clientIncome);
  const outstanding = sumByStatus(clientIncome, "ממתין") + sumByStatus(clientIncome, "באיחור");
  const overdue = sumByStatus(clientIncome, "באיחור");
  const notifications = buildNotifications(incomeEntries, bundle.subscriptions);

  return (
    <div>
      <TopBar
        title={client.company}
        subtitle="פרופיל לקוח"
        live={live}
        notifications={notifications}
        action={
          <div className="flex items-center gap-2">
            <ClientEditButton client={client} />
            <Link
              href="/clients"
              className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-emerald transition-colors px-3 py-2 rounded-lg border border-border-soft"
            >
              <ArrowRight className="w-4 h-4" />
              כל הלקוחות
            </Link>
          </div>
        }
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard label="הכנסה ששולמה" value={formatCurrency(paid)} icon={TrendingUp} accent="emerald" />
          <KpiCard label="יתרה פתוחה" value={formatCurrency(outstanding)} icon={Wallet} accent="blue" />
          <KpiCard label="באיחור" value={formatCurrency(overdue)} icon={AlertCircle} accent="rose" />
          <KpiCard label="חשבוניות" value={String(clientIncome.length)} icon={Wallet} accent="brass" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-5 lg:col-span-1">
            <SectionHeading title="פרטי קשר" />
            <div className="space-y-3 mt-3 text-[13.5px]">
              {client.contact && (
                <div>
                  <div className="text-[11px] text-text-tertiary mb-0.5">איש קשר</div>
                  <div className="font-medium">{client.contact}</div>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:text-emerald truncate">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Phone className="w-4 h-4 shrink-0" />
                  <a href={`tel:${client.phone}`} className="hover:text-emerald">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.vat && (
                <div>
                  <div className="text-[11px] text-text-tertiary mb-0.5">ח.פ / ע.מ</div>
                  <div className="font-mono text-[13px]">{client.vat}</div>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Badge label={client.status} />
                {client.activeSince && (
                  <span className="text-[12px] text-text-tertiary">לקוח מאז {client.activeSince}</span>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-2 overflow-hidden">
            <SectionHeading title="חשבוניות ותשלומים" subtitle={`${clientIncome.length} רשומות`} />
            <MobileCardList
              isEmpty={clientIncome.length === 0}
              emptyMessage="אין חשבוניות ללקוח זה"
            >
              {clientIncome.map((i) => (
                <MobileCard key={i.id}>
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-[14px] truncate">{i.project || i.invoiceNumber || "—"}</div>
                      <div className="text-[12px] text-text-tertiary">{i.date}</div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="font-nums font-semibold">{formatCurrency(i.amount, i.currency)}</div>
                      <IncomeStatusSelect id={i.id} status={resolveIncomeStatus(i)} />
                    </div>
                  </div>
                </MobileCard>
              ))}
            </MobileCardList>

            <div className="hidden md:block overflow-x-auto mt-3">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-border-soft text-text-tertiary text-[12px]">
                    <th className="text-start font-medium px-4 py-3">פרויקט</th>
                    <th className="text-start font-medium px-4 py-3">מס׳ חשבונית</th>
                    <th className="text-start font-medium px-4 py-3">סכום</th>
                    <th className="text-start font-medium px-4 py-3">תאריך</th>
                    <th className="text-start font-medium px-4 py-3">סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {clientIncome.map((i) => (
                    <tr key={i.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/60">
                      <td className="px-4 py-3.5">{i.project || "—"}</td>
                      <td className="px-4 py-3.5 font-mono text-[12.5px]">{i.invoiceNumber || "—"}</td>
                      <td className="px-4 py-3.5 font-nums font-semibold">
                        {formatCurrency(i.amount, i.currency)}
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary">{i.date}</td>
                      <td className="px-4 py-3.5">
                        <IncomeStatusSelect id={i.id} status={resolveIncomeStatus(i)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
