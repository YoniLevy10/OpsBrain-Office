import { TopBar } from "@/components/layout/TopBar";
import { Card, KpiCard, Badge } from "@/components/ui/Primitives";
import { subscriptions, formatCurrency } from "@/lib/data";
import { RefreshCw, Calendar, Layers } from "lucide-react";

export default function SubscriptionsPage() {
  const monthlyTotal = subscriptions
    .filter((s) => s.status === "פעיל" && s.billingCycle === "חודשי")
    .reduce((s, x) => s + x.priceILS, 0);
  const annualProjection = monthlyTotal * 12;
  const activeCount = subscriptions.filter((s) => s.status === "פעיל").length;

  return (
    <div className="pb-16">
      <TopBar title="מנויים" subtitle="כל הכלים והתשתיות שאתה משלם עליהם" actionLabel="מנוי חדש" />

      <div className="px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  );
}
