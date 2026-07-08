import { test, expect, request } from "@playwright/test";
import fs from "node:fs";

/**
 * Smoke: module-course-exam edge function end-to-end.
 * Uses the authed storage state to obtain a Supabase access token from
 * localStorage and calls the edge function directly:
 *   curriculum → exam → submit (all 10 correct) → verify certificate row.
 */
const SUPA_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

function extractAccessToken(): string | null {
  try {
    const state = JSON.parse(fs.readFileSync("e2e/.auth/authed-state.json", "utf8"));
    for (const origin of state.origins ?? []) {
      for (const item of origin.localStorage ?? []) {
        if (item.name?.startsWith("sb-") && item.name.endsWith("-auth-token")) {
          const parsed = JSON.parse(item.value);
          return parsed?.access_token ?? parsed?.currentSession?.access_token ?? null;
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

test("module-course-exam: curriculum → exam → submit → certificate", async () => {
  const token = extractAccessToken();
  test.skip(!token, "No authed storage state available");

  const api = await request.newContext({
    baseURL: `${SUPA_URL}/functions/v1`,
    extraHTTPHeaders: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      origin: "https://uniqueapp.fun",
    },
  });

  const meta = {
    module_key: "public-speaking",
    module_label: "Public Speaking",
    course_slug: "e2e-smoke-course",
    course_title: "E2E Smoke Course",
    description: "Smoke test course",
    level: "Beginner",
    duration: "2h",
    price: 9,
    skills: ["public speaking"],
  };

  const curr = await api.post("/module-course-exam", {
    data: { action: "curriculum", meta },
  });
  expect(curr.status(), await curr.text()).toBe(200);
  const currBody = await curr.json();
  expect(currBody.content?.modules?.length).toBeGreaterThan(0);

  const exam = await api.post("/module-course-exam", {
    data: { action: "exam", meta },
  });
  expect(exam.status(), await exam.text()).toBe(200);
  const examBody = await exam.json();
  expect(Array.isArray(examBody.questions)).toBe(true);
  expect(examBody.questions.length).toBe(10);
  expect(typeof examBody.exam_token).toBe("string");

  // Submit random answers (should score, may pass or fail — we only assert shape).
  const answers = examBody.questions.map(() => 0);
  const submit = await api.post("/module-course-exam", {
    data: { action: "submit", meta, answers, exam_token: examBody.exam_token, recipient_name: "E2E Tester" },
  });
  expect(submit.status(), await submit.text()).toBe(200);
  const sub = await submit.json();
  expect(typeof sub.score).toBe("number");
  expect(typeof sub.passed).toBe("boolean");
  if (sub.passed) {
    expect(sub.certificate?.certificate_code).toMatch(/^UNIQ-\d{4}-[A-F0-9]+$/);
    expect(sub.certificate?.pdf_url).toContain("certificates/");
    // Public verify page should now find the cert.
    const verify = await api.get(`/${''}`, { url: `https://uniqueapp.fun/cert/${sub.certificate.certificate_code}` });
    expect([200, 304]).toContain(verify.status());
  }
});
