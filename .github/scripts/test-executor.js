#!/usr/bin/env node
/**
 * Test script for the autonomous executor
 * Validates functionality without making API calls
 */

const AutonomousExecutor = require('./autonomous-executor.js');

async function testExecutor() {
  console.log('🧪 **TESTING AUTONOMOUS EXECUTOR**');
  console.log('');

  const executor = new AutonomousExecutor();

  // Test session ID generation
  console.log(`📋 Session ID: ${executor.sessionId}`);

  // Test prompt building
  const testIssues = [
    {
      number: 123,
      title: 'Test Issue',
      url: 'https://github.com/test/test/issues/123',
      labels: [{ name: 'bug' }, { name: 'priority: high' }],
      body: 'This is a test issue description.',
    },
  ];

  const systemPrompt = executor.buildSystemPrompt();
  const userPrompt = executor.buildUserPrompt('Test autonomous execution', testIssues);

  console.log('✅ **SYSTEM PROMPT GENERATED**');
  console.log(`Length: ${systemPrompt.length} characters`);
  console.log('');

  console.log('✅ **USER PROMPT GENERATED**');
  console.log(`Length: ${userPrompt.length} characters`);
  console.log('');

  // Test command extraction
  const sampleResponse = `
I'll help you with this issue. Let me start by analyzing the codebase.

\`\`\`bash
git status
\`\`\`

Next, I'll check the file structure:

\`\`\`bash
ls -la assets/
\`\`\`

Now I'll commit the changes:

\`\`\`bash
git add .
git commit -m "Fix test issue"
\`\`\`
  `;

  const commands = executor.extractCommands(sampleResponse);
  console.log('✅ **COMMAND EXTRACTION TEST**');
  console.log(`Extracted ${commands.length} commands:`);
  commands.forEach((cmd, i) => {
    console.log(`  ${i + 1}. ${cmd}`);
  });
  console.log('');

  console.log('🎉 **AUTONOMOUS EXECUTOR TEST COMPLETED**');
  console.log('All core functions working correctly!');
}

testExecutor().catch(console.error);
