import { test, expect } from '@playwright/test';

test('terminal accepts "help" command and shows output', async ({ page }) => {
  await page.goto('http://localhost:8000'); // Assuming the server is running on port 8000

  // Wait for the terminal to be ready (e.g., input field visible)
  await page.waitForSelector('#commandInput');

  // Type 'help' and press Enter
  await page.type('#commandInput', 'help');
  await page.press('#commandInput', 'Enter');

  // Wait for the output to appear. Adjust selector if needed.
  // This assumes 'help' command output contains "Available commands:"
  await page.waitForSelector('#terminal-output');
  const output = await page.textContent('#terminal-output');

  // Assert that the help output is present
  expect(output).toContain('Available commands:');
  expect(output).toContain('help');
  expect(output).toContain('clear');
});