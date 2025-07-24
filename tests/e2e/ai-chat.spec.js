// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('AI Chat Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('Chat mode activation/deactivation', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Entering chat mode.');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:/chat$'); // Assuming prompt changes in chat mode

    await terminalInput.fill('exit');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Exiting chat mode.');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:~$'); // Prompt should revert
  });

  test('Message sending and receiving', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Mock the API response for chat
    await page.route('**/api/chat.js', async route => {
      const json = { response: 'Mocked AI response.' };
      await route.fulfill({ json });
    });

    await terminalInput.fill('Hello AI');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('You: Hello AI');
    await expect(terminalOutput).toContainText('AI: Mocked AI response.');
  });

  // TODO: Add tests for token counting accuracy, cache hit/miss tracking, and fallback to offline mode.
  // These will likely require more sophisticated mocking and state management.
});
