import { test, expect } from '@playwright/test';

test('beta button in navbar opens beta notice', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  
  // Dismiss onboarding modal if present
  const skipTutorial = page.getByText('Skip tutorial', { exact: false });
  if (await skipTutorial.isVisible().catch(() => false)) {
    await skipTutorial.click();
    await page.waitForTimeout(300);
  }
  
  // Look for beta button in navbar
  const betaButton = page.locator('nav').getByRole('button', { name: 'Beta' }).first();
  await expect(betaButton).toBeVisible();
  await betaButton.click();
  
  // Verify modal text
  await expect(page.getByText('We are in beta testing')).toBeVisible();
  await expect(page.getByText('No one will lose anything')).toBeVisible();
  
  await page.screenshot({ path: 'test-results/beta-notice.png' });
});
