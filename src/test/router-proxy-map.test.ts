/**
 * Proxy-map regression suite.
 * Verifies that every legacy edge-function name consolidated into
 * nutrition-router / horse-router / video-ad-tools resolves to the
 * correct router + action via resolveProxy(). Catches consolidation
 * regressions (renamed action, missing entry) before runtime.
 */
import { describe, it, expect } from "vitest";
import { resolveProxy } from "@/integrations/supabase/proxyMap";

const NUTRITION_EXPECTED: Record<string, string> = {
  "nutrition-coach-chat": "coach_chat",
  "nutrition-allergy-scanner": "allergy_scanner",
  "nutrition-barcode-scanner": "barcode_scanner",
  "nutrition-body-predictor": "body_predictor",
  "nutrition-grocery-optimizer": "grocery_optimizer",
  "nutrition-hydration-coach": "hydration_coach",
  "nutrition-meal-challenge": "meal_challenge",
  "nutrition-supplement-advisor": "supplement_advisor",
  "nutrition-weekly-progress": "weekly_progress",
};

const HORSE_EXPECTED: Record<string, string> = {
  "horse-create": "create",
  "horse-train": "train",
  "horse-join-race": "join_race",
  "horse-purchase-equipment": "purchase_equipment",
  "horse-championship-enroll": "championship_enroll",
  "horse-claim-quest-reward": "claim_quest_reward",
};

const VIDEO_AD_EXPECTED: Record<string, string> = {
  "video-ad-scenes": "scenes",
  "video-ad-sfx": "sfx",
  "video-ad-tts": "tts",
  "video-ad-voice-clone": "voice_clone",
};

describe("proxyMap router consolidation", () => {
  it.each(Object.entries(NUTRITION_EXPECTED))(
    "nutrition: %s -> nutrition-router action=%s",
    (legacyName, expectedAction) => {
      const r = resolveProxy(legacyName, { foo: "bar" });
      expect(r).not.toBeNull();
      expect(r!.target).toBe("nutrition-router");
      expect(r!.body.action).toBe(expectedAction);
      expect(r!.body.foo).toBe("bar"); // body preserved
    }
  );

  it.each(Object.entries(HORSE_EXPECTED))(
    "horse: %s -> horse-router action=%s",
    (legacyName, expectedAction) => {
      const r = resolveProxy(legacyName, {});
      expect(r).not.toBeNull();
      expect(r!.target).toBe("horse-router");
      expect(r!.body.action).toBe(expectedAction);
    }
  );

  it.each(Object.entries(VIDEO_AD_EXPECTED))(
    "video-ad: %s -> video-ad-tools action=%s",
    (legacyName, expectedAction) => {
      const r = resolveProxy(legacyName, {});
      expect(r).not.toBeNull();
      expect(r!.target).toBe("video-ad-tools");
      expect(r!.body.action).toBe(expectedAction);
    }
  );

  it("unrelated function names are not rewritten", () => {
    expect(resolveProxy("battle-characters", {})).toBeNull();
    expect(resolveProxy("nonexistent-fn", {})).toBeNull();
  });

  it("caller-supplied action wins (no clobber)", () => {
    // Frontend never sets action on legacy calls, but defensive merge order
    // matters: spread body first, then action — proxyMap intentionally
    // overrides. This test pins that contract.
    const r = resolveProxy("nutrition-coach-chat", { action: "hacker" });
    expect(r!.body.action).toBe("coach_chat");
  });

  describe("B18a megatalent consolidation", () => {
    const MEGATALENT_EXPECTED: Record<string, string> = {
      "create-megatalent-checkout": "megatalent_subscription",
      "create-megatalent-boost": "megatalent_boost",
      "create-megatalent-tip": "megatalent_tip",
      "create-megatalent-vip-checkout": "megatalent_vip",
    };

    it.each(Object.entries(MEGATALENT_EXPECTED))(
      "%s -> create-checkout product=%s",
      (legacyName, expectedProduct) => {
        const r = resolveProxy(legacyName, { tier: "premium", amount: 5 });
        expect(r).not.toBeNull();
        expect(r!.target).toBe("create-checkout");
        expect(r!.body.product).toBe(expectedProduct);
        // Body fields from caller are preserved alongside the product tag.
        expect(r!.body.tier).toBe("premium");
        expect(r!.body.amount).toBe(5);
      },
    );
  });

  describe("B18c events consolidation", () => {
    const EVENTS_EXPECTED: Record<string, string> = {
      "create-concert-payment": "concert_payment",
      "create-concert-ticket-checkout": "concert_ticket",
      "create-comedy-payment": "comedy_coins",
      "create-kitchen-battle": "kitchen_battle_create",
    };

    it.each(Object.entries(EVENTS_EXPECTED))(
      "%s -> create-checkout product=%s",
      (legacyName, expectedProduct) => {
        const r = resolveProxy(legacyName, { foo: "bar" });
        expect(r).not.toBeNull();
        expect(r!.target).toBe("create-checkout");
        expect(r!.body.product).toBe(expectedProduct);
        expect(r!.body.foo).toBe("bar");
      },
    );
  });

  describe("B18d creator economy consolidation", () => {
    const CREATOR_EXPECTED: Record<string, string> = {
      "create-paid-message-checkout": "paid_message",
      "create-profile-tip": "profile_tip",
      "create-merch-checkout": "merch_purchase",
      "create-service-order-checkout": "service_order",
    };

    it.each(Object.entries(CREATOR_EXPECTED))(
      "%s -> create-checkout product=%s",
      (legacyName, expectedProduct) => {
        const r = resolveProxy(legacyName, { foo: "bar" });
        expect(r).not.toBeNull();
        expect(r!.target).toBe("create-checkout");
        expect(r!.body.product).toBe(expectedProduct);
        expect(r!.body.foo).toBe("bar");
      },
    );

  describe("B18e brand/campaign consolidation", () => {
    const BRAND_EXPECTED: Record<string, string> = {
      "brand-campaign-checkout": "brand_campaign_escrow",
      "create-brand-sponsorship": "brand_sponsorship",
      "create-brand-votes-payment": "brand_votes",
      "create-campaign-payment-checkout": "campaign_payment",
    };

    it.each(Object.entries(BRAND_EXPECTED))(
      "%s -> create-checkout product=%s",
      (legacyName, expectedProduct) => {
        const r = resolveProxy(legacyName, { foo: "bar" });
        expect(r).not.toBeNull();
        expect(r!.target).toBe("create-checkout");
        expect(r!.body.product).toBe(expectedProduct);
        expect(r!.body.foo).toBe("bar");
      },
    );
  });
});
});

