// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Music System Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('Music player initializes', async ({ page }) => {
    // Assuming there's a visible element indicating the music player is active or initialized
    const musicPlayerIndicator = page.locator('#music-player-indicator'); // Replace with actual selector
    await expect(musicPlayerIndicator).toBeVisible();
  });

  test('Track switching (cyberpunk, ambient, synthwave, mathematical)', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const musicPlayerStatus = page.locator('#music-player-status'); // Replace with actual selector for music status

    await terminalInput.fill('play cyberpunk');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Cyberpunk');

    await terminalInput.fill('play ambient');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Ambient');

    await terminalInput.fill('play synthwave');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Synthwave');

    await terminalInput.fill('play mathematical');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Mathematical');
  });

  test('Volume control functionality', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const musicVolumeDisplay = page.locator('#music-volume-display'); // Replace with actual selector for volume display

    await terminalInput.fill('volume 50');
    await terminalInput.press('Enter');
    await expect(musicVolumeDisplay).toContainText('Volume: 50%');

    await terminalInput.fill('volume 100');
    await terminalInput.press('Enter');
    await expect(musicVolumeDisplay).toContainText('Volume: 100%');

    await terminalInput.fill('volume 0');
    await terminalInput.press('Enter');
    await expect(musicVolumeDisplay).toContainText('Volume: 0%');
  });

  test('Audio visualizer activation', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const visualizerCanvas = page.locator('#audio-visualizer-canvas'); // Replace with actual selector for visualizer canvas

    // Assuming visualizer is off by default or can be toggled
    await terminalInput.fill('visualizer on');
    await terminalInput.press('Enter');
    await expect(visualizerCanvas).toBeVisible();

    await terminalInput.fill('visualizer off');
    await terminalInput.press('Enter');
    await expect(visualizerCanvas).toBeHidden();
  });

  test('WebGL shader switching', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const shaderDisplay = page.locator('#current-shader-display'); // Replace with actual selector for current shader display

    await terminalInput.fill('shader plasma');
    await terminalInput.press('Enter');
    await expect(shaderDisplay).toContainText('Current Shader: Plasma');

    await terminalInput.fill('shader kaleidoscope');
    await terminalInput.press('Enter');
    await expect(shaderDisplay).toContainText('Current Shader: Kaleidoscope');
  });

  test('Stop/start music commands', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const musicPlayerStatus = page.locator('#music-player-status');

    // Start music first
    await terminalInput.fill('play cyberpunk');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Cyberpunk');

    // Stop music
    await terminalInput.fill('stop music');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Music stopped'); // Or similar indicator

    // Start music again
    await terminalInput.fill('start music');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing:'); // Should resume playing
  });

  test('Volume control handles invalid inputs', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    await terminalInput.fill('volume -10');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Volume must be between 0.0 and 1.0');

    await terminalInput.fill('volume 1.5');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Volume must be between 0.0 and 1.0');

    await terminalInput.fill('volume abc');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Volume must be between 0.0 and 1.0');
  });

  test('Rapid play/stop/switch actions', async ({ page }) => {
    const terminalInput = page.locator('#commandInput');
    const musicPlayerStatus = page.locator('#music-player-status');

    await terminalInput.fill('play cyberpunk');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Cyberpunk');

    await terminalInput.fill('stop music');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Music stopped');

    await terminalInput.fill('play ambient');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Ambient');

    await terminalInput.fill('stop music');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Music stopped');

    await terminalInput.fill('play mathematical');
    await terminalInput.press('Enter');
    await expect(musicPlayerStatus).toContainText('Now playing: Mathematical');
  });
});
