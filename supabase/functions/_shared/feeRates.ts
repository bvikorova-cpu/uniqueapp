// ============================================================================
// Centralised platform fee rates for edge functions.
//
// Mirrors src/lib/feeRates.ts. Hardcoded defaults match the
// `platform_commission_settings` DB table. Use `getFeeRate(serviceType)` to
// fetch the live rate with a 5-min in-memory cache; falls back to the
// hardcoded default if the DB lookup fails (resilient at scale).
// ============================================================================
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

export type ServiceType =
  | "creator_subscription"
  | "tip_jar"
  | "brand_collaboration"
  | "megatalent"
  | "service_order"
  | "bazaar"
  | "marketplace"
  | "auction"
  | "antique"
  | "collectible"
  | "coupon"
  | "crystal"
  | "home_decor"
  | "property"
  | "skill_swap"
  | "job_portal"
  | "phobia";

/** Hardcoded percentage defaults (0-100). Single source of truth if DB is unreachable. */
export const FEE_DEFAULTS: Record<ServiceType, number> = {
  creator_subscription: 15,
  tip_jar: 10,
  brand_collaboration: 20,
  megatalent: 20,
  service_order: 15,
  bazaar: 10,
  marketplace: 15,
  auction: 10,
  antique: 10,
  collectible: 15,
  coupon: 10,
  crystal: 15,
  home_decor: 15,
  property: 5,
  skill_swap: 0,
  job_portal: 0,
  phobia: 0,
};

interface CacheEntry { rate: number; exp: number }
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<ServiceType, CacheEntry>();

/** Returns commission percentage (0-100). DB → cache → fallback to default. */
export async function getFeeRate(serviceType: ServiceType): Promise<number> {
  const hit = cache.get(serviceType);
  if (hit && hit.exp > Date.now()) return hit.rate;

  const fallback = FEE_DEFAULTS[serviceType];
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data, error } = await supabase
      .from("platform_commission_settings")
      .select("commission_rate")
      .eq("service_type", serviceType)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    const rate = data?.commission_rate != null ? Number(data.commission_rate) : fallback;
    cache.set(serviceType, { rate, exp: Date.now() + CACHE_TTL_MS });
    return rate;
  } catch (e) {
    console.warn(`[feeRates] DB lookup failed for ${serviceType}, using fallback ${fallback}%:`, e);
    // Cache the fallback briefly to avoid hammering DB while it's down.
    cache.set(serviceType, { rate: fallback, exp: Date.now() + 60_000 });
    return fallback;
  }
}

/** Convenience: net amount in cents after platform fee. */
export const netCents = (grossCents: number, feePct: number) =>
  Math.floor((grossCents * (100 - feePct)) / 100);

/** Convenience: platform fee in cents. */
export const feeCents = (grossCents: number, feePct: number) =>
  grossCents - netCents(grossCents, feePct);
