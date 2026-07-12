"use client";

import { useMemo, useState } from "react";

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
      <label className="block">
        <span className="text-[12px] text-text-secondary font-medium">לקוח</span>
        <input
          value={freeName}
          onChange={(e) => {
            setFreeName(e.target.value);
            onChange(null, e.target.value);
          }}
          placeholder="שם הלקוח"
          className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
          required
        />
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-[12px] text-text-secondary font-medium">לקוח</span>
        {mode === "list" ? (
          <select
            value={value || selected?.id || ""}
            onChange={(e) => {
              const c = clients.find((x) => x.id === e.target.value) ?? null;
              onChange(c);
            }}
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
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
            placeholder="שם לקוח"
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50"
            required
          />
        )}
      </label>
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
        className="text-[11.5px] text-emerald hover:underline"
      >
        {mode === "list" ? "+ לקוח חדש (הקלדה חופשית)" : "← בחירה מרשימת לקוחות"}
      </button>
    </div>
  );
}
