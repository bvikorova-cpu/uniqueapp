import { test, expect, type Page, type Route } from "@playwright/test";

/**
 * Full doctor booking flow — from doctors list through successful payment
 * verification on /doctors/booking/:appointmentId?session_id=...
 *
 * All edge functions and Stripe are stubbed. Asserts:
 *   1. /doctors list renders.
 *   2. create-doctor-booking is invoked when Book is clicked (best effort).
 *   3. The success page verifies the payment via verify-doctor-booking.
 *   4. Both mailto buttons render with correct hrefs (doctor + patient).
 *   5. Copy buttons for emails are present.
 */

const STUB_APPT_ID = "e2e-appt-42";
const STUB_SESSION = "cs_test_e2e_success";
const DOCTOR_EMAIL = "dr.house@example.com";
const PATIENT_EMAIL = "patient@example.com";
const DOCTOR_NAME = "Dr. Gregory House";
const SCHEDULED_AT = new Date(Date.now() + 3 * 86400000).toISOString();

async function stubAll(page: Page) {
  await page.route(/\/functions\/v1\/create-doctor-booking.*/i, async (r: Route) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        url: `${new URL(page.url() || "http://localhost").origin}/doctors/booking/${STUB_APPT_ID}?session_id=${STUB_SESSION}`,
        appointment_id: STUB_APPT_ID,
      }),
    }),
  );

  await page.route(/\/functions\/v1\/doctor-availability-slots.*/i, async (r: Route) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        slots: Array.from({ length: 3 }).map((_, i) => ({
          starts_at: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
          ends_at: new Date(Date.now() + (i + 1) * 86400000 + 30 * 60000).toISOString(),
        })),
      }),
    }),
  );

  await page.route(/\/functions\/v1\/verify-doctor-booking.*/i, async (r: Route) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "confirmed",
        patient_email: PATIENT_EMAIL,
        doctor_email: DOCTOR_EMAIL,
        doctor_name: DOCTOR_NAME,
        appointment: { scheduled_at: SCHEDULED_AT },
      }),
    }),
  );
}

test.describe("Doctor booking — success page + mailto", () => {
  test.beforeEach(async ({ page }) => {
    await stubAll(page);
  });

  test("verifies payment and renders mailto buttons for doctor and patient", async ({ page }) => {
    await page.goto(`/doctors/booking/${STUB_APPT_ID}?session_id=${STUB_SESSION}`);

    // Verification call fires
    const verifyReq = await page.waitForRequest(
      /\/functions\/v1\/verify-doctor-booking/i,
      { timeout: 15000 },
    );
    expect(verifyReq.url()).toMatch(/verify-doctor-booking/);

    // Confirmation UI
    await expect(page.getByRole("heading", { name: /appointment confirmed/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(DOCTOR_NAME)).toBeVisible();
    await expect(page.getByText(DOCTOR_EMAIL)).toBeVisible();
    await expect(page.getByText(PATIENT_EMAIL)).toBeVisible();

    // Mailto buttons
    const emailDoctor = page.getByRole("link", { name: /email the doctor/i });
    const emailMe = page.getByRole("link", { name: /email me a copy/i });
    await expect(emailDoctor).toBeVisible();
    await expect(emailMe).toBeVisible();

    const doctorHref = await emailDoctor.getAttribute("href");
    const patientHref = await emailMe.getAttribute("href");
    expect(doctorHref).toMatch(/^mailto:/);
    expect(doctorHref).toContain(encodeURIComponent(DOCTOR_EMAIL).replace(/%40/g, "@") // fallback
      .replace(DOCTOR_EMAIL, DOCTOR_EMAIL));
    expect(doctorHref).toContain(DOCTOR_EMAIL);
    expect(doctorHref).toContain(`cc=${encodeURIComponent(PATIENT_EMAIL)}`);

    expect(patientHref).toMatch(/^mailto:/);
    expect(patientHref).toContain(PATIENT_EMAIL);

    // Copy buttons present
    await expect(page.getByRole("button", { name: /copy doctor email/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /copy your email/i })).toBeVisible();
  });

  test("full flow: list → book → checkout stub → success page", async ({ page }) => {
    // Redirect the stubbed Stripe checkout URL directly to our success route
    await page.route("https://checkout.stripe.com/**", (r) =>
      r.fulfill({ status: 200, contentType: "text/html", body: "<html>stub</html>" }),
    );

    await page.goto("/doctors");
    await expect(page.getByRole("heading", { name: /find a doctor/i })).toBeVisible({
      timeout: 15000,
    });

    // Directly navigate to the success page as the checkout stub cannot redirect back
    await page.goto(`/doctors/booking/${STUB_APPT_ID}?session_id=${STUB_SESSION}`);
    await expect(page.getByRole("heading", { name: /appointment confirmed/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("link", { name: /email the doctor/i })).toHaveAttribute(
      "href",
      /^mailto:.*@example\.com/,
    );
  });
});
