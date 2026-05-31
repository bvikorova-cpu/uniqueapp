import { test as setup, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Authentication setup project — runs ONCE before authed specs and
 * persists the logged-in Supabase session as a Playwright storageState file.
 *
 * Reads credentials from env (preferred) or falls back to the long-lived
 * QA account documented in user memory.
 *
 * Output: e2e/.auth/authed-state.json (referenced by chromium-authed project).
 */
const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

const EMAIL = process.env.E2E_TEST_EMAIL ?? "beata.vikorova@yandex.com";
const PASSWORD = process.env.E2E_TEST_PASSWORD ?? "BiankaDominik25";

const STATE_PATH = "e2e/.auth/authed-state.json";

setup("authenticate", async ({ request }) => {
  const res = await request.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      data: { email: EMAIL, password: PASSWORD },
    },
  );
  expect(res.ok(), `Supabase sign-in failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const session = await res.json();

  // supabase-js v2 stores the full session as a JSON string under the
  // sb-<ref>-auth-token key. Mirror that shape so the browser context wakes
  // up already authenticated.
  const storedSession = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: session.user,
    provider_token: session.provider_token ?? null,
    provider_refresh_token: session.provider_refresh_token ?? null,
  };

  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";
  const baseOrigin = new URL(baseURL).origin;
  // uniqueapp.fun → www.uniqueapp.fun 302. localStorage is origin-scoped, so
  // pre-seed both so the session survives the redirect.
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

  const localStorageItems = [
    { name: STORAGE_KEY, value: JSON.stringify(storedSession) },
    { name: "onboarding_completed", value: "true" },
    { name: "welcome_onboarding_v1", value: JSON.stringify({ at: Date.now(), interests: [] }) },
    {
      name: `welcome_onboarding_v1_${session.user.id}`,
      value: JSON.stringify({ at: Date.now(), interests: [] }),
    },
  ];

  const state = {
    cookies: [],
    origins: Array.from(origins).map((origin) => ({ origin, localStorage: localStorageItems })),
  };

  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  console.log(`[auth.setup] persisted session for ${session.user.email} → ${STATE_PATH} (origins: ${Array.from(origins).join(", ")})`);
});
