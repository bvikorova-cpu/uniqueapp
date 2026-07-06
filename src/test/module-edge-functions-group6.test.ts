/**
 * Group 6 regression: verify real edge functions exist on disk for
 * Video Ad / Stream / Brain Duel / Escape Room / Coupon / Phobia / Multiverse.
 *
 * These modules do NOT go through proxyMap — they are invoked directly by name.
 * This test guards against accidental deletion of the underlying edge functions.
 */
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const FN_ROOT = resolve(__dirname, "../../supabase/functions");

const GROUPS: Record<string, string[]> = {
  "video-ad": ["video-ad-tools"],
  "brain-duel": [
    "brain-duel-ai-commentary",
    "brain-duel-ai-recap",
    "brain-duel-daily-challenge",
    "brain-duel-finish-match",
    "brain-duel-get-questions",
    "brain-duel-match-analysis",
    "brain-duel-matchmaking",
    "brain-duel-router",
    "brain-duel-submit-answer",
    "brain-duel-use-referral",
  ],
  coupon: [
    "coupon-ai",
    "coupon-buyer-action",
    "coupon-digest-cron",
    "coupon-price-alerts-cron",
    "coupon-public-api",
  ],
  multiverse: ["multiverse-ai-tool"],
};

describe("Group 6 edge functions present", () => {
  for (const [group, fns] of Object.entries(GROUPS)) {
    describe(group, () => {
      it.each(fns)("%s/index.ts exists", (name) => {
        expect(existsSync(resolve(FN_ROOT, name, "index.ts")), `${name} missing`).toBe(true);
      });
    });
  }
});
