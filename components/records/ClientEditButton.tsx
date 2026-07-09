"use client";

import { EditRecordPanel } from "@/components/ui/EditRecordPanel";
import { Field, SelectField } from "@/components/ui/AddRecordPanel";
import { updateClient } from "@/app/actions";
import type { Client } from "@/lib/data";

export function ClientEditButton({ client }: { client: Client }) {
  return (
    <EditRecordPanel title="עריכת לקוח" action={updateClient}>
      <input type="hidden" name="id" value={client.id} />
      <Field label="שם חברה" name="company" required defaultValue={client.company} />
      <Field label="איש קשר" name="contact" defaultValue={client.contact} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="אימייל" name="email" type="email" defaultValue={client.email} />
        <Field label="טלפון" name="phone" defaultValue={client.phone} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="הכנסה מצטברת (₪)" name="revenue" type="number" defaultValue={String(client.revenue)} />
        <Field label="יתרה פתוחה (₪)" name="outstanding" type="number" defaultValue={String(client.outstanding)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="לקוח מאז" name="active_since" type="date" defaultValue={client.activeSince} />
        <SelectField label="סטטוס" name="status" options={["פעיל", "לא פעיל"]} defaultValue={client.status} />
      </div>
    </EditRecordPanel>
  );
}
