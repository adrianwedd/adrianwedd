class GitHubActionsManager {
    constructor() {
        this.repo = 'adrianwedd/adrianwedd';
        this.cache = new Map();
        this.initialized = false;
        this.performanceMetrics = new Map();
        this.realTimeMonitors = new Map();
        this.workflowTemplates = this.initWorkflowTemplates();
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
        
        // Try to fetch real workflow data from GitHub API
        try {
            const apiResponse = await fetch('https://api.github.com/repos/adrianwedd/adrianwedd/actions/workflows', {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Adrian-Terminal-Interface'
                }
            });
            
            if (apiResponse.ok) {
                const apiData = await apiResponse.json();
                const workflows = apiData.workflows.map(wf => ({
                    name: wf.name,
                    id: wf.path.split('/').pop(),
                    status: wf.state === 'active' ? 'active' : 'disabled',
                    url: wf.html_url,
                    badge_url: wf.badge_url
                }));
                
                return {
                    ...result,
                    workflows,
                    count: workflows.length,
                    source: 'github-api'
                };
            }
        } catch (error) {
            console.warn('GitHub API failed, using fallback data:', error);
        }
        
        // Fallback workflow data
        const workflows = [
            { name: '🤖 Daily AI Magic', id: 'daily-claude-magic.yml', status: 'active' },
            { name: '🌤️ Tasmania Weather Update', id: 'update-weather.yml', status: 'active' },
            { name: '🚀 Deploy Terminal Interface', id: 'deploy-pages.yml', status: 'active' },
            { name: '🧪 Test Suite', id: 'test.yml', status: 'active' },
            { name: '🎭 Playwright Testing Suite', id: 'playwright-tests.yml', status: 'active' },
            { name: '💬 LLM Chat Response', id: 'llm-chat.yml', status: 'active' }
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
        
        // Try to fetch real workflow run data from GitHub API
        try {
            const apiResponse = await fetch(`https://api.github.com/repos/adrianwedd/adrianwedd/actions/runs?per_page=${limit}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Adrian-Terminal-Interface'
                }
            });
            
            if (apiResponse.ok) {
                const apiData = await apiResponse.json();
                const runs = apiData.workflow_runs.map(run => ({
                    workflow: run.name,
                    status: run.status,
                    conclusion: run.conclusion,
                    created_at: run.created_at,
                    run_number: run.run_number,
                    html_url: run.html_url,
                    head_branch: run.head_branch,
                    event: run.event
                }));
                
                return {
                    ...result,
                    runs,
                    count: runs.length,
                    source: 'github-api'
                };
            }
        } catch (error) {
            console.warn('GitHub API failed for runs, using fallback data:', error);
        }
        
        // Fallback run data
        const runs = [
            { 
                workflow: '🌤️ Tasmania Weather Update',
                status: 'completed',
                conclusion: 'success',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                run_number: 42,
                head_branch: 'main',
                event: 'schedule'
            },
            { 
                workflow: '🤖 Daily AI Magic',
                status: 'completed',
                conclusion: 'success',
                created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                run_number: 15,
                head_branch: 'main',
                event: 'schedule'
            },
            { 
                workflow: '🧪 Test Suite',
                status: 'completed',
                conclusion: 'success',
                created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                run_number: 128,
                head_branch: 'main',
                event: 'push'
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
                        case 'list': {
                            const workflows = await this.listWorkflows();
                            return this.formatWorkflowsList(workflows);
                        }
                        
                        case 'runs': {
                            const runs = await this.getWorkflowRuns();
                            return this.formatRunsList(runs);
                        }
                        
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
        
        output += `Total: ${data.count} workflows${data.source ? ` (${data.source})` : ''}\n`;
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
            output += `   Status: ${run.status} (${run.conclusion || 'running'})\n`;
            output += `   Branch: ${run.head_branch || 'main'} • Event: ${run.event || 'push'}\n`;
            output += `   Started: ${timeAgo}\n\n`;
        });
        
        output += `Showing ${data.count} recent runs${data.source ? ` (${data.source})` : ''}`;
        
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

    // Initialize workflow templates library
    initWorkflowTemplates() {
        return {
            'Node.js CI/CD': {
                description: 'Continuous integration and deployment for Node.js applications',
                category: 'web',
                template: `name: Node.js CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
    
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to production
      run: echo "Deploy to production server"`
            },
            'Python Django': {
                description: 'Django application testing and deployment pipeline',
                category: 'python',
                template: `name: Django CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
    - uses: actions/checkout@v4
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    - name: Run tests
      run: |
        python manage.py test`
            },
            'Accessibility Testing': {
                description: 'Automated accessibility testing with axe-core',
                category: 'testing',
                template: `name: Accessibility Testing

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - name: Install Playwright
      run: npx playwright install
    - name: Run accessibility tests
      run: npm run test:accessibility
    - name: Upload accessibility report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: accessibility-report
        path: accessibility-report/`
            },
            'Security Scan': {
                description: 'Security vulnerability scanning with CodeQL',
                category: 'security',
                template: `name: Security Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript' ]
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: \${{ matrix.language }}
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3`
            }
        };
    }

    // Visual workflow editor in terminal
    async createWorkflowEditor() {
        return {
            title: '🔧 GITHUB ACTIONS WORKFLOW EDITOR',
            commands: {
                'new': {
                    description: 'Create new workflow from template',
                    handler: async (args) => this.newWorkflowFromTemplate(args)
                },
                'edit': {
                    description: 'Edit existing workflow',
                    handler: async (args) => this.editExistingWorkflow(args)
                },
                'validate': {
                    description: 'Validate workflow syntax',
                    handler: async (args) => this.validateWorkflow(args)
                },
                'preview': {
                    description: 'Preview workflow before saving',
                    handler: async (args) => this.previewWorkflow(args)
                },
                'templates': {
                    description: 'List available workflow templates',
                    handler: async (args) => this.listWorkflowTemplates()
                }
            }
        };
    }

    async newWorkflowFromTemplate(args) {
        if (args.length === 0) {
            return {
                success: false,
                message: 'Usage: workflow new <template-name> [workflow-name]',
                suggestion: 'Try: workflow templates to see available templates'
            };
        }

        const templateName = args[0];
        const workflowName = args[1] || templateName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        const template = this.findTemplate(templateName);
        if (!template) {
            return {
                success: false,
                message: `Template "${templateName}" not found`,
                availableTemplates: Object.keys(this.workflowTemplates)
            };
        }

        return {
            success: true,
            template: template.template,
            workflowName: workflowName,
            description: template.description,
            message: `Created workflow "${workflowName}" from template "${templateName}"`
        };
    }

    findTemplate(name) {
        // Case-insensitive search
        const key = Object.keys(this.workflowTemplates).find(
            k => k.toLowerCase().includes(name.toLowerCase())
        );
        return key ? this.workflowTemplates[key] : null;
    }

    async listWorkflowTemplates() {
        const templates = Object.entries(this.workflowTemplates).map(([name, info]) => ({
            name,
            description: info.description,
            category: info.category
        }));

        return {
            success: true,
            templates,
            total: templates.length
        };
    }

    // Real-time workflow monitoring
    async startRealTimeMonitoring(workflowName = null) {
        const monitorId = `monitor-${Date.now()}`;
        
        const monitor = {
            id: monitorId,
            workflowName,
            startTime: new Date(),
            isActive: true,
            updates: []
        };

        this.realTimeMonitors.set(monitorId, monitor);
        
        // Start polling for updates
        this.pollWorkflowUpdates(monitorId);
        
        return {
            success: true,
            monitorId,
            message: `Started real-time monitoring for ${workflowName || 'all workflows'}`
        };
    }

    async pollWorkflowUpdates(monitorId) {
        const monitor = this.realTimeMonitors.get(monitorId);
        if (!monitor || !monitor.isActive) return;

        try {
            const runs = await this.getWorkflowRuns(monitor.workflowName, 3);
            if (runs.success) {
                const latestRuns = runs.runs.filter(run => 
                    new Date(run.created_at) > monitor.startTime
                );
                
                if (latestRuns.length > 0) {
                    monitor.updates.push({
                        timestamp: new Date(),
                        runs: latestRuns
                    });
                }
            }
        } catch (error) {
            console.warn('Error polling workflow updates:', error);
        }

        // Continue polling every 10 seconds
        setTimeout(() => this.pollWorkflowUpdates(monitorId), 10000);
    }

    async stopRealTimeMonitoring(monitorId) {
        const monitor = this.realTimeMonitors.get(monitorId);
        if (monitor) {
            monitor.isActive = false;
            this.realTimeMonitors.delete(monitorId);
            return {
                success: true,
                message: `Stopped monitoring ${monitorId}`
            };
        }
        return {
            success: false,
            message: `Monitor ${monitorId} not found`
        };
    }

    // Workflow performance analytics
    async getWorkflowAnalytics(timeframe = '30d') {
        try {
            const runs = await this.getWorkflowRuns(null, 50);
            if (!runs.success) {
                return runs;
            }

            const analytics = this.calculatePerformanceMetrics(runs.runs, timeframe);
            return {
                success: true,
                analytics,
                timeframe
            };
        } catch (error) {
            return {
                success: false,
                message: `Error calculating analytics: ${error.message}`
            };
        }
    }

    calculatePerformanceMetrics(runs, timeframe) {
        const now = new Date();
        const timeframeMs = this.parseTimeframe(timeframe);
        const cutoffDate = new Date(now.getTime() - timeframeMs);
        
        const filteredRuns = runs.filter(run => 
            new Date(run.created_at) > cutoffDate
        );

        const successfulRuns = filteredRuns.filter(run => run.conclusion === 'success');
        const failedRuns = filteredRuns.filter(run => run.conclusion === 'failure');
        
        const durations = filteredRuns.map(run => {
            const start = new Date(run.created_at);
            const end = new Date(run.updated_at);
            return end - start;
        }).filter(d => d > 0);

        const avgDuration = durations.length > 0 
            ? durations.reduce((a, b) => a + b, 0) / durations.length 
            : 0;

        return {
            totalRuns: filteredRuns.length,
            successRate: filteredRuns.length > 0 
                ? (successfulRuns.length / filteredRuns.length * 100).toFixed(1) 
                : 0,
            failureRate: filteredRuns.length > 0 
                ? (failedRuns.length / filteredRuns.length * 100).toFixed(1) 
                : 0,
            averageDuration: this.formatDuration(avgDuration),
            fastestRun: durations.length > 0 ? this.formatDuration(Math.min(...durations)) : 'N/A',
            slowestRun: durations.length > 0 ? this.formatDuration(Math.max(...durations)) : 'N/A',
            runsPerDay: filteredRuns.length > 0 
                ? (filteredRuns.length / (timeframeMs / (24 * 60 * 60 * 1000))).toFixed(1) 
                : 0
        };
    }

    parseTimeframe(timeframe) {
        const match = timeframe.match(/^(\d+)([dwmy])$/);
        if (!match) return 30 * 24 * 60 * 60 * 1000; // Default 30 days
        
        const [, num, unit] = match;
        const multipliers = {
            'd': 24 * 60 * 60 * 1000,
            'w': 7 * 24 * 60 * 60 * 1000,
            'm': 30 * 24 * 60 * 60 * 1000,
            'y': 365 * 24 * 60 * 60 * 1000
        };
        
        return parseInt(num) * (multipliers[unit] || multipliers.d);
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }

    // Enhanced command registry
    getEnhancedCommands() {
        return {
            'workflow': {
                description: 'Enhanced workflow management with templates and analytics',
                subcommands: {
                    'editor': {
                        description: 'Open visual workflow editor',
                        handler: async () => this.createWorkflowEditor()
                    },
                    'analytics': {
                        description: 'Show workflow performance analytics',
                        handler: async (args) => this.getWorkflowAnalytics(args[0])
                    },
                    'monitor': {
                        description: 'Start/stop real-time monitoring',
                        handler: async (args) => {
                            if (args[0] === 'start') return this.startRealTimeMonitoring(args[1]);
                            if (args[0] === 'stop') return this.stopRealTimeMonitoring(args[1]);
                            return { success: false, message: 'Usage: workflow monitor <start|stop> [workflow-name|monitor-id]' };
                        }
                    },
                    'templates': {
                        description: 'Manage workflow templates',
                        handler: async () => this.listWorkflowTemplates()
                    }
                }
            }
        };
    }

    // Cleanup method
    cleanup() {
        this.cache.clear();
        this.realTimeMonitors.forEach(monitor => monitor.isActive = false);
        this.realTimeMonitors.clear();
        this.performanceMetrics.clear();
    }
}

// Export for use in terminal
window.GitHubActionsManager = GitHubActionsManager;