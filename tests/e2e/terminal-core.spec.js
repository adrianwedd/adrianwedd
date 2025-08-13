import { test, expect } from '@playwright/test';

test.describe('Terminal Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait for terminal to initialize
    await page.waitForSelector('#cli-input', { timeout: 10000 });
    await page.waitForFunction(() => window.terminal && window.terminal.initialized);
  });

  test('terminal loads and accepts input', async ({ page }) => {
    const input = page.locator('#cli-input');
    const output = page.locator('#output');

    await expect(input).toBeVisible();
    await expect(output).toBeVisible();

    await input.fill('help');
    await input.press('Enter');

    await expect(output).toContainText('Available Commands');
  });

  test('basic commands work', async ({ page }) => {
    const input = page.locator('#cli-input');
    const output = page.locator('#output');

    await input.fill('about');
    await input.press('Enter');
    await expect(output).toContainText('Adrian Wedd');

    await input.fill('clear');
    await input.press('Enter');
    // Terminal should clear but input should remain
    await expect(input).toBeVisible();
  });

  test('unknown command shows error', async ({ page }) => {
    const input = page.locator('#cli-input');
    const output = page.locator('#output');

    await input.fill('invalidcommand123');
    await input.press('Enter');

    await expect(output).toContainText('Unknown command:');
  });
});
