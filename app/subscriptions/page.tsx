import { TopBar } from "@/components/layout/TopBar";
import { Card, KpiCard, Badge } from "@/components/ui/Primitives";
import { AddRecordPanel, Field, SelectField } from "@/components/ui/AddRecordPanel";
import { formatCurrency } from "@/lib/data";
import { fetchSubscriptions, fetchIncome } from "@/lib/queries";
import { addSubscription } from "@/app/actions";
import { withResolvedStatus, buildNotifications, isAllLive } from "@/lib/analytics";
import { RefreshCw, Calendar, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

const categories = ["AI", "אחסון", "תוכנה", "מאגר מידע", "משרד", "שיווק", "אחר"];

export default async function SubscriptionsPage() {
  const [subsRes, incomeRes] = await Promise.all([fetchSubscriptions(), fetchIncome()]);
  const live = isAllLive([subsRes.live, incomeRes.live]);
  const subscriptions = subsRes.rows;
  const notifications = buildNotifications(withResolvedStatus(incomeRes.rows), subscriptions);

  const monthlyTotal = subscriptions
    .filter((s) => s.status === "פעיל" && s.billingCycle === "חודשי")
    .reduce((s, x) => s + x.priceILS, 0);
  const annualProjection = monthlyTotal * 12;
  const activeCount = subscriptions.filter((s) => s.status === "פעיל").length;

  return (
    <div>
      <TopBar
        title="מנויים"
        subtitle="כל הכלים והתשתיות שאתה משלם עליהם"
        live={live}
        notifications={notifications}
        action={
          <AddRecordPanel buttonLabel="מנוי חדש" title="הוספת מנוי" action={addSubscription}>
            <Field label="ספק" name="vendor" required placeholder="לדוגמה: Cursor" />
            <SelectField label="קטגוריה" name="category" options={categories} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="מחיר" name="price" type="number" required />
              <SelectField label="מטבע" name="currency" options={["USD", "ILS"]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="שער המרה (אם USD)" name="rate" type="number" defaultValue="3.7" />
              <SelectField label="מחזור חיוב" name="billing_cycle" options={["חודשי", "שנתי"]} />
            </div>
            <Field label="חיוב הבא" name="next_charge" type="date" />
          </AddRecordPanel>
        }
      />

      <div className="px-4 sm:px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <KpiCard label="עלות חודשית כוללת" value={formatCurrency(monthlyTotal)} icon={RefreshCw} accent="blue" />
          <KpiCard label="תחזית שנתית" value={formatCurrency(annualProjection)} icon={Calendar} accent="brass" />
          <KpiCard label="מנויים פעילים" value={String(activeCount)} icon={Layers} accent="emerald" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center text-[13px] font-bold text-blue">
                  {s.vendor.slice(0, 2)}
                </div>
                <Badge label={s.status} />
              </div>
              <div className="font-semibold text-[14.5px]">{s.vendor}</div>
              <div className="text-[12px] text-text-tertiary mt-0.5">{s.category}</div>

              <div className="flex items-end justify-between mt-4">
                <div>
                  <div className="font-nums text-[19px] font-bold">{formatCurrency(s.priceILS)}</div>
                  <div className="text-[11.5px] text-text-tertiary">
                    {s.currency === "USD" && `$${s.price} · `}
                    {s.billingCycle}
                  </div>
                </div>
                <div className="text-[11.5px] text-text-secondary text-left">
                  חיוב הבא
                  <div className="font-nums text-[12.5px] font-medium">{s.nextCharge}</div>
                </div>
              </div>
            </Card>
          ))}
          {subscriptions.length === 0 && (
            <Card className="p-10 col-span-full text-center text-text-tertiary text-[13px]">
              אין עדיין מנויים — הוסף את הראשון עם הכפתור למעלה
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
