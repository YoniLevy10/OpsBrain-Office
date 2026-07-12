"use client";

import { useMemo, useState } from "react";
import { User, Mail, Building2 } from "lucide-react";

export type MorningClient = {
  id: string;
  company: string;
  email: string;
};

export function MorningClientPicker({
  clients,
  value,
  onChange,
}: {
  clients: MorningClient[];
  value: string;
  onChange: (client: MorningClient | null, freeText?: string) => void;
}) {
  const [mode, setMode] = useState<"list" | "free">(clients.length ? "list" : "free");
  const [freeName, setFreeName] = useState("");

  const selected = useMemo(
    () => clients.find((c) => c.id === value) ?? clients[0] ?? null,
    [clients, value]
  );

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-border-soft bg-bg p-4 space-y-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-text-secondary">
          <User className="w-4 h-4" />
          פרטי לקוח
        </div>
        <label className="block">
          <span className="text-[12px] text-text-secondary font-medium">שם לקוח</span>
          <input
            value={freeName}
            onChange={(e) => {
              setFreeName(e.target.value);
              onChange(null, e.target.value);
            }}
            placeholder="הקלד שם לקוח"
            className="mt-1.5 w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10"
            required
          />
        </label>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-bg p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-text-secondary">
          <Building2 className="w-4 h-4" />
          לקוח
        </div>
        <button
          type="button"
          onClick={() => {
            if (mode === "list") {
              setMode("free");
              onChange(null, "");
            } else {
              setMode("list");
              if (selected) onChange(selected);
            }
          }}
          className="text-[11px] text-emerald font-medium hover:underline"
        >
          {mode === "list" ? "לקוח חדש" : "מהרשימה"}
        </button>
      </div>

      {mode === "list" ? (
        <select
          value={value || selected?.id || ""}
          onChange={(e) => {
            const c = clients.find((x) => x.id === e.target.value) ?? null;
            onChange(c);
          }}
          className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={freeName}
          onChange={(e) => {
            setFreeName(e.target.value);
            onChange(null, e.target.value);
          }}
          placeholder="שם לקוח חדש"
          className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10"
          required
        />
      )}

      {selected && mode === "list" && selected.email && (
        <div className="flex items-center gap-2 text-[12px] text-text-tertiary pt-1">
          <Mail className="w-3.5 h-3.5" />
          <span dir="ltr" className="truncate">{selected.email}</span>
        </div>
      )}
    </div>
  );
}
