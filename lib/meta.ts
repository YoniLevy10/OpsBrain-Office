import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSupabase } from "./supabase";
import { META_CACHE_TAG } from "./cache-tags";

async function getMeta(key: string): Promise<string | null> {
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

const DEFAULT_USD_RATE = 3.7;

async function loadLastSyncTime(): Promise<string | null> {
  return getMeta("last_sync_at");
}

async function loadUsdRate(): Promise<number> {
  const raw = await getMeta("usd_rate");
  if (!raw) return DEFAULT_USD_RATE;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_USD_RATE;
}

const getCachedLastSync = unstable_cache(loadLastSyncTime, ["last-sync-at"], {
  revalidate: 60,
  tags: [META_CACHE_TAG],
});

const getCachedUsdRate = unstable_cache(loadUsdRate, ["usd-rate"], {
  revalidate: 300,
  tags: [META_CACHE_TAG],
});

export const getLastSyncTime = cache(getCachedLastSync);
export const getUsdRate = cache(getCachedUsdRate);

export async function setLastSyncTime(iso: string): Promise<void> {
  return setMeta("last_sync_at", iso);
}

export async function setUsdRate(rate: number): Promise<void> {
  return setMeta("usd_rate", String(rate));
}
