"use client";

import { useRef, useState } from "react";
import { importBankCsv } from "@/app/actions";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { Upload } from "lucide-react";
import Link from "next/link";

export function BankImportPanel() {
  const [bank, setBank] = useState("discount");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage("בחר קובץ CSV");
      return;
    }
    setPending(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bank", bank);
    const result = await importBankCsv(formData);
    setPending(false);
    if (result.ok) {
      setMessage(`יובאו ${result.imported} תנועות חדשות (${result.skipped} כפולות דולגו)`);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setMessage(result.error ?? "שגיאה בייבוא");
    }
  }

  return (
    <Card className="p-5">
      <SectionHeading
        title="ייבוא תנועות בנק (CSV)"
        subtitle="דיסקונט אונליין: ייצוא תנועות ל-Excel → שמירה כ-CSV (UTF-8)"
      />
      <p className="text-[13px] text-text-secondary mb-4">
        עמודות מומלצות: תאריך, תיאור, זכות, חובה.{" "}
        <Link href="/bank" className="text-emerald hover:underline">
          צפייה בתנועות
        </Link>
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="bank-name" className="text-[13px] font-medium text-text-secondary">
            בנק
          </label>
          <input
            id="bank-name"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="discount"
            className="w-full px-3 py-2.5 rounded-lg border border-border-soft bg-bg text-[13.5px]"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="bank-csv" className="text-[13px] font-medium text-text-secondary">
            קובץ CSV
          </label>
          <input
            id="bank-csv"
            ref={fileRef}
            type="file"
            accept=".csv,.txt,text/csv"
            className="w-full text-[13px] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald/10 file:text-emerald file:font-semibold"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald text-white text-[13.5px] font-semibold disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {pending ? "מייבא..." : "ייבוא"}
        </button>
      </form>
      {message && (
        <p className={`text-[13px] mt-3 ${message.includes("יובאו") ? "text-emerald" : "text-rose"}`}>
          {message}
        </p>
      )}
      <p className="text-[12px] text-text-tertiary mt-4">
        הרץ את <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">supabase/migration-bank.sql</code> ב-Supabase לפני הייבוא הראשון.
      </p>
    </Card>
  );
}
