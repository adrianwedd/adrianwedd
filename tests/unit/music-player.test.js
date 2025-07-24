// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Music Player Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('should play and stop music', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const musicPlayerStatus = page.locator('#music-player-status'); // Assuming a status display

    // Simulate playing music
    await terminalInput.fill('play cyberpunk');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Cyberpunk');

    // Simulate stopping music
    await terminalInput.fill('stop music');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Music stopped');
  });

  test('should adjust volume', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const musicVolumeDisplay = page.locator('#music-volume-display'); // Assuming a volume display

    await terminalInput.fill('volume 75');
    await terminalInput.press('Enter');
    await expect(musicVolumeDisplay).toContainText('Volume: 75%');

    await terminalInput.fill('volume 20');
    await terminalInput.press('Enter');
    await expect(musicVolumeDisplay).toContainText('Volume: 20%');
  });

  test('should switch audio visualizer', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const visualizerCanvas = page.locator('#audio-visualizer-canvas'); // Assuming a visualizer canvas

    await terminalInput.fill('visualizer on');
    await terminalInput.press('Enter');
    await expect(visualizerCanvas).toBeVisible();

    await terminalInput.fill('visualizer off');
    await terminalInput.press('Enter');
    await expect(visualizerCanvas).not.toBeVisible();
  });

  test('should switch WebGL shaders', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const shaderDisplay = page.locator('#current-shader-display'); // Assuming a shader display

    await terminalInput.fill('shader plasma');
    await terminalInput.press('Enter');
    await expect(shaderDisplay).toContainText('Current Shader: Plasma');

    await terminalInput.fill('shader waves');
    await terminalInput.press('Enter');
    await expect(shaderDisplay).toContainText('Current Shader: Waves');
  });
});
