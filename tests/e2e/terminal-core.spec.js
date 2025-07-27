import { test, expect } from '@playwright/test';

test.describe('Terminal Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('terminal loads and accepts input', async ({ page }) => {
    const input = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await expect(input).toBeVisible();
    await expect(output).toBeVisible();

    await input.fill('help');
    await input.press('Enter');

    await expect(output).toContainText('ADRIAN.TERMINAL - Available Commands');
  });

  test('basic commands work', async ({ page }) => {
    const input = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('about');
    await input.press('Enter');
    await expect(output).toContainText('Adrian Wedd');

    await input.fill('clear');
    await input.press('Enter');
    // Terminal should clear but input should remain
    await expect(input).toBeVisible();
  });

  test('unknown command shows error', async ({ page }) => {
    const input = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('invalidcommand123');
    await input.press('Enter');

    await expect(output).toContainText('Command not found:');
  });
});
