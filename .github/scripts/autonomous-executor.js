#!/usr/bin/env node
/**
 * Custom Autonomous Executor
 * Replaces Claude Code Action for workflow_dispatch events
 * Provides direct Anthropic API integration with autonomous capabilities
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class AutonomousExecutor {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.sessionId = this.generateSessionId();
    this.tokenUsage = {
      input: 0,
      output: 0,
      cached: 0,
      total: 0
    };
  }

  generateSessionId() {
    return `autonomous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async executeAutonomousSession(prompt, issues) {
    console.log('🤖 **AUTONOMOUS EXECUTOR INITIATED**');
    console.log(`📋 Processing ${issues.length} issues`);
    console.log(`🎯 Session ID: ${this.sessionId}`);
    console.log('');

    try {
      // Initialize conversation with system context
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(prompt, issues);

      console.log('🧠 **CALLING ANTHROPIC API**');
      const response = await this.callAnthropicAPI(systemPrompt, userPrompt);
      
      if (response.error) {
        throw new Error(`API Error: ${response.error}`);
      }

      console.log('✅ **API RESPONSE RECEIVED**');
      console.log(`📊 Tokens - Input: ${response.usage?.input_tokens || 0}, Output: ${response.usage?.output_tokens || 0}`);

      // Update token usage tracking
      this.updateTokenUsage(response.usage);

      // Process the AI response and execute commands
      await this.processAIResponse(response.content[0].text, issues);

      console.log('🎉 **AUTONOMOUS SESSION COMPLETED**');
      return {
        success: true,
        tokenUsage: this.tokenUsage,
        sessionId: this.sessionId
      };

    } catch (error) {
      console.error('❌ **AUTONOMOUS SESSION FAILED**');
      console.error(`Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        sessionId: this.sessionId
      };
    }
  }

  buildSystemPrompt() {
    return `You are an autonomous GitHub repository manager with full access to the codebase. You have the ability to:

🔧 **Core Capabilities:**
- Read, edit, and create files using standard file operations
- Execute bash commands for git operations, testing, and builds
- Analyze code structure and implement solutions
- Manage GitHub issues with proper closure summaries

🎯 **Autonomous Mode Guidelines:**
- Work independently to complete assigned issues end-to-end
- Follow existing code patterns and architecture  
- Use sophisticated emoji for enhanced readability
- Create comprehensive issue closure summaries
- Commit changes with descriptive messages
- Run tests and ensure code quality

📊 **Quality Standards:**
- Ensure accessibility compliance
- Maintain performance standards  
- Follow existing code conventions
- Add appropriate tests where needed
- Document significant changes

🚀 **Execution Flow:**
1. Analyze each issue thoroughly
2. Implement solution following best practices
3. Test implementation
4. Document changes
5. Close issue with comprehensive summary

Execute with confidence and technical excellence!`;
  }

  buildUserPrompt(prompt, issues) {
    const issueDetails = issues.map(issue => 
      `### Issue #${issue.number}: ${issue.title}
**URL:** ${issue.url}
**Labels:** ${issue.labels.map(l => l.name).join(', ')}
**Description:**
${issue.body}
---`
    ).join('\n');

    return `${prompt}

## 📋 **Issues to Process**
${issueDetails}

Begin autonomous execution now. Work through each issue systematically and provide updates on your progress.`;
  }

  async callAnthropicAPI(systemPrompt, userPrompt) {
    const fetch = require('node-fetch');
    
    const requestBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  }

  async processAIResponse(aiResponse, issues) {
    console.log('🔄 **PROCESSING AI RESPONSE**');
    console.log('');
    console.log('📝 **AI Analysis:**');
    console.log(aiResponse);
    console.log('');

    // Parse AI response for actionable commands
    const commands = this.extractCommands(aiResponse);
    
    console.log(`🎯 **EXTRACTED ${commands.length} ACTIONABLE COMMANDS**`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`\n📋 **Executing Command ${i + 1}/${commands.length}:**`);
      console.log(`Command: ${command}`);
      
      try {
        await this.executeCommand(command);
        console.log('✅ Command executed successfully');
      } catch (error) {
        console.log(`⚠️ Command failed: ${error.message}`);
        // Continue with other commands
      }
    }

    // Create session summary
    await this.createSessionSummary(aiResponse, issues, commands);
  }

  extractCommands(aiResponse) {
    // Extract bash commands and file operations from AI response
    const commands = [];
    
    // Look for code blocks with bash/shell commands
    const bashMatches = aiResponse.match(/```(?:bash|shell|sh)\n([\s\S]*?)\n```/g);
    if (bashMatches) {
      bashMatches.forEach(match => {
        const command = match.replace(/```(?:bash|shell|sh)\n/, '').replace(/\n```/, '').trim();
        if (command && !command.includes('placeholder') && !command.includes('example')) {
          commands.push(command);
        }
      });
    }

    // Look for explicit git commands
    const gitMatches = aiResponse.match(/git [^\n]+/g);
    if (gitMatches) {
      gitMatches.forEach(cmd => {
        if (!commands.includes(cmd)) {
          commands.push(cmd);
        }
      });
    }

    return commands.slice(0, 10); // Limit to 10 commands for safety
  }

  async executeCommand(command) {
    // Safety checks
    const dangerousCommands = ['rm -rf', 'sudo', 'curl', 'wget', 'npm install -g', 'format', 'shutdown'];
    if (dangerousCommands.some(danger => command.includes(danger))) {
      throw new Error('Command blocked for safety');
    }

    // Allow only safe git, npm, and file operations
    const allowedPrefixes = ['git ', 'npm run', 'ls ', 'mkdir', 'echo', 'cat'];
    if (!allowedPrefixes.some(prefix => command.startsWith(prefix))) {
      throw new Error('Command not in allowed list');
    }

    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB max output
      });
      console.log(`Output: ${output.trim()}`);
      return output;
    } catch (error) {
      throw new Error(`Execution failed: ${error.message}`);
    }
  }

  updateTokenUsage(usage) {
    if (usage) {
      this.tokenUsage.input += usage.input_tokens || 0;
      this.tokenUsage.output += usage.output_tokens || 0;
      this.tokenUsage.total = this.tokenUsage.input + this.tokenUsage.output;
    }
  }

  async createSessionSummary(aiResponse, issues, commands) {
    const summaryPath = `.github/data/autonomous-sessions/${this.sessionId}.json`;
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(summaryPath), { recursive: true });

    const summary = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      issues: issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        url: issue.url
      })),
      aiResponse: aiResponse.substring(0, 2000), // Truncate for storage
      commandsExecuted: commands,
      tokenUsage: this.tokenUsage,
      status: 'completed'
    };

    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 **SESSION SUMMARY SAVED:** ${summaryPath}`);
  }
}

// Main execution
async function main() {
  const executor = new AutonomousExecutor();
  
  // Get arguments from environment or command line
  const prompt = process.env.AUTONOMOUS_PROMPT || process.argv[2];
  const issuesJson = process.env.ISSUES_JSON || process.argv[3];

  console.log('🔍 **DEBUGGING INPUT PARAMETERS**');
  console.log(`Prompt length: ${prompt ? prompt.length : 'undefined'} characters`);
  console.log(`Issues JSON length: ${issuesJson ? issuesJson.length : 'undefined'} characters`);
  console.log(`API Key present: ${executor.apiKey ? 'Yes' : 'No'}`);
  console.log('');

  if (!prompt || !issuesJson) {
    console.error('❌ Missing required arguments: prompt and issues JSON');
    console.error('Available environment variables:');
    console.error('- AUTONOMOUS_PROMPT:', !!process.env.AUTONOMOUS_PROMPT);
    console.error('- ISSUES_JSON:', !!process.env.ISSUES_JSON);
    console.error('Command line args:', process.argv.slice(2));
    process.exit(1);
  }

  if (!executor.apiKey) {
    console.error('❌ Missing ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }

  try {
    const issues = JSON.parse(issuesJson);
    console.log(`📋 **PARSED ${issues.length} ISSUES SUCCESSFULLY**`);
    console.log('');
    
    const result = await executor.executeAutonomousSession(prompt, issues);
    
    if (result.success) {
      console.log('🎉 **AUTONOMOUS EXECUTION SUCCESSFUL**');
      console.log(`📊 Token usage: ${result.tokenUsage.total} total (${result.tokenUsage.input} input, ${result.tokenUsage.output} output)`);
      console.log(`🎯 Session ID: ${result.sessionId}`);
      process.exit(0);
    } else {
      console.error('❌ **AUTONOMOUS EXECUTION FAILED**');
      console.error(`Error: ${result.error}`);
      console.error(`🎯 Session ID: ${result.sessionId}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ **FATAL ERROR:**', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = AutonomousExecutor;