"use client";

import { useState, useTransition, ReactNode } from "react";
import { Plus, X, Loader2 } from "lucide-react";

export function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-text-secondary font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        step={type === "number" ? "0.01" : undefined}
        className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10 transition-colors placeholder:text-text-tertiary"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-text-secondary font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]}
        className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10 transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AddRecordPanel({
  buttonLabel,
  title,
  action,
  children,
}: {
  buttonLabel: string;
  title: string;
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        setOpen(false);
      } else {
        setError(result.error ?? "שגיאה לא ידועה");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-emerald text-white font-semibold text-[13px] px-3 sm:px-4 py-2.5 rounded-lg hover:bg-emerald/90 transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto card-shadow">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-[16px] font-bold">{title}</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="סגור"
                className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form action={handleSubmit} className="px-5 pb-5 space-y-3.5">
              {children}
              {error && (
                <p className="text-[12.5px] text-rose bg-rose/10 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-2 bg-emerald text-white font-semibold text-[13.5px] py-2.5 rounded-lg hover:bg-emerald/90 transition-colors disabled:opacity-50"
              >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                שמירה
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
