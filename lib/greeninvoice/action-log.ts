import { getSupabase } from "../supabase";
import type { GiActionStatus, GiActionType } from "./types";

export type GiActionRow = {
  id: string;
  income_id: string | null;
  client_id: string | null;
  gi_document_id: string | null;
  action_type: GiActionType;
  status: GiActionStatus;
  payment_link_url: string | null;
  sent_to: string[] | null;
  amount: number | null;
  currency: string | null;
  metadata: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
};

export async function logGiAction(params: {
  incomeId?: string | null;
  clientId?: string | null;
  giDocumentId?: string | null;
  actionType: GiActionType;
  status: GiActionStatus;
  paymentLinkUrl?: string | null;
  sentTo?: string[];
  amount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
}): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("ob_gi_actions")
    .insert({
      income_id: params.incomeId ?? null,
      client_id: params.clientId ?? null,
      gi_document_id: params.giDocumentId ?? null,
      action_type: params.actionType,
      status: params.status,
      payment_link_url: params.paymentLinkUrl ?? null,
      sent_to: params.sentTo ?? null,
      amount: params.amount ?? null,
      currency: params.currency ?? "ILS",
      metadata: params.metadata ?? {},
      error_message: params.errorMessage ?? null,
    })
    .select("id")
    .single();

  if (error) return null;
  return data?.id ?? null;
}

export async function updateGiActionStatus(
  actionId: string,
  status: GiActionStatus,
  extra?: { paymentLinkUrl?: string; errorMessage?: string }
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const patch: Record<string, unknown> = { status };
  if (extra?.paymentLinkUrl) patch.payment_link_url = extra.paymentLinkUrl;
  if (extra?.errorMessage) patch.error_message = extra.errorMessage;
  await sb.from("ob_gi_actions").update(patch).eq("id", actionId);
}

export async function persistCreatedIncome(params: {
  giDocumentId: string;
  giDocumentType: number;
  clientId?: string | null;
  clientName: string;
  project?: string;
  amount: number;
  currency: string;
  invoiceNumber?: string;
  status: string;
  paymentLinkUrl?: string;
  pdfUrl?: string;
  incomeId?: string;
}): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const row = {
    gi_id: params.giDocumentId,
    client_id: params.clientId ?? null,
    client_name: params.clientName,
    project: params.project ?? "",
    amount: params.amount,
    currency: params.currency,
    invoice_number: params.invoiceNumber ? String(params.invoiceNumber) : "",
    status: params.status,
    date: new Date().toISOString().slice(0, 10),
    gi_document_type: params.giDocumentType,
    gi_payment_link: params.paymentLinkUrl ?? null,
    gi_pdf_url: params.pdfUrl ?? null,
    source: "created",
  };

  if (params.incomeId) {
    const { error } = await sb
      .from("ob_income")
      .update({
        gi_id: params.giDocumentId,
        gi_document_type: params.giDocumentType,
        gi_payment_link: params.paymentLinkUrl ?? null,
        gi_pdf_url: params.pdfUrl ?? null,
        source: "created",
        invoice_number: params.invoiceNumber ? String(params.invoiceNumber) : undefined,
        status: params.status,
      })
      .eq("id", params.incomeId);
    if (error) return null;
    return params.incomeId;
  }

  const { data, error } = await sb
    .from("ob_income")
    .upsert(row, { onConflict: "gi_id", ignoreDuplicates: false })
    .select("id")
    .single();

  if (error) return null;
  return data?.id ?? null;
}

export async function markIncomePaidByGiId(giDocumentId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb
    .from("ob_income")
    .update({ status: "שולם" })
    .eq("gi_id", giDocumentId);
}

export async function fetchRecentGiActions(limit = 10): Promise<GiActionRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("ob_gi_actions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as GiActionRow[];
}

export async function getClientGiId(clientId: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ob_clients").select("gi_id").eq("id", clientId).maybeSingle();
  return data?.gi_id ?? null;
}

export async function getIncomeGiMeta(incomeId: string): Promise<{
  giId: string | null;
  giPaymentLink: string | null;
  giPdfUrl: string | null;
  clientId: string | null;
  clientName: string;
  amount: number;
  currency: string;
  project: string;
  status: string;
} | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("ob_income")
    .select("gi_id, gi_payment_link, gi_pdf_url, client_id, client_name, amount, currency, project, status")
    .eq("id", incomeId)
    .maybeSingle();
  if (!data) return null;
  return {
    giId: data.gi_id,
    giPaymentLink: data.gi_payment_link,
    giPdfUrl: data.gi_pdf_url,
    clientId: data.client_id,
    clientName: data.client_name,
    amount: Number(data.amount),
    currency: data.currency ?? "ILS",
    project: data.project ?? "",
    status: data.status,
  };
}
