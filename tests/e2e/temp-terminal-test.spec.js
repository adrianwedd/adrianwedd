import { test, expect } from '@playwright/test';

test('terminal accepts "help" command and shows output', async ({ page }) => {
  await page.goto('/'); // Use relative path

  // Wait for the terminal to be ready
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#cli-input')).toBeVisible({ timeout: 10000 });
  await page.waitForFunction(() => window.terminal && window.terminal.initialized);

  // Type 'help' and press Enter
  await page.fill('#cli-input', 'help');
  await page.press('#cli-input', 'Enter');

  // Wait for the output and check terminal content
  const output = page.locator('#output');

  // Assert that the help output is present with correct text
  await expect(output).toContainText('Available Commands');
  await expect(output).toContainText('help');
  await expect(output).toContainText('clear');
});
