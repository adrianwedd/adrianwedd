// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Terminal input and output should work across browsers', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('echo Hello from ' + page.context().browser().browserType().name());
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Hello from ' + page.context().browser().browserType().name());
  });

  test('Music player controls should function across browsers', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const musicPlayerStatus = page.locator('#music-player-status');

    await terminalInput.fill('play cyberpunk');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Cyberpunk');

    await terminalInput.fill('stop music');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Music stopped');
  });

  test('AI chat integration should work across browsers', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    await page.route('**/api/chat.js', async route => {
      const json = { response: 'Mocked AI response for cross-browser test.' };
      await route.fulfill({ json });
    });

    await terminalInput.fill('Test AI in ' + page.context().browser().browserType().name());
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('AI: Mocked AI response for cross-browser test.');
  });
});
