import { test, expect } from '@playwright/test';

test('beta button in navbar opens beta notice', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  
  // Dismiss onboarding if present
  const skipTutorial = page.getByText('Skip tutorial', { exact: false });
  if (await skipTutorial.isVisible().catch(() => false)) {
    await skipTutorial.click();
    await page.waitForTimeout(300);
  }
  
  // Close auto-opened beta notice if present
  const startExploring = page.getByRole('button', { name: 'Start exploring' });
  if (await startExploring.isVisible().catch(() => false)) {
    await startExploring.click();
    await page.waitForTimeout(300);
  }
  
  // Click beta button in navbar
  const betaButton = page.locator('nav').getByRole('button', { name: 'Beta' }).first();
  await expect(betaButton).toBeVisible();
  await betaButton.click();
  
  // Verify modal text
  await expect(page.getByText('We are in beta testing')).toBeVisible();
  await expect(page.getByText('No one will lose anything')).toBeVisible();
  
  await page.screenshot({ path: 'test-results/beta-notice.png' });
});
