// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Voice Interface Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('should handle microphone permission denied', async ({ page }) => {
    // Mock navigator.mediaDevices.getUserMedia to deny permission
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: () => Promise.reject(new Error('Permission denied')),
        },
        writable: true,
      });
    });

    // Simulate clicking the voice toggle button
    const voiceToggleButton = page.locator('#voice-toggle-button');
    await voiceToggleButton.click();

    // Check for a message indicating permission denied
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toContainText('Microphone permission denied.');
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'off');
  });

  test('should simulate speech recognition and display text', async ({ page }) => {
    // Mock SpeechRecognition API
    await page.evaluate(() => {
      window.SpeechRecognition = class MockSpeechRecognition {
        constructor() {
          this.onresult = null;
          this.onerror = null;
          this.onend = null;
        }
        start() {
          // Simulate a speech recognition result after a short delay
          setTimeout(() => {
            if (this.onresult) {
              this.onresult({
                results: [[{ transcript: 'Hello terminal', confidence: 0.9 }]],
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
    const terminalOutput = page.locator('#terminal-output');

    // Turn on voice
    await voiceToggleButton.click();
    await expect(voiceToggleButton).toHaveAttribute('data-state', 'on');

    // Wait for the simulated speech recognition result
    await expect(terminalOutput).toContainText('You said: Hello terminal');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:~$');
  });

  test('should simulate text-to-speech output', async ({ page }) => {
    // Mock SpeechSynthesis API
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

    const terminalInput = page.locator('#terminal-input');

    // Assuming a command that triggers TTS, e.g., 'say hello'
    await terminalInput.fill('say hello');
    await terminalInput.press('Enter');

    // Verify that the text-to-speech function was called with the correct text
    const spokenText = await page.evaluate(() => window.lastSpokenText);
    expect(spokenText).toBe('hello');
  });

  // Add tests for wake word detection simulation and voice command execution flow
});
