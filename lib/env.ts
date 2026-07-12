import { isGreenInvoiceConfigured } from "./greeninvoice";
import { isSupabaseConfigured } from "./supabase";

export interface EnvStatus {
  key: string;
  label: string;
  configured: boolean;
  required: boolean;
  hint: string;
}

export function getEnvStatus(): EnvStatus[] {
  return [
    {
      key: "SUPABASE",
      label: "Supabase (מסד נתונים)",
      configured: isSupabaseConfigured(),
      required: true,
      hint: "NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY",
    },
    {
      key: "GREENINVOICE",
      label: "חשבונית ירוקה",
      configured: isGreenInvoiceConfigured(),
      required: true,
      hint: "GREENINVOICE_API_ID + GREENINVOICE_API_SECRET",
    },
    {
      key: "CRON",
      label: "סנכרון אוטומטי יומי",
      configured: Boolean(process.env.CRON_SECRET),
      required: false,
      hint: "CRON_SECRET — מחרוזת אקראית (לדוגמה: openssl rand -hex 32)",
    },
    {
      key: "GI_PLUGIN",
      label: "סליקה — קישורי תשלום",
      configured: Boolean(process.env.GREENINVOICE_PLUGIN_ID),
      required: false,
      hint: "GREENINVOICE_PLUGIN_ID — מזהה פלאגין סליקה מ-Morning",
    },
    {
      key: "GI_WEBHOOK",
      label: "Webhook תשלומים",
      configured: Boolean(process.env.GREENINVOICE_WEBHOOK_SECRET),
      required: false,
      hint: "GREENINVOICE_WEBHOOK_SECRET — לאימות POST /api/webhooks/greeninvoice",
    },
  ];
}

export function isProductionReady(): boolean {
  return getEnvStatus().filter((e) => e.required).every((e) => e.configured);
}
