-- OpsBrain — Gmail OAuth connection
-- Run in Supabase SQL Editor

create table if not exists public.ob_gmail_connection (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scopes text,
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ob_gmail_connection enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ob_gmail_connection' and policyname = 'ob_gmail_connection_all'
  ) then
    create policy "ob_gmail_connection_all" on public.ob_gmail_connection
      for all using (true) with check (true);
  end if;
end $$;
