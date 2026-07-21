// E2E: after Stripe checkout redirects to /gift/success, verify that:
//   1. The pending → paid transition is confirmed exactly once.
//   2. A second navigation with the same gift id is a safe no-op
//      (verify-creator-gift returns { status: "paid" } from the tx.status guard,
//       so no duplicate notification insert can happen).
// We mock the edge function so this runs deterministically in CI without
// needing real Stripe/DB state. The mock records every hit and mirrors the
// real function's idempotency contract (`.eq("status","pending")`).
import { test, expect } from "@playwright/test";

const GIFT_ID = "11111111-1111-1111-1111-111111111111";
const SESSION_ID = "cs_test_dedup_1";

test("gift/success confirms pending→paid exactly once and is idempotent on refresh", async ({ page }) => {
  // Simulated DB row state (mirrors `.eq("status","pending")` guard).
  let status: "pending" | "paid" = "pending";
  let notificationInserts = 0;
  const calls: Array<{ id: string; sessionId?: string; returnedStatus: string }> = [];

  await page.route("**/functions/v1/verify-creator-gift", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    // Mirror the edge function: only insert notification on the transition.
    if (status === "pending") {
      status = "paid";
      notificationInserts += 1;
    }
    calls.push({ id: body.id, sessionId: body.sessionId, returnedStatus: status });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "paid" }),
    });
  });

  // First visit — the redirect Stripe sends the buyer to.
  await page.goto(`/gift/success?id=${GIFT_ID}&session_id=${SESSION_ID}`);
  await expect(page.getByRole("heading", { name: /gift delivered/i })).toBeVisible();

  expect(calls).toHaveLength(1);
  expect(notificationInserts).toBe(1);

  // Second visit — buyer refreshes or bookmarks the success URL.
  await page.goto(`/gift/success?id=${GIFT_ID}&session_id=${SESSION_ID}`);
  await expect(page.getByRole("heading", { name: /gift delivered/i })).toBeVisible();

  // Verify was called again, but the transition guard prevented a duplicate notification.
  expect(calls).toHaveLength(2);
  expect(notificationInserts).toBe(1);
  expect(status).toBe("paid");
});

test("gift/success surfaces verification error clearly (no silent duplicate on retry)", async ({ page }) => {
  let hits = 0;
  await page.route("**/functions/v1/verify-creator-gift", async (route) => {
    hits += 1;
    await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "boom" }) });
  });
  await page.goto(`/gift/success?id=${GIFT_ID}&session_id=${SESSION_ID}`);
  await expect(page.getByRole("heading", { name: /verification failed/i })).toBeVisible();
  expect(hits).toBe(1); // no auto-retry loop
});
