#!/usr/bin/env node
/**
 * Test script for the issue processor
 * Validates functionality without making API calls
 */

const IssueProcessor = require('./issue-processor.js');

async function testIssueProcessor() {
  console.log('🧪 **TESTING ISSUE PROCESSOR**');
  console.log('');

  const processor = new IssueProcessor();

  // Test with mock issues
  const testIssues = [
    {
      number: 123,
      title: 'Fix typo in README',
      url: 'https://github.com/test/test/issues/123',
      labels: [{ name: 'bug' }, { name: 'documentation' }],
      body: "There's a typo in the README file that needs to be corrected.",
    },
    {
      number: 124,
      title: 'Add new terminal command feature',
      url: 'https://github.com/test/test/issues/124',
      labels: [{ name: 'enhancement' }, { name: 'priority: high' }],
      body: 'Implement a new command for the terminal interface with advanced functionality.',
    },
    {
      number: 125,
      title: 'Performance optimization for large datasets',
      url: 'https://github.com/test/test/issues/125',
      labels: [{ name: 'performance' }, { name: 'priority: medium' }],
      body: 'The system becomes slow when processing large datasets. Need to optimize the data processing pipeline.',
    },
  ];

  console.log(`📋 **TESTING WITH ${testIssues.length} MOCK ISSUES**`);
  console.log('');

  const result = await processor.processIssues(testIssues);

  if (result.success) {
    console.log('');
    console.log('🎉 **ISSUE PROCESSOR TEST COMPLETED SUCCESSFULLY**');
    console.log(`📊 Processed: ${result.processedCount} issues`);
    console.log(`💡 Suggestions: ${result.suggestedActions.length}`);
    console.log(`🎯 Session ID: ${result.sessionId}`);
  } else {
    console.error('❌ **ISSUE PROCESSOR TEST FAILED**');
    console.error(`Error: ${result.error}`);
  }
}

testIssueProcessor().catch(console.error);
