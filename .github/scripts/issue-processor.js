#!/usr/bin/env node
/**
 * Issue Processor - API-key-free autonomous workflow fallback
 * Processes GitHub issues using rule-based automation and structured analysis
 * Works without external API calls for basic autonomous functionality
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class IssueProcessor {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.sessionId = this.generateSessionId();
    this.processedIssues = [];
    this.suggestedActions = [];
  }

  generateSessionId() {
    return `issue-processor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async processIssues(issues) {
    console.log('🔧 **ISSUE PROCESSOR INITIATED** (API-key-free mode)');
    console.log(`📋 Processing ${issues.length} issues`);
    console.log(`🎯 Session ID: ${this.sessionId}`);
    console.log('');

    try {
      for (const issue of issues) {
        console.log(`\n📋 **Processing Issue #${issue.number}: ${issue.title}**`);
        await this.analyzeAndProcessIssue(issue);
      }

      // Generate comprehensive summary
      await this.generateProcessingSummary(issues);

      console.log('🎉 **ISSUE PROCESSING COMPLETED**');
      return {
        success: true,
        processedCount: this.processedIssues.length,
        suggestedActions: this.suggestedActions,
        sessionId: this.sessionId,
      };
    } catch (error) {
      console.error('❌ **ISSUE PROCESSING FAILED**');
      console.error(`Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        sessionId: this.sessionId,
      };
    }
  }

  async analyzeAndProcessIssue(issue) {
    const analysis = this.analyzeIssue(issue);
    console.log(`🔍 **Analysis Result**: ${analysis.category} (${analysis.complexity})`);
    console.log(`💡 **Action Plan**: ${analysis.actionPlan}`);

    // Execute appropriate automation based on analysis
    const result = await this.executeAutomation(issue, analysis);

    this.processedIssues.push({
      issue: issue.number,
      title: issue.title,
      analysis: analysis,
      result: result,
      timestamp: new Date().toISOString(),
    });

    if (result.actions.length > 0) {
      console.log(`✅ **Executed ${result.actions.length} automated actions**`);
      result.actions.forEach((action) => {
        console.log(`  - ${action}`);
      });
    }

    if (result.suggestions.length > 0) {
      console.log(`💡 **Generated ${result.suggestions.length} suggestions**`);
      result.suggestions.forEach((suggestion) => {
        console.log(`  - ${suggestion}`);
        this.suggestedActions.push({
          issue: issue.number,
          suggestion: suggestion,
        });
      });
    }
  }

  analyzeIssue(issue) {
    const title = issue.title.toLowerCase();
    const body = issue.body.toLowerCase();
    const labels = issue.labels.map((l) => l.name.toLowerCase());

    // Determine issue category
    let category = 'general';
    if (labels.includes('bug') || title.includes('fix') || title.includes('error')) {
      category = 'bug';
    } else if (
      labels.includes('enhancement') ||
      title.includes('feature') ||
      title.includes('add')
    ) {
      category = 'feature';
    } else if (
      labels.includes('documentation') ||
      title.includes('docs') ||
      title.includes('readme')
    ) {
      category = 'documentation';
    } else if (
      title.includes('refactor') ||
      title.includes('improve') ||
      title.includes('optimize')
    ) {
      category = 'enhancement';
    } else if (title.includes('test') || title.includes('spec')) {
      category = 'testing';
    }

    // Determine complexity
    let complexity = 'medium';
    const simpleKeywords = ['typo', 'fix text', 'update readme', 'add comment', 'lint', 'format'];
    const complexKeywords = [
      'architecture',
      'refactor',
      'database',
      'security',
      'performance',
      'integration',
    ];

    if (simpleKeywords.some((keyword) => title.includes(keyword) || body.includes(keyword))) {
      complexity = 'simple';
    } else if (
      complexKeywords.some((keyword) => title.includes(keyword) || body.includes(keyword))
    ) {
      complexity = 'complex';
    }

    // Generate action plan
    const actionPlan = this.generateActionPlan(category, complexity, title, body);

    return {
      category,
      complexity,
      actionPlan,
      automatable:
        complexity === 'simple' && ['bug', 'documentation', 'enhancement'].includes(category),
    };
  }

  generateActionPlan(category, complexity, _title, _body) {
    const plans = {
      bug: {
        simple: 'Quick fix - likely configuration or text correction',
        medium: 'Code investigation and targeted fix required',
        complex: 'Comprehensive debugging and testing needed',
      },
      feature: {
        simple: 'Small addition or enhancement',
        medium: 'New functionality implementation',
        complex: 'Major feature development with multiple components',
      },
      documentation: {
        simple: 'Text update or correction',
        medium: 'Section rewrite or new documentation',
        complex: 'Comprehensive documentation overhaul',
      },
      enhancement: {
        simple: 'Minor improvement or optimization',
        medium: 'Code refactoring or performance improvement',
        complex: 'Architectural changes or major optimization',
      },
      testing: {
        simple: 'Add missing test case',
        medium: 'Test suite enhancement',
        complex: 'Comprehensive testing framework',
      },
      general: {
        simple: 'Basic task completion',
        medium: 'Standard development work',
        complex: 'Complex multi-step implementation',
      },
    };

    return plans[category]?.[complexity] || 'Analysis and implementation required';
  }

  async executeAutomation(issue, analysis) {
    const actions = [];
    const suggestions = [];

    // Simple automated actions we can safely perform
    if (analysis.automatable) {
      try {
        // Create issue branch if it doesn't exist
        const branchName = `issue-${issue.number}-${issue.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .slice(0, 30)}`;
        try {
          execSync(`git checkout -b ${branchName}`, { encoding: 'utf8', stdio: 'pipe' });
          actions.push(`Created branch: ${branchName}`);
        } catch {
          // Branch might already exist or other git issues
          suggestions.push(`Consider creating branch: ${branchName}`);
        }

        // Generate basic documentation if needed
        if (analysis.category === 'documentation') {
          await this.generateDocumentationSuggestions(issue, suggestions);
        }

        // Generate basic fix suggestions for simple bugs
        if (analysis.category === 'bug' && analysis.complexity === 'simple') {
          await this.generateBugFixSuggestions(issue, suggestions);
        }
      } catch (error) {
        suggestions.push(`Automation failed: ${error.message}`);
      }
    } else {
      // Generate suggestions for manual implementation
      suggestions.push(
        `Manual implementation required for ${analysis.category} (${analysis.complexity})`
      );
      suggestions.push(`Action plan: ${analysis.actionPlan}`);
    }

    return { actions, suggestions };
  }

  async generateDocumentationSuggestions(issue, suggestions) {
    suggestions.push('Documentation updates needed:');

    if (issue.title.toLowerCase().includes('readme')) {
      suggestions.push('- Update README.md with new information');
      suggestions.push('- Ensure all sections are current and accurate');
    }

    if (issue.body.toLowerCase().includes('command')) {
      suggestions.push('- Document new terminal commands in CLAUDE.md');
      suggestions.push('- Add usage examples and descriptions');
    }

    suggestions.push('- Review existing documentation for consistency');
    suggestions.push('- Consider adding inline code comments where needed');
  }

  async generateBugFixSuggestions(issue, suggestions) {
    suggestions.push('Bug fix strategy:');
    suggestions.push('- Identify root cause through code analysis');
    suggestions.push('- Write test case to reproduce the issue');
    suggestions.push('- Implement minimal fix with proper error handling');
    suggestions.push('- Verify fix with existing test suite');
    suggestions.push('- Update documentation if behavior changes');
  }

  async generateProcessingSummary(issues) {
    const summaryPath = `.github/data/autonomous-sessions/${this.sessionId}.json`;

    // Ensure directory exists
    await fs.mkdir(path.dirname(summaryPath), { recursive: true });

    const summary = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      mode: 'issue-processor',
      totalIssues: issues.length,
      processedIssues: this.processedIssues,
      suggestedActions: this.suggestedActions,
      categoryBreakdown: this.getCategoryBreakdown(),
      complexityBreakdown: this.getComplexityBreakdown(),
      status: 'completed',
    };

    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\n📋 **SESSION SUMMARY SAVED:** ${summaryPath}`);

    // Generate human-readable summary
    console.log('\n📊 **PROCESSING SUMMARY:**');
    console.log(`- Total issues analyzed: ${issues.length}`);
    console.log(
      `- Automated actions: ${this.processedIssues.reduce((sum, p) => sum + p.result.actions.length, 0)}`
    );
    console.log(`- Suggestions generated: ${this.suggestedActions.length}`);
    console.log(`- Session ID: ${this.sessionId}`);
  }

  getCategoryBreakdown() {
    const breakdown = {};
    this.processedIssues.forEach((p) => {
      breakdown[p.analysis.category] = (breakdown[p.analysis.category] || 0) + 1;
    });
    return breakdown;
  }

  getComplexityBreakdown() {
    const breakdown = {};
    this.processedIssues.forEach((p) => {
      breakdown[p.analysis.complexity] = (breakdown[p.analysis.complexity] || 0) + 1;
    });
    return breakdown;
  }
}

// Main execution
async function main() {
  const processor = new IssueProcessor();

  // Get issues from environment variable
  const issuesJson = process.env.ISSUES_JSON;

  console.log('🔍 **DEBUGGING INPUT PARAMETERS**');
  console.log(`Issues JSON length: ${issuesJson ? issuesJson.length : 'undefined'} characters`);
  console.log(`GitHub Token present: ${processor.githubToken ? 'Yes' : 'No'}`);
  console.log('');

  if (!issuesJson) {
    console.error('❌ Missing ISSUES_JSON environment variable');
    process.exit(1);
  }

  try {
    const issues = JSON.parse(issuesJson);
    console.log(`📋 **PARSED ${issues.length} ISSUES SUCCESSFULLY**`);
    console.log('');

    const result = await processor.processIssues(issues);

    if (result.success) {
      console.log('🎉 **ISSUE PROCESSING SUCCESSFUL**');
      console.log(`📊 Processed: ${result.processedCount} issues`);
      console.log(`💡 Suggestions: ${result.suggestedActions.length}`);
      console.log(`🎯 Session ID: ${result.sessionId}`);
      process.exit(0);
    } else {
      console.error('❌ **ISSUE PROCESSING FAILED**');
      console.error(`Error: ${result.error}`);
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

module.exports = IssueProcessor;
