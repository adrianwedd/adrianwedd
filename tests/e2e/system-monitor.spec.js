// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('System Monitor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('Monitor mode activation (htop/btop style)', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Entering system monitor mode.');
    // Assuming a specific element appears when monitor mode is active
    const monitorDisplay = page.locator('#system-monitor-display'); // Replace with actual selector
    await expect(monitorDisplay).toBeVisible();
  });

  test('Three-pane layout rendering', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Assuming specific selectors for each pane
    const pane1 = page.locator('#monitor-pane-ci-cd');
    const pane2 = page.locator('#monitor-pane-ai-tokens');
    const pane3 = page.locator('#monitor-pane-homestead');

    await expect(pane1).toBeVisible();
    await expect(pane2).toBeVisible();
    await expect(pane3).toBeVisible();
  });

  test('CI/CD data fetching and display', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock the API response for CI/CD data
    await page.route('**/api/monitor-data.js?type=ci-cd', async route => {
      const json = { status: 'success', lastRun: '2025-07-24 10:00:00' };
      await route.fulfill({ json });
    });

    const ciCdPane = page.locator('#monitor-pane-ci-cd');
    await expect(ciCdPane).toContainText('CI/CD Status: success');
    await expect(ciCdPane).toContainText('Last Run: 2025-07-24 10:00:00');
  });

  test('AI token analytics updates', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock the API response for AI token data
    await page.route('**/api/monitor-data.js?type=ai-tokens', async route => {
      const json = { totalTokens: 12345, cachedTokens: 5432 };
      await route.fulfill({ json });
    });

    const aiTokensPane = page.locator('#monitor-pane-ai-tokens');
    await expect(aiTokensPane).toContainText('Total Tokens: 12345');
    await expect(aiTokensPane).toContainText('Cached Tokens: 5432');
  });

  test('Homestead telemetry simulation', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock the API response for Homestead telemetry
    await page.route('**/api/monitor-data.js?type=homestead', async route => {
      const json = { cpu: '25%', memory: '40%', disk: '60%' };
      await route.fulfill({ json });
    });

    const homesteadPane = page.locator('#monitor-pane-homestead');
    await expect(homesteadPane).toContainText('CPU: 25%');
    await expect(homesteadPane).toContainText('Memory: 40%');
    await expect(homesteadPane).toContainText('Disk: 60%');
  });

  test('Real-time data refresh cycles', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Initial mock for CI/CD data
    await page.route('**/api/monitor-data.js?type=ci-cd', async route => {
      const json = { status: 'initial', lastRun: 'initial time' };
      await route.fulfill({ json });
    });

    const ciCdPane = page.locator('#monitor-pane-ci-cd');
    await expect(ciCdPane).toContainText('CI/CD Status: initial');

    // Wait for a short period (e.g., 2 seconds) and then update the mock response
    // This assumes the refresh rate is faster than 2 seconds. Adjust as needed.
    await page.waitForTimeout(2000);

    await page.route('**/api/monitor-data.js?type=ci-cd', async route => {
      const json = { status: 'updated', lastRun: 'updated time' };
      await route.fulfill({ json });
    });

    // Trigger a refresh or wait for the next automatic refresh
    // If there's a refresh button, click it. Otherwise, rely on the automatic refresh.
    // For now, we'll just wait for another period to allow the automatic refresh to happen.
    await page.waitForTimeout(3000); // Wait for refresh cycle

    await expect(ciCdPane).toContainText('CI/CD Status: updated');
  });
});
