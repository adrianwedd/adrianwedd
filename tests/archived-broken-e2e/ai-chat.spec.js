import { test, expect } from '@playwright/test';

test.describe('AI Chat Functionality', () => {
  /* ───────────────────────────── SET-UP ───────────────────────────── */
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  /* ─────────────────── BASIC CHAT COMMAND WORKS ──────────────────── */
  test('chat command opens chat UI', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('chat');
    await input.press('Enter');

    await expect(output).toContainText('ADRIAN.AI CHAT SESSION');
  });

  /* ───────────────────── BACK-END ERROR HANDLING ─────────────────── */
  test('handles 500 Internal Server Error', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('chat');
    await input.press('Enter');

    await page.route('**/api/chat', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal server error' }) })
    );

    await input.fill('test message');
    await input.press('Enter');

    await expect(output).toContainText('Error: Internal server error');
    await expect(output).toContainText('adrian@retro-terminal:/offline-chat$');
  });

  test('handles 400 Bad Request', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('chat');
    await input.press('Enter');

    await page.route('**/api/chat', route =>
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'Message too short' }) })
    );

    await input.fill('short');
    await input.press('Enter');

    await expect(output).toContainText('Error: Message too short');
    await expect(output).toContainText('adrian@retro-terminal:/offline-chat$');
  });

  /* ─────────────────── OFF-LINE FALLBACK COMMANDS ─────────────────── */
  test('still runs local commands (help) offline', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('help');
    await input.press('Enter');

    await expect(output).toContainText('Available Commands:');
  });

  /* ────────────── MARKDOWN-FORMATTER UTILITY FUNCTION ─────────────── */
  test('formatLLMResponse converts basic markdown', async ({ page }) => {
    const ok = await page.evaluate(() => {
      const t = window.terminal;
      return (
        t.formatLLMResponse('**bold** and *italic*')
          .includes('<strong>bold</strong>') &&
        t.formatLLMResponse('`code`')
          .includes('<code class="inline-code">code</code>')
      );
    });
    expect(ok).toBe(true);
  });

  /* ───────────── CHAT-MODE FLOW & MISCELLANEOUS UX TESTS ──────────── */
  test('shows usage text when no message supplied', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('chat');
    await input.press('Enter');

    await expect(output).toContainText('Interactive chat');
    await expect(output).toContainText('Type your message');
  });

  test('exit command leaves chat mode', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('chat');
    await input.press('Enter');

    await input.fill('exit');
    await input.press('Enter');

    await expect(output).toContainText('Chat session ended');
  });

  /* ────────────── SUCCESSFUL BACK-END RESPONSE RENDER ─────────────── */
  test('shows AI response when API succeeds', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('chat');
    await input.press('Enter');

    await page.route('**/api/chat', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          response: 'Hello! This is a test response from the AI.',
          usage: { tokens: 25 }
        })
      })
    );

    await input.fill('Hello');
    await input.press('Enter');

    await expect(output).toContainText('Hello! This is a test response from the AI.');
  });

  /* ─────────────────── NETWORK FAILURE FALL-BACK ──────────────────── */
  test('falls back gracefully on network abort', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('chat');
    await input.press('Enter');

    await page.route('**/api/chat', route => route.abort());

    await input.fill('test message');
    await input.press('Enter');

    await expect(output).toContainText('adrian@retro-terminal:/offline-chat$');
  });

  /* ─────────────────── CONTEXT MAINTENANCE CHECK ──────────────────── */
  test('maintains context across messages', async ({ page }) => {
    const input  = page.locator('#commandInput');
    const output = page.locator('.terminal-content');

    await input.fill('chat');
    await input.press('Enter');

    await page.route('**/api/chat', async route => {
      const data = await route.request().postData();
      if (data && data.includes('Hello')) {
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ response: 'Hi there!', usage: { tokens: 15 } })
        });
      }
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ response: 'I remember!', usage: { tokens: 10 } })
      });
    });

    await input.fill('Hello');
    await input.press('Enter');
    await expect(output).toContainText('Hi there!');

    await input.fill('Do you remember?');
    await input.press('Enter');
    await expect(output).toContainText('I remember!');
  });
});