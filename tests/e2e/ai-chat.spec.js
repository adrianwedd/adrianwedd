// @ts-check
import { test, expect } from '@playwright/test';

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

  test('Token counting accuracy', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Mock API response with specific token counts
    await page.route('**/api/chat.js', async route => {
      const json = { response: 'Short response.', tokens: { total: 10, cached: 0 } };
      await route.fulfill({ json });
    });

    await terminalInput.fill('What is 1+1?');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Tokens: 10 (Cached: 0)'); // Assuming this is how token count is displayed

    await page.route('**/api/chat.js', async route => {
      const json = { response: 'Longer response with more tokens.', tokens: { total: 50, cached: 5 } };
      await route.fulfill({ json });
    });

    await terminalInput.fill('Tell me about the universe.');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Tokens: 50 (Cached: 5)');
  });

  test('Cache hit/miss tracking', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // First request - simulate cache miss
    await page.route('**/api/chat.js', async route => {
      const json = { response: 'First response (cache miss).', tokens: { total: 20, cached: 0 } };
      await route.fulfill({ json });
    });

    await terminalInput.fill('Query A');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Tokens: 20 (Cached: 0)');

    // Second request with same query - simulate cache hit
    await page.route('**/api/chat.js', async route => {
      const json = { response: 'Second response (cache hit).', tokens: { total: 20, cached: 20 } };
      await route.fulfill({ json });
    });

    await terminalInput.fill('Query A');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Tokens: 20 (Cached: 20)');
  });

  test('Fallback to offline mode on API error', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Mock API to return an error
    await page.route('**/api/chat.js', async route => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await terminalInput.fill('Hello AI');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Error: Could not connect to AI service. Falling back to offline mode.');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:/offline-chat
); // Assuming prompt changes for offline mode

    // Test that commands still work in offline mode (e.g., 'help')
    await terminalInput.fill('help');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Available Commands:');
    await expect(terminalOutput).toContainText('exit - Exits offline chat mode.');
  });

  test('formatLLMResponse handles various markdown inputs', async ({ page }) => {
    const formattedText = await page.evaluate(() => {
      const terminalInstance = window.terminal; // Assuming terminal instance is globally accessible
      const testCases = [
        { input: '**bold** and *italic* text', expected: '<strong>bold</strong> and <em>italic</em> text' },
        { input: 'inline `code`', expected: 'inline <code class="inline-code">code</code>' },
        { input: '```\ncode block\n```', expected: '<pre class="code-block">\ncode block\n</pre>' },
        { input: '- list item 1\n- list item 2', expected: '• list item 1<br>• list item 2' },
        { input: 'Line 1\nLine 2', expected: 'Line 1<br>Line 2' },
        { input: 'Mixed: **bold** `code` - item\nNew line.', expected: 'Mixed: <strong>bold</strong> <code class="inline-code">code</code> • item<br>New line.' }
      ];
      
      let allPassed = true;
      for (const testCase of testCases) {
        const result = terminalInstance.formatLLMResponse(testCase.input);
        if (result !== testCase.expected) {
          console.error(`Test failed for input: ${testCase.input}\nExpected: ${testCase.expected}\nGot: ${result}`);
          allPassed = false;
        }
      }
      return allPassed;
    });
    expect(formattedText).toBe(true);
  });

  test('API error handling for 400 Bad Request', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Mock API to return a 400 error with a specific message
    await page.route('**/api/chat.js', async route => {
      await route.fulfill({ status: 400, body: JSON.stringify({ error: 'Message too short' }) });
    });

    await terminalInput.fill('short');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Error: Message too short');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:/offline-chat
); // Should still fall back to offline mode
  });
}
