// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Terminal Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Assuming baseURL is configured in playwright.config.js
  });

  test('Terminal initializes and displays boot sequence', async ({ page }) => {
    // Check for the presence of the terminal element
    const terminal = page.locator('#terminal');
    await expect(terminal).toBeVisible();

    // Check for a common element in the boot sequence, e.g., a welcome message or prompt
    await expect(terminal).toContainText('Welcome to Adrian\'s Retro Terminal');
    await expect(terminal).toContainText('Type \'help\' for a list of commands.');
    await expect(terminal).toContainText('adrian@retro-terminal:~$');
  });

  test('Command execution and output display', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('echo Hello Playwright');
    await terminalInput.press('Enter');

    await expect(terminalOutput).toContainText('Hello Playwright');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:~$'); // Ensure prompt reappears
  });

  test('Command history navigation (↑/↓ keys)', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');

    await terminalInput.fill('first command');
    await terminalInput.press('Enter');
    await terminalInput.fill('second command');
    await terminalInput.press('Enter');

    // Navigate up to 'second command'
    await terminalInput.press('ArrowUp');
    await expect(terminalInput).toHaveValue('second command');

    // Navigate up to 'first command'
    await terminalInput.press('ArrowUp');
    await expect(terminalInput).toHaveValue('first command');

    // Navigate down to 'second command'
    await terminalInput.press('ArrowDown');
    await expect(terminalInput).toHaveValue('second command');

    // Navigate down past 'second command' should clear input or stay on last command
    await terminalInput.press('ArrowDown');
    await expect(terminalInput).toHaveValue(''); // Assuming it clears after last history item
  });

  test('Help command and formatted output', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('help');
    await terminalInput.press('Enter');

    // Check for specific help output format or content
    await expect(terminalOutput).toContainText('Available Commands:');
    await expect(terminalOutput).toContainText('help - Displays this help message.');
    await expect(terminalOutput).toContainText('clear - Clears the terminal screen.');
    // Add more checks for other commands as they are implemented
  });

  test('Clear command functionality', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('echo This will be cleared');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('This will be cleared');

    await terminalInput.fill('clear');
    await terminalInput.press('Enter');

    // After clear, the output should only contain the last prompt
    await expect(terminalOutput).not.toContainText('This will be cleared');
    await expect(terminalOutput).toContainText('adrian@retro-terminal:~$');
    // Verify that the terminal output area is effectively empty except for the prompt
    const outputContent = await terminalOutput.innerText();
    const lines = outputContent.split('\n').filter(line => line.trim() !== '');
    expect(lines.length).toBeLessThanOrEqual(2); // Should be just the prompt or prompt + cursor
  });

  test('Tab completion - no matches', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('xyz');
    await terminalInput.press('Tab');
    await expect(terminalInput).toHaveValue('xyz'); // Should not change
    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions
  });

  test('Tab completion - single match', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('cle');
    await terminalInput.press('Tab');
    await expect(terminalInput).toHaveValue('clear'); // Should complete to 'clear'
    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions for single match
  });

  test('Tab completion - multiple matches and cycling', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('m');
    await terminalInput.press('Tab');
    // First match (e.g., 'matrix')
    await expect(terminalInput).toHaveValue('matrix');
    await expect(terminalOutput).toContainText('Tab completions: matrix, monitor, music');

    await terminalInput.press('Tab');
    // Second match (e.g., 'monitor')
    await expect(terminalInput).toHaveValue('monitor');

    await terminalInput.press('Tab');
    // Third match (e.g., 'music')
    await expect(terminalInput).toHaveValue('music');

    await terminalInput.press('Tab');
    // Cycle back to first match
    await expect(terminalInput).toHaveValue('matrix');
  });

  test('Tab completion - reset on new input', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('m');
    await terminalInput.press('Tab');
    await expect(terminalInput).toHaveValue('matrix');

    await terminalInput.fill('mu'); // Change input
    await terminalInput.press('Tab');
    await expect(terminalInput).toHaveValue('music'); // Should complete 'music' directly
    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions for single match
  });

  test('Tab completion - no matches', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('xyz');
    await terminalInput.press('Tab');
    await expect(terminalInput).toHaveValue('xyz'); // Should not change
    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions
  });

  test('Tab completion - single match', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('cle');
    await terminalInput.press('Tab');
    await expect(terminalInput).toHaveValue('clear'); // Should complete to 'clear'
    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions for single match
  });

  test('Tab completion - multiple matches and cycling', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('m');
    await terminalInput.press('Tab');
    // First match (e.g., 'matrix')
    await expect(terminalInput).toHaveValue('matrix');
    await expect(terminalOutput).toContainText('Tab completions: matrix, monitor, music');

    await terminalInput.press('Tab');
    // Second match (e.g., 'monitor')
    await expect(terminalInput).toHaveValue('monitor');

    await terminalInput.press('Tab');
    // Third match (e.g., 'music')
    await expect(terminalInput).toHaveValue('music');

    await terminalInput.press('Tab');
    // Cycle back to first match
    await expect(terminalInput).toHaveValue('matrix');
  });

  test('Tab completion - reset on new input', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');

    await terminalInput.fill('m');
    await terminalInput.press('Tab');
    await expect(terminalInput).toHaveValue('matrix');

    await terminalInput.fill('mu'); // Change input
    await terminalInput.press('Tab');
    await expect(terminalInput).toHaveValue('music'); // Should complete 'music' directly
    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions for single match
  });

  test('Execute "about" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('about');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('Adrian Wedd - Systems Architect');
    await expect(terminalOutput).toContainText('Neurodivergent (ADHD/Autism) systems thinker');
  });

  test('Execute "projects" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('projects');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('🚀 Active Projects:');
    await expect(terminalOutput).toContainText('TicketSmith');
    await expect(terminalOutput).toContainText('Personal Intelligence Node');
    await expect(terminalOutput).toContainText('VERITAS');
  });

  test('Execute "skills" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('skills');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('🧰 Technical Arsenal:');
    await expect(terminalOutput).toContainText('AI/ML:');
    await expect(terminalOutput).toContainText('Languages:');
  });

  test('Execute "homestead" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('homestead');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('🏔️ Tasmania Off-Grid Homestead:');
    await expect(terminalOutput).toContainText('Location:     170 acres of Tasmanian bushland');
  });

  test('Execute "veritas" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('veritas');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('🔬 VERITAS - AI Safety Research Platform:');
    await expect(terminalOutput).toContainText('Mission:      Understanding LLM vulnerabilities through systematic testing');
  });

  test('Execute "ls" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('drwxr-xr-x  adrian adrian  4096 Jul 24 13:37 projects/');
    await expect(terminalOutput).toContainText('-rw-r--r--  adrian adrian  2048 Jul 24 10:30 thoughts.md');
  });

  test('Execute "whoami" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('adrian - Recursive Systems Architect & Off-Grid Permanaut');
  });

  test('Execute "pwd" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('pwd');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('/home/adrian/tasmania/homestead~');
  });

  test('Execute "uptime" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('uptime');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('System uptime:');
    await expect(terminalOutput).toContainText('Load average:');
  });

  test('Execute "ps" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('ps');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('PID  COMMAND                    CPU  MEM');
    await expect(terminalOutput).toContainText('veritas-research-daemon');
  });

  test('Execute "neofetch" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('neofetch');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('adrian@tasmania-homestead');
    await expect(terminalOutput).toContainText('OS: Tasmania Linux (Off-Grid Edition)');
  });

  test('Execute "sudo" command', async ({ page }) => {
    const terminalInput = page.locator('#terminal-input');
    const terminalOutput = page.locator('#terminal-output');
    await terminalInput.fill('sudo rm -rf /');
    await terminalInput.press('Enter');
    await expect(terminalOutput).toContainText('adrian is not in the sudoers file. This incident will be reported.');
  });

  test('Tab completion - no matches', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('xyz');    await terminalInput.press('Tab');    await expect(terminalInput).toHaveValue('xyz'); // Should not change    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions  });  test('Tab completion - single match', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('cle');    await terminalInput.press('Tab');    await expect(terminalInput).toHaveValue('clear'); // Should complete to 'clear'    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions for single match  });  test('Tab completion - multiple matches and cycling', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('m');    await terminalInput.press('Tab');    // First match (e.g., 'matrix')    await expect(terminalInput).toHaveValue('matrix');    await expect(terminalOutput).toContainText('Tab completions: matrix, monitor, music');    await terminalInput.press('Tab');    // Second match (e.g., 'monitor')    await expect(terminalInput).toHaveValue('monitor');    await terminalInput.press('Tab');    // Third match (e.g., 'music')    await expect(terminalInput).toHaveValue('music');    await terminalInput.press('Tab');    // Cycle back to first match    await expect(terminalInput).toHaveValue('matrix');  });  test('Tab completion - reset on new input', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('m');    await terminalInput.press('Tab');    await expect(terminalInput).toHaveValue('matrix');    await terminalInput.fill('mu'); // Change input    await terminalInput.press('Tab');    await expect(terminalInput).toHaveValue('music'); // Should complete 'music' directly    await expect(terminalOutput).not.toContainText('Tab completions:'); // No suggestions for single match  });  test('Execute "about" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('about');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('Adrian Wedd - Systems Architect');    await expect(terminalOutput).toContainText('Neurodivergent (ADHD/Autism) systems thinker');  });  test('Execute "projects" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('projects');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('🚀 Active Projects:');    await expect(terminalOutput).toContainText('TicketSmith');    await expect(terminalOutput).toContainText('Personal Intelligence Node');    await expect(terminalOutput).toContainText('VERITAS');  });  test('Execute "skills" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('skills');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('🧰 Technical Arsenal:');    await expect(terminalOutput).toContainText('AI/ML:');    await expect(terminalOutput).toContainText('Languages:');  });  test('Execute "homestead" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('homestead');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('🏔️ Tasmania Off-Grid Homestead:');    await expect(terminalOutput).toContainText('Location:     170 acres of Tasmanian bushland');  });  test('Execute "veritas" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('veritas');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('🔬 VERITAS - AI Safety Research Platform:');    await expect(terminalOutput).toContainText('Mission:      Understanding LLM vulnerabilities through systematic testing');  });  test('Execute "ls" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('ls');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('drwxr-xr-x  adrian adrian  4096 Jul 24 13:37 projects/');    await expect(terminalOutput).toContainText('-rw-r--r--  adrian adrian  2048 Jul 24 10:30 thoughts.md');  });  test('Execute "whoami" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('whoami');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('adrian - Recursive Systems Architect & Off-Grid Permanaut');  });  test('Execute "pwd" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('pwd');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('/home/adrian/tasmania/homestead~');  });  test('Execute "uptime" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('uptime');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('System uptime:');    await expect(terminalOutput).toContainText('Load average:');  });  test('Execute "ps" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('ps');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('PID  COMMAND                    CPU  MEM');    await expect(terminalOutput).toContainText('veritas-research-daemon');  });  test('Execute "neofetch" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('neofetch');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('adrian@tasmania-homestead');    await expect(terminalOutput).toContainText('OS: Tasmania Linux (Off-Grid Edition)');  });  test('Execute "sudo" command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('sudo rm -rf /');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('adrian is not in the sudoers file. This incident will be reported.');  });  test('Execute unknown command', async ({ page }) => {    const terminalInput = page.locator('#terminal-input');    const terminalOutput = page.locator('#terminal-output');    await terminalInput.fill('unknowncommand');    await terminalInput.press('Enter');    await expect(terminalOutput).toContainText('Command not found: unknowncommand. Type \'help\' for available commands.');  });});