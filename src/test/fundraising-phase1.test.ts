import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Phase 1 regression: Fundraising hub components must be wired to real data.
 * Each of these components previously rendered hardcoded arrays; they now must
 * call a Supabase RPC or query for their content.
 */
describe("Fundraising Phase 1 — data wiring", () => {
  const componentsShouldQuerySupabase = [
    "src/components/fundraising/FundraisingCategoryCards.tsx",
    "src/components/fundraising/FeaturedCampaignSpotlight.tsx",
    "src/components/fundraising/DonorLeaderboard.tsx",
    "src/components/fundraising/LiveImpactTicker.tsx",
  ];

  for (const rel of componentsShouldQuerySupabase) {
    it(`${rel} imports supabase client + calls rpc/from/channel`, () => {
      const p = resolve(process.cwd(), rel);
      expect(existsSync(p), `file exists: ${rel}`).toBe(true);
      const src = readFileSync(p, "utf-8");
      expect(src, `${rel} imports supabase`).toMatch(/from ["']@\/integrations\/supabase\/client["']/);
      expect(src, `${rel} calls supabase.rpc/from/channel`).toMatch(/supabase\.(rpc|from|channel)\(/);
    });
  }

  const pagesShouldQuerySupabase = [
    "src/pages/fundraising/DreamMaker.tsx",
    "src/pages/fundraising/CrisisRelief.tsx",
    "src/pages/fundraising/TalentSponsorship.tsx",
    "src/pages/fundraising/RecurringDonationsHub.tsx",
    "src/pages/fundraising/EmbedCampaignWidget.tsx",
    "src/pages/fundraising/CommunityHero.tsx",
  ];

  for (const rel of pagesShouldQuerySupabase) {
    it(`${rel} calls supabase`, () => {
      const p = resolve(process.cwd(), rel);
      expect(existsSync(p), `file exists: ${rel}`).toBe(true);
      const src = readFileSync(p, "utf-8");
      expect(src).toMatch(/supabase\.(rpc|from|functions|auth|channel)\(/);
    });
  }

  it("public embed route is registered in App.tsx", () => {
    const app = readFileSync(resolve(process.cwd(), "src/App.tsx"), "utf-8");
    expect(app).toMatch(/\/embed\/campaign\/:campaignType\/:campaignId/);
  });
});
