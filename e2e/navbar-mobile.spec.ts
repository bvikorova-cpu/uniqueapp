import { test, expect } from '@playwright/test';

test('mobile navbar is not crowded', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
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
  
  await page.screenshot({ path: 'test-results/navbar-mobile-clean.png' });
  
  // Verify Beta button is not in the header (it's in the menu)
  await expect(page.locator('nav').getByRole('button', { name: 'Beta' })).not.toBeVisible();
  
  // Open mobile menu and verify Beta and VIP Club are there
  const menuButton = page.locator('nav').getByRole('button', { name: 'Open menu' }).first();
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('button', { name: 'Beta testing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unique VIP Club' })).toBeVisible();
    await page.screenshot({ path: 'test-results/navbar-mobile-menu.png' });
  }
});
