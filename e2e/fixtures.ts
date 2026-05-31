import { test as base, expect } from "@playwright/test";

/**
 * Shared test fixture that disables the onboarding tutorial overlays
 * BEFORE any page script runs, so selectors aren't blocked by the modal.
 *
 * Use:
 *   import { test, expect } from "./fixtures";
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      try {
        localStorage.setItem("onboarding_completed", "true");
        localStorage.setItem("welcome_onboarding_v1", JSON.stringify({ at: Date.now(), interests: [] }));
        // Also block any per-user keys by stubbing setItem read for the welcome variant
        // (WelcomeOnboarding uses `${STORAGE_KEY}_${user.id}`; anonymous users skip it.)
      } catch {}
    });
    await use(context);
  },
});

export { expect };
