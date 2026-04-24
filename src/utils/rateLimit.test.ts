import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, createRateLimiter, rateLimiters } from "./rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    rateLimiters.auth.clear();
  });

  it("allows requests within limit", () => {
    const r1 = checkRateLimit("test-1", { maxRequests: 3, windowMs: 1000 });
    const r2 = checkRateLimit("test-1", { maxRequests: 3, windowMs: 1000 });
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it("blocks once limit is exceeded", () => {
    const config = { maxRequests: 2, windowMs: 1000 };
    checkRateLimit("test-2", config);
    checkRateLimit("test-2", config);
    const blocked = checkRateLimit("test-2", config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("creates independent buckets per key", () => {
    const config = { maxRequests: 1, windowMs: 1000 };
    expect(checkRateLimit("a", config).allowed).toBe(true);
    expect(checkRateLimit("b", config).allowed).toBe(true);
    expect(checkRateLimit("a", config).allowed).toBe(false);
  });
});

describe("createRateLimiter", () => {
  it("exposes check/reset/clear", () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 });
    expect(limiter.check("k").allowed).toBe(true);
    expect(limiter.check("k").allowed).toBe(false);
    limiter.reset("k");
    expect(limiter.check("k").allowed).toBe(true);
  });
});
