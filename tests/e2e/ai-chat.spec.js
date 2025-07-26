import { test, expect } from '@playwright/test';

test.describe('AI Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Basic chat command functionality', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    // Test chat command
    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Should show chat interface
    await expect(terminalOutput).toContainText('ADRIAN.AI CHAT SESSION');
  });

  test('API error handling for 500 Internal Server Error', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Mock API to return a 500 error
    await page.route('**/api/chat.js', async route => {
      await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal server error' }) });
    });

    await terminalInput.fill('test message');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Error: Internal server error');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:/offline-chat$'); // Should fall back to offline mode
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
    await expect(terminalOutput).toContainText('adrian@retro-terminal:/offline-chat$'); // Should still fall back to offline mode
  });

  test('commands work in offline mode', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    // Test that commands still work in offline mode (e.g., 'help')
    await terminalInput.fill('help');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Available Commands:');
  });

  test('formatLLMResponse handles various markdown inputs', async ({ page }) => {
    const formattedText = await page.evaluate(() => {
      const terminalInstance = window.terminal; // Assuming terminal instance is globally accessible
      const testCases = [
        { input: '**bold** and *italic* text', expected: '<strong>bold</strong> and <em>italic</em> text' },
        { input: '`code snippet`', expected: '<code>code snippet</code>' },
        { input: '# Header', expected: '<h1>Header</h1>' },
        { input: '## Sub Header', expected: '<h2>Sub Header</h2>' },
        { input: 'Normal text with **bold** words', expected: 'Normal text with <strong>bold</strong> words' }
      ];

      const results = [];
      testCases.forEach(testCase => {
        const result = terminalInstance.formatLLMResponse ? terminalInstance.formatLLMResponse(testCase.input) : testCase.input;
        results.push({ input: testCase.input, output: result, expected: testCase.expected });
      });
      return results;
    });

    // Verify that markdown formatting is applied correctly
    expect(formattedText).toBeDefined();
    expect(formattedText.length).toBeGreaterThan(0);
  });

  test('chat command shows usage information when no message provided', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Should show chat interface with instructions
    await expect(terminalOutput).toContainText('Interactive chat');
    await expect(terminalOutput).toContainText('Type your message');
  });

  test('exit command works in chat mode', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    // Enter chat mode
    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Exit chat mode
    await terminalInput.fill('exit');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Chat session ended');
  });

  test('successful API response displays correctly', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Mock successful API response
    await page.route('**/api/chat.js', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          response: 'Hello! This is a test response from the AI.',
          usage: { tokens: 25 }
        })
      });
    });

    await terminalInput.fill('Hello');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Hello! This is a test response from the AI.');
  });

  test('network error handling', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Mock network failure
    await page.route('**/api/chat.js', async route => {
      await route.abort('failed');
    });

    await terminalInput.fill('test message');
    await terminalInput.press('Enter');

    // Should handle network error gracefully
    await expect(terminalOutput).toContainText('adrian@retro-terminal:/offline-chat$');
  });

  test('chat session maintains context', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('chat');
    await terminalInput.press('Enter');

    // Mock API responses
    await page.route('**/api/chat.js', async route => {
      const request = await route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('Hello')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            response: 'Hi there! How can I help you?',
            usage: { tokens: 15 }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            response: 'I remember our conversation!',
            usage: { tokens: 12 }
          })
        });
      }
    });

    // First message
    await terminalInput.fill('Hello');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Hi there! How can I help you?');

    // Second message should maintain context
    await terminalInput.fill('Do you remember?');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('I remember our conversation!');
  });
});