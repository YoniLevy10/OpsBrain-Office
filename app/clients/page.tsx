import { TopBar } from "@/components/layout/TopBar";
import { Card, Badge } from "@/components/ui/Primitives";
import { AddRecordPanel, Field, SelectField } from "@/components/ui/AddRecordPanel";
import { formatCurrency } from "@/lib/data";
import { fetchClients } from "@/lib/queries";
import { addClient } from "@/app/actions";
import { Mail, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { rows: clients, live } = await fetchClients();

  return (
    <div className="pb-16">
      <TopBar
        title="לקוחות"
        subtitle={`${clients.length} לקוחות · ${clients.filter((c) => c.status === "פעיל").length} פעילים`}
        live={live}
        action={
          <AddRecordPanel buttonLabel="לקוח חדש" title="הוספת לקוח" action={addClient}>
            <Field label="שם חברה" name="company" required placeholder="לדוגמה: נכסי הרימון" />
            <Field label="איש קשר" name="contact" placeholder="שם מלא" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="אימייל" name="email" type="email" />
              <Field label="טלפון" name="phone" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="הכנסה מצטברת (₪)" name="revenue" type="number" defaultValue="0" />
              <Field label="יתרה פתוחה (₪)" name="outstanding" type="number" defaultValue="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="לקוח מאז" name="active_since" type="date" />
              <SelectField label="סטטוס" name="status" options={["פעיל", "לא פעיל"]} />
            </div>
          </AddRecordPanel>
        }
      />

      <div className="px-6 md:px-9">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-border-soft text-text-tertiary text-[12px]">
                  <th className="text-start font-medium px-5 py-3.5">חברה</th>
                  <th className="text-start font-medium px-5 py-3.5">איש קשר</th>
                  <th className="text-start font-medium px-5 py-3.5">הכנסה מצטברת</th>
                  <th className="text-start font-medium px-5 py-3.5">יתרה פתוחה</th>
                  <th className="text-start font-medium px-5 py-3.5">לקוח מאז</th>
                  <th className="text-start font-medium px-5 py-3.5">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border-soft last:border-0 hover:bg-surface-hover/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold">{c.company}</div>
                      <div className="flex items-center gap-3 text-[12px] text-text-tertiary mt-1">
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {c.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{c.contact}</td>
                    <td className="px-5 py-4 font-nums font-semibold">
                      {formatCurrency(c.revenue)}
                    </td>
                    <td className="px-5 py-4 font-nums">
                      {c.outstanding > 0 ? (
                        <span className="text-rose font-semibold">{formatCurrency(c.outstanding)}</span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{c.activeSince}</td>
                    <td className="px-5 py-4">
                      <Badge label={c.status} />
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-text-tertiary text-[13px]">
                      אין עדיין לקוחות — הוסף את הראשון עם הכפתור למעלה
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
