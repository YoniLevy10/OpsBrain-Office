"use client";

import { useState } from "react";

export function ClientSelectField({
  clients,
  defaultCompany,
}: {
  clients: { id: string; company: string }[];
  defaultCompany?: string;
}) {
  const initialIdx = defaultCompany
    ? clients.findIndex((c) => c.company === defaultCompany)
    : 0;
  const [mode, setMode] = useState<"select" | "new">(
    clients.length > 0 && (initialIdx >= 0 || !defaultCompany) ? "select" : "new"
  );
  const [selectedId, setSelectedId] = useState(
    initialIdx >= 0 ? clients[initialIdx]?.id ?? "" : clients[0]?.id ?? ""
  );

  if (clients.length === 0) {
    return (
      <label className="block">
        <span className="text-[12px] text-text-secondary font-medium">לקוח</span>
        <input
          name="client_name"
          required
          defaultValue={defaultCompany}
          placeholder="שם הלקוח"
          className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10 transition-colors placeholder:text-text-tertiary"
        />
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="client_id" value={mode === "select" ? selectedId : ""} />
      <label className="block">
        <span className="text-[12px] text-text-secondary font-medium">לקוח</span>
        {mode === "select" ? (
          <select
            name="client_name"
            required
            defaultValue={defaultCompany ?? clients[0]?.company}
            onChange={(e) => {
              const match = clients.find((c) => c.company === e.target.value);
              setSelectedId(match?.id ?? "");
            }}
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
            defaultValue={defaultCompany}
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
