import { createHash } from "crypto";

export type ParsedBankRow = {
  date: string;
  description: string;
  amount: number;
  balance: number | null;
  reference: string;
  importHash: string;
};

const DATE_KEYS = ["תאריך", "תאריך ערך", "תאריך פעולה", "date", "value date"];
const DESC_KEYS = ["תיאור", "תאור", "פרטים", "פירוט", "description", "details", "memo"];
const CREDIT_KEYS = ["זכות", "הכנסה", "credit"];
const DEBIT_KEYS = ["חובה", "הוצאה", "debit"];
const AMOUNT_KEYS = ["סכום", "amount", "סכום בשקלים"];
const BALANCE_KEYS = ["יתרה", "balance", "יתרה בשקלים"];
const REF_KEYS = ["אסמכתא", "מספר אסמכתא", "reference", "ref"];

function normalizeHeader(h: string): string {
  return h.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function findColumn(headers: string[], keys: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const key of keys) {
    const idx = normalized.findIndex((h) => h === key.toLowerCase() || h.includes(key.toLowerCase()));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw
    .replace(/[₪\s]/g, "")
    .replace(/,/g, "")
    .trim();
  if (!cleaned || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    let year = dmy[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === "," || ch === ";") && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function hashRow(date: string, amount: number, description: string, reference: string): string {
  return createHash("sha256")
    .update(`${date}|${amount}|${description.trim()}|${reference.trim()}`)
    .digest("hex")
    .slice(0, 40);
}

export function parseBankCsv(text: string, bank = "discount"): { rows: ParsedBankRow[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ["הקובץ ריק או חסר שורת כותרות"] };
  }

  let headerIdx = 0;
  while (headerIdx < lines.length && !/[א-תa-z]/i.test(lines[headerIdx])) {
    headerIdx++;
  }
  if (headerIdx >= lines.length) {
    return { rows: [], errors: ["לא נמצאה שורת כותרות"] };
  }

  const headers = splitCsvLine(lines[headerIdx]);
  const dateCol = findColumn(headers, DATE_KEYS);
  const descCol = findColumn(headers, DESC_KEYS);
  const creditCol = findColumn(headers, CREDIT_KEYS);
  const debitCol = findColumn(headers, DEBIT_KEYS);
  const amountCol = findColumn(headers, AMOUNT_KEYS);
  const balanceCol = findColumn(headers, BALANCE_KEYS);
  const refCol = findColumn(headers, REF_KEYS);

  if (dateCol < 0) {
    return { rows: [], errors: ["חסרה עמודת תאריך (תאריך / תאריך ערך)"] };
  }
  if (descCol < 0 && amountCol < 0 && creditCol < 0 && debitCol < 0) {
    return { rows: [], errors: ["חסרות עמודות סכום או תיאור"] };
  }

  const rows: ParsedBankRow[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.every((c) => !c)) continue;

    const date = parseDate(cols[dateCol] ?? "");
    if (!date) {
      errors.push(`שורה ${i + 1}: תאריך לא תקין`);
      continue;
    }

    const description = (descCol >= 0 ? cols[descCol] : cols.find((c) => c.length > 2) ?? "").trim();
    const reference = refCol >= 0 ? (cols[refCol] ?? "").trim() : "";

    let amount: number | null = null;
    if (amountCol >= 0) {
      amount = parseAmount(cols[amountCol] ?? "");
    } else {
      const credit = creditCol >= 0 ? parseAmount(cols[creditCol] ?? "") : null;
      const debit = debitCol >= 0 ? parseAmount(cols[debitCol] ?? "") : null;
      if (credit && credit > 0) amount = credit;
      else if (debit && debit > 0) amount = -debit;
      else if (credit !== null && credit !== 0) amount = credit;
      else if (debit !== null && debit !== 0) amount = -Math.abs(debit);
    }

    if (amount === null || amount === 0) {
      errors.push(`שורה ${i + 1}: סכום חסר`);
      continue;
    }

    const balance = balanceCol >= 0 ? parseAmount(cols[balanceCol] ?? "") : null;

    rows.push({
      date,
      description: description || "תנועה",
      amount,
      balance,
      reference,
      importHash: hashRow(date, amount, description, reference),
    });
  }

  return { rows, errors };
}

export type ImportPreview = {
  total: number;
  credits: number;
  debits: number;
  sample: ParsedBankRow[];
};

export function previewBankImport(rows: ParsedBankRow[]): ImportPreview {
  const credits = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const debits = rows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  return {
    total: rows.length,
    credits,
    debits,
    sample: rows.slice(0, 5),
  };
}
