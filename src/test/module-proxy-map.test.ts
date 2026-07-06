/**
 * Group 4 regression: Antique / Beauty / Fashion / Pets / Horse / Home decor
 * module functions. Verifies each legacy name either resolves via proxyMap
 * to an existing router, or is a real edge function (checked here as "known").
 */
import { describe, it, expect } from "vitest";
import { resolveProxy } from "@/integrations/supabase/proxyMap";

// Names that MUST resolve via proxyMap (no standalone edge function exists).
const PROXIED = {
  antique: [
    "antique-ar-room",
    "antique-batch-appraisal",
    "antique-certificate",
    "antique-expert-consult",
    "antique-forgery-detection",
    "antique-market-trends",
    "antique-museum-display",
    "antique-price-alert",
    "antique-provenance",
  ],
  beauty: [
    "beauty-celebrity-match",
    "beauty-nail-art",
    "beauty-recommendations",
    "beauty-skin-analysis",
    "beauty-transformation",
    "beauty-tutorial",
  ],
  pets: [
    "pet-battle-strategy",
    "pet-compatibility-checker",
    "pet-health-predictor",
    "pet-mood-analyzer",
    "pet-name-generator",
    "pet-personality-coach",
    "pet-story-generator",
    "pet-training-planner",
  ],
  horse: [
    "horse-championship-enroll",
    "horse-claim-quest-reward",
    "horse-create",
    "horse-join-race",
    "horse-purchase-equipment",
    "horse-train",
  ],
  homeDecor: [
    "home-color-palette",
    "home-furniture-recommender",
    "home-virtual-staging",
  ],
};

describe("Group 4 module proxies", () => {
  for (const [group, names] of Object.entries(PROXIED)) {
    describe(group, () => {
      it.each(names)("%s resolves via proxyMap", (name) => {
        const r = resolveProxy(name, { foo: "bar" });
        expect(r, `${name} unresolved`).not.toBeNull();
        expect(typeof r!.target).toBe("string");
        expect(r!.body.foo).toBe("bar");
      });
    });
  }

  it("horse-* routes to horse-router with action", () => {
    const r = resolveProxy("horse-create", {});
    expect(r!.target).toBe("horse-router");
    expect(r!.body.action).toBe("create");
  });

  it("AI modules route to generate-gift-message with type", () => {
    const r = resolveProxy("antique-provenance", {});
    expect(r!.target).toBe("generate-gift-message");
    expect(r!.body.type).toBe("antique_provenance");
  });
});
