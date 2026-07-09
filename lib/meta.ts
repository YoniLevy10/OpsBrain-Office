import { getSupabase } from "./supabase";

export async function getMeta(key: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ob_meta").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("ob_meta").upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
}

export async function getLastSyncTime(): Promise<string | null> {
  return getMeta("last_sync_at");
}

export async function setLastSyncTime(iso: string): Promise<void> {
  return setMeta("last_sync_at", iso);
}
