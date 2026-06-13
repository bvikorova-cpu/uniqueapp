import { test, expect, type Page } from "@playwright/test";

/**
 * E2E — Anonymous Dating partner enrichment.
 *
 * Verifies that the <ActiveMatches /> UI displays partner name, age range,
 * and interests correctly:
 *   1) for multiple matches with different partners simultaneously,
 *   2) after a full page refresh (state must come from URL/server, not memory),
 *   3) when the partner in the same match slot changes between renders.
 *
 * Uses the dev-only test harness route /__e2e/anonymous-date-matches which
 * renders <ActiveMatches /> directly with fixture data — no auth, no Stripe,
 * no RLS dependencies. The harness short-circuits to null in production.
 */

type FixtureMatch = {
  id: string;
  user1_id: string;
  user2_id: string;
  status: "active" | "revealed";
  expires_at: string | null;
  revealed_at?: string | null;
  partner_profile: {
    user_id: string;
    anonymous_name: string;
    age_range: string;
    interests: string[];
    personality_traits?: string[];
  } | null;
};

const ME = "me-user-id";

function makeMatch(
  id: string,
  partnerName: string,
  ageRange: string,
  interests: string[],
  status: "active" | "revealed" = "active",
  daysUntilReveal = 5
): FixtureMatch {
  const partnerId = `partner-${id}`;
  return {
    id,
    user1_id: ME,
    user2_id: partnerId,
    status,
    expires_at: new Date(Date.now() + daysUntilReveal * 86400000).toISOString(),
    revealed_at: status === "revealed" ? new Date().toISOString() : null,
    partner_profile: {
      user_id: partnerId,
      anonymous_name: partnerName,
      age_range: ageRange,
      interests,
    },
  };
}

async function gotoHarness(page: Page, matches: FixtureMatch[]) {
  const fixture = Buffer.from(JSON.stringify(matches), "utf-8").toString("base64");
  await page.goto(
    `/__e2e/anonymous-date-matches?fixture=${encodeURIComponent(fixture)}`
  );
  await page.waitForSelector('[data-testid="e2e-anon-date-harness"]');
}

test.describe("Anonymous Dating — partner profile rendering", () => {
  test("renders different partners in their own match cards simultaneously", async ({
    page,
  }) => {
    const matches: FixtureMatch[] = [
      makeMatch("m1", "Mystic Fox", "25-30", ["yoga", "books"]),
      makeMatch("m2", "Silver Wolf", "30-35", ["hiking", "music"], "revealed"),
    ];
    await gotoHarness(page, matches);

    // Both partner names must be visible
    await expect(page.getByText("Mystic Fox", { exact: true })).toBeVisible();
    await expect(page.getByText("Silver Wolf", { exact: true })).toBeVisible();

    // Age ranges
    await expect(page.getByText("25-30", { exact: true })).toBeVisible();
    await expect(page.getByText("30-35", { exact: true })).toBeVisible();

    // Interests (each rendered as its own pill)
    for (const tag of ["yoga", "books", "hiking", "music"]) {
      await expect(page.getByText(tag, { exact: true })).toBeVisible();
    }
  });

  test("partner data persists after a full page refresh", async ({ page }) => {
    const matches: FixtureMatch[] = [
      makeMatch("m1", "Mystic Fox", "25-30", ["yoga", "books"]),
      makeMatch("m2", "Silver Wolf", "30-35", ["hiking", "music"], "revealed"),
    ];
    await gotoHarness(page, matches);
    await expect(page.getByText("Mystic Fox", { exact: true })).toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="e2e-anon-date-harness"]');

    // After refresh, both partners' name + age + at least one interest must
    // still render (data flows from URL fixture, mimicking server fetch).
    await expect(page.getByText("Mystic Fox", { exact: true })).toBeVisible();
    await expect(page.getByText("Silver Wolf", { exact: true })).toBeVisible();
    await expect(page.getByText("25-30", { exact: true })).toBeVisible();
    await expect(page.getByText("30-35", { exact: true })).toBeVisible();
    await expect(page.getByText("yoga", { exact: true })).toBeVisible();
    await expect(page.getByText("hiking", { exact: true })).toBeVisible();
  });

  test("swapping the partner inside a match updates name, age, and interests", async ({
    page,
  }) => {
    // First render — partner A in slot m1
    await gotoHarness(page, [
      makeMatch("m1", "Mystic Fox", "25-30", ["yoga", "books"]),
    ]);
    await expect(page.getByText("Mystic Fox", { exact: true })).toBeVisible();
    await expect(page.getByText("yoga", { exact: true })).toBeVisible();

    // Now navigate the same harness with a DIFFERENT partner in the same id.
    // (Simulates a new match cycle / different match returned by the server.)
    await gotoHarness(page, [
      makeMatch("m1", "Crimson Phoenix", "35-40", ["chess", "wine"]),
    ]);

    await expect(page.getByText("Crimson Phoenix", { exact: true })).toBeVisible();
    await expect(page.getByText("35-40", { exact: true })).toBeVisible();
    await expect(page.getByText("chess", { exact: true })).toBeVisible();
    await expect(page.getByText("wine", { exact: true })).toBeVisible();

    // The previous partner's data must NOT linger
    await expect(page.getByText("Mystic Fox", { exact: true })).toHaveCount(0);
    await expect(page.getByText("yoga", { exact: true })).toHaveCount(0);
  });

  test("missing partner_profile falls back to 'Anonymous Match' label", async ({
    page,
  }) => {
    const orphan: FixtureMatch = {
      id: "m-orphan",
      user1_id: ME,
      user2_id: "partner-x",
      status: "active",
      expires_at: new Date(Date.now() + 3 * 86400000).toISOString(),
      partner_profile: null,
    };
    await gotoHarness(page, [orphan]);
    await expect(page.getByText("Anonymous Match", { exact: true })).toBeVisible();
  });

  test("empty matches list renders the empty state", async ({ page }) => {
    await gotoHarness(page, []);
    await expect(page.getByText(/No matches yet/i)).toBeVisible();
  });
});
