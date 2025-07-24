#!/usr/bin/env node

/**
 * GitHub Task Synchronization Script
 * Syncs local todos with GitHub Issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class GitHubTaskSync {
    constructor() {
        this.repo = 'adrianwedd/adrianwedd';
        this.todoFile = '../todos.json'; // Hypothetical local todo storage
    }

    async createIssue(title, body, labels = [], assignee = null) {
        try {
            const labelsArg = labels.length > 0 ? `--label "${labels.join(',')}"` : '';
            const assigneeArg = assignee ? `--assignee "${assignee}"` : '';
            
            const command = `gh issue create --repo "${this.repo}" --title "${title}" --body "${body}" ${labelsArg} ${assigneeArg}`;
            
            console.log(`Creating issue: ${title}`);
            const result = execSync(command, { encoding: 'utf8' });
            
            // Extract issue number from result URL
            const issueUrl = result.trim();
            const issueNumber = issueUrl.split('/').pop();
            
            return {
                success: true,
                number: issueNumber,
                url: issueUrl
            };
        } catch (error) {
            console.error(`Failed to create issue "${title}":`, error.message);
            return { success: false, error: error.message };
        }
    }

    async updateIssue(issueNumber, options = {}) {
        try {
            const commands = [];

            if (options.addLabels) {
                commands.push(`gh issue edit ${issueNumber} --add-label "${options.addLabels.join(',')}"`);
            }

            if (options.removeLabels) {
                commands.push(`gh issue edit ${issueNumber} --remove-label "${options.removeLabels.join(',')}"`);
            }

            if (options.comment) {
                commands.push(`gh issue comment ${issueNumber} --body "${options.comment}"`);
            }

            if (options.close) {
                commands.push(`gh issue close ${issueNumber} --comment "Task completed"`);
            }

            for (const command of commands) {
                console.log(`Executing: ${command}`);
                execSync(command, { encoding: 'utf8' });
            }

            return { success: true };
        } catch (error) {
            console.error(`Failed to update issue ${issueNumber}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    async listIssues(state = 'open', labels = null) {
        try {
            let command = `gh issue list --repo "${this.repo}" --state ${state} --json number,title,labels,state,createdAt`;
            
            if (labels) {
                command += ` --label "${labels.join(',')}"`;
            }

            const result = execSync(command, { encoding: 'utf8' });
            return JSON.parse(result);
        } catch (error) {
            console.error('Failed to list issues:', error.message);
            return [];
        }
    }

    async ensureLabels() {
        const labels = [
            { name: 'priority: high', color: 'ff4444', description: 'High priority task' },
            { name: 'priority: medium', color: 'ffaa00', description: 'Medium priority task' },
            { name: 'priority: low', color: '44ff44', description: 'Low priority task' },
            { name: 'type: task', color: '0096ff', description: 'General task' },
            { name: 'type: enhancement', color: '00ff88', description: 'Enhancement or feature' },
            { name: 'type: bug', color: 'ff6600', description: 'Bug fix' },
            { name: 'agent: claude', color: '00cccc', description: 'Managed by Claude Code' },
            { name: 'status: in-progress', color: 'ffcc00', description: 'Currently being worked on' }
        ];

        console.log('Ensuring GitHub labels exist...');
        
        for (const label of labels) {
            try {
                const command = `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --repo "${this.repo}"`;
                execSync(command, { encoding: 'utf8' });
                console.log(`✓ Created label: ${label.name}`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`✓ Label exists: ${label.name}`);
                } else {
                    console.warn(`⚠ Could not create label ${label.name}:`, error.message);
                }
            }
        }
    }

    formatIssueBody(todo) {
        const timestamp = new Date().toISOString();
        return `**Task ID:** ${todo.id}
**Priority:** ${todo.priority}
**Status:** ${todo.status}

**Description:**
${todo.content}

---
*Created by Claude Code Agent at ${timestamp}*

**Management Commands:**
\`\`\`bash
# Update status to in-progress
gh issue edit $ISSUE_NUMBER --add-label "status: in-progress"

# Complete task
gh issue close $ISSUE_NUMBER --comment "Task completed by Claude Code"

# Add comment
gh issue comment $ISSUE_NUMBER --body "Your comment here"
\`\`\``;
    }

    // Sample todo structure for demonstration
    getSampleTodos() {
        return [
            {
                id: 'sample-1',
                content: 'Implement GitHub Issues integration',
                status: 'in_progress',
                priority: 'high'
            },
            {
                id: 'sample-2', 
                content: 'Add terminal command autocompletion',
                status: 'pending',
                priority: 'medium'
            },
            {
                id: 'sample-3',
                content: 'Improve monitor font readability',
                status: 'pending',
                priority: 'high'
            }
        ];
    }

    async syncTodos(todos = null) {
        if (!todos) {
            todos = this.getSampleTodos();
        }

        console.log('Starting GitHub Issues sync...');
        
        // Ensure labels exist
        await this.ensureLabels();
        
        // Get existing issues
        const existingIssues = await this.listIssues('all', ['agent: claude']);
        const issueMap = new Map(existingIssues.map(issue => [
            issue.title.toLowerCase(), issue
        ]));

        for (const todo of todos) {
            const existingIssue = issueMap.get(todo.content.toLowerCase());
            
            if (!existingIssue && todo.status !== 'completed') {
                // Create new issue
                const labels = [
                    `priority: ${todo.priority}`,
                    'type: task',
                    'agent: claude'
                ];
                
                if (todo.status === 'in_progress') {
                    labels.push('status: in-progress');
                }

                const result = await this.createIssue(
                    todo.content,
                    this.formatIssueBody(todo),
                    labels
                );

                if (result.success) {
                    console.log(`✓ Created issue #${result.number}: ${todo.content}`);
                }
            } else if (existingIssue) {
                // Update existing issue
                const updates = {};
                
                if (todo.status === 'completed' && existingIssue.state === 'open') {
                    updates.close = true;
                    updates.comment = 'Task completed by Claude Code';
                } else if (todo.status === 'in_progress' && !existingIssue.labels.some(l => l.name === 'status: in-progress')) {
                    updates.addLabels = ['status: in-progress'];
                }

                if (Object.keys(updates).length > 0) {
                    await this.updateIssue(existingIssue.number, updates);
                    console.log(`✓ Updated issue #${existingIssue.number}: ${todo.content}`);
                }
            }
        }

        console.log('✅ GitHub Issues sync completed');
    }

    async generateSyncReport() {
        const issues = await this.listIssues('all', ['agent: claude']);
        
        console.log('\\n📊 GitHub Issues Sync Report');
        console.log('================================');
        console.log(`Total Claude-managed issues: ${issues.length}`);
        
        const byStatus = issues.reduce((acc, issue) => {
            const status = issue.state === 'closed' ? 'completed' : 
                         issue.labels.some(l => l.name === 'status: in-progress') ? 'in_progress' : 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        console.log(`Open issues: ${byStatus.pending || 0}`);
        console.log(`In progress: ${byStatus.in_progress || 0}`);
        console.log(`Completed: ${byStatus.completed || 0}`);

        return { total: issues.length, byStatus, issues };
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const sync = new GitHubTaskSync();
    const command = process.argv[2];

    switch (command) {
        case 'sync':
            await sync.syncTodos();
            break;
        case 'report':
            await sync.generateSyncReport();
            break;
        case 'labels':
            await sync.ensureLabels();
            break;
        default:
            console.log(`
GitHub Task Sync CLI

Usage:
  node sync-github-tasks.js sync     # Sync todos with GitHub issues
  node sync-github-tasks.js report   # Generate sync report
  node sync-github-tasks.js labels   # Ensure GitHub labels exist

Commands will use your existing GitHub CLI authentication.
            `);
    }
}

export default GitHubTaskSync;