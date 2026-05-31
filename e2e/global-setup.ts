import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Playwright global setup — writes a storageState file that pre-seeds
 * localStorage so the onboarding tutorial overlays are dismissed before
 * any test page loads. Without this, the modal blocks button selectors
 * and causes most E2E failures to be false positives.
 */
export default async function globalSetup() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";
  const baseOrigin = new URL(baseURL).origin;
  const origins = new Set<string>([baseOrigin]);
  try {
    const u = new URL(baseURL);
    if (!u.hostname.startsWith("www.") && !u.hostname.match(/^localhost|^\d/)) {
      origins.add(`${u.protocol}//www.${u.hostname}`);
    }
    if (u.hostname.startsWith("www.")) {
      origins.add(`${u.protocol}//${u.hostname.replace(/^www\./, "")}`);
    }
  } catch {}
  // NOTE: WelcomeOnboarding (src/components/onboarding/WelcomeOnboarding.tsx)
  // gates on `unique_onboarding_v1_{userId}`. For anonymous tests there's no
  // user id, so we just block the modal globally with the legacy keys too.
  const onboardingPayload = JSON.stringify({ at: Date.now(), interests: [] });
  const localStorageItems = [
    { name: "onboarding_completed", value: "true" },
    { name: "welcome_onboarding_v1", value: onboardingPayload },
    { name: "unique_onboarding_v1", value: onboardingPayload },
  ];
  const state = {
    cookies: [],
    origins: Array.from(origins).map((origin) => ({ origin, localStorage: localStorageItems })),
  };
  const path = "e2e/.auth/storage-state.json";
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2));
}
