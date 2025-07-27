// @ts-check
import { test, expect } from '@playwright/test';

test.describe('System Monitor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('Monitor mode activation (htop/btop style)', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Entering system monitor mode.');
    // Assuming a specific element appears when monitor mode is active
    const monitorDisplay = page.locator('#system-monitor-display'); // Replace with actual selector
    await expect(monitorDisplay).toBeVisible();
  });

  test('Three-pane layout rendering', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
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
    const terminalInput = page.locator('#commandInput');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock the API response for CI/CD data
    await page.route('**/api/monitor-data.js?type=ci-cd', async (route) => {
      const json = { status: 'success', lastRun: '2025-07-24 10:00:00' };
      await route.fulfill({ json });
    });

    const ciCdPane = page.locator('#monitor-pane-ci-cd');
    await expect(ciCdPane).toContainText('CI/CD Status: success');
    await expect(ciCdPane).toContainText('Last Run: 2025-07-24 10:00:00');
  });

  test('AI token analytics updates', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock the API response for AI token data
    await page.route('**/api/monitor-data.js?type=ai-tokens', async (route) => {
      const json = { totalTokens: 12345, cachedTokens: 5432 };
      await route.fulfill({ json });
    });

    const aiTokensPane = page.locator('#monitor-pane-ai-tokens');
    await expect(aiTokensPane).toContainText('Total Tokens: 12345');
    await expect(aiTokensPane).toContainText('Cached Tokens: 5432');
  });

  test('Homestead telemetry simulation', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock the API response for Homestead telemetry
    await page.route('**/api/monitor-data.js?type=homestead', async (route) => {
      const json = { cpu: '25%', memory: '40%', disk: '60%' };
      await route.fulfill({ json });
    });

    const homesteadPane = page.locator('#monitor-pane-homestead');
    await expect(homesteadPane).toContainText('CPU: 25%');
    await expect(homesteadPane).toContainText('Memory: 40%');
    await expect(homesteadPane).toContainText('Disk: 60%');
  });

  test('Real-time data refresh cycles', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Initial mock for CI/CD data
    await page.route('**/api/monitor-data.js?type=ci-cd', async (route) => {
      const json = { status: 'initial', lastRun: 'initial time' };
      await route.fulfill({ json });
    });

    const ciCdPane = page.locator('#monitor-pane-ci-cd');
    await expect(ciCdPane).toContainText('CI/CD Status: initial');

    // Wait for a short period (e.g., 2 seconds) and then update the mock response
    // This assumes the refresh rate is faster than 2 seconds. Adjust as needed.
    await page.waitForTimeout(2000);

    await page.route('**/api/monitor-data.js?type=ci-cd', async (route) => {
      const json = { status: 'updated', lastRun: 'updated time' };
      await route.fulfill({ json });
    });

    // Trigger a refresh or wait for the next automatic refresh
    // If there's a refresh button, click it. Otherwise, rely on the automatic refresh.
    // For now, we'll just wait for another period to allow the automatic refresh to happen.
    await page.waitForTimeout(3000); // Wait for refresh cycle

    await expect(ciCdPane).toContainText('CI/CD Status: updated');
  });

  test('Exit monitor mode using "q"', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Entering system monitor mode.');

    await page.keyboard.press('q');
    await expect(terminalOutput).toContainText('Exiting system monitor mode.');
    await expect(terminalOutput).toContainText('adrian@homestead:~$');
  });

  test('CI/CD data fetching handles API error', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock API to return an error
    await page.route('**/api/monitor-data.js?type=ci-cd', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    // Re-enter monitor mode to trigger data fetch with error
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Error fetching CI/CD data. Displaying mock data.');
    await expect(terminalOutput).toContainText('CI/CD Status: mock'); // Check for fallback data
  });

  test('Homestead telemetry handles API error', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock API to return an error
    await page.route('**/api/monitor-data.js?type=homestead', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    // Re-enter monitor mode to trigger data fetch with error
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText(
      'Error fetching homestead data. Displaying mock data.'
    );
    await expect(terminalOutput).toContainText('Location: mock'); // Check for fallback data
  });

  test('System data handles API error', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Mock API to return an error
    await page.route('**/api/monitor-data.js?type=system', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    // Re-enter monitor mode to trigger data fetch with error
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Error fetching system data. Displaying mock data.');
    await expect(terminalOutput).toContainText('Hostname: mock'); // Check for fallback data
  });

  test('Monitor display responsiveness', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Test that monitor adapts to different viewport sizes
    await page.setViewportSize({ width: 800, height: 600 });

    const monitorDisplay = page.locator('#system-monitor-display');
    await expect(monitorDisplay).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(monitorDisplay).toBeVisible();
  });

  test('Monitor keyboard shortcuts', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');

    // Test 'r' for refresh
    await page.keyboard.press('r');
    await expect(terminalOutput).toContainText('Refreshing monitor data...');

    // Test 'h' for help
    await page.keyboard.press('h');
    await expect(terminalOutput).toContainText('Monitor Help');
  });
});
