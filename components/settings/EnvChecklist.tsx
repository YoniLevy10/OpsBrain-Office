import { Card, SectionHeading } from "@/components/ui/Primitives";
import { getEnvStatus, isProductionReady } from "@/lib/env";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function EnvChecklist() {
  const items = getEnvStatus();
  const ready = isProductionReady();

  return (
    <Card className="p-5">
      <SectionHeading
        title="משתני סביבה (Vercel)"
        subtitle={ready ? "כל החיבורים הנדרשים מוגדרים ✓" : "יש להשלים את ההגדרות הבאות ב-Vercel → Settings → Environment Variables"}
      />
      {!ready && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-brass/10 text-brass text-[12.5px]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>ה-SQL כבר הורץ — עכשיו הוסף את משתני הסביבה ב-Vercel ועשה Redeploy.</span>
        </div>
      )}
      <div className="space-y-0">
        {items.map((item) => (
          <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-border-soft last:border-0">
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.configured ? "bg-emerald/10 text-emerald" : item.required ? "bg-rose/10 text-rose" : "bg-brass/10 text-brass"}`}>
                {item.configured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className="text-[13px] font-medium flex items-center gap-2">
                  {item.label}
                  {item.required && <span className="text-[10px] text-rose font-semibold">חובה</span>}
                </div>
                <code className="text-[11px] text-text-tertiary mt-0.5 block">{item.hint}</code>
              </div>
            </div>
            <span className={`text-[11.5px] font-semibold shrink-0 ${item.configured ? "text-emerald" : "text-text-tertiary"}`}>
              {item.configured ? "מוגדר" : "חסר"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-bg text-[12px] text-text-secondary leading-relaxed">
        <strong className="text-text-primary">אופציונלי:</strong>{" "}
        <code className="text-[11px]">GREENINVOICE_SANDBOX=true</code> לסביבת בדיקות של חשבונית ירוקה.
      </div>
    </Card>
  );
}
