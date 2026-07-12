-- OpsBrain Finance — Morning Phase 2 (safe to re-run)
-- הרץ רק את הקובץ הזה אם כבר הרצת את migration.sql בעבר
-- Dashboard → SQL Editor → New query → Paste → Run

-- === Morning write integration ===
alter table public.ob_income add column if not exists gi_document_type int;
alter table public.ob_income add column if not exists gi_payment_link text;
alter table public.ob_income add column if not exists gi_pdf_url text;
alter table public.ob_income add column if not exists source text default 'manual';

create table if not exists public.ob_gi_actions (
  id uuid primary key default gen_random_uuid(),
  income_id uuid references public.ob_income(id) on delete set null,
  client_id uuid references public.ob_clients(id) on delete set null,
  gi_document_id text,
  action_type text not null,
  status text default 'pending',
  payment_link_url text,
  sent_to text[],
  amount numeric,
  currency text default 'ILS',
  metadata jsonb default '{}',
  error_message text,
  created_at timestamptz default now()
);

alter table public.ob_gi_actions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ob_gi_actions' and policyname = 'ob_gi_actions_all'
  ) then
    create policy "ob_gi_actions_all" on public.ob_gi_actions for all using (true) with check (true);
  end if;
end $$;

create index if not exists ob_gi_actions_created_idx on public.ob_gi_actions(created_at desc);
create index if not exists ob_income_source_idx on public.ob_income(source);
