#!/usr/bin/env node

/**
 * CLI Command Audit Script
 * 
 * Comprehensive testing script to audit all terminal commands in the 
 * Adrian Wedd terminal interface. Tests command functionality, error handling,
 * and provides detailed reporting on command status.
 * 
 * Usage: node cli-test-audit.js [--headless] [--command=specific_command]
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class CLITestAudit {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      timeout: options.timeout || 10000,
      targetCommand: options.command || null,
      baseUrl: options.baseUrl || 'http://localhost:3000',
      reportFile: options.reportFile || 'cli-audit-report.json'
    };
    
    // All terminal commands based on terminal.js analysis
    this.commands = {
      // Basic system commands
      basic: [
        'help',
        'about',
        'whoami',
        'pwd',
        'uptime',
        'clear',
        'history',
        'neofetch',
        'ps'
      ],
      
      // Content/navigation commands
      content: [
        'projects',
        'skills', 
        'home',
        'veritas',
        'adrian',
        'ls'
      ],
      
      // Interactive commands
      interactive: [
        'chat',
        'monitor',
        'split',
        'boot',
        'reboot'
      ],
      
      // Media/effects commands
      media: [
        'music',
        'play',
        'stop',
        'volume',
        'matrix',
        'effects',
        'particles',
        'theme'
      ],
      
      // AI/voice commands
      ai: [
        'voice',
        'speak',
        'tokens',
        'cache',
        'magic',
        'research'
      ],
      
      // Development commands
      dev: [
        'script',
        'edit',
        'exec',
        'grep',
        'tail',
        'cat',
        'debug'
      ],
      
      // GitHub/CI commands
      github: [
        'actions',
        'trigger',
        'runs',
        'ci',
        'gh-create',
        'gh-list', 
        'gh-sync'
      ],
      
      // Weather/external commands
      external: [
        'weather',
        'gemini'
      ],
      
      // Commands with subcommands that need special testing
      complex: {
        'theme': ['list', 'matrix', 'cyberpunk', 'amber', 'synthwave'],
        'effects': ['matrix', 'snow', 'rain', 'fireflies', 'neural'],
        'particles': ['matrix', 'stars', 'rain', 'fireflies', 'neural'],
        'history': ['clear', 'search test'],
        'cache': ['stats', 'clear'],
        'voice': ['on', 'off', 'status'],
        'research': ['stream', 'search', 'list', 'categories', 'stats'],
        'script': ['list', 'help'],
        'ci': ['status', 'workflows']
      }
    };
    
    this.results = {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        errors: 0,
        skipped: 0
      },
      details: {},
      errors: [],
      timestamp: new Date().toISOString()
    };
  }

  async runAudit() {
    console.log('🔍 Starting CLI Command Audit...\n');
    
    try {
      const browser = await puppeteer.launch({ 
        headless: this.options.headless,
        defaultViewport: { width: 1200, height: 800 }
      });
      
      const page = await browser.newPage();
      
      // Setup console monitoring
      page.on('console', msg => {
        if (msg.type() === 'error') {
          this.results.errors.push({
            type: 'console_error',
            message: msg.text(),
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Navigate to the terminal
      console.log(`📡 Connecting to ${this.options.baseUrl}...`);
      await page.goto(this.options.baseUrl, { waitUntil: 'networkidle0' });
      
      // Wait for terminal to be ready
      await page.waitForSelector('#commandInput', { timeout: this.options.timeout });
      await page.waitForFunction(() => window.terminal && window.terminal.init, { timeout: this.options.timeout });
      
      console.log('⏳ Waiting for boot sequence to complete...');
      
      // Wait for boot sequence to complete
      await page.waitForFunction(() => {
        return window.terminal && !window.terminal.isBooting;
      }, { timeout: this.options.timeout * 2 }); // Double timeout for boot sequence
      
      // Additional safety delay after boot
      await page.waitForTimeout(1000);
      
      console.log('✅ Terminal boot complete, ready for testing\n');
      
      // Run tests based on options
      if (this.options.targetCommand) {
        await this.testSingleCommand(page, this.options.targetCommand);
      } else {
        await this.testAllCommands(page);
      }
      
      await browser.close();
      
      // Generate report
      await this.generateReport();
      
    } catch (error) {
      console.error('💥 Audit failed:', error.message);
      this.results.errors.push({
        type: 'audit_failure',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testAllCommands(page) {
    console.log('🧪 Testing all commands...\n');
    
    // Test basic commands first
    for (const category of Object.keys(this.commands)) {
      if (category === 'complex') continue;
      
      console.log(`\n📂 Testing ${category} commands:`);
      for (const command of this.commands[category]) {
        await this.testCommand(page, command, category);
      }
    }
    
    // Test complex commands with subcommands
    console.log('\n📂 Testing complex commands:');
    for (const [command, subcommands] of Object.entries(this.commands.complex)) {
      await this.testCommand(page, command, 'complex');
      
      // Test subcommands
      for (const subcommand of subcommands) {
        await this.testCommand(page, `${command} ${subcommand}`, 'complex');
      }
    }
  }

  async testSingleCommand(page, command) {
    console.log(`🎯 Testing single command: ${command}\n`);
    await this.testCommand(page, command, 'single');
  }

  async testCommand(page, command, category) {
    const startTime = Date.now();
    const testResult = {
      command,
      category,
      status: 'unknown',
      executionTime: 0,
      output: '',
      fullOutput: '',
      errors: [],
      timestamp: new Date().toISOString()
    };
    
    try {
      console.log(`  🔧 Testing: ${command}`);
      
      // Wait for any previous commands to complete
      await page.waitForTimeout(5000);
      
      // Get initial state
      const initialState = await page.evaluate(() => {
        const outputElement = document.getElementById('terminalOutput');
        return {
          content: outputElement ? outputElement.innerHTML : '',
          length: outputElement ? outputElement.children.length : 0
        };
      });
      
      // Clear and focus input
      await page.evaluate(() => {
        const input = document.getElementById('commandInput');
        if (input) {
          input.value = '';
          input.focus();
        }
      });
      
      // Execute command
      await page.type('#commandInput', command, { delay: 50 });
      await page.keyboard.press('Enter');
      
      // Wait longer for command to process with multiple checks
      let hasNewOutput = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!hasNewOutput && attempts < maxAttempts) {
        await page.waitForTimeout(500);
        
        const currentState = await page.evaluate(() => {
          const outputElement = document.getElementById('terminalOutput');
          return {
            content: outputElement ? outputElement.innerHTML : '',
            length: outputElement ? outputElement.children.length : 0,
            text: outputElement ? outputElement.textContent : ''
          };
        });
        
        hasNewOutput = currentState.length > initialState.length || 
                      currentState.content !== initialState.content;
        attempts++;
      }
      
      // Capture final output
      const finalOutput = await page.evaluate(() => {
        const outputElement = document.getElementById('terminalOutput');
        return {
          html: outputElement ? outputElement.innerHTML : '',
          text: outputElement ? outputElement.textContent : ''
        };
      });
      
      // Enhanced error detection
      const hasError = finalOutput.html.toLowerCase().includes('error') ||
                      finalOutput.html.toLowerCase().includes('❌') ||
                      finalOutput.html.toLowerCase().includes('unknown') ||
                      finalOutput.html.toLowerCase().includes('failed') ||
                      finalOutput.text.toLowerCase().includes('command not found');
      
      testResult.output = finalOutput.text.trim();
      testResult.fullOutput = finalOutput.text.substring(0, 500); // Limit output
      testResult.executionTime = Date.now() - startTime;
      
      if (hasError) {
        testResult.status = 'failed';
        console.log(`    ❌ Failed (${testResult.executionTime}ms)`);
        this.results.summary.failed++;
      } else if (hasNewOutput) {
        testResult.status = 'passed';
        console.log(`    ✅ Passed (${testResult.executionTime}ms)`);
        this.results.summary.passed++;
      } else {
        testResult.status = 'no_output';
        console.log(`    ⚠️  No output (${testResult.executionTime}ms)`);
        this.results.summary.skipped++;
      }
      
    } catch (error) {
      testResult.status = 'error';
      testResult.errors.push(error.message);
      console.log(`    💥 Error: ${error.message}`);
      this.results.summary.errors++;
    }
    
    this.results.details[command] = testResult;
    this.results.summary.total++;
    
    // Longer delay between commands
    await page.waitForTimeout(2000);
  }

  async generateReport() {
    // Calculate percentages
    const { total, passed, failed, errors, skipped } = this.results.summary;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    // Console summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLI AUDIT REPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`📈 Total Commands Tested: ${total}`);
    console.log(`✅ Passed: ${passed} (${passRate}%)`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`💥 Errors: ${errors}`);
    console.log(`⚠️  No Output: ${skipped}`);
    console.log('='.repeat(60));
    
    // Show failed commands
    if (failed > 0 || errors > 0) {
      console.log('\n🔍 FAILED/ERROR COMMANDS:');
      for (const [command, result] of Object.entries(this.results.details)) {
        if (result.status === 'failed' || result.status === 'error') {
          console.log(`  ❌ ${command}: ${result.status}`);
          if (result.errors.length > 0) {
            result.errors.forEach(error => console.log(`     Error: ${error}`));
          }
        }
      }
    }
    
    // Show commands with no output
    if (skipped > 0) {
      console.log('\n⚠️  COMMANDS WITH NO OUTPUT:');
      for (const [command, result] of Object.entries(this.results.details)) {
        if (result.status === 'no_output') {
          console.log(`  ⚠️  ${command}`);
        }
      }
    }
    
    // Save detailed JSON report
    try {
      // Add test run metadata
      this.results.testRun = {
        timestamp: new Date().toISOString(),
        options: this.options,
        version: '1.0'
      };
      
      fs.writeFileSync(this.options.reportFile, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Detailed report saved: ${this.options.reportFile}`);
      
      // Create GitHub issues for failures if requested
      if (failed > 0 || errors > 0) {
        console.log(`\n🐙 Found ${failed + errors} failed commands.`);
        console.log('GitHub issue URLs will be generated...\n');
        this.generateGitHubIssues();
      }
      
    } catch (error) {
      console.error(`Failed to save report: ${error.message}`);
    }
    
    console.log('\n🏁 Audit complete!');
  }

  generateGitHubIssues() {
    const failedCommands = Object.entries(this.results.details)
      .filter(([cmd, result]) => result.status === 'failed' || result.status === 'error');
    
    if (failedCommands.length === 0) return;
    
    const issuesFile = `github-issues-${Date.now()}.md`;
    let issuesContent = `# GitHub Issues for Failed CLI Commands\n\nGenerated: ${new Date().toISOString()}\n\n`;
    
    failedCommands.forEach(([command, result]) => {
      const issueTitle = `🐛 CLI Command '${command}' failing in terminal interface`;
      const issueBody = `## 🐛 Command Failure Report

**Command:** \`${command}\`
**Status:** ${result.status}
**Category:** ${result.category}
**Execution Time:** ${result.executionTime}ms
**Timestamp:** ${result.timestamp}

### 📋 Error Details
**Output:** ${result.output}

### 🖥️ Full Terminal Output
\`\`\`
${result.fullOutput || 'No output captured'}
\`\`\`

### 🔍 Test Environment
- **Base URL:** ${this.options.baseUrl}
- **Headless:** ${this.options.headless}
- **Timeout:** ${this.options.timeout}ms
- **Test Version:** ${this.results.testRun.version}

### 📊 Test Summary
- **Total Commands:** ${this.results.summary.total}
- **Pass Rate:** ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%

### ✅ Acceptance Criteria
- [ ] Command executes without errors
- [ ] Command produces expected output
- [ ] Command completes within reasonable time
- [ ] Output matches expected format/content

### 🔧 Additional Context
This issue was automatically generated by the CLI audit system. The command may:
- Have syntax errors in its implementation
- Be missing required dependencies or setup
- Have timing issues with async operations
- Need updated error handling

---
🤖 Generated by CLI Audit Tool - ${new Date().toISOString()}`;

      const repoUrl = 'https://github.com/adrianwedd/adrianwedd';
      const issueUrl = `${repoUrl}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=bug,cli,automated-test`;
      
      issuesContent += `## ${command}\n\n`;
      issuesContent += `**GitHub Issue URL:**\n`;
      issuesContent += `${issueUrl}\n\n`;
      issuesContent += `**Issue Title:** ${issueTitle}\n\n`;
      issuesContent += `---\n\n`;
      
      console.log(`🐛 ${command}: ${issueUrl.substring(0, 100)}...`);
    });
    
    // Save issues to file
    try {
      fs.writeFileSync(issuesFile, issuesContent);
      console.log(`\n📝 GitHub issues saved to: ${issuesFile}`);
      console.log('Copy the URLs from the file to create issues manually.\n');
    } catch (error) {
      console.error(`Failed to save GitHub issues: ${error.message}`);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (const arg of args) {
    if (arg === '--headless') {
      options.headless = true;
    } else if (arg === '--headed') {
      options.headless = false;
    } else if (arg.startsWith('--command=')) {
      options.command = arg.split('=')[1];
    } else if (arg.startsWith('--timeout=')) {
      options.timeout = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--url=')) {
      options.baseUrl = arg.split('=')[1];
    }
  }
  
  console.log('🚀 CLI Command Audit Tool');
  console.log('================================\n');
  
  if (!options.command) {
    console.log('📋 Will test all available commands');
  } else {
    console.log(`🎯 Will test specific command: ${options.command}`);
  }
  
  console.log(`🌐 Target URL: ${options.baseUrl || 'http://localhost:3000'}`);
  console.log(`⏱️  Timeout: ${options.timeout || 10000}ms`);
  console.log(`👁️  Headless: ${options.headless !== false}\n`);
  
  const audit = new CLITestAudit(options);
  await audit.runAudit();
}

// Handle process errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Main process error:', error);
    process.exit(1);
  });
}

module.exports = CLITestAudit;