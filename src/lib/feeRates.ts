// Centralised platform fee rates. Mirror these in edge functions.
export const CREATOR_SUBSCRIPTION_PLATFORM_FEE_PCT = 15;
export const CREATOR_SUBSCRIPTION_CREATOR_SHARE_PCT =
  100 - CREATOR_SUBSCRIPTION_PLATFORM_FEE_PCT;

export const calcCreatorNetCents = (grossCents: number) =>
  Math.floor((grossCents * CREATOR_SUBSCRIPTION_CREATOR_SHARE_PCT) / 100);

export const calcPlatformFeeCents = (grossCents: number) =>
  grossCents - calcCreatorNetCents(grossCents);
