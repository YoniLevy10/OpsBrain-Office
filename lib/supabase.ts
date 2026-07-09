import { createClient, SupabaseClient } from "@supabase/supabase-js";

// OpsBrain internal project (typvjqvsncnnwxozffft).
// The anon key is safe to ship client-side by design; access is limited
// to the ob_* tables via RLS policies.
const DEFAULT_URL = "https://typvjqvsncnnwxozffft.supabase.co";
const DEFAULT_ANON_KEY = ""; // filled in once provided

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export const isSupabaseConfigured = () =>
  Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL) &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY)
  );
