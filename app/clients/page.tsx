import { TopBar } from "@/components/layout/TopBar";
import { Card, Badge } from "@/components/ui/Primitives";
import { clients, formatCurrency } from "@/lib/data";
import { Mail, Phone } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="pb-16">
      <TopBar
        title="לקוחות"
        subtitle={`${clients.length} לקוחות · ${clients.filter((c) => c.status === "פעיל").length} פעילים`}
        actionLabel="לקוח חדש"
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
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {c.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {c.phone}
                        </span>
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
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
