// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  test('Terminal layout on iPhone SE', async ({ page }) => {
    const terminal = page.locator('#terminal');
    await expect(terminal).toBeVisible();
    // Add assertions specific to mobile layout, e.g., font sizes, element positions
    await expect(terminal).toHaveCSS('font-size', '14px'); // Example assertion
    // You might need to inspect your CSS to get the exact values
  });

  test.use({ viewport: { width: 414, height: 896 } }); // iPhone XR
  test('Terminal layout on iPhone XR', async ({ page }) => {
    const terminal = page.locator('#terminal');
    await expect(terminal).toBeVisible();
    await expect(terminal).toHaveCSS('font-size', '16px'); // Example assertion
  });

  test.use({ viewport: { width: 768, height: 1024 } }); // iPad
  test('Terminal layout on iPad', async ({ page }) => {
    const terminal = page.locator('#terminal');
    await expect(terminal).toBeVisible();
    await expect(terminal).toHaveCSS('font-size', '18px'); // Example assertion
  });

  test('Input field adjusts on mobile keyboard appearance (simulated)', async ({ page }) => {
    test.use({ viewport: { width: 375, height: 667 } });
    await page.reload(); // Reload with the specific viewport

    const terminalInput = page.locator('#terminal-input');
    const initialInputY = await terminalInput.boundingBox().then(box => box.y);

    // Simulate keyboard appearance by focusing the input
    await terminalInput.focus();

    // This is a simplified check. Real mobile keyboard simulation is complex.
    // You might need to add custom CSS to handle keyboard-open states.
    // For now, we'll just check if the input's position changes significantly.
    const afterFocusInputY = await terminalInput.boundingBox().then(box => box.y);

    // Expect the input to move up (or some other visual change)
    expect(afterFocusInputY).toBeLessThan(initialInputY); // Example: input moves up
  });
});
