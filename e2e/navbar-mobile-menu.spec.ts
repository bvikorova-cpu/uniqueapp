import { test, expect } from '@playwright/test';

test('mobile menu shows beta and vip', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const skipTutorial = page.getByText('Skip tutorial', { exact: false });
  if (await skipTutorial.isVisible().catch(() => false)) {
    await skipTutorial.click();
    await page.waitForTimeout(300);
  }
  
  const startExploring = page.getByRole('button', { name: 'Start exploring' });
  if (await startExploring.isVisible().catch(() => false)) {
    await startExploring.click();
    await page.waitForTimeout(300);
  }
  
  // Click hamburger menu (last button in nav)
  const nav = page.locator('nav').first();
  const menuButton = nav.locator('button').last();
  await menuButton.click();
  await page.waitForTimeout(300);
  
  await expect(page.getByRole('button', { name: 'Beta testing' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unique VIP Club' })).toBeVisible();
  await page.screenshot({ path: 'test-results/navbar-mobile-menu.png' });
});
