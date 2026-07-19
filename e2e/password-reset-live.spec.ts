import { test, expect } from '@playwright/test';

test('password reset flow on live site', async ({ page }) => {
  const responses: { url: string; status: number; body: string }[] = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('recover') || url.includes('auth/v1')) {
      const body = await response.text().catch(() => '');
      responses.push({ url, status: response.status(), body: body.slice(0, 500) });
    }
  });

  await page.goto('/auth', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: '/tmp/browser/auth-page.png' });

  const forgotLink = page.locator('text=Forgot password');
  await expect(forgotLink).toBeVisible({ timeout: 10000 });
  await forgotLink.click();

  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/browser/forgot-password-form.png' });

  const testEmail = 'test-reset-check@example.com';
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill(testEmail);

  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/browser/password-reset-submitted.png' });

  console.log('Responses:', JSON.stringify(responses, null, 2));
  console.log('Page URL:', page.url());

  const pageText = await page.textContent('body');
  console.log('Page text snippet:', pageText?.slice(0, 300));

  // The API should return 200 even if email doesn't exist (security)
  const recoverResponse = responses.find(r => r.url.includes('recover'));
  if (recoverResponse) {
    expect(recoverResponse.status).toBe(200);
  }
});
