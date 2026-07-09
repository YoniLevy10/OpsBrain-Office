"use client";

import { useState } from "react";

export function ClientSelectField({
  clients,
}: {
  clients: { id: string; company: string }[];
}) {
  const [mode, setMode] = useState<"select" | "new">(clients.length > 0 ? "select" : "new");

  if (clients.length === 0) {
    return (
      <label className="block">
        <span className="text-[12px] text-text-secondary font-medium">לקוח</span>
        <input
          name="client_name"
          required
          placeholder="שם הלקוח"
          className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10 transition-colors placeholder:text-text-tertiary"
        />
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-[12px] text-text-secondary font-medium">לקוח</span>
        {mode === "select" ? (
          <select
            name="client_name"
            required
            defaultValue={clients[0]?.company}
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10 transition-colors"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.company}>
                {c.company}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="client_name"
            required
            placeholder="שם לקוח חדש"
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10 transition-colors placeholder:text-text-tertiary"
          />
        )}
      </label>
      <button
        type="button"
        onClick={() => setMode(mode === "select" ? "new" : "select")}
        className="text-[11.5px] text-emerald hover:underline"
      >
        {mode === "select" ? "+ לקוח חדש (הקלדה חופשית)" : "← בחירה מרשימת לקוחות"}
      </button>
    </div>
  );
}
