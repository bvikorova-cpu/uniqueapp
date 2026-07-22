/**
 * Re-export from rateLimit.ts for backward compatibility
 * All rate limiting logic is consolidated in rateLimit.ts
 */
export { checkRateLimit,
  withRateLimit,
  rateLimitExceededResponse,
  addRateLimitHeaders,
  getIdentifier,
  RATE_LIMITS } from "./rateLimit.ts";

export type { RateLimitConfig,
  RateLimitResult } from "./rateLimit.ts";
