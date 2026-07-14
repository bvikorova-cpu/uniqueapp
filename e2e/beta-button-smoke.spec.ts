import { test, expect } from '@playwright/test';

test('beta button in navbar opens beta notice', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  // Look for beta button
  const betaButton = page.locator('nav').getByText('Beta', { exact: true }).first();
  await expect(betaButton).toBeVisible();
  
  // Click it and verify modal
  await betaButton.click();
  await expect(page.getByText('We are in beta testing')).toBeVisible();
  await expect(page.getByText('No one will lose anything')).toBeVisible();
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/browser/beta-notice.png' });
});
