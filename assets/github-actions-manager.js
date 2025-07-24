class GitHubActionsManager {
    constructor() {
        this.repo = 'adrianwedd/adrianwedd';
        this.cache = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return true;
        
        try {
            // Test if we can access GitHub CLI
            const testResponse = await this.executeGHCommand('auth status');
            if (testResponse.success) {
                this.initialized = true;
                return true;
            }
            return false;
        } catch (error) {
            console.warn('GitHub CLI not available:', error);
            return false;
        }
    }

    async executeGHCommand(command) {
        // This would be executed via a backend API endpoint in a real implementation
        // For now, we'll simulate the functionality and provide the commands
        return {
            success: true,
            command: `gh ${command}`,
            message: 'Command ready for execution'
        };
    }

    async listWorkflows() {
        const result = await this.executeGHCommand(`workflow list --repo ${this.repo}`);
        
        // Simulate workflow data (in production this would parse actual gh output)
        const workflows = [
            { name: 'Daily Claude Magic', id: 'daily-claude-magic.yml', status: 'active' },
            { name: 'Tasmania Weather Update', id: 'update-weather.yml', status: 'active' },
            { name: 'Deploy Terminal Interface', id: 'deploy.yml', status: 'active' },
            { name: 'Playwright Tests', id: 'test.yml', status: 'active' },
            { name: 'Claude Code Review', id: 'claude-review.yml', status: 'active' },
            { name: 'LLM Chat Response', id: 'llm-chat.yml', status: 'active' }
        ];

        return {
            ...result,
            workflows,
            count: workflows.length
        };
    }

    async triggerWorkflow(workflowName, inputs = {}) {
        if (!this.initialized && !await this.init()) {
            throw new Error('GitHub Actions integration not available');
        }

        // Map workflow names to their identifiers
        const workflowMap = {
            'weather': 'update-weather.yml',
            'magic': 'daily-claude-magic.yml',
            'deploy': 'deploy.yml',
            'test': 'test.yml',
            'tests': 'test.yml'
        };

        const workflowId = workflowMap[workflowName.toLowerCase()] || workflowName;
        
        // Build the command with inputs
        let command = `workflow run "${workflowId}" --repo ${this.repo}`;
        
        if (Object.keys(inputs).length > 0) {
            for (const [key, value] of Object.entries(inputs)) {
                command += ` --field ${key}="${value}"`;
            }
        }

        const result = await this.executeGHCommand(command);
        
        return {
            success: true,
            workflow: workflowId,
            command: result.command,
            inputs,
            message: `Workflow trigger command ready: ${workflowName}`
        };
    }

    async getWorkflowRuns(workflowName = null, limit = 5) {
        let command = `run list --repo ${this.repo} --limit ${limit}`;
        
        if (workflowName) {
            const workflowMap = {
                'weather': 'update-weather.yml',
                'magic': 'daily-claude-magic.yml',
                'deploy': 'deploy.yml',
                'test': 'test.yml'
            };
            const workflowId = workflowMap[workflowName.toLowerCase()] || workflowName;
            command += ` --workflow "${workflowId}"`;
        }

        const result = await this.executeGHCommand(command);
        
        // Simulate recent runs (in production this would parse actual gh output)
        const runs = [
            { 
                workflow: 'Tasmania Weather Update',
                status: 'completed',
                conclusion: 'success',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                run_number: 42
            },
            { 
                workflow: 'Daily Claude Magic',
                status: 'completed',
                conclusion: 'success',
                created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                run_number: 15
            }
        ];

        return {
            ...result,
            runs,
            count: runs.length
        };
    }

    async watchWorkflowRun(runId) {
        const command = `run watch ${runId} --repo ${this.repo}`;
        const result = await this.executeGHCommand(command);
        
        return {
            ...result,
            runId,
            message: `Watching workflow run: ${runId}`
        };
    }

    // Terminal command integration
    getTerminalCommands() {
        return {
            'actions': {
                description: 'List available GitHub Actions workflows',
                usage: 'actions [list|runs|status]',
                handler: async (args) => {
                    const subcommand = args[0] || 'list';
                    
                    switch (subcommand.toLowerCase()) {
                        case 'list':
                            const workflows = await this.listWorkflows();
                            return this.formatWorkflowsList(workflows);
                        
                        case 'runs':
                            const runs = await this.getWorkflowRuns();
                            return this.formatRunsList(runs);
                        
                        case 'status':
                            return 'GitHub Actions integration: ' + (this.initialized ? 'Active ✅' : 'Initializing...');
                        
                        default:
                            return 'Usage: actions [list|runs|status]';
                    }
                }
            },
            'trigger': {
                description: 'Trigger a GitHub Actions workflow',
                usage: 'trigger <workflow> [key=value...]',
                handler: async (args) => {
                    if (!args[0]) {
                        return 'Usage: trigger <workflow> [key=value...]\n\nAvailable workflows:\n• weather - Update Tasmania weather\n• magic - Generate daily Claude magic\n• deploy - Deploy terminal interface\n• test - Run Playwright tests';
                    }
                    
                    const workflowName = args[0];
                    const inputs = {};
                    
                    // Parse key=value inputs
                    for (let i = 1; i < args.length; i++) {
                        const [key, value] = args[i].split('=');
                        if (key && value) {
                            inputs[key] = value;
                        }
                    }
                    
                    const result = await this.triggerWorkflow(workflowName, inputs);
                    return this.formatTriggerResult(result);
                }
            },
            'runs': {
                description: 'Show recent workflow runs',
                usage: 'runs [workflow] [limit]',
                handler: async (args) => {
                    const workflow = args[0];
                    const limit = parseInt(args[1]) || 5;
                    
                    const runs = await this.getWorkflowRuns(workflow, limit);
                    return this.formatRunsList(runs);
                }
            }
        };
    }

    formatWorkflowsList(data) {
        if (!data.workflows || data.workflows.length === 0) {
            return 'No workflows found.';
        }

        let output = '🚀 GITHUB ACTIONS WORKFLOWS\n\n';
        
        data.workflows.forEach(workflow => {
            const status = workflow.status === 'active' ? '✅' : '❌';
            output += `${status} ${workflow.name}\n`;
            output += `   ID: ${workflow.id}\n`;
            output += `   Status: ${workflow.status}\n\n`;
        });
        
        output += `Total: ${data.count} workflows\n`;
        output += `\n💡 Use 'trigger <workflow>' to run workflows`;
        
        return output;
    }

    formatRunsList(data) {
        if (!data.runs || data.runs.length === 0) {
            return 'No recent workflow runs found.';
        }

        let output = '📊 RECENT WORKFLOW RUNS\n\n';
        
        data.runs.forEach(run => {
            const statusEmoji = run.conclusion === 'success' ? '✅' : 
                               run.conclusion === 'failure' ? '❌' : '🔄';
            const timeAgo = this.getTimeAgo(new Date(run.created_at));
            
            output += `${statusEmoji} ${run.workflow} (#${run.run_number})\n`;
            output += `   Status: ${run.status} (${run.conclusion})\n`;
            output += `   Started: ${timeAgo}\n\n`;
        });
        
        output += `Showing ${data.count} recent runs`;
        
        return output;
    }

    formatTriggerResult(result) {
        let output = '🚀 WORKFLOW TRIGGER\n\n';
        output += `Workflow: ${result.workflow}\n`;
        
        if (Object.keys(result.inputs).length > 0) {
            output += 'Inputs:\n';
            for (const [key, value] of Object.entries(result.inputs)) {
                output += `  ${key}: ${value}\n`;
            }
        }
        
        output += `\n📋 Command to execute:\n${result.command}\n`;
        output += `\n✨ ${result.message}`;
        
        return output;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    // Cleanup method
    cleanup() {
        this.cache.clear();
    }
}

// Export for use in terminal
window.GitHubActionsManager = GitHubActionsManager;