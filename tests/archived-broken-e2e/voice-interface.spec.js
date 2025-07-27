// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Voice Interface Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('Voice toggle button functionality', async ({ page }) => {
    const voiceToggleButton = page.locator('#voice-toggle-button'); // Assuming an ID for the voice toggle button
    await expect(voiceToggleButton).toBeVisible();

    // Check initial state (e.g., off)
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'off'); // Assuming a data-state attribute

    // Click to turn on
    await voiceToggleButton.click();
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'on');

    // Click to turn off
    await voiceToggleButton.click();
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'off');
  });

  test('Microphone permission handling - denied', async ({ page }) => {
    // Mock navigator.mediaDevices.getUserMedia to deny permission
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: () => Promise.reject(new Error('Permission denied')),
        },
        writable: true,
      });
    });

    const voiceToggleButton = page.locator('#voice-toggle-button');
    const terminalOutput = page.locator('#commandOutput');

    await voiceToggleButton.click();
    await expect(terminalOutput).toContainText('Microphone permission denied.');
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'off');
  });

  test('Speech recognition mock testing - successful recognition', async ({ page }) => {
    await page.evaluate(() => {
      window.SpeechRecognition = class MockSpeechRecognition {
        constructor() {
          this.onresult = null;
          this.onerror = null;
          this.onend = null;
        }
        start() {
          setTimeout(() => {
            if (this.onresult) {
              this.onresult({
                results: [[{ transcript: 'Hello voice command', confidence: 0.9 }]],
                final: true,
              });
            }
            if (this.onend) {
              this.onend();
            }
          }, 100);
        }
        stop() {}
      };
      window.webkitSpeechRecognition = window.SpeechRecognition;
    });

    const voiceToggleButton = page.locator('#voice-toggle-button');
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    await voiceToggleButton.click();
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'on');

    await expect(terminalOutput).toContainText('You said: Hello voice command');
    await expect(terminalInput).toHaveValue('Hello voice command');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:~$');
  });

  test('Text-to-speech output verification', async ({ page }) => {
    await page.evaluate(() => {
      window.speechSynthesis = {
        speak: (utterance) => {
          window.lastSpokenText = utterance.text;
        },
        cancel: () => {},
        getVoices: () => [],
        speaking: false,
        pending: false,
        paused: false,
        onvoiceschanged: null,
      };
      window.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
        constructor(text) {
          this.text = text;
        }
      };
    });

    const terminalInput = page.locator('#commandInput');
    await terminalInput.fill('say This is a test');
    await terminalInput.press('Enter');

    const spokenText = await page.evaluate(() => window.lastSpokenText);
    expect(spokenText).toBe('This is a test');
  });

  test('Wake word detection simulation', async ({ page }) => {
    await page.evaluate(() => {
      window.SpeechRecognition = class MockSpeechRecognition {
        constructor() {
          this.onresult = null;
          this.onerror = null;
          this.onend = null;
        }
        start() {
          setTimeout(() => {
            if (this.onresult) {
              this.onresult({
                results: [[{ transcript: 'Computer', confidence: 0.9 }]],
                final: true,
              });
            }
            if (this.onend) {
              this.onend();
            }
          }, 100);
        }
        stop() {}
      };
      window.webkitSpeechRecognition = window.SpeechRecognition;
    });

    const voiceToggleButton = page.locator('#voice-toggle-button');
    const terminalOutput = page.locator('#commandOutput');

    await voiceToggleButton.click();
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'on');

    await expect(terminalOutput).toContainText('Wake word detected: Computer');
    await expect(terminalOutput).toContainText('Listening for command...');
  });

  test('Voice command execution flow', async ({ page }) => {
    await page.evaluate(() => {
      window.SpeechRecognition = class MockSpeechRecognition {
        constructor() {
          this.onresult = null;
          this.onerror = null;
          this.onend = null;
        }
        start() {
          setTimeout(() => {
            if (this.onresult) {
              this.onresult({
                results: [[{ transcript: 'clear', confidence: 0.9 }]],
                final: true,
              });
            }
            if (this.onend) {
              this.onend();
            }
          }, 100);
        }
        stop() {}
      };
      window.webkitSpeechRecognition = window.SpeechRecognition;
    });

    const voiceToggleButton = page.locator('#voice-toggle-button');
    const terminalInput = page.locator('#commandInput');
    const terminalOutput = page.locator('#commandOutput');

    // Type something to be cleared later
    await terminalInput.fill('echo This will be cleared by voice');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('This will be cleared by voice');

    await voiceToggleButton.click();
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'on');

    // Expect the clear command to be executed and output cleared
    await expect(terminalOutput).not.toContainText('This will be cleared by voice');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:~$');
  });
});
