"use client";

import { EditRecordPanel } from "@/components/ui/EditRecordPanel";
import { Field, SelectField } from "@/components/ui/AddRecordPanel";
import { ClientSelectField } from "@/components/income/ClientSelectField";
import { updateIncome } from "@/app/actions";
import type { Client, IncomeEntry } from "@/lib/data";

const statuses = ["שולם", "ממתין", "באיחור", "בוטל"];

export function IncomeEditButton({
  entry,
  clients,
}: {
  entry: IncomeEntry;
  clients: Pick<Client, "id" | "company">[];
}) {
  return (
    <EditRecordPanel title="עריכת הכנסה" action={updateIncome}>
      <input type="hidden" name="id" value={entry.id} />
      <ClientSelectField clients={clients} defaultCompany={entry.clientName} />
      <Field label="פרויקט" name="project" defaultValue={entry.project} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="סכום" name="amount" type="number" required defaultValue={String(entry.amount)} />
        <SelectField label="מטבע" name="currency" options={["ILS", "USD"]} defaultValue={entry.currency} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="מס׳ חשבונית" name="invoice_number" defaultValue={entry.invoiceNumber} />
        <Field label="תאריך" name="date" type="date" defaultValue={entry.date} />
      </div>
      <SelectField label="סטטוס" name="status" options={statuses} defaultValue={entry.status} />
    </EditRecordPanel>
  );
}
