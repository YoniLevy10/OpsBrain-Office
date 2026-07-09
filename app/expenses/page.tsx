import { TopBar } from "@/components/layout/TopBar";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AddRecordPanel, Field, SelectField } from "@/components/ui/AddRecordPanel";
import { getFinanceBundle } from "@/lib/queries";
import { addExpense } from "@/app/actions";
import { withResolvedStatus, buildNotifications, isAllLive } from "@/lib/analytics";
import { getUsdRate } from "@/lib/meta";

const categories = ["AI", "אחסון", "תוכנה", "מאגר מידע", "משרד", "שכר", "שיווק", "הנהלת חשבונות", "מיסים", "אחר"];

export const revalidate = 45;

export default async function ExpensesPage() {
  const [bundle, usdRate] = await Promise.all([getFinanceBundle(), getUsdRate()]);
  const live = isAllLive([bundle.live.expenses, bundle.live.income, bundle.live.subscriptions]);
  const notifications = buildNotifications(withResolvedStatus(bundle.income), bundle.subscriptions);

  return (
    <div>
      <TopBar
        title="הוצאות"
        subtitle="כל ההוצאות והספקים"
        live={live}
        notifications={notifications}
        action={
          <AddRecordPanel buttonLabel="הוצאה חדשה" title="הוספת הוצאה" action={addExpense}>
            <Field label="ספק" name="vendor" required placeholder="לדוגמה: Vercel" />
            <SelectField label="קטגוריה" name="category" options={categories} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="סכום" name="amount" type="number" required />
              <SelectField label="מטבע" name="currency" options={["ILS", "USD"]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="שער המרה (אם USD)" name="rate" type="number" defaultValue={String(usdRate)} />
              <Field label="תאריך" name="date" type="date" />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-text-secondary">
              <input type="checkbox" name="recurring" className="accent-emerald w-4 h-4" />
              הוצאה חוזרת
            </label>
          </AddRecordPanel>
        }
      />

      <div className="px-4 sm:px-6 md:px-9">
        <ExpenseList entries={bundle.expenses} />
      </div>
    </div>
  );
}
