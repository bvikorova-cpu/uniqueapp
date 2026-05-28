import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

test.describe("Fairy Castles catalogue", () => {
  test("contains at least 12 castles with thumbnails", async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
    const { data, error } = await supabase
      .from("fairy_castles")
      .select("id, name, thumbnail_url");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.length).toBeGreaterThanOrEqual(12);

    // No empty thumbnails
    const missingThumbs = data!.filter((c) => !c.thumbnail_url);
    expect(missingThumbs, `Castles missing thumbnails: ${missingThumbs.map((c) => c.name).join(", ")}`).toHaveLength(0);
  });

  test("/kids-channel/fairy-castles renders the castle list after refresh", async ({ page }) => {
    await page.goto("/kids-channel/fairy-castles");
    await expect(page.getByText(/Fairy Castle/i).first()).toBeVisible({ timeout: 15_000 });

    // Stats card should show /12 (or more) explored target
    await expect(page.getByText(/\/12/).first()).toBeVisible({ timeout: 15_000 });

    // Reload and re-verify
    await page.reload();
    await expect(page.getByText(/\/12/).first()).toBeVisible({ timeout: 15_000 });
  });
});
