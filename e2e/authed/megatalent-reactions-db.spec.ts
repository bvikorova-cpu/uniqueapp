/**
 * Targeted E2E: Megatalent like/dislike (talent_votes)
 *
 * Verifies that clicking the Like button on a submission card in
 * /megatalent/singing:
 *   1. Updates the UI counter (heart badge increments).
 *   2. Persists a row in `talent_votes` for the authed user.
 * Then cleans up (removes the vote row) so the test is idempotent.
 */
import { test, expect, APIRequestContext } from "@playwright/test";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const STORAGE_KEY = "sb-jufrdzeonywluwutvyxz-auth-token";

async function getSession(page: import("@playwright/test").Page) {
  const raw = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  expect(raw, "supabase session missing from storage").toBeTruthy();
  const s = JSON.parse(raw!);
  return { accessToken: s.access_token as string, userId: s.user.id as string };
}

function authHeaders(token: string) {
  return {
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function deleteMyVotes(req: APIRequestContext, token: string, userId: string, subId: string) {
  await req.delete(
    `${SUPABASE_URL}/rest/v1/talent_votes?user_id=eq.${userId}&submission_id=eq.${subId}`,
    { headers: authHeaders(token) },
  );
}

test.describe("Megatalent — like/dislike persistence", () => {
  test("clicking Like on a submission writes to talent_votes and UI count increments", async ({
    page,
    request,
  }) => {
    await page.goto("/megatalent/singing", { waitUntil: "domcontentloaded" });
    // Wait for at least one submission card with a Like button.
    const likeButtons = page.getByRole("button", { name: "Like" });
    await likeButtons.first().waitFor({ state: "visible", timeout: 20_000 });

    const { accessToken, userId } = await getSession(page);

    // Snapshot the first Like button + its numeric badge.
    const firstLike = likeButtons.first();
    const beforeText = (await firstLike.innerText()).trim();
    const beforeCount = parseInt(beforeText.match(/\d+/)?.[0] ?? "0", 10);

    // Ensure clean slate: if the user already liked *some* submission in this
    // category, the toggle below would DECREMENT. We handle both directions by
    // detecting the pressed state.
    const wasPressed = (await firstLike.getAttribute("aria-pressed")) === "true";

    await firstLike.click();

    // UI: wait for count to change (either +1 or -1) or for aria-pressed flip.
    await expect
      .poll(
        async () => {
          const t = (await firstLike.innerText()).trim();
          const n = parseInt(t.match(/\d+/)?.[0] ?? "0", 10);
          const pressed = (await firstLike.getAttribute("aria-pressed")) === "true";
          return { n, pressed };
        },
        { timeout: 10_000, message: "Like button count/state never updated" },
      )
      .toEqual(
        wasPressed
          ? { n: Math.max(0, beforeCount - 1), pressed: false }
          : { n: beforeCount + 1, pressed: true },
      );

    // DB: locate the vote row we just wrote (or, if we toggled off, confirm gone).
    // We identify submission_id via the most recent talent_votes row for this user.
    const rowsRes = await request.get(
      `${SUPABASE_URL}/rest/v1/talent_votes?user_id=eq.${userId}&select=submission_id,vote_type,created_at&order=created_at.desc&limit=5`,
      { headers: authHeaders(accessToken) },
    );
    expect(rowsRes.ok(), `talent_votes GET failed: ${rowsRes.status()}`).toBeTruthy();
    const rows = (await rowsRes.json()) as Array<{
      submission_id: string;
      vote_type: string;
      created_at: string;
    }>;

    if (!wasPressed) {
      // Fresh like — expect at least one 'like' row within the last minute.
      const fresh = rows.find(
        (r) => r.vote_type === "like" && Date.now() - new Date(r.created_at).getTime() < 60_000,
      );
      expect(fresh, "no fresh 'like' row found in talent_votes").toBeTruthy();
      // Cleanup so subsequent runs start from the same state.
      await deleteMyVotes(request, accessToken, userId, fresh!.submission_id);
    } else {
      // We toggled OFF an existing like — original submission_id no longer has a
      // vote from us. Just assert no vote row is <60s old (nothing was added).
      const stray = rows.find(
        (r) => Date.now() - new Date(r.created_at).getTime() < 60_000,
      );
      expect(stray, "unexpected new talent_votes row after toggle-off").toBeFalsy();
    }
  });
});
