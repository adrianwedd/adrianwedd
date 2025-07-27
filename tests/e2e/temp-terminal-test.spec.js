import { test, expect } from '@playwright/test';

test('terminal accepts "help" command and shows output', async ({ page }) => {
  await page.goto('/'); // Use relative path

  // Wait for the terminal to be ready
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#commandInput');

  // Type 'help' and press Enter
  await page.fill('#commandInput', 'help');
  await page.press('#commandInput', 'Enter');

  // Wait for the output and check terminal content
  const output = page.locator('.terminal-content');
  
  // Assert that the help output is present with correct text
  await expect(output).toContainText('ADRIAN.TERMINAL - Available Commands');
  await expect(output).toContainText('help');
  await expect(output).toContainText('clear');
});