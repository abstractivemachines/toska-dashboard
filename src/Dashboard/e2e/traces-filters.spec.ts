import { test, expect, type Page } from '@playwright/test';

const traceListResponse = {
  total: 1,
  page: 1,
  pageSize: 50,
  items: [
    {
      traceId: '0123456789abcdef0123456789abcdef',
      serviceName: 'checkout',
      operation: 'GET /checkout',
      startTimeUtc: '2024-01-01T10:00:00.000Z',
      endTimeUtc: '2024-01-01T10:00:00.150Z',
      durationMs: 150,
      status: 'Ok',
      spanCount: 3,
      correlationId: null,
    },
  ],
};

async function mockTraceApi(page: Page) {
  await page.route('**/api/dashboard/traces/services', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(['checkout', 'cart']),
    });
  });

  await page.route('**/api/dashboard/traces/services/checkout/operations', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(['GET /checkout', 'POST /checkout']),
    });
  });

  await page.route(/\/api\/dashboard\/traces(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(traceListResponse),
    });
  });
}

test('trace filters allow suggestions and clear', async ({ page }) => {
  await mockTraceApi(page);
  await page.goto('/#/traces');

  const tableRows = page.locator('table.data-table tbody tr');
  await expect(tableRows).toHaveCount(1);

  const pagination = page.locator('.pagination-info');
  await expect(pagination).toContainText('Showing 1 traces');
  await page.getByRole('button', { name: 'Show total' }).click();
  await expect(pagination).toContainText('Showing 1 of 1 traces');
  await expect(page.getByRole('button', { name: 'Hide total' })).toBeVisible();

  const serviceInput = page.locator('#service-filter');
  await serviceInput.fill('check');
  const serviceSuggestion = page.locator('.autocomplete-suggestions li', { hasText: 'checkout' });
  await expect(serviceSuggestion).toBeVisible();
  await serviceSuggestion.click();
  await expect(serviceInput).toHaveValue('checkout');

  const operationInput = page.locator('#operation-filter');
  await expect(operationInput).toHaveAttribute('placeholder', 'Type to search...');
  await operationInput.fill('GET');
  const operationSuggestion = page.locator('.autocomplete-suggestions li', { hasText: 'GET /checkout' });
  await expect(operationSuggestion).toBeVisible();
  await operationSuggestion.click();
  await expect(operationInput).toHaveValue('GET /checkout');

  await page.locator('#status-filter').selectOption('Ok');
  await expect(page.locator('#status-filter')).toHaveValue('Ok');

  await page.locator('#duration-filter').fill('150');
  await expect(page.locator('#duration-filter')).toHaveValue('150');

  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(serviceInput).toHaveValue('');
  await expect(operationInput).toHaveValue('');
  await expect(page.locator('#status-filter')).toHaveValue('');
  await expect(page.locator('#duration-filter')).toHaveValue('');
});
