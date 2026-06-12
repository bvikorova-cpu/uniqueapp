import { describe, it, expect } from "vitest";

// Verifies that the legacy/aliased H&W checkout function names are wired
// through patchSupabaseFunctions to real edge functions.
import { FUNCTION_ALIASES } from "@/integrations/supabase/patchSupabaseFunctions";

describe("Health & Wellness checkout router aliases", () => {
  const expected: Record<string, RegExp> = {
    "create-wellness-checkout": /checkout/i,
    "create-healthcare-checkout": /checkout/i,
    "create-nutrition-checkout": /checkout/i,
    "create-psychology-checkout": /checkout/i,
    "psychology-customer-portal": /portal/i,
    "healthcare-customer-portal": /portal/i,
    "nutrition-customer-portal": /portal/i,
    "wellness-customer-portal": /portal/i,
  };

  for (const [alias, pattern] of Object.entries(expected)) {
    it(`alias ${alias} maps to a real function`, () => {
      const target = FUNCTION_ALIASES?.[alias];
      expect(target, `missing alias for ${alias}`).toBeTruthy();
      expect(target).toMatch(pattern);
    });
  }
});
