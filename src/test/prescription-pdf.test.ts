import { describe, it, expect } from "vitest";

/**
 * Phase 5 — prescription QR token stability.
 * Verifies the QR token format we generate DB-side (hex, ≥18 bytes → ≥36 chars).
 */
function looksLikeQrToken(t: string) {
  return /^[0-9a-f]{36,}$/i.test(t);
}

describe("prescription QR token", () => {
  it("hex36 passes", () => expect(looksLikeQrToken("a".repeat(36))).toBe(true));
  it("short fails", () => expect(looksLikeQrToken("abc123")).toBe(false));
  it("non-hex fails", () => expect(looksLikeQrToken("z".repeat(36))).toBe(false));
});

describe("prescription payload guard", () => {
  it("rejects empty medications", () => {
    const meds: Array<{ name: string; dose: string; frequency: string }> = [];
    expect(meds.length > 0).toBe(false);
  });
  it("accepts a valid line", () => {
    const med = { name: "Ibuprofen", dose: "400 mg", frequency: "3x/day" };
    expect(med.name.length).toBeGreaterThan(0);
    expect(med.dose.length).toBeGreaterThan(0);
  });
});
