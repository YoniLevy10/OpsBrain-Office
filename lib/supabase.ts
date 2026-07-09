import { createClient, SupabaseClient } from "@supabase/supabase-js";

// OpsBrain internal project (typvjqvsncnnwxozffft).
// The anon key is safe to ship client-side by design; access is limited
// to the ob_* tables via RLS policies.
const DEFAULT_URL = "https://typvjqvsncnnwxozffft.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cHZqcXZzbmNubnd4b3pmZmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTQwMDQsImV4cCI6MjA5OTE3MDAwNH0.pwh3wpnbBnLsl5TIeigyceDObFgTnJWMNqlj14Fod6U";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const isSupabaseConfigured = () =>
  Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL) &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY)
  );
