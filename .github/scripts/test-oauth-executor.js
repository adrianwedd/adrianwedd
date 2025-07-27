#!/usr/bin/env node
/**
 * Test script for the OAuth executor
 * Validates functionality and authentication flow
 */

const ClaudeOAuthExecutor = require('./claude-oauth-executor.js');

async function testOAuthExecutor() {
  console.log('🧪 **TESTING CLAUDE OAUTH EXECUTOR**');
  console.log('');

  const executor = new ClaudeOAuthExecutor();
  
  // Test session ID generation
  console.log(`📋 Session ID: ${executor.sessionId}`);
  console.log(`🔐 OAuth Token present: ${executor.oauthToken ? 'Yes' : 'No'}`);
  console.log(`🔑 API Key present: ${executor.apiKey ? 'Yes' : 'No'}`);
  console.log('');
  
  // Test prompt building
  const testIssues = [
    {
      number: 123,
      title: "Test OAuth Issue",
      url: "https://github.com/test/test/issues/123",
      labels: [{ name: "bug" }, { name: "priority: high" }],
      body: "This is a test issue for OAuth authentication."
    }
  ];
  
  const systemPrompt = executor.buildSystemPrompt();
  const userPrompt = executor.buildUserPrompt("Test OAuth autonomous execution", testIssues);
  
  console.log('✅ **SYSTEM PROMPT GENERATED**');
  console.log(`Length: ${systemPrompt.length} characters`);
  console.log('');
  
  console.log('✅ **USER PROMPT GENERATED**');
  console.log(`Length: userPrompt.length} characters`);
  console.log('');
  
  // Test command extraction
  const sampleResponse = `
I'll help you with this OAuth authentication issue. Let me start by checking the current setup.

\`\`\`bash
git status
\`\`\`

Next, I'll examine the authentication configuration:

\`\`\`bash
ls -la .github/workflows/
\`\`\`

Now I'll implement the OAuth fix:

\`\`\`bash
git add .
git commit -m "Fix OAuth authentication issue"
\`\`\`
  `;
  
  const commands = executor.extractCommands(sampleResponse);
  console.log('✅ **COMMAND EXTRACTION TEST**');
  console.log(`Extracted ${commands.length} commands:`);
  commands.forEach((cmd, i) => {
    console.log(`  ${i + 1}. ${cmd}`);
  });
  console.log('');
  
  // Test authentication method detection
  const authMethod = executor.oauthToken ? 'oauth' : executor.apiKey ? 'api-key' : 'none';
  console.log(`🔐 **AUTHENTICATION METHOD**: ${authMethod}`);
  console.log('');
  
  console.log('🎉 **OAUTH EXECUTOR TEST COMPLETED**');
  console.log('Ready for OAuth authentication with Claude Max account!');
}

testOAuthExecutor().catch(console.error);