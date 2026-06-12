import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Verifies the H&W legacy checkout/portal/subscription names are wired
// through the alias map in patchSupabaseFunctions to universal routers.
const src = readFileSync(
  resolve(__dirname, "../utils/patchSupabaseFunctions.ts"),
  "utf-8",
);

describe("Health & Wellness alias map", () => {
  const aliases = [
    "create-wellness-checkout",
    "create-healthcare-checkout",
    "create-nutrition-checkout",
    "create-psychology-checkout",
    "healthcare-customer-portal",
    "psychology-customer-portal",
    "check-wellness-subscription",
    "check-healthcare-subscription",
    "check-psychology-subscription",
  ];

  for (const alias of aliases) {
    it(`maps ${alias}`, () => {
      expect(src).toContain(`"${alias}"`);
    });
  }
});
