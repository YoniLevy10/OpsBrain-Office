"use client";

import { EditRecordPanel } from "@/components/ui/EditRecordPanel";
import { Field, SelectField } from "@/components/ui/AddRecordPanel";
import { updateSubscription } from "@/app/actions";
import type { Subscription } from "@/lib/data";

const categories = ["AI", "אחסון", "תוכנה", "מאגר מידע", "משרד", "שיווק", "אחר"];

export function SubscriptionEditButton({ sub }: { sub: Subscription }) {
  return (
    <EditRecordPanel title="עריכת מנוי" action={updateSubscription}>
      <input type="hidden" name="id" value={sub.id} />
      <Field label="ספק" name="vendor" required defaultValue={sub.vendor} />
      <SelectField label="קטגוריה" name="category" options={categories} defaultValue={sub.category} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="מחיר" name="price" type="number" required defaultValue={String(sub.price)} />
        <SelectField label="מטבע" name="currency" options={["USD", "ILS"]} defaultValue={sub.currency} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="שער המרה" name="rate" type="number" defaultValue="3.7" />
        <SelectField label="מחזור חיוב" name="billing_cycle" options={["חודשי", "שנתי"]} defaultValue={sub.billingCycle} />
      </div>
      <Field label="חיוב הבא" name="next_charge" type="date" defaultValue={sub.nextCharge} />
      <SelectField label="סטטוס" name="status" options={["פעיל", "מושהה"]} defaultValue={sub.status} />
    </EditRecordPanel>
  );
}
