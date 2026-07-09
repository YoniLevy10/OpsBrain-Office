import { TopBar } from "@/components/layout/TopBar";
import { Card, KpiCard, Badge, SectionHeading } from "@/components/ui/Primitives";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  clients,
  subscriptions,
  cashFlowSeries,
  expenseByCategory,
  formatCurrency,
  totalMonthlyIncome,
  totalMonthlyExpenses,
  totalMonthlyRecurring,
  totalOutstanding,
} from "@/lib/data";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { CategoryDonut } from "@/components/charts/CategoryDonut";

export default function DashboardPage() {
  const income = totalMonthlyIncome();
  const expenses = totalMonthlyExpenses();
  const profit = income - expenses;
  const recurring = totalMonthlyRecurring();
  const outstanding = totalOutstanding();
  const activeClients = clients.filter((c) => c.status === "פעיל").length;

  const recentActivity = [
    { label: "שרה נבות שילמה חשבונית INV-1042", amount: "+₪500", positive: true },
    { label: "מנוי Claude חויב אוטומטית", amount: "-₪74", positive: false },
    { label: "לקוח חדש: נכסי הרימון", amount: "", positive: true },
    { label: "חשבונית INV-1039 באיחור", amount: "₪1,500", positive: false },
  ];

  return (
    <div className="pb-16">
      <TopBar
        title="לוח בקרה"
        subtitle="סקירה כללית של מצב העסק — עודכן היום, 09:40"
        actionLabel="הוסף רשומה"
      />

      <div className="px-6 md:px-9 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="הכנסה חודשית" value={formatCurrency(income)} delta="+18%" icon={TrendingUp} accent="emerald" />
          <KpiCard label="הוצאה חודשית" value={formatCurrency(expenses)} delta="+7%" deltaDirection="down" icon={TrendingDown} accent="rose" />
          <KpiCard label="רווח נקי" value={formatCurrency(profit)} delta="+24%" icon={Wallet} accent="brass" />
          <KpiCard label="לקוחות פעילים" value={String(activeClients)} delta="+1 החודש" icon={Users} accent="blue" />
        </div>

        <Card className="p-5 flex items-start gap-4 border-emerald/20 bg-gradient-to-l from-emerald/[0.06] to-transparent">
          <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-[18px] h-[18px] text-emerald" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold mb-1">תובנת AI</div>
            <p className="text-[13.5px] text-text-secondary leading-relaxed">
              ההכנסות עלו ב-18% ביחס לחודש שעבר, בעיקר בזכות ההקמה החדשה אצל נכסי הרימון. סך ההוצאות על כלי AI (Claude + ChatGPT) עומד על ₪148/חודש — שווה לבדוק אם יש כפילות שימוש. ₪1,500 מחשבונית INV-1039 באיחור מעל 3 שבועות.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <SectionHeading title="מגמת תזרים מזומנים" subtitle="הכנסות מול הוצאות — 7 חודשים אחרונים" />
            <CashFlowChart data={cashFlowSeries} />
          </Card>

          <Card className="p-5">
            <SectionHeading title="פילוח הוצאות" subtitle="לפי קטגוריה, החודש" />
            <CategoryDonut data={expenseByCategory} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <SectionHeading title="אירועים קרובים" subtitle="תשלומים, חשבוניות ומנויים בשבועיים הקרובים" />
            <div className="divide-y divide-border-soft">
              {subscriptions.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-[11px] font-bold text-blue">
                      {s.vendor.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-medium">{s.vendor}</div>
                      <div className="text-[12px] text-text-tertiary">חיוב הבא: {s.nextCharge}</div>
                    </div>
                  </div>
                  <span className="font-nums text-[13px] font-semibold">
                    {formatCurrency(s.priceILS)}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="/subscriptions"
              className="mt-4 flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-emerald transition-colors w-fit"
            >
              כל המנויים
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </Card>

          <Card className="p-5">
            <SectionHeading title="פעילות אחרונה" />
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <p className="text-[13px] text-text-secondary leading-snug">{a.label}</p>
                  {a.amount && (
                    <span
                      className={`font-nums text-[12.5px] font-semibold shrink-0 ${
                        a.positive ? "text-emerald" : "text-rose"
                      }`}
                    >
                      {a.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">יתרה פתוחה מלקוחות</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(outstanding)}</div>
            </div>
            <Badge label="ממתין" />
          </Card>
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">הכנסה חוזרת חודשית (MRR)</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(1000)}</div>
            </div>
            <Badge label="פעיל" />
          </Card>
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-text-secondary">מנויים חוזרים חודשיים</div>
              <div className="font-nums text-[20px] font-bold mt-1">{formatCurrency(recurring)}</div>
            </div>
            <Badge label="פעיל" />
          </Card>
        </div>
      </div>
    </div>
  );
}
