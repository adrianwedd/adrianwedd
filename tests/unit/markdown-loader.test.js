// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('MarkdownLoader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('should render markdown content to terminal', async ({ page }) => {
    const terminalOutput = page.locator('#terminal-output');

    // Mock the fetch request for markdown content
    await page.route('https://raw.githubusercontent.com/adrianwedd/adrianwedd/main/content/about.md', async route => {
      const markdownContent = '# About Me\n\nThis is **Adrian**.';
      await route.fulfill({ body: markdownContent });
    });

    // Execute the command that triggers markdown loading
    await page.evaluate(() => {
      window.terminal.executeCommand('about');
    });

    // Expect the formatted markdown to appear in the terminal
    await expect(terminalOutput).toContainText('# About Me'); // Raw markdown header
    await expect(terminalOutput).toContainText('This is Adrian.'); // Content
    await expect(terminalOutput).toContainText('Loading content...');
  });

  test('should handle markdown content loading errors and fallback', async ({ page }) => {
    const terminalOutput = page.locator('#terminal-output');

    // Mock the fetch request to fail
    await page.route('https://raw.githubusercontent.com/adrianwedd/adrianwedd/main/content/nonexistent.md', async route => {
      await route.fulfill({ status: 404 });
    });

    // Execute the command that triggers markdown loading
    await page.evaluate(() => {
      window.terminal.executeCommand('nonexistent'); // Assuming this command would try to load nonexistent.md
    });

    // Expect an error message and fallback content
    await expect(terminalOutput).toContainText('❌ Failed to load nonexistent: Not Found');
    // Assuming a fallback to showAbout() or similar
    await expect(terminalOutput).toContainText('Adrian Wedd - Systems Architect');
  });
});
