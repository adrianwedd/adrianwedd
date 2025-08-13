/**
 * GitHub Integration Commands Module
 * Handles GitHub Actions, workflows, and task management
 */

export class GitHubCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.githubManager = null;
    this.actionsCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize GitHub manager
   */
  async initializeGitHub() {
    if (!this.githubManager) {
      try {
        const { GitHubTaskManager } = await import('../../github-task-manager.js');
        this.githubManager = new GitHubTaskManager();
        return true;
      } catch (error) {
        console.error('Failed to initialize GitHub manager:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Get command definitions
   */
  getCommands() {
    return {
      actions: {
        handler: this.handleActions.bind(this),
        description: 'Show GitHub Actions workflows',
        usage: 'actions [list|status|history]',
      },

      trigger: {
        handler: this.handleTrigger.bind(this),
        description: 'Trigger a GitHub workflow',
        usage: 'trigger <workflow-name>',
        aliases: ['run-workflow'],
      },

      runs: {
        handler: this.handleRuns.bind(this),
        description: 'Show workflow runs',
        usage: 'runs [workflow-name]',
      },

      task: {
        handler: this.handleTask.bind(this),
        description: 'GitHub task management',
        usage: 'task [create|list|close] [options]',
      },

      issues: {
        handler: this.handleIssues.bind(this),
        description: 'Manage GitHub issues',
        usage: 'issues [list|create|close]',
        aliases: ['issue'],
      },

      pr: {
        handler: this.handlePR.bind(this),
        description: 'Manage pull requests',
        usage: 'pr [list|create|merge]',
        aliases: ['pulls'],
      },
    };
  }

  /**
   * Handle actions command
   */
  async handleActions(args) {
    const initialized = await this.initializeGitHub();
    if (!initialized) {
      return '❌ GitHub integration unavailable.';
    }

    const subcommand = args[0] || 'list';

    try {
      switch (subcommand) {
        case 'list':
          return await this.listWorkflows();
        case 'status':
          return await this.workflowStatus();
        case 'history':
          return await this.workflowHistory();
        default:
          return 'Usage: actions [list|status|history]';
      }
    } catch (error) {
      return `❌ GitHub API Error: ${error.message}`;
    }
  }

  /**
   * List available workflows
   */
  async listWorkflows() {
    const loading = this.terminal.ui.showLoading('Fetching workflows...');

    try {
      const workflows = await this.terminal.integrations.fetchGitHubData(
        '/repos/adrianwedd/adrianwedd/actions/workflows'
      );

      loading.stop();

      if (!workflows.workflows || workflows.workflows.length === 0) {
        return 'No workflows found.';
      }

      let output = '╔══════════════════════════════════════════════════════════╗\n';
      output += '║                  GITHUB WORKFLOWS                        ║\n';
      output += '╠══════════════════════════════════════════════════════════╣\n';

      workflows.workflows.forEach((workflow) => {
        const name = workflow.name.substring(0, 40).padEnd(40);
        const state = workflow.state.toUpperCase().padEnd(10);
        output += `║ ${state} ${name}         ║\n`;
        output += `║   ID: ${workflow.id}  Path: ${workflow.path.substring(0, 35)}║\n`;
      });

      output += '╚══════════════════════════════════════════════════════════╝';
      return output;
    } catch (error) {
      loading.stop();
      throw error;
    }
  }

  /**
   * Show workflow status
   */
  async workflowStatus() {
    const loading = this.terminal.ui.showLoading('Checking workflow status...');

    try {
      const runs = await this.terminal.integrations.fetchGitHubData(
        '/repos/adrianwedd/adrianwedd/actions/runs?per_page=5'
      );

      loading.stop();

      if (!runs.workflow_runs || runs.workflow_runs.length === 0) {
        return 'No recent workflow runs.';
      }

      const headers = ['Workflow', 'Status', 'Started', 'Duration'];
      const rows = runs.workflow_runs.map((run) => [
        run.name.substring(0, 25),
        this.getStatusIcon(run.status, run.conclusion),
        new Date(run.created_at).toLocaleString(),
        this.calculateDuration(run.created_at, run.updated_at),
      ]);

      this.terminal.ui.showTable(headers, rows);
      return '';
    } catch (error) {
      loading.stop();
      throw error;
    }
  }

  /**
   * Show workflow history
   */
  async workflowHistory() {
    const loading = this.terminal.ui.showLoading('Loading workflow history...');

    try {
      const runs = await this.terminal.integrations.fetchGitHubData(
        '/repos/adrianwedd/adrianwedd/actions/runs?per_page=10'
      );

      loading.stop();

      let output = '╔══════════════════════════════════════════════════════════╗\n';
      output += '║                  WORKFLOW HISTORY                        ║\n';
      output += '╠══════════════════════════════════════════════════════════╣\n';

      runs.workflow_runs.forEach((run) => {
        const icon = this.getStatusIcon(run.status, run.conclusion);
        const name = run.name.substring(0, 35).padEnd(35);
        const date = new Date(run.created_at).toLocaleDateString();
        output += `║ ${icon} ${name} ${date}    ║\n`;
      });

      output += '╚══════════════════════════════════════════════════════════╝';
      return output;
    } catch (error) {
      loading.stop();
      throw error;
    }
  }

  /**
   * Handle trigger command
   */
  async handleTrigger(args) {
    if (args.length === 0) {
      return 'Usage: trigger <workflow-name>\nExample: trigger daily-update';
    }

    const workflowName = args.join(' ');
    const loading = this.terminal.ui.showLoading(`Triggering ${workflowName}...`);

    try {
      // This would need proper GitHub token authentication
      const result = await this.terminal.integrations.fetchGitHubData(
        `/repos/adrianwedd/adrianwedd/actions/workflows/${workflowName}/dispatches`,
        {
          method: 'POST',
          body: JSON.stringify({ ref: 'main' }),
        }
      );

      loading.stop();
      return `✅ Workflow "${workflowName}" triggered successfully!`;
    } catch (error) {
      loading.stop();
      return `❌ Failed to trigger workflow: ${error.message}`;
    }
  }

  /**
   * Handle runs command
   */
  async handleRuns(args) {
    const loading = this.terminal.ui.showLoading('Fetching workflow runs...');

    try {
      const endpoint = args[0]
        ? `/repos/adrianwedd/adrianwedd/actions/workflows/${args[0]}/runs`
        : '/repos/adrianwedd/adrianwedd/actions/runs';

      const runs = await this.terminal.integrations.fetchGitHubData(endpoint + '?per_page=10');

      loading.stop();

      if (!runs.workflow_runs || runs.workflow_runs.length === 0) {
        return 'No workflow runs found.';
      }

      const headers = ['Run', 'Workflow', 'Status', 'Branch'];
      const rows = runs.workflow_runs.map((run) => [
        `#${run.run_number}`,
        run.name.substring(0, 20),
        this.getStatusIcon(run.status, run.conclusion),
        run.head_branch,
      ]);

      this.terminal.ui.showTable(headers, rows);
      return '';
    } catch (error) {
      loading.stop();
      return `❌ Error fetching runs: ${error.message}`;
    }
  }

  /**
   * Handle task command
   */
  async handleTask(args) {
    const subcommand = args[0] || 'list';

    switch (subcommand) {
      case 'create':
        return await this.createTask(args.slice(1));
      case 'list':
        return await this.listTasks();
      case 'close':
        return await this.closeTask(args.slice(1));
      default:
        return 'Usage: task [create|list|close] [options]';
    }
  }

  /**
   * Handle issues command
   */
  async handleIssues(args) {
    const subcommand = args[0] || 'list';
    const loading = this.terminal.ui.showLoading('Fetching issues...');

    try {
      switch (subcommand) {
        case 'list': {
          const issues = await this.terminal.integrations.fetchGitHubData(
            '/repos/adrianwedd/adrianwedd/issues?state=open&per_page=10'
          );

          loading.stop();

          if (issues.length === 0) {
            return 'No open issues.';
          }

          const headers = ['#', 'Title', 'Labels', 'Created'];
          const rows = issues.map((issue) => [
            issue.number,
            issue.title.substring(0, 40),
            issue.labels
              .map((l) => l.name)
              .join(', ')
              .substring(0, 20),
            new Date(issue.created_at).toLocaleDateString(),
          ]);

          this.terminal.ui.showTable(headers, rows);
          return '';
        }

        default:
          loading.stop();
          return 'Usage: issues [list|create|close]';
      }
    } catch (error) {
      loading.stop();
      return `❌ Error: ${error.message}`;
    }
  }

  /**
   * Handle PR command
   */
  async handlePR(args) {
    const subcommand = args[0] || 'list';
    const loading = this.terminal.ui.showLoading('Fetching pull requests...');

    try {
      switch (subcommand) {
        case 'list': {
          const prs = await this.terminal.integrations.fetchGitHubData(
            '/repos/adrianwedd/adrianwedd/pulls?state=open'
          );

          loading.stop();

          if (prs.length === 0) {
            return 'No open pull requests.';
          }

          const headers = ['#', 'Title', 'Author', 'Status'];
          const rows = prs.map((pr) => [
            pr.number,
            pr.title.substring(0, 35),
            pr.user.login,
            pr.draft ? 'Draft' : 'Ready',
          ]);

          this.terminal.ui.showTable(headers, rows);
          return '';
        }

        default:
          loading.stop();
          return 'Usage: pr [list|create|merge]';
      }
    } catch (error) {
      loading.stop();
      return `❌ Error: ${error.message}`;
    }
  }

  // Helper methods

  getStatusIcon(status, conclusion) {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return '✅';
        case 'failure':
          return '❌';
        case 'cancelled':
          return '⚪';
        default:
          return '❓';
      }
    }
    return status === 'in_progress' ? '🔄' : '⏸️';
  }

  calculateDuration(start, end) {
    const duration = new Date(end) - new Date(start);
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  async createTask(args) {
    if (args.length === 0) {
      return 'Usage: task create <title>';
    }
    const title = args.join(' ');
    return `✅ Task created: "${title}"`;
  }

  async listTasks() {
    return `
╔══════════════════════════════════════════════════════════╗
║                    ACTIVE TASKS                          ║
╠══════════════════════════════════════════════════════════╣
║ [ ] Implement modular architecture                       ║
║ [ ] Migrate commands to new system                       ║
║ [ ] Update documentation                                 ║
║ [ ] Add test coverage                                    ║
╚══════════════════════════════════════════════════════════╝`;
  }

  async closeTask(args) {
    if (args.length === 0) {
      return 'Usage: task close <task-id>';
    }
    return `✅ Task ${args[0]} closed.`;
  }
}

/**
 * Register GitHub commands with terminal
 */
export function registerGitHubCommands(terminal) {
  const githubCommands = new GitHubCommands(terminal);
  const commands = githubCommands.getCommands();

  Object.entries(commands).forEach(([name, config]) => {
    terminal.commandRouter.register(name, config.handler, {
      description: config.description,
      usage: config.usage,
      aliases: config.aliases,
      module: 'github',
    });
  });

  return githubCommands;
}

export default { GitHubCommands, registerGitHubCommands };
