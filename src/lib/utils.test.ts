import { describe, it, expect } from "vitest";
import { cn, formatCurrency } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles falsy values", () => {
    const falsy: false | string = false;
    expect(cn("a", falsy && "b", null, undefined, "c")).toBe("a c");
  });
});

describe("formatCurrency", () => {
  it("formats EUR by default", () => {
    const result = formatCurrency(10);
    expect(result).toMatch(/10/);
    expect(result).toMatch(/€|EUR/);
  });

  it("supports custom currency", () => {
    const result = formatCurrency(99, "USD");
    expect(result).toMatch(/99/);
  });
});
