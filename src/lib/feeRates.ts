// Centralised platform fee rates (frontend mirror of supabase/functions/_shared/feeRates.ts).
// Use these constants in UI for displaying creator splits, fee previews, etc.

export const FEE_DEFAULTS = {
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
} as const;

export type ServiceType = keyof typeof FEE_DEFAULTS;

// Back-compat exports (used in existing code).
export const CREATOR_SUBSCRIPTION_PLATFORM_FEE_PCT = FEE_DEFAULTS.creator_subscription;
export const CREATOR_SUBSCRIPTION_CREATOR_SHARE_PCT =
  100 - CREATOR_SUBSCRIPTION_PLATFORM_FEE_PCT;

export const calcCreatorNetCents = (grossCents: number) =>
  Math.floor((grossCents * CREATOR_SUBSCRIPTION_CREATOR_SHARE_PCT) / 100);

export const calcPlatformFeeCents = (grossCents: number) =>
  grossCents - calcCreatorNetCents(grossCents);

export const netCents = (grossCents: number, feePct: number) =>
  Math.floor((grossCents * (100 - feePct)) / 100);

export const feeCentsFor = (grossCents: number, feePct: number) =>
  grossCents - netCents(grossCents, feePct);
