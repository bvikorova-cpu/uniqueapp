import { describe, it, expect } from "vitest";
import { FEE_DEFAULTS, netCents, feeCentsFor, type ServiceType } from "@/lib/feeRates";

describe("FEE_DEFAULTS — all service types", () => {
  it("contains expected business-critical rates", () => {
    expect(FEE_DEFAULTS.creator_subscription).toBe(15);
    expect(FEE_DEFAULTS.tip_jar).toBe(10);
    expect(FEE_DEFAULTS.brand_collaboration).toBe(20);
    expect(FEE_DEFAULTS.megatalent).toBe(20);
    expect(FEE_DEFAULTS.skill_swap).toBe(0);
    expect(FEE_DEFAULTS.job_portal).toBe(0);
    expect(FEE_DEFAULTS.phobia).toBe(0);
    expect(FEE_DEFAULTS.property).toBe(5);
  });

  it("every fee in 0..100 range", () => {
    for (const [k, v] of Object.entries(FEE_DEFAULTS)) {
      expect(v, `${k} must be 0..100`).toBeGreaterThanOrEqual(0);
      expect(v, `${k} must be 0..100`).toBeLessThanOrEqual(100);
    }
  });

  it("math invariant: net + fee == gross for every service × edge grosses", () => {
    const grosses = [0, 1, 99, 100, 499, 1000, 9999, 100000, 999999];
    const services = Object.keys(FEE_DEFAULTS) as ServiceType[];
    for (const svc of services) {
      const pct = FEE_DEFAULTS[svc];
      for (const g of grosses) {
        const n = netCents(g, pct);
        const f = feeCentsFor(g, pct);
        expect(n + f, `${svc} gross=${g}`).toBe(g);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(f).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("0% fee → creator gets full amount", () => {
    expect(netCents(12345, 0)).toBe(12345);
    expect(feeCentsFor(12345, 0)).toBe(0);
  });

  it("100% fee → creator gets 0", () => {
    expect(netCents(12345, 100)).toBe(0);
    expect(feeCentsFor(12345, 100)).toBe(12345);
  });

  it("uses Math.floor (never rounds up to over-pay creator)", () => {
    // 999 cents at 15% = 849.15 → must floor to 849
    expect(netCents(999, 15)).toBe(849);
    expect(feeCentsFor(999, 15)).toBe(150);
  });
});
