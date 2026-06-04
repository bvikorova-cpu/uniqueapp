import { describe, it, expect } from "vitest";
import {
  TIER_BENEFITS,
  TOP_PREMIUM_BOOST_MULTIPLIER,
  TOP_PREMIUM_BOOST_PERCENT,
  calculateTotalVotesWithBonus,
  getRankingBoostFactor,
} from "@/hooks/useMegaTalentTier";

type Submission = {
  id: string;
  votes_count: number;
  tier: "premium" | "top_premium" | null;
};

// Mirror of the ordering logic used in the leaderboard:
// display = real votes (untouched), sort by score = real * boostFactor(tier)
const sortByRankingScore = (subs: Submission[]) =>
  [...subs].sort(
    (a, b) =>
      b.votes_count * getRankingBoostFactor(b.tier) -
      a.votes_count * getRankingBoostFactor(a.tier),
  );

describe("MegaTalent ranking boost", () => {
  describe("constants", () => {
    it("TOP Premium boost is exactly +100% (×2)", () => {
      expect(TOP_PREMIUM_BOOST_PERCENT).toBe(100);
      expect(TOP_PREMIUM_BOOST_MULTIPLIER).toBe(2.0);
    });

    it("tier benefits expose the correct numbers", () => {
      expect(TIER_BENEFITS.premium.winChanceBoost).toBe(0);
      expect(TIER_BENEFITS.premium.algorithmicBoost).toBe(false);
      expect(TIER_BENEFITS.premium.bonusVotes).toBe(0);

      expect(TIER_BENEFITS.top_premium.winChanceBoost).toBe(100);
      expect(TIER_BENEFITS.top_premium.algorithmicBoost).toBe(true);
      expect(TIER_BENEFITS.top_premium.bonusVotes).toBe(0);
    });

    it("both tiers include the €5 referral perk", () => {
      const hasReferral = (features: readonly string[]) =>
        features.some((f) => /referral/i.test(f) && /€\s?5/.test(f));
      expect(hasReferral(TIER_BENEFITS.premium.features)).toBe(true);
      expect(hasReferral(TIER_BENEFITS.top_premium.features)).toBe(true);
    });
  });

  describe("getRankingBoostFactor()", () => {
    it("returns 1.0 for unsubscribed users", () => {
      expect(getRankingBoostFactor(null)).toBe(1.0);
    });
    it("returns 1.0 for premium tier", () => {
      expect(getRankingBoostFactor("premium")).toBe(1.0);
    });
    it("returns 2.0 for top_premium tier", () => {
      expect(getRankingBoostFactor("top_premium")).toBe(2.0);
    });
  });

  describe("calculateTotalVotesWithBonus() — displayed vote count", () => {
    it.each([
      [0, null],
      [100, "premium" as const],
      [50_000, "top_premium" as const],
      [1, "top_premium" as const],
    ])("never inflates real votes (votes=%i, tier=%s)", (votes, tier) => {
      expect(calculateTotalVotesWithBonus(votes, tier)).toBe(votes);
    });
  });

  describe("ranking calculation — edge cases", () => {
    it("TOP Premium with same real votes ranks above Premium", () => {
      const sorted = sortByRankingScore([
        { id: "premium", votes_count: 1000, tier: "premium" },
        { id: "top", votes_count: 1000, tier: "top_premium" },
      ]);
      expect(sorted[0].id).toBe("top");
    });

    it("Premium with 2× more real votes still beats TOP Premium (boost is +100%, not infinite)", () => {
      const sorted = sortByRankingScore([
        { id: "premium", votes_count: 2001, tier: "premium" }, // score 2001
        { id: "top", votes_count: 1000, tier: "top_premium" }, // score 2000
      ]);
      expect(sorted[0].id).toBe("premium");
    });

    it("breakeven: Premium needs exactly 2× the votes to tie TOP Premium", () => {
      const premiumScore = 2000 * getRankingBoostFactor("premium");
      const topScore = 1000 * getRankingBoostFactor("top_premium");
      expect(premiumScore).toBe(topScore);
    });

    it("zero votes stay at zero regardless of tier", () => {
      expect(0 * getRankingBoostFactor("top_premium")).toBe(0);
      const sorted = sortByRankingScore([
        { id: "a", votes_count: 0, tier: "top_premium" },
        { id: "b", votes_count: 1, tier: null },
      ]);
      expect(sorted[0].id).toBe("b");
    });

    it("handles unsubscribed (null tier) without errors", () => {
      const sorted = sortByRankingScore([
        { id: "anon", votes_count: 500, tier: null },
        { id: "top", votes_count: 200, tier: "top_premium" }, // 400
      ]);
      expect(sorted[0].id).toBe("anon");
    });

    it("displayed votes remain the real count even for top-ranked TOP Premium entry", () => {
      const entry: Submission = { id: "x", votes_count: 1234, tier: "top_premium" };
      const display = calculateTotalVotesWithBonus(entry.votes_count, entry.tier);
      const rankingScore = entry.votes_count * getRankingBoostFactor(entry.tier);
      expect(display).toBe(1234);
      expect(rankingScore).toBe(2468);
      expect(display).not.toBe(rankingScore);
    });

    it("stable ordering across many entries", () => {
      const subs: Submission[] = [
        { id: "p100", votes_count: 100, tier: "premium" },
        { id: "t60", votes_count: 60, tier: "top_premium" },
        { id: "n200", votes_count: 200, tier: null },
        { id: "t110", votes_count: 110, tier: "top_premium" },
        { id: "p150", votes_count: 150, tier: "premium" },
      ];
      // Scores: n200=200, t110=220, t60=120, p150=150, p100=100
      const sorted = sortByRankingScore(subs).map((s) => s.id);
      expect(sorted).toEqual(["t110", "n200", "p150", "t60", "p100"]);
    });
  });
});
