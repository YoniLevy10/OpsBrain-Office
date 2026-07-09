"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, Calendar, X } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import type { Notification } from "@/lib/analytics";

export function NotificationsButton({ notifications }: { notifications: Notification[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const count = notifications.length;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="התראות"
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg bg-surface border border-border-soft flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
      >
        <Bell className="w-[17px] h-[17px]" strokeWidth={2} />
        {count > 0 && (
          <span className="absolute -top-1 -start-1 w-4 h-4 rounded-full bg-rose text-[9px] font-bold text-white flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 end-0 w-80 bg-surface border border-border rounded-xl card-shadow z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
            <span className="text-[13px] font-semibold">התראות</span>
            <button onClick={() => setOpen(false)} aria-label="סגור" className="text-text-tertiary hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-[13px] text-text-tertiary px-4 py-8 text-center">אין התראות חדשות</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-border-soft last:border-0 hover:bg-surface-hover/50">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${n.type === "overdue" ? "bg-rose/10 text-rose" : "bg-blue/10 text-blue"}`}>
                    {n.type === "overdue" ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium">{n.title}</div>
                    <div className="text-[11.5px] text-text-tertiary mt-0.5">{n.body}</div>
                  </div>
                  {n.amount !== undefined && (
                    <span className="font-nums text-[12px] font-semibold text-rose shrink-0">
                      {formatCurrency(n.amount)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
