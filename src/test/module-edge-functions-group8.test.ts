/**
 * Group 8 regression: analyze-* / generate-* / translate / legal-ai edge functions.
 * Verifies real edge functions exist on disk.
 * (translate + legal-ai are NOT present — no frontend refs exist either, so they are excluded.)
 */
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const FN_ROOT = resolve(__dirname, "../../supabase/functions");

const GROUPS: Record<string, string[]> = {
  "analyze-*": [
    "analyze-dream",
    "analyze-handwriting",
    "analyze-journal",
    "analyze-past-life",
    "analyze-restaurant-menu",
  ],
  "generate-*": [
    "generate-avatar",
    "generate-bio",
    "generate-brand-kit",
    "generate-campaign-story",
    "generate-character-image",
    "generate-character-story",
    "generate-coloring-page",
    "generate-content",
    "generate-content-image",
    "generate-course-certificate",
    "generate-cover-letter",
    "generate-creative-content",
    "generate-decision-tree",
    "generate-fitness-plan",
    "generate-gift-message",
    "generate-lottery-numbers",
    "generate-meal-plan",
    "generate-monetization-ideas",
    "generate-past-life-regression",
    "generate-redemption-plan",
    "generate-room-design",
    "generate-sports-prediction",
    "generate-voice-intro",
    "generate-workout-plan",
  ],
};

describe("Group 8 edge functions present", () => {
  for (const [group, fns] of Object.entries(GROUPS)) {
    describe(group, () => {
      it.each(fns)("%s/index.ts exists", (name) => {
        expect(existsSync(resolve(FN_ROOT, name, "index.ts")), `${name} missing`).toBe(true);
      });
    });
  }
});
