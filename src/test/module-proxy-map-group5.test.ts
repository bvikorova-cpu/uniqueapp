/**
 * Group 5 regression: Nutrition / Photo / Shadow / Kids proxies.
 */
import { describe, it, expect } from "vitest";
import { resolveProxy } from "@/integrations/supabase/proxyMap";

const NUTRITION = [
  "nutrition-allergy-scanner",
  "nutrition-barcode-scanner",
  "nutrition-body-predictor",
  "nutrition-coach-chat",
  "nutrition-grocery-optimizer",
  "nutrition-hydration-coach",
  "nutrition-meal-challenge",
  "nutrition-supplement-advisor",
  "nutrition-weekly-progress",
];

const PHOTO = [
  "photo-ai-upscaling",
  "photo-background-removal",
  "photo-colorization-pro",
  "photo-damage-detection",
  "photo-face-enhancement",
];

const SHADOW = [
  "shadow-ai-narrator",
  "shadow-ai-story-generator",
  "shadow-arena-credits-init",
  "shadow-battle-predictor",
  "shadow-curse-wheel-spin",
  "shadow-horror-reel",
  "shadow-nightmare-avatar",
  "shadow-patron-checkout",
  "shadow-voice-clone",
];

const KIDS = [
  "kids-customer-portal",
  "kids-story-customer-portal",
  "kids-science-lab",
];

describe("Group 5 module proxies", () => {
  describe.each([
    ["nutrition", NUTRITION],
    ["photo", PHOTO],
    ["shadow", SHADOW],
    ["kids", KIDS],
  ])("%s", (_g, names) => {
    it.each(names as string[])("%s resolves", (name) => {
      const r = resolveProxy(name, { foo: "bar" });
      expect(r, `${name} unresolved`).not.toBeNull();
      expect(typeof r!.target).toBe("string");
    });
  });

  it("nutrition-* -> nutrition-router with action", () => {
    const r = resolveProxy("nutrition-coach-chat", {});
    expect(r!.target).toBe("nutrition-router");
    expect(r!.body.action).toBe("coach_chat");
  });

  it("shadow-ai-narrator -> shadow-arena-router with action", () => {
    const r = resolveProxy("shadow-ai-narrator", {});
    expect(r!.target).toBe("shadow-arena-router");
    expect(r!.body.action).toBe("ai_narrate");
  });

  it("shadow-patron-checkout -> create-checkout", () => {
    const r = resolveProxy("shadow-patron-checkout", {});
    expect(r!.target).toBe("create-checkout");
    expect(r!.body.product).toBe("shadow_patron");
  });

  it("kids-customer-portal -> check-router", () => {
    const r = resolveProxy("kids-customer-portal", {});
    expect(r!.target).toBe("check-router");
    expect(r!.body.action).toBe("customer_portal");
  });
});
