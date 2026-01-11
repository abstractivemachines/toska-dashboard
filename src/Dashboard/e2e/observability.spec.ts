import { test, expect, Page, Locator } from '@playwright/test';

interface Issue {
  section: string;
  type: 'error' | 'warning' | 'link';
  message: string;
  detail?: string;
}

const issues: Issue[] = [];

function logIssue(issue: Issue) {
  issues.push(issue);
  console.log(`[ISSUE] [${issue.section}] ${issue.message}${issue.detail ? ` (${issue.detail})` : ''}`);
}

async function setupListeners(page: Page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      logIssue({ section: 'console', type: 'error', message: `Console error: ${msg.text()}` });
    }
  });

  page.on('response', (response) => {
    const status = response.status();
    if (status >= 400) {
      logIssue({
        section: 'network',
        type: 'error',
        message: `HTTP ${status} ${response.statusText()}`,
        detail: response.url(),
      });
    }
  });
}

async function openLinkInNewPage(link: Locator, label: string, page: Page) {
  const href = await link.getAttribute('href');
  if (!href) {
    logIssue({ section: 'links', type: 'warning', message: `Missing href on ${label}` });
    return;
  }

  const [popup] = await Promise.all([page.context().waitForEvent('page'), link.click()]);
  await popup.waitForLoadState('domcontentloaded');
  console.log(`[LINK] ${label} opened ${popup.url()}`);
  await popup.close();
}

test.describe('Observability Page', () => {
  test.setTimeout(120000);

  test('covers observability features and external links', async ({ page }) => {
    await setupListeners(page);

    await page.goto('/#/observability');
    await page.waitForTimeout(4000);

    const title = page.locator('h1, h2').filter({ hasText: /Observability/i }).first();
    await expect(title).toBeVisible();

    const loading = page.locator('.loading-state');
    if (await loading.count()) {
      await loading.first().waitFor({ state: 'detached', timeout: 10000 }).catch(() => {
        logIssue({ section: 'page', type: 'warning', message: 'Loading state still visible after 10s' });
      });
    }

    const portalPanel = page.locator('section.panel:has(h2:has-text("Observability Portal"))');
    await expect(portalPanel).toBeVisible();
    const portalCards = portalPanel.locator('.portal-card');
    const portalCardCount = await portalCards.count();
    console.log(`[INFO] Portal entries: ${portalCardCount}`);
    if (portalCardCount === 0) {
      logIssue({ section: 'portal', type: 'warning', message: 'No portal entries available' });
    }
    const portalLinks = portalPanel.locator('.portal-link');
    const portalLinkCount = await portalLinks.count();
    for (let i = 0; i < Math.min(portalLinkCount, 5); i++) {
      const link = portalLinks.nth(i);
      await openLinkInNewPage(link, `Portal link ${i + 1}`, page).catch((err) =>
        logIssue({ section: 'portal', type: 'link', message: 'Portal link failed to open', detail: err.message })
      );
    }

    const metricsPanel = page.locator('section.panel:has(h2:has-text("Metrics Summary"))');
    await expect(metricsPanel).toBeVisible();
    const metricsTable = metricsPanel.locator('table.data-table tbody tr');
    const metricRows = await metricsTable.count();
    console.log(`[INFO] Metric rows: ${metricRows}`);
    if (metricRows === 0) {
      const emptyState = metricsPanel.locator('text=No metric summaries available.');
      if (!(await emptyState.isVisible())) {
        logIssue({ section: 'metrics', type: 'warning', message: 'Metrics panel empty without empty state' });
      }
    }

    const sloPanel = page.locator('section.panel:has(h2:has-text("SLO Statuses"))');
    await expect(sloPanel).toBeVisible();
    const sloCards = sloPanel.locator('.slo-card');
    console.log(`[INFO] SLO cards: ${await sloCards.count()}`);

    const burnPanel = page.locator('section.panel:has(h2:has-text("Burn-Rate Alerts"))');
    await expect(burnPanel).toBeVisible();
    const burnCards = burnPanel.locator('.burn-alert-card');
    console.log(`[INFO] Burn-rate alerts: ${await burnCards.count()}`);

    const releasePanel = page.locator('section.panel:has(h2:has-text("Recent Releases"))');
    await expect(releasePanel).toBeVisible();
    const releaseRows = releasePanel.locator('table.data-table tbody tr');
    const releaseRowCount = await releaseRows.count();
    console.log(`[INFO] Release rows: ${releaseRowCount}`);
    const releaseLinks = releasePanel.locator('.release-links a');
    const releaseLinkCount = await releaseLinks.count();
    for (let i = 0; i < Math.min(releaseLinkCount, 4); i++) {
      const link = releaseLinks.nth(i);
      const label = await link.textContent();
      await openLinkInNewPage(link, `Release ${label ?? ''} link`, page).catch((err) =>
        logIssue({ section: 'releases', type: 'link', message: 'Release link failed to open', detail: err.message })
      );
    }

    const playbooksPanel = page.locator('section.panel:has(h2:has-text("Playbooks"))');
    await expect(playbooksPanel).toBeVisible();
    const playbookCards = playbooksPanel.locator('.playbook-card');
    const playbookCount = await playbookCards.count();
    console.log(`[INFO] Playbooks: ${playbookCount}`);
    if (playbookCount > 0) {
      const firstSummary = playbookCards.first().locator('summary');
      await firstSummary.click();
      await page.waitForTimeout(500);
      const steps = playbookCards.first().locator('.playbook-step');
      console.log(`[INFO] Playbook steps shown: ${await steps.count()}`);
    }

    const topologyPanel = page.locator('section.panel:has(h2:has-text("Topology Overview"))');
    await expect(topologyPanel).toBeVisible();
    const nodeRows = topologyPanel.locator('table.data-table').nth(0).locator('tbody tr');
    const edgeRows = topologyPanel.locator('table.data-table').nth(1).locator('tbody tr');
    console.log(`[INFO] Topology nodes: ${await nodeRows.count()}, edges: ${await edgeRows.count()}`);

    const errorState = page.locator('.error-state');
    if (await errorState.count()) {
      const errorText = await errorState.first().innerText();
      logIssue({ section: 'page', type: 'error', message: 'Error state visible', detail: errorText });
    }

    await page.screenshot({ path: 'e2e-results/observability-full.png', fullPage: true });
  });

  test.afterAll(async () => {
    console.log('\n===== OBSERVABILITY ISSUES =====');
    if (issues.length === 0) {
      console.log('No issues recorded.');
    } else {
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.type}] ${issue.section} - ${issue.message}${issue.detail ? ` (${issue.detail})` : ''}`);
      });
    }
    console.log('================================\n');
  });
});
