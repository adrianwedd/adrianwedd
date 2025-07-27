import { test, expect } from '@playwright/test';

test.describe('Adrian Wedd Terminal Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the terminal interface
    await page.goto('/');

    // Wait for terminal to be ready
    await page.waitForSelector('.terminal');
    await page.waitForSelector('.command-input');

    // Wait for boot sequence to complete
    await page.waitForTimeout(3000);
  });

  test('should load terminal interface correctly', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Adrian Wedd - Terminal Interface/);

    // Check terminal elements are present
    await expect(page.locator('.terminal')).toBeVisible();
    await expect(page.locator('.command-input')).toBeVisible();
    await expect(page.locator('.prompt')).toBeVisible();

    // Check boot sequence completed
    await expect(page.locator('.boot-line').last()).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/terminal-loaded.png',
      fullPage: true,
    });
  });

  test('should display properly formatted help command', async ({ page }) => {
    // Type help command
    await page.fill('.command-input', 'help');
    await page.press('.command-input', 'Enter');

    // Wait for help output
    await page.waitForTimeout(1000);

    // Check help sections are displayed
    await expect(page.locator('text=ADRIAN.AI TERMINAL INTERFACE')).toBeVisible();
    await expect(page.locator('text=Personal & Projects:')).toBeVisible();
    await expect(page.locator('text=Interactive Features:')).toBeVisible();
    await expect(page.locator('text=System Commands:')).toBeVisible();
    await expect(page.locator('text=Tips:')).toBeVisible();

    // Check specific commands are listed
    await expect(page.locator('text=chat → 🤖 Real-time AI persona chat')).toBeVisible();
    await expect(page.locator('text=matrix → 🎨 Toggle matrix rain')).toBeVisible();
    await expect(page.locator('text=projects → Technical projects showcase')).toBeVisible();

    // Check philosophy quote
    await expect(page.locator('text=Liberate through recursion')).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/help-command.png',
      fullPage: true,
    });
  });

  test('should execute about command', async ({ page }) => {
    await page.fill('.command-input', 'about');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check about content
    await expect(page.locator('text=Adrian Wedd - Recursive Systems Architect')).toBeVisible();
    await expect(page.locator('text=Neurodivergent')).toBeVisible();
    await expect(page.locator('text=Tasmania')).toBeVisible();
    await expect(page.locator('text=VERITAS')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/about-command.png',
      fullPage: true,
    });
  });

  test('should execute projects command', async ({ page }) => {
    await page.fill('.command-input', 'projects');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check projects content
    await expect(page.locator('text=TicketSmith')).toBeVisible();
    await expect(page.locator('text=Personal Intelligence Node')).toBeVisible();
    await expect(page.locator('text=VERITAS')).toBeVisible();
    await expect(page.locator('text=LangChain')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/projects-command.png',
      fullPage: true,
    });
  });

  test('should execute skills command', async ({ page }) => {
    await page.fill('.command-input', 'skills');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check skills content
    await expect(page.locator('text=Technical Arsenal')).toBeVisible();
    await expect(page.locator('text=Python')).toBeVisible();
    await expect(page.locator('text=LangChain')).toBeVisible();
    await expect(page.locator('text=Docker')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/skills-command.png',
      fullPage: true,
    });
  });

  test('should execute homestead command', async ({ page }) => {
    await page.fill('.command-input', 'homestead');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check homestead content
    await expect(page.locator('text=170 acres')).toBeVisible();
    await expect(page.locator('text=Tasmania')).toBeVisible();
    await expect(page.locator('text=Solar')).toBeVisible();
    await expect(page.locator('text=ESPHome')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/homestead-command.png',
      fullPage: true,
    });
  });

  test('should execute veritas command', async ({ page }) => {
    await page.fill('.command-input', 'veritas');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check VERITAS content
    await expect(page.locator('text=AI Safety Research Platform')).toBeVisible();
    await expect(page.locator('text=jailbreak simulation')).toBeVisible();
    await expect(page.locator('text=defensive security research')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/veritas-command.png',
      fullPage: true,
    });
  });

  test('should execute neofetch command', async ({ page }) => {
    await page.fill('.command-input', 'neofetch');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check neofetch ASCII art and system info
    await expect(page.locator('text=adrian@tasmania-homestead')).toBeVisible();
    await expect(page.locator('text=Tasmania Linux')).toBeVisible();
    await expect(page.locator('text=NeurodivergentOS')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/neofetch-command.png',
      fullPage: true,
    });
  });

  test('should open chat interface', async ({ page }) => {
    await page.fill('.command-input', 'chat');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check chat interface appears
    await expect(page.locator('.chat-interface')).toBeVisible();
    await expect(page.locator('.chat-header')).toBeVisible();
    await expect(page.locator('text=ADRIAN.AI - Recursive Intelligence Node')).toBeVisible();
    await expect(page.locator('.chat-input')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/chat-interface.png',
      fullPage: true,
    });
  });

  test('should toggle matrix rain effect', async ({ page }) => {
    // Enable matrix rain
    await page.fill('.command-input', 'matrix');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check matrix rain canvas is created
    await expect(page.locator('.matrix-rain')).toBeVisible();
    await expect(page.locator('text=Matrix rain enabled')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/matrix-rain-enabled.png',
      fullPage: true,
    });

    // Disable matrix rain
    await page.fill('.command-input', 'matrix');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(1000);

    // Check matrix rain is disabled
    await expect(page.locator('text=Matrix rain disabled')).toBeVisible();
  });

  test('should handle command history with arrow keys', async ({ page }) => {
    // Execute a few commands
    await page.fill('.command-input', 'help');
    await page.press('.command-input', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('.command-input', 'about');
    await page.press('.command-input', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('.command-input', 'projects');
    await page.press('.command-input', 'Enter');
    await page.waitForTimeout(500);

    // Test arrow up to get previous command
    await page.press('.command-input', 'ArrowUp');
    await expect(page.locator('.command-input')).toHaveValue('projects');

    await page.press('.command-input', 'ArrowUp');
    await expect(page.locator('.command-input')).toHaveValue('about');

    await page.press('.command-input', 'ArrowUp');
    await expect(page.locator('.command-input')).toHaveValue('help');

    // Test arrow down
    await page.press('.command-input', 'ArrowDown');
    await expect(page.locator('.command-input')).toHaveValue('about');
  });

  test('should handle unknown commands gracefully', async ({ page }) => {
    await page.fill('.command-input', 'invalidcommand');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(500);

    // Check error message
    await expect(page.locator('text=Command not found: invalidcommand')).toBeVisible();
    await expect(page.locator("text=Type 'help' for available commands")).toBeVisible();
  });

  test('should clear terminal', async ({ page }) => {
    // Execute some commands first
    await page.fill('.command-input', 'help');
    await page.press('.command-input', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('.command-input', 'about');
    await page.press('.command-input', 'Enter');
    await page.waitForTimeout(500);

    // Clear terminal
    await page.fill('.command-input', 'clear');
    await page.press('.command-input', 'Enter');

    await page.waitForTimeout(500);

    // Check that only boot sequence and prompt remain
    const outputLines = await page.locator('.boot-line').count();
    expect(outputLines).toBeLessThan(10); // Should be mostly cleared

    // Boot sequence should still be there
    await expect(page.locator('text=Initializing VERITAS neural pathways')).toBeVisible();
  });

  test('should have responsive design elements', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Check terminal is still visible and usable
    await expect(page.locator('.terminal')).toBeVisible();
    await expect(page.locator('.command-input')).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/mobile-view.png',
      fullPage: true,
    });

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/tablet-view.png',
      fullPage: true,
    });
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check input has proper focus
    await page.focus('.command-input');
    await expect(page.locator('.command-input')).toBeFocused();

    // Check proper ARIA labels would be ideal (to be added)
    // await expect(page.locator('.terminal')).toHaveAttribute('role', 'application');
  });
});
