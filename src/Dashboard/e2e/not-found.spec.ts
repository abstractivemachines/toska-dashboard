import { test, expect } from '@playwright/test';

test('unknown route shows not found content and returns home', async ({ page }) => {
  await page.goto('/#/this-route-does-not-exist');

  const heading = page.getByRole('heading', { level: 2, name: 'Page Not Found' });
  await expect(heading).toBeVisible();

  const backLink = page.getByRole('link', { name: 'Go to Services' });
  await backLink.click();

  await expect(page).toHaveURL(/#\/$/);
});
