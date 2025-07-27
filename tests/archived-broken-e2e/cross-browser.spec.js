// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Cross‑Browser Compatibility', () => {
  /* ------------------------------------------------------------------ */
  /*                               SETUP                                */
  /* ------------------------------------------------------------------ */
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  /* ------------------------------------------------------------------ */
  /*               TERMINAL INPUT / OUTPUT BASIC FUNCTION               */
  /* ------------------------------------------------------------------ */
  test('Terminal echoes correctly in every browser', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('.terminal-content');

    const msg = `echo Hello from ${page.context().browser()?.browserType().name()}`;
    await terminalInput.fill(msg);
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText(
      `Hello from ${page.context().browser()?.browserType().name()}`
    );
  });

  /* ------------------------------------------------------------------ */
  /*             MUSIC PLAYER COMMANDS ACROSS BROWSERS                  */
  /* ------------------------------------------------------------------ */
  test('Music player responds to play / stop', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('.terminal-content');

    // Play a track
    await terminalInput.fill('music cyberpunk');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Now playing: cyberpunk');

    // Stop the track
    await terminalInput.fill('stop');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Music stopped');
  });

  /* ------------------------------------------------------------------ */
  /*             AI CHAT INTEGRATION ACROSS BROWSERS                    */
  /* ------------------------------------------------------------------ */
  test('AI chat round‑trip works cross‑browser', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('.terminal-content');

    // Open chat mode
    await terminalInput.fill('chat');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('ADRIAN.AI CHAT SESSION');

    // Mock the /api/chat endpoint for a deterministic response
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ response: 'Mocked AI response for cross‑browser test.' }),
      });
    });

    // Send a message
    const txt = `Test AI in ${page.context().browser()?.browserType().name()}`;
    await terminalInput.fill(txt);
    await terminalInput.press('Enter');

    // Validate the mocked response is rendered in the terminal
    await expect(terminalOutput).toContainText('Mocked AI response for cross‑browser test.');
  });
});
