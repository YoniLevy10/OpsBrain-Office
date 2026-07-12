-- OpsBrain — Gmail OAuth connection (service-role only)
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

-- Remove permissive anon policy if it exists (tokens must not be readable from the browser)
drop policy if exists "ob_gmail_connection_all" on public.ob_gmail_connection;

-- No policies for anon/authenticated roles = deny all client access.
-- Server uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
