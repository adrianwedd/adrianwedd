// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Terminal Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('Terminal initializes and displays boot sequence', async ({ page }) => {
    // Check for the presence of the terminal element
    const terminal = page.locator('#terminal');
    await expect(terminal).toBeVisible();

    // Check for a common element in the boot sequence, e.g., a welcome message or prompt
    await expect(terminal).toContainText('Welcome to Adrian's Retro Terminal');
    await expect(terminal).toContainText('Type 'help' for a list of commands.');
    await expect(terminal).toContainText('adrian@retro-terminal:~$');
  });

  test('Command execution and output display', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('echo Hello Playwright');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Hello Playwright');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:~$'); // Ensure prompt reappears
  });

  test('Command history navigation (↑/↓ keys)', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');

    await terminalInput.fill('first command');
    await terminalInput.press('Enter');
    await terminalInput.fill('second command');
    await terminalInput.press('Enter');

    // Navigate up to 'second command'
    await terminalInput.press('ArrowUp');
    await expect(terminalInput).toHaveValue('second command');

    // Navigate up to 'first command'
    await terminalInput.press('ArrowUp');
    await expect(terminalInput).toHaveValue('first command');

    // Navigate down to 'second command'
    await terminalInput.press('ArrowDown');
    await expect(terminalInput).toHaveValue('second command');

    // Navigate down past 'second command' should clear input or stay on last command
    await terminalInput.press('ArrowDown');
    await expect(terminalInput).toHaveValue(''); // Assuming it clears after last history item
  });

  test('Help command and formatted output', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('help');
    await terminalInput.press('Enter');

    // Check for specific help output format or content
    await expect(terminalOutput).toContainText('Available Commands:');
    await expect(terminalOutput).toContainText('help - Displays this help message.');
    await expect(terminalOutput).toContainText('clear - Clears the terminal screen.');
    // Add more checks for other commands as they are implemented
  });

  test('Clear command functionality', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('echo This will be cleared');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('This will be cleared');

    await terminalInput.fill('clear');
    await terminalInput.press('Enter');

    // After clear, the output should only contain the last prompt
    await expect(terminalOutput).not.toContainText('This will be cleared');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:~$');
    // Verify that the terminal output area is effectively empty except for the prompt
    const outputContent = await terminalOutput.innerText();
    const lines = outputContent.split('\n').filter(line => line.trim() !== '');
    expect(lines.length).toBeLessThanOrEqual(2); // Should be just the prompt or prompt + cursor
  });
});
