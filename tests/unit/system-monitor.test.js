// @ts-check
import { test, expect } from '@playwright/test';

test.describe('System Monitor Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('should fetch and display CI/CD data', async ({ page }) => {
    // Mock the API response for CI/CD data
    await page.route('**/api/monitor-data.js?type=ci-cd', async route => {
      const json = { status: 'success', lastRun: '2025-07-24 10:00:00' };
      await route.fulfill({ json });
    });

    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    const ciCdPane = page.locator('#monitor-pane-ci-cd');
    await expect(ciCdPane).toContainText('CI/CD Status: success');
    await expect(ciCdPane).toContainText('Last Run: 2025-07-24 10:00:00');
  });

  test('should fetch and display AI token analytics', async ({ page }) => {
    // Mock the API response for AI token data
    await page.route('**/api/monitor-data.js?type=ai-tokens', async route => {
      const json = { totalTokens: 12345, cachedTokens: 5432 };
      await route.fulfill({ json });
    });

    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    const aiTokensPane = page.locator('#monitor-pane-ai-tokens');
    await expect(aiTokensPane).toContainText('Total Tokens: 12345');
    await expect(aiTokensPane).toContainText('Cached Tokens: 5432');
  });

  test('should fetch and display Homestead telemetry', async ({ page }) => {
    // Mock the API response for Homestead telemetry
    await page.route('**/api/monitor-data.js?type=homestead', async route => {
      const json = { cpu: '25%', memory: '40%', disk: '60%' };
      await route.fulfill({ json });
    });

    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    const homesteadPane = page.locator('#monitor-pane-homestead');
    await expect(homesteadPane).toContainText('CPU: 25%');
    await expect(homesteadPane).toContainText('Memory: 40%');
    await expect(homesteadPane).toContainText('Disk: 60%');
  });

  test('should update data on refresh cycles', async ({ page }) => {
    // Initial mock for CI/CD data
    await page.route('**/api/monitor-data.js?type=ci-cd', async route => {
      const json = { status: 'initial', lastRun: 'initial time' };
      await route.fulfill({ json });
    });

    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    const ciCdPane = page.locator('#monitor-pane-ci-cd');
    await expect(ciCdPane).toContainText('CI/CD Status: initial');

    // Update the mock response after a short delay
    await page.route('**/api/monitor-data.js?type=ci-cd', async route => {
      const json = { status: 'updated', lastRun: 'updated time' };
      await route.fulfill({ json });
    });

    // Assuming there's a mechanism to trigger a refresh or it happens automatically
    // For this test, we'll simulate a re-entry into monitor mode to force a refresh
    // In a real scenario, you might trigger a refresh button or wait for an interval
    await terminalInput.fill('monitor'); // Re-enter monitor mode to trigger data fetch
    await terminalInput.press('Enter');

    await expect(ciCdPane).toContainText('CI/CD Status: updated');
  });
});
