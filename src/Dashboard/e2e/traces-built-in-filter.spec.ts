import { test, expect } from '@playwright/test';

const builtInServiceNames = new Set(['mesh-rpc-a', 'mesh-rpc-b', 'mesh-rpc-c']);

async function waitForTraceResponse(page: import('@playwright/test').Page, exclude: boolean) {
  return page.waitForResponse((response) => {
    const url = response.url();
    return (
      url.includes('/api/dashboard/traces') &&
      url.includes(`excludeBuiltInServices=${exclude}`) &&
      response.status() === 200
    );
  });
}

async function getServiceNames(page: import('@playwright/test').Page): Promise<string[]> {
  const cells = page.locator('table.data-table tbody tr td:nth-child(2)');
  const names = (await cells.allTextContents())
    .map((name) => name.trim())
    .filter(Boolean);
  return names;
}

test('hide built-in services checkbox refetches and filters', async ({ page }) => {
  page.on('response', (response) => {
    if (response.url().includes('/api/dashboard/traces')) {
      console.log('Trace response:', response.url());
    }
  });

  const initialResponse = waitForTraceResponse(page, true);
  await page.goto('/#/traces');
  await initialResponse;

  const checkbox = page.getByLabel('Hide built-in services');
  await expect(checkbox).toBeVisible();
  await expect(checkbox).toBeChecked();

  const emptyState = page.getByText('No traces found.');
  const tableRow = page.locator('table.data-table tbody tr').first();
  await Promise.race([
    tableRow.waitFor({ state: 'visible', timeout: 15000 }),
    emptyState.waitFor({ state: 'visible', timeout: 15000 }),
  ]);

  if (await emptyState.isVisible()) {
    test.skip(true, 'No traces available to verify filtering.');
  }

  const servicesChecked = await getServiceNames(page);
  console.log('Services when checked:', servicesChecked);

  await Promise.all([
    waitForTraceResponse(page, false),
    checkbox.uncheck(),
  ]);
  await page.waitForTimeout(500);
  const servicesUnchecked = await getServiceNames(page);
  console.log('Services when unchecked:', servicesUnchecked);

  await Promise.all([
    waitForTraceResponse(page, true),
    checkbox.check(),
  ]);
  await page.waitForTimeout(500);
  const servicesRechecked = await getServiceNames(page);
  console.log('Services when rechecked:', servicesRechecked);

  const builtInAfterUncheck = servicesUnchecked.filter((name) => builtInServiceNames.has(name));
  console.log('Built-in services after uncheck:', builtInAfterUncheck);

  if (builtInAfterUncheck.length > 0) {
    const builtInAfterRecheck = servicesRechecked.filter((name) => builtInServiceNames.has(name));
    expect(builtInAfterRecheck).toHaveLength(0);
  } else {
    console.log('No built-in services present after uncheck; skip filter assertion.');
  }
});
