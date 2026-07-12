-- OpsBrain Finance — הדבק והרץ את זה ב-SQL Editor של הפרויקט typvjqvsncnnwxozffft
-- Dashboard → SQL Editor → New query → Paste → Run

create table if not exists public.ob_clients (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact text default '',
  email text default '',
  phone text default '',
  vat text default '',
  revenue numeric default 0,
  outstanding numeric default 0,
  active_since date default current_date,
  status text default 'פעיל',
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.ob_income (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.ob_clients(id) on delete set null,
  client_name text not null,
  project text default '',
  amount numeric not null default 0,
  currency text default 'ILS',
  invoice_number text default '',
  status text default 'ממתין',
  date date default current_date,
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.ob_expenses (
  id uuid primary key default gen_random_uuid(),
  vendor text not null,
  category text default 'אחר',
  amount numeric not null default 0,
  currency text default 'ILS',
  amount_ils numeric not null default 0,
  date date default current_date,
  recurring boolean default false,
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.ob_subscriptions (
  id uuid primary key default gen_random_uuid(),
  vendor text not null,
  category text default 'תוכנה',
  price numeric not null default 0,
  currency text default 'USD',
  price_ils numeric not null default 0,
  billing_cycle text default 'חודשי',
  next_charge date,
  status text default 'פעיל',
  created_at timestamptz default now()
);

alter table public.ob_clients enable row level security;
alter table public.ob_income enable row level security;
alter table public.ob_expenses enable row level security;
alter table public.ob_subscriptions enable row level security;

create policy "ob_clients_all" on public.ob_clients for all using (true) with check (true);
create policy "ob_income_all" on public.ob_income for all using (true) with check (true);
create policy "ob_expenses_all" on public.ob_expenses for all using (true) with check (true);
create policy "ob_subscriptions_all" on public.ob_subscriptions for all using (true) with check (true);

create index if not exists ob_income_date_idx on public.ob_income(date desc);
create index if not exists ob_expenses_date_idx on public.ob_expenses(date desc);
create index if not exists ob_subscriptions_next_charge_idx on public.ob_subscriptions(next_charge);

-- === Green Invoice sync support (run this too) ===
alter table public.ob_clients add column if not exists gi_id text;
alter table public.ob_income add column if not exists gi_id text;
alter table public.ob_expenses add column if not exists gi_id text;
create unique index if not exists ob_clients_gi_id_key on public.ob_clients(gi_id) where gi_id is not null;
create unique index if not exists ob_income_gi_id_key on public.ob_income(gi_id) where gi_id is not null;
create unique index if not exists ob_expenses_gi_id_key on public.ob_expenses(gi_id) where gi_id is not null;

-- === Morning write integration (Phase 2+) ===
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
create policy "ob_gi_actions_all" on public.ob_gi_actions for all using (true) with check (true);
create index if not exists ob_gi_actions_created_idx on public.ob_gi_actions(created_at desc);
create index if not exists ob_income_source_idx on public.ob_income(source);

-- App metadata (last sync time, etc.)
create table if not exists public.ob_meta (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);
alter table public.ob_meta enable row level security;
create policy "ob_meta_all" on public.ob_meta for all using (true) with check (true);
