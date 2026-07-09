-- OpsBrain Finance — תנועות בנק (ייבוא CSV)
-- הרץ ב-Supabase SQL Editor אחרי migration.sql

create table if not exists public.ob_bank_transactions (
  id uuid primary key default gen_random_uuid(),
  bank text not null default 'discount',
  date date not null,
  description text not null default '',
  amount numeric not null,
  balance numeric,
  reference text default '',
  import_hash text not null,
  created_at timestamptz default now()
);

create unique index if not exists ob_bank_import_hash_key on public.ob_bank_transactions(import_hash);
create index if not exists ob_bank_date_idx on public.ob_bank_transactions(date desc);

alter table public.ob_bank_transactions enable row level security;
create policy "ob_bank_all" on public.ob_bank_transactions for all using (true) with check (true);
