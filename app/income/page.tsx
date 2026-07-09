import { TopBar } from "@/components/layout/TopBar";
import { IncomeList } from "@/components/income/IncomeList";
import { ClientSelectField } from "@/components/income/ClientSelectField";
import { AddRecordPanel, Field, SelectField } from "@/components/ui/AddRecordPanel";
import { fetchIncome, fetchSubscriptions, fetchClients } from "@/lib/queries";
import { addIncome } from "@/app/actions";
import { withResolvedStatus, buildNotifications, isAllLive } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const [incomeRes, subsRes, clientsRes] = await Promise.all([
    fetchIncome(),
    fetchSubscriptions(),
    fetchClients(),
  ]);
  const live = isAllLive([incomeRes.live, subsRes.live]);
  const incomeEntries = withResolvedStatus(incomeRes.rows);
  const notifications = buildNotifications(incomeEntries, subsRes.rows);

  return (
    <div>
      <TopBar
        title="הכנסות"
        subtitle="כל התשלומים והחשבוניות"
        live={live}
        notifications={notifications}
        action={
          <AddRecordPanel buttonLabel="הכנסה חדשה" title="הוספת הכנסה" action={addIncome}>
            <ClientSelectField clients={clientsRes.rows.map((c) => ({ id: c.id, company: c.company }))} />
            <Field label="פרויקט / תיאור" name="project" placeholder="לדוגמה: Bamakor – מנוי חודשי" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="סכום" name="amount" type="number" required />
              <SelectField label="מטבע" name="currency" options={["ILS", "USD"]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="מס׳ חשבונית" name="invoice_number" placeholder="INV-1045" />
              <Field label="תאריך" name="date" type="date" />
            </div>
            <SelectField label="סטטוס" name="status" options={["שולם", "ממתין", "באיחור", "בוטל"]} />
          </AddRecordPanel>
        }
      />

      <div className="px-4 sm:px-6 md:px-9">
        <IncomeList entries={incomeEntries} />
      </div>
    </div>
  );
}
