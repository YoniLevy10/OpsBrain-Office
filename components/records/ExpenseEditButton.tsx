"use client";

import { EditRecordPanel } from "@/components/ui/EditRecordPanel";
import { Field, SelectField } from "@/components/ui/AddRecordPanel";
import { updateExpense } from "@/app/actions";
import type { ExpenseEntry } from "@/lib/data";

const categories = ["AI", "אחסון", "תוכנה", "מאגר מידע", "משרד", "שכר", "שיווק", "הנהלת חשבונות", "מיסים", "אחר"];

export function ExpenseEditButton({ entry }: { entry: ExpenseEntry }) {
  return (
    <EditRecordPanel title="עריכת הוצאה" action={updateExpense}>
      <input type="hidden" name="id" value={entry.id} />
      <Field label="ספק" name="vendor" required defaultValue={entry.vendor} />
      <SelectField label="קטגוריה" name="category" options={categories} defaultValue={entry.category} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="סכום" name="amount" type="number" required defaultValue={String(entry.amount)} />
        <SelectField label="מטבע" name="currency" options={["ILS", "USD"]} defaultValue={entry.currency} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="שער המרה" name="rate" type="number" defaultValue="3.7" />
        <Field label="תאריך" name="date" type="date" defaultValue={entry.date} />
      </div>
      <label className="flex items-center gap-2 text-[13px] text-text-secondary">
        <input type="checkbox" name="recurring" defaultChecked={entry.recurring} className="accent-emerald w-4 h-4" />
        הוצאה חוזרת
      </label>
    </EditRecordPanel>
  );
}
