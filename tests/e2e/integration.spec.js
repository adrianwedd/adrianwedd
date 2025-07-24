// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('Verify overall application integration', async ({ page }) => {
    // This test will cover scenarios that involve multiple components interacting.
    // For example, playing music, then using voice commands to control it, and checking system monitor.

    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    // Scenario 1: Start music, then use voice command (mocked) to change track
    await terminalInput.fill('play synthwave');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Now playing: Synthwave');

    // Mock voice command to change track
    // This would typically involve mocking the speech recognition API
    // For now, we simulate the effect of a voice command by directly executing the command
    await terminalInput.fill('play ambient');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Now playing: Ambient');

    // Scenario 2: Check system monitor after some AI chat interactions
    await terminalInput.fill('chat');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Entering chat mode.');

    await page.route('**/api/chat.js', async route => {
      const json = { response: 'Mocked AI response for integration test.' };
      await route.fulfill({ json });
    });

    await terminalInput.fill('Tell me a joke');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('AI: Mocked AI response for integration test.');

    await terminalInput.fill('exit');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Exiting chat mode.');

    await terminalInput.fill('monitor');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Entering system monitor mode.');

    // Verify that AI token analytics reflect the chat interaction
    await page.route('**/api/monitor-data.js?type=ai-tokens', async route => {
      const json = { totalTokens: 150, cachedTokens: 50 }; // Example values after chat
      await route.fulfill({ json });
    });
    const aiTokensPane = page.locator('#monitor-pane-ai-tokens');
    await expect(aiTokensPane).toContainText('Total Tokens: 150');
    await expect(aiTokensPane).toContainText('Cached Tokens: 50');

    // Add more complex integration scenarios as needed
  });
});
