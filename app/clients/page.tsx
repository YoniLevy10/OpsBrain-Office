import { TopBar } from "@/components/layout/TopBar";
import { Card, Badge, KpiCard } from "@/components/ui/Primitives";
import { MobileCard, MobileCardList, MobileCardRow } from "@/components/ui/MobileCard";
import { AddRecordPanel, Field, SelectField } from "@/components/ui/AddRecordPanel";
import { formatCurrency } from "@/lib/data";
import { fetchClients, fetchIncome, fetchSubscriptions } from "@/lib/queries";
import { addClient } from "@/app/actions";
import {
  enrichClients,
  withResolvedStatus,
  buildNotifications,
  isAllLive,
} from "@/lib/analytics";
import { Mail, Phone, Users, Wallet, AlertCircle } from "lucide-react";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { ClientEditButton } from "@/components/records/ClientEditButton";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clientsRes, incomeRes, subsRes] = await Promise.all([
    fetchClients(),
    fetchIncome(),
    fetchSubscriptions(),
  ]);

  const live = isAllLive([clientsRes.live, incomeRes.live, subsRes.live]);
  const incomeEntries = withResolvedStatus(incomeRes.rows);
  const clients = enrichClients(clientsRes.rows, incomeEntries);
  const notifications = buildNotifications(incomeEntries, subsRes.rows);

  const totalRevenue = clients.reduce((s, c) => s + c.revenue, 0);
  const totalOutstanding = clients.reduce((s, c) => s + c.outstanding, 0);
  const activeCount = clients.filter((c) => c.status === "פעיל").length;

  return (
    <div>
      <TopBar
        title="לקוחות"
        subtitle={`${clients.length} לקוחות · ${activeCount} פעילים`}
        live={live}
        notifications={notifications}
        action={
          <AddRecordPanel buttonLabel="לקוח חדש" title="הוספת לקוח" action={addClient}>
            <Field label="שם חברה" name="company" required placeholder="לדוגמה: נכסי הרימון" />
            <Field label="איש קשר" name="contact" placeholder="שם מלא" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="אימייל" name="email" type="email" />
              <Field label="טלפון" name="phone" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="הכנסה מצטברת (₪)" name="revenue" type="number" defaultValue="0" />
              <Field label="יתרה פתוחה (₪)" name="outstanding" type="number" defaultValue="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="לקוח מאז" name="active_since" type="date" />
              <SelectField label="סטטוס" name="status" options={["פעיל", "לא פעיל"]} />
            </div>
          </AddRecordPanel>
        }
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <KpiCard label="לקוחות פעילים" value={String(activeCount)} icon={Users} accent="emerald" />
          <KpiCard label="הכנסה מצטברת" value={formatCurrency(totalRevenue)} icon={Wallet} accent="blue" />
          <KpiCard label="יתרה פתוחה" value={formatCurrency(totalOutstanding)} icon={AlertCircle} accent="rose" />
        </div>

        <MobileCardList
          isEmpty={clients.length === 0}
          emptyMessage="אין עדיין לקוחות — הוסף את הראשון עם הכפתור למעלה"
        >
          {clients.map((c) => (
            <MobileCard key={c.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-[14px]">{c.company}</div>
                  {c.contact && <div className="text-[12px] text-text-secondary mt-0.5">{c.contact}</div>}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <ClientEditButton client={c} />
                  <Badge label={c.status} />
                  <DeleteButton table="clients" id={c.id} />
                </div>
              </div>
              <MobileCardRow label="הכנסה מצטברת" value={<span className="font-nums font-semibold">{formatCurrency(c.revenue)}</span>} />
              <MobileCardRow
                label="יתרה פתוחה"
                value={
                  c.outstanding > 0 ? (
                    <span className="font-nums font-semibold text-rose">{formatCurrency(c.outstanding)}</span>
                  ) : (
                    <span className="text-text-tertiary">—</span>
                  )
                }
              />
              <MobileCardRow label="לקוח מאז" value={c.activeSince || "—"} />
              {(c.email || c.phone) && (
                <div className="flex flex-wrap gap-3 text-[12px] text-text-tertiary pt-1">
                  {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                </div>
              )}
            </MobileCard>
          ))}
        </MobileCardList>

        <Card className="overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-border-soft text-text-tertiary text-[12px]">
                  <th className="text-start font-medium px-5 py-3.5">חברה</th>
                  <th className="text-start font-medium px-5 py-3.5">איש קשר</th>
                  <th className="text-start font-medium px-5 py-3.5">הכנסה מצטברת</th>
                  <th className="text-start font-medium px-5 py-3.5">יתרה פתוחה</th>
                  <th className="text-start font-medium px-5 py-3.5">לקוח מאז</th>
                  <th className="text-start font-medium px-5 py-3.5">סטטוס</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-border-soft last:border-0 hover:bg-surface-hover/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold">{c.company}</div>
                      <div className="flex items-center gap-3 text-[12px] text-text-tertiary mt-1">
                        {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                        {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{c.contact}</td>
                    <td className="px-5 py-4 font-nums font-semibold">{formatCurrency(c.revenue)}</td>
                    <td className="px-5 py-4 font-nums">
                      {c.outstanding > 0 ? (
                        <span className="text-rose font-semibold">{formatCurrency(c.outstanding)}</span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{c.activeSince || "—"}</td>
                    <td className="px-5 py-4"><Badge label={c.status} /></td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-0.5">
                        <ClientEditButton client={c} />
                        <DeleteButton table="clients" id={c.id} />
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-text-tertiary text-[13px]">
                      אין עדיין לקוחות — הוסף את הראשון עם הכפתור למעלה
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
