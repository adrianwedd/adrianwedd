class GitHubTaskManager {
    constructor() {
        this.repo = 'adrianwedd/adrianwedd';
        this.apiBase = 'https://api.github.com';
        this.labels = {
            'high': 'priority: high',
            'medium': 'priority: medium', 
            'low': 'priority: low',
            'bug': 'type: bug',
            'enhancement': 'type: enhancement',
            'task': 'type: task',
            'documentation': 'type: documentation'
        };
        this.cache = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return true;
        
        try {
            // Check if we can access GitHub API
            const response = await fetch(`${this.apiBase}/repos/${this.repo}`, {
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            });
            
            if (response.ok) {
                this.initialized = true;
                await this.ensureLabelsExist();
                return true;
            }
            return false;
        } catch (error) {
            console.warn('GitHub API not accessible:', error);
            return false;
        }
    }

    async ensureLabelsExist() {
        const labelConfigs = [
            { name: 'priority: high', color: 'ff4444', description: 'High priority task' },
            { name: 'priority: medium', color: 'ffaa00', description: 'Medium priority task' },
            { name: 'priority: low', color: '44ff44', description: 'Low priority task' },
            { name: 'type: task', color: '0096ff', description: 'General task' },
            { name: 'type: enhancement', color: '00ff88', description: 'Enhancement or feature' },
            { name: 'type: bug', color: 'ff6600', description: 'Bug fix' },
            { name: 'type: documentation', color: 'cc99ff', description: 'Documentation update' },
            { name: 'agent: claude', color: '00cccc', description: 'Managed by Claude Code' },
            { name: 'status: in-progress', color: 'ffcc00', description: 'Currently being worked on' },
            { name: 'status: blocked', color: '888888', description: 'Blocked waiting for something' }
        ];

        for (const labelConfig of labelConfigs) {
            try {
                await this.createLabelIfNotExists(labelConfig);
            } catch (error) {
                console.warn(`Could not create label ${labelConfig.name}:`, error);
            }
        }
    }

    async createLabelIfNotExists(labelConfig) {
        // Note: This would require authenticated API access
        // For now, we'll use gh CLI commands
        console.log(`Ensuring label exists: ${labelConfig.name}`);
    }

    async createIssue(title, body, priority = 'medium', type = 'task', assignee = null) {
        if (!this.initialized && !await this.init()) {
            throw new Error('GitHub integration not available');
        }

        const labels = [
            this.labels[priority],
            this.labels[type],
            'agent: claude'
        ].filter(Boolean);

        const issueData = {
            title,
            body: this.formatIssueBody(body),
            labels,
            assignees: assignee ? [assignee] : []
        };

        try {
            // Use GitHub CLI for issue creation since it handles auth
            const labelsArg = labels.map(l => `"${l}"`).join(',');
            const assigneeArg = assignee ? `--assignee "${assignee}"` : '';
            
            const command = `gh issue create --repo "${this.repo}" --title "${title}" --body "${body}" --label ${labelsArg} ${assigneeArg}`.trim();
            
            // For security, we'll return the command instead of executing it
            return {
                success: false,
                command,
                data: issueData,
                message: 'GitHub CLI command ready for execution'
            };
        } catch (error) {
            throw new Error(`Failed to create GitHub issue: ${error.message}`);
        }
    }

    formatIssueBody(body) {
        const timestamp = new Date().toISOString();
        return `${body}

---
**Metadata:**
- Created by: Claude Code Agent
- Timestamp: ${timestamp}
- Repository: ${this.repo}

**Commands for management:**
\`\`\`bash
# Update status
gh issue edit <issue-number> --add-label "status: in-progress"
gh issue edit <issue-number> --remove-label "status: in-progress"

# Close issue
gh issue close <issue-number> --comment "Completed by Claude Code"
\`\`\``;
    }

    async updateIssue(issueNumber, updates) {
        if (!this.initialized && !await this.init()) {
            throw new Error('GitHub integration not available');
        }

        const commands = [];

        if (updates.status) {
            commands.push(`gh issue edit ${issueNumber} --add-label "status: ${updates.status}"`);
        }

        if (updates.priority) {
            // Remove old priority labels and add new one
            commands.push(`gh issue edit ${issueNumber} --remove-label "priority: high,priority: medium,priority: low"`);
            commands.push(`gh issue edit ${issueNumber} --add-label "${this.labels[updates.priority]}"`);
        }

        if (updates.comment) {
            commands.push(`gh issue comment ${issueNumber} --body "${updates.comment}"`);
        }

        if (updates.close) {
            commands.push(`gh issue close ${issueNumber} --comment "Completed by Claude Code"`);
        }

        return {
            commands,
            issueNumber,
            message: 'GitHub CLI commands ready for execution'
        };
    }

    async listIssues(state = 'open', labels = null) {
        if (!this.initialized && !await this.init()) {
            throw new Error('GitHub integration not available');
        }

        let command = `gh issue list --repo "${this.repo}" --state ${state}`;
        
        if (labels) {
            const labelFilter = labels.join(',');
            command += ` --label "${labelFilter}"`;
        }

        return {
            command,
            message: 'Use GitHub CLI to list issues'
        };
    }

    async syncTodosWithIssues(todos) {
        if (!this.initialized && !await this.init()) {
            console.warn('GitHub integration not available, using local todos only');
            return todos;
        }

        const commands = [];
        const issueCreations = [];

        for (const todo of todos) {
            if (todo.status === 'pending' && !todo.githubIssue) {
                // Create new issue for pending todos
                const issueData = await this.createIssue(
                    todo.content,
                    `**Task ID:** ${todo.id}
**Priority:** ${todo.priority}
**Status:** ${todo.status}

**Description:**
${todo.content}

This issue was automatically created from the Claude Code task management system.`,
                    todo.priority,
                    'task'
                );
                
                issueCreations.push({
                    todo: todo.id,
                    command: issueData.command
                });
            } else if (todo.status === 'completed' && todo.githubIssue) {
                // Close completed issues
                const closeData = await this.updateIssue(todo.githubIssue, {
                    close: true,
                    comment: `Task completed successfully.

**Final Status:** ${todo.status}
**Task ID:** ${todo.id}`
                });
                
                commands.push(...closeData.commands);
            }
        }

        return {
            todos,
            commands,
            issueCreations,
            message: 'GitHub issue sync commands prepared'
        };
    }

    // Convert GitHub issues back to todo format
    async parseIssuesAsTodos(issues) {
        return issues.map(issue => {
            // Extract priority from labels
            const priorityLabel = issue.labels.find(l => l.name.startsWith('priority:'));
            const priority = priorityLabel ? priorityLabel.name.split(': ')[1] : 'medium';
            
            // Extract status from labels and issue state
            let status = 'pending';
            if (issue.state === 'closed') {
                status = 'completed';
            } else if (issue.labels.some(l => l.name === 'status: in-progress')) {
                status = 'in_progress';
            }

            return {
                id: `gh-${issue.number}`,
                content: issue.title,
                status,
                priority,
                githubIssue: issue.number,
                url: issue.html_url,
                created: issue.created_at,
                updated: issue.updated_at
            };
        });
    }

    // Terminal command integration
    getTerminalCommands() {
        return {
            'gh-create': {
                description: 'Create a GitHub issue',
                usage: 'gh-create <title> [priority] [type]',
                handler: async (args) => {
                    const [title, priority = 'medium', type = 'task'] = args;
                    if (!title) {
                        return 'Usage: gh-create <title> [priority] [type]';
                    }
                    
                    const result = await this.createIssue(title, title, priority, type);
                    return `GitHub issue creation command:\n${result.command}`;
                }
            },
            'gh-sync': {
                description: 'Sync todos with GitHub issues',
                usage: 'gh-sync',
                handler: async () => {
                    // This would integrate with the existing todo system
                    return 'GitHub sync functionality ready - integrate with existing todo system';
                }
            },
            'gh-list': {
                description: 'List GitHub issues',
                usage: 'gh-list [state] [labels]',
                handler: async (args) => {
                    const [state = 'open', labels] = args;
                    const result = await this.listIssues(state, labels ? labels.split(',') : null);
                    return `GitHub list command:\n${result.command}`;
                }
            }
        };
    }
}

// Export for use in terminal
window.GitHubTaskManager = GitHubTaskManager;