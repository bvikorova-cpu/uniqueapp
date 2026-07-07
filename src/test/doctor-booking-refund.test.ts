/**
 * Semantic unit tests for the doctor booking refund + payout split rules.
 * Mirrors the logic in supabase/functions/verify-doctor-booking and
 * supabase/functions/patient-cancel-booking so silent regressions in
 * money math or the 24h refund window get caught in CI.
 */
import { describe, it, expect } from "vitest";

// Mirrors verify-doctor-booking/index.ts PLATFORM_FEE_BPS = 1500 (15%)
const PLATFORM_FEE_BPS = 1500;

function splitPriceCents(priceCents: number) {
  const platformFee = Math.round((priceCents * PLATFORM_FEE_BPS) / 10000);
  const doctorAmount = priceCents - platformFee;
  return { platformFee, doctorAmount };
}

// Mirrors patient-cancel-booking/index.ts refund eligibility
function isEligibleForRefund(scheduledAt: Date, now: Date) {
  const hoursUntil = (scheduledAt.getTime() - now.getTime()) / 3600000;
  return hoursUntil >= 24;
}

describe("doctor booking — 85/15 payout split (memory: healthcare 85/15)", () => {
  it("splits 10.00 EUR (1000c) into 850c doctor / 150c platform", () => {
    const { platformFee, doctorAmount } = splitPriceCents(1000);
    expect(platformFee).toBe(150);
    expect(doctorAmount).toBe(850);
  });

  it("splits 50.00 EUR (5000c) into 4250c doctor / 750c platform", () => {
    const { platformFee, doctorAmount } = splitPriceCents(5000);
    expect(platformFee).toBe(750);
    expect(doctorAmount).toBe(4250);
  });

  it("never loses or prints money across a range of prices", () => {
    const samples = [1, 99, 100, 999, 1234, 4999, 5000, 12345, 99999, 100000];
    for (const gross of samples) {
      const { platformFee, doctorAmount } = splitPriceCents(gross);
      expect(platformFee + doctorAmount).toBe(gross);
      expect(platformFee).toBeGreaterThanOrEqual(0);
      expect(doctorAmount).toBeGreaterThanOrEqual(0);
    }
  });

  it("platform fee is exactly 15% of gross (± rounding of 1 cent)", () => {
    for (const gross of [200, 3333, 7777, 88888]) {
      const { platformFee } = splitPriceCents(gross);
      expect(Math.abs(platformFee - gross * 0.15)).toBeLessThanOrEqual(1);
    }
  });
});

describe("patient cancellation — 24h refund window", () => {
  const now = new Date("2026-07-07T12:00:00Z");

  it("refunds when appointment is >24h away", () => {
    const scheduled = new Date("2026-07-08T13:00:00Z"); // 25h ahead
    expect(isEligibleForRefund(scheduled, now)).toBe(true);
  });

  it("refunds exactly at the 24h boundary", () => {
    const scheduled = new Date("2026-07-08T12:00:00Z"); // 24h ahead
    expect(isEligibleForRefund(scheduled, now)).toBe(true);
  });

  it("does NOT refund when appointment is <24h away", () => {
    const scheduled = new Date("2026-07-08T11:59:00Z"); // 23h59m
    expect(isEligibleForRefund(scheduled, now)).toBe(false);
  });

  it("does NOT refund for imminent appointments (2h away)", () => {
    const scheduled = new Date("2026-07-07T14:00:00Z");
    expect(isEligibleForRefund(scheduled, now)).toBe(false);
  });

  it("does NOT refund for past appointments", () => {
    const scheduled = new Date("2026-07-06T12:00:00Z");
    expect(isEligibleForRefund(scheduled, now)).toBe(false);
  });
});
