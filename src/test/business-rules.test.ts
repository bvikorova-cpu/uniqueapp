/**
 * Semantic unit tests for core business rules.
 * These guard against silent regressions in money, splits and economy math —
 * the kind of bugs that render "correct-looking" but wrong data.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  FEE_DEFAULTS,
  CREATOR_SUBSCRIPTION_PLATFORM_FEE_PCT,
  CREATOR_SUBSCRIPTION_CREATOR_SHARE_PCT,
  calcCreatorNetCents,
  calcPlatformFeeCents,
  netCents,
  feeCentsFor,
} from "@/lib/feeRates";
import {
  getXP,
  addXP,
  getStars,
  getStarsSpent,
  spendStars,
} from "@/lib/kidsAcademyEconomy";

describe("feeRates — platform commission rules (project memory)", () => {
  it("creator subscription split is exactly 85/15 (memory: 85/15 for Creator Subscriptions)", () => {
    expect(CREATOR_SUBSCRIPTION_PLATFORM_FEE_PCT).toBe(15);
    expect(CREATOR_SUBSCRIPTION_CREATOR_SHARE_PCT).toBe(85);
    expect(FEE_DEFAULTS.creator_subscription).toBe(15);
  });

  it("megatalent + brand_collaboration use 80/20 escrow", () => {
    expect(FEE_DEFAULTS.megatalent).toBe(20);
    expect(FEE_DEFAULTS.brand_collaboration).toBe(20);
  });

  it("tip jar P2P commission is 10% (memory: System Tipov)", () => {
    expect(FEE_DEFAULTS.tip_jar).toBe(10);
  });

  it("free-fee verticals stay at 0% (skill_swap, job_portal, phobia)", () => {
    expect(FEE_DEFAULTS.skill_swap).toBe(0);
    expect(FEE_DEFAULTS.job_portal).toBe(0);
    expect(FEE_DEFAULTS.phobia).toBe(0);
  });

  it("calcCreatorNetCents + calcPlatformFeeCents always equal gross (no money lost or printed)", () => {
    const samples = [1, 99, 100, 999, 1234, 9999, 10000, 12345, 99999, 100000];
    for (const gross of samples) {
      const net = calcCreatorNetCents(gross);
      const fee = calcPlatformFeeCents(gross);
      expect(net + fee).toBe(gross);
      expect(net).toBeGreaterThanOrEqual(0);
      expect(fee).toBeGreaterThanOrEqual(0);
    }
  });

  it("creator net for 10.00 EUR (1000 cents) at 85% = 850 cents", () => {
    expect(calcCreatorNetCents(1000)).toBe(850);
    expect(calcPlatformFeeCents(1000)).toBe(150);
  });

  it("netCents floors (never overpays creator)", () => {
    // 999 * 85 / 100 = 849.15 → 849
    expect(netCents(999, 15)).toBe(849);
    expect(feeCentsFor(999, 15)).toBe(150);
    expect(netCents(999, 15) + feeCentsFor(999, 15)).toBe(999);
  });

  it("netCents handles 100% fee and 0% fee edge cases", () => {
    expect(netCents(500, 0)).toBe(500);
    expect(feeCentsFor(500, 0)).toBe(0);
    expect(netCents(500, 100)).toBe(0);
    expect(feeCentsFor(500, 100)).toBe(500);
  });

  it("zero gross yields zero net and zero fee (no negative cents)", () => {
    expect(calcCreatorNetCents(0)).toBe(0);
    expect(calcPlatformFeeCents(0)).toBe(0);
  });
});

describe("kidsAcademyEconomy — XP/Stars conversion (1 star per 10 XP)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts at zero XP and zero stars", () => {
    expect(getXP()).toBe(0);
    expect(getStars()).toBe(0);
    expect(getStarsSpent()).toBe(0);
  });

  it("addXP accumulates monotonically (XP never decreases)", () => {
    addXP(10);
    addXP(25);
    expect(getXP()).toBe(35);
  });

  it("derives 1 star per 10 XP (floor), not per 1 XP", () => {
    addXP(9);
    expect(getStars()).toBe(0);
    addXP(1); // total 10
    expect(getStars()).toBe(1);
    addXP(15); // total 25 → 2 stars
    expect(getStars()).toBe(2);
  });

  it("spendStars decrements available stars but NOT XP", () => {
    addXP(50); // 5 stars
    expect(spendStars(3)).toBe(true);
    expect(getStars()).toBe(2);
    expect(getXP()).toBe(50); // XP preserved
    expect(getStarsSpent()).toBe(3);
  });

  it("spendStars refuses when insufficient (returns false, no mutation)", () => {
    addXP(20); // 2 stars
    expect(spendStars(5)).toBe(false);
    expect(getStars()).toBe(2);
    expect(getStarsSpent()).toBe(0);
  });

  it("stars cannot go negative even if spent record is corrupted high", () => {
    addXP(10); // 1 star
    localStorage.setItem("kids-academy-stars-spent", "999");
    expect(getStars()).toBe(0);
  });
});
