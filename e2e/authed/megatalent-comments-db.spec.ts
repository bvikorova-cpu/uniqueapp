/**
 * Targeted E2E: Megatalent comments (talent_comments)
 *
 * Posts a unique comment via the MegatalentComments card on /megatalent/singing
 * and verifies:
 *   1. The comment appears in the UI list (realtime + optimistic path).
 *   2. A matching row exists in `talent_comments`.
 * Then cleans up the row so the test is idempotent.
 *
 * Costs 1 AI credit per run (megatalent_comment). QA account is pre-funded.
 */
import { test, expect } from "@playwright/test";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const STORAGE_KEY = "sb-jufrdzeonywluwutvyxz-auth-token";

test.describe("Megatalent — comments persistence", () => {
  test("posting a comment writes to talent_comments and renders in UI", async ({
    page,
    request,
  }) => {
    await page.goto("/megatalent/singing", { waitUntil: "domcontentloaded" });

    // Scroll the Comments card into view (it lives below the submissions grid).
    const commentsHeading = page.getByRole("heading", { name: "Comments" });
    await commentsHeading.waitFor({ state: "visible", timeout: 20_000 });
    await commentsHeading.scrollIntoViewIfNeeded();

    // The textarea placeholder is "Write a comment…" (signed-in state).
    const textarea = page.getByPlaceholder("Write a comment…");
    await expect(textarea).toBeVisible({ timeout: 15_000 });

    const unique = `e2e-mt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await textarea.fill(unique);

    // Send button is the icon button right next to the textarea (no accessible
    // name), so target it as the enabled submit-style button inside the same
    // flex row as the textarea.
    const sendBtn = textarea.locator("xpath=following-sibling::button[1]");
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // UI: the comment body should appear in the list within a few seconds.
    await expect(page.getByText(unique, { exact: false })).toBeVisible({
      timeout: 15_000,
    });

    // DB: verify a row was written for this user with the unique body.
    const raw = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    const session = JSON.parse(raw!);
    const accessToken: string = session.access_token;
    const userId: string = session.user.id;

    const rowsRes = await request.get(
      `${SUPABASE_URL}/rest/v1/talent_comments?user_id=eq.${userId}&body=eq.${encodeURIComponent(unique)}&select=id,submission_id,body`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    expect(rowsRes.ok(), `talent_comments GET failed: ${rowsRes.status()}`).toBeTruthy();
    const rows = (await rowsRes.json()) as Array<{ id: string; body: string }>;
    expect(rows.length, `expected exactly one talent_comments row with body="${unique}"`).toBe(1);
    expect(rows[0].body).toBe(unique);

    // Cleanup: remove the comment so repeated runs stay clean.
    await request.delete(
      `${SUPABASE_URL}/rest/v1/talent_comments?id=eq.${rows[0].id}`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  });
});
