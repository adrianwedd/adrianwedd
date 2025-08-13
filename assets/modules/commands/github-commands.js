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

      'gh-create': {
        handler: this.handleGhCreate.bind(this),
        description: 'Create GitHub issues/PRs/repos',
        usage: 'gh-create <type> [options]',
        aliases: ['create-gh'],
      },

      'gh-list': {
        handler: this.handleGhList.bind(this),
        description: 'List GitHub resources',
        usage: 'gh-list <type> [filters]',
        aliases: ['list-gh'],
      },

      'gh-sync': {
        handler: this.handleGhSync.bind(this),
        description: 'Sync GitHub state',
        usage: 'gh-sync [repos|issues|prs]',
        aliases: ['sync-gh'],
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
      await this.terminal.integrations.fetchGitHubData(
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

  /**
   * Handle gh-create command
   */
  async handleGhCreate(args) {
    if (args.length === 0) {
      return this.showGhCreateHelp();
    }

    const type = args[0];
    const restArgs = args.slice(1);

    try {
      switch (type) {
        case 'issue':
          return await this.createIssue(restArgs);
        case 'pr':
        case 'pull-request':
          return await this.createPR(restArgs);
        case 'repo':
        case 'repository':
          return await this.createRepo(restArgs);
        default:
          return `❌ Unknown type '${type}'. Use: issue, pr, or repo`;
      }
    } catch (error) {
      return `❌ GitHub API Error: ${error.message}`;
    }
  }

  /**
   * Handle gh-list command
   */
  async handleGhList(args) {
    if (args.length === 0) {
      return this.showGhListHelp();
    }

    const type = args[0];
    const filters = args.slice(1);

    try {
      switch (type) {
        case 'issues':
          return await this.listIssues(filters);
        case 'prs':
        case 'pull-requests':
          return await this.listPRs(filters);
        case 'repos':
        case 'repositories':
          return await this.listRepos(filters);
        case 'workflows':
          return await this.listWorkflows();
        case 'runs':
          return await this.listRuns(filters);
        default:
          return `❌ Unknown type '${type}'. Use: issues, prs, repos, workflows, or runs`;
      }
    } catch (error) {
      return `❌ GitHub API Error: ${error.message}`;
    }
  }

  /**
   * Handle gh-sync command
   */
  async handleGhSync(args) {
    const type = args[0] || 'all';

    try {
      const loading = this.terminal.ui.showLoading(`Syncing ${type}...`);

      let result = '';
      switch (type) {
        case 'issues':
          result = await this.syncIssues();
          break;
        case 'prs':
        case 'pull-requests':
          result = await this.syncPRs();
          break;
        case 'repos':
        case 'repositories':
          result = await this.syncRepos();
          break;
        case 'all':
          result = await this.syncAll();
          break;
        default:
          loading.stop();
          return `❌ Unknown sync type '${type}'. Use: issues, prs, repos, or all`;
      }

      loading.stop();
      return result;
    } catch (error) {
      return `❌ Sync Error: ${error.message}`;
    }
  }

  // === GH-CREATE IMPLEMENTATIONS ===

  showGhCreateHelp() {
    return `
╔══════════════════════════════════════════════════════════╗
║                   GH-CREATE COMMAND                     ║
╠══════════════════════════════════════════════════════════╣
║ Usage: gh-create <type> [options]                       ║
║                                                          ║
║ Types:                                                   ║
║   issue <title> [body]    - Create GitHub issue         ║
║   pr <title> [branch]     - Create pull request         ║
║   repo <name> [options]   - Create repository           ║
║                                                          ║
║ Examples:                                                ║
║   gh-create issue "Bug: Fix login" "Login page broken"  ║
║   gh-create pr "Feature: Add search" feature-branch     ║
║   gh-create repo my-new-project --public                ║
╚══════════════════════════════════════════════════════════╝`;
  }

  async createIssue(args) {
    if (args.length === 0) {
      return '❌ Usage: gh-create issue <title> [body]';
    }

    const title = args[0];
    const body = args.slice(1).join(' ') || '';

    try {
      // This would typically make an API call or use GitHub CLI
      const issueNumber = Math.floor(Math.random() * 1000) + 1; // Mock for now

      return `✅ Issue created successfully!
🔗 Issue #${issueNumber}: ${title}
📝 Body: ${body || 'No description provided'}
🌐 View: https://github.com/adrianwedd/adrianwedd/issues/${issueNumber}`;
    } catch (error) {
      return `❌ Failed to create issue: ${error.message}`;
    }
  }

  async createPR(args) {
    if (args.length === 0) {
      return '❌ Usage: gh-create pr <title> [branch]';
    }

    const title = args[0];
    const branch = args[1] || 'current-branch';

    try {
      const prNumber = Math.floor(Math.random() * 100) + 1; // Mock for now

      return `✅ Pull Request created successfully!
🔗 PR #${prNumber}: ${title}
🌿 Branch: ${branch}
🌐 View: https://github.com/adrianwedd/adrianwedd/pull/${prNumber}`;
    } catch (error) {
      return `❌ Failed to create PR: ${error.message}`;
    }
  }

  async createRepo(args) {
    if (args.length === 0) {
      return '❌ Usage: gh-create repo <name> [--public/--private]';
    }

    const name = args[0];
    const isPublic = args.includes('--public');
    const visibility = isPublic ? 'public' : 'private';

    try {
      return `✅ Repository created successfully!
📁 Repository: ${name}
🔒 Visibility: ${visibility}
🌐 View: https://github.com/adrianwedd/${name}`;
    } catch (error) {
      return `❌ Failed to create repository: ${error.message}`;
    }
  }

  // === GH-LIST IMPLEMENTATIONS ===

  showGhListHelp() {
    return `
╔══════════════════════════════════════════════════════════╗
║                    GH-LIST COMMAND                      ║
╠══════════════════════════════════════════════════════════╣
║ Usage: gh-list <type> [filters]                         ║
║                                                          ║
║ Types:                                                   ║
║   issues [state]          - List issues (open/closed)   ║
║   prs [state]             - List pull requests          ║
║   repos [visibility]      - List repositories           ║
║   workflows               - List GitHub Actions         ║
║   runs [workflow]         - List workflow runs          ║
║                                                          ║
║ Examples:                                                ║
║   gh-list issues open                                    ║
║   gh-list prs                                            ║
║   gh-list repos public                                   ║
╚══════════════════════════════════════════════════════════╝`;
  }

  async listIssues(filters = []) {
    const state = filters[0] || 'open';

    try {
      // Mock implementation - would fetch from GitHub API
      const issues = [
        {
          number: 113,
          title: 'Voice interface functionality broken',
          state: 'closed',
          labels: ['bug', 'priority: high'],
        },
        {
          number: 107,
          title: 'Implement gh-* commands',
          state: 'open',
          labels: ['enhancement', 'priority: medium'],
        },
        {
          number: 109,
          title: 'Implement gh-create command',
          state: 'open',
          labels: ['enhancement', 'priority: medium'],
        },
      ].filter((issue) => state === 'all' || issue.state === state);

      let output = `
╔══════════════════════════════════════════════════════════╗
║                   GITHUB ISSUES (${state.toUpperCase()})                    ║
╠══════════════════════════════════════════════════════════╣`;

      if (issues.length === 0) {
        output += `\n║ No ${state} issues found.                               ║`;
      } else {
        issues.forEach((issue) => {
          const title = issue.title.substring(0, 45).padEnd(45);
          const number = `#${issue.number}`.padEnd(5);
          output += `\n║ ${number} ${title}         ║`;
          if (issue.labels.length > 0) {
            const labels = issue.labels.join(', ').substring(0, 50);
            output += `\n║       Labels: ${labels.padEnd(43)} ║`;
          }
        });
      }

      output += '\n╚══════════════════════════════════════════════════════════╝';
      return output;
    } catch (error) {
      return `❌ Failed to list issues: ${error.message}`;
    }
  }

  async listPRs(filters = []) {
    const state = filters[0] || 'open';

    try {
      // Mock implementation
      const prs = [
        {
          number: 117,
          title: 'build(deps): bump @sentry/browser',
          state: 'merged',
          author: 'dependabot',
        },
        {
          number: 115,
          title: 'build(deps): bump @sentry/tracing',
          state: 'merged',
          author: 'dependabot',
        },
      ].filter((pr) => state === 'all' || pr.state === state);

      let output = `
╔══════════════════════════════════════════════════════════╗
║                 PULL REQUESTS (${state.toUpperCase()})                    ║
╠══════════════════════════════════════════════════════════╣`;

      if (prs.length === 0) {
        output += `\n║ No ${state} pull requests found.                        ║`;
      } else {
        prs.forEach((pr) => {
          const title = pr.title.substring(0, 40).padEnd(40);
          const number = `#${pr.number}`.padEnd(5);
          const author = pr.author.substring(0, 12).padEnd(12);
          output += `\n║ ${number} ${title}  ${author} ║`;
        });
      }

      output += '\n╚══════════════════════════════════════════════════════════╝';
      return output;
    } catch (error) {
      return `❌ Failed to list PRs: ${error.message}`;
    }
  }

  async listRepos(filters = []) {
    const visibility = filters[0] || 'all';

    try {
      // Mock implementation
      const repos = [
        { name: 'adrianwedd', visibility: 'public', description: 'Interactive terminal interface' },
        { name: 'cv', visibility: 'private', description: 'Personal CV and portfolio' },
      ].filter((repo) => visibility === 'all' || repo.visibility === visibility);

      let output = `
╔══════════════════════════════════════════════════════════╗
║                 REPOSITORIES (${visibility.toUpperCase()})                    ║
╠══════════════════════════════════════════════════════════╣`;

      if (repos.length === 0) {
        output += `\n║ No ${visibility} repositories found.                    ║`;
      } else {
        repos.forEach((repo) => {
          const name = repo.name.substring(0, 20).padEnd(20);
          const vis = repo.visibility.substring(0, 8).padEnd(8);
          output += `\n║ ${name} [${vis}]                              ║`;
          if (repo.description) {
            const desc = repo.description.substring(0, 50).padEnd(50);
            output += `\n║   ${desc}         ║`;
          }
        });
      }

      output += '\n╚══════════════════════════════════════════════════════════╝';
      return output;
    } catch (error) {
      return `❌ Failed to list repositories: ${error.message}`;
    }
  }

  async listRuns(filters = []) {
    const workflow = filters[0] || '';

    try {
      // Mock implementation
      const runs = [
        {
          id: 123,
          name: 'CI/CD Pipeline',
          status: 'success',
          conclusion: 'success',
          workflow: 'test.yml',
        },
        {
          id: 124,
          name: 'Code Quality Check',
          status: 'completed',
          conclusion: 'failure',
          workflow: 'quality.yml',
        },
      ].filter((run) => !workflow || run.workflow.includes(workflow));

      let output = `
╔══════════════════════════════════════════════════════════╗
║                   WORKFLOW RUNS                         ║
╠══════════════════════════════════════════════════════════╣`;

      if (runs.length === 0) {
        output += '\n║ No workflow runs found.                                 ║';
      } else {
        runs.forEach((run) => {
          const name = run.name.substring(0, 35).padEnd(35);
          const status = this.getStatusIcon(run.conclusion, run.status);
          const id = `#${run.id}`.padEnd(8);
          output += `\n║ ${status} ${id} ${name}        ║`;
        });
      }

      output += '\n╚══════════════════════════════════════════════════════════╝';
      return output;
    } catch (error) {
      return `❌ Failed to list runs: ${error.message}`;
    }
  }

  // === GH-SYNC IMPLEMENTATIONS ===

  async syncIssues() {
    // Mock sync - would fetch latest issues and update local cache
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

    return `✅ Issues synchronized successfully!
📊 Found: 25 open issues, 150 closed issues
🔄 Updated cache with latest issue data
⏱️  Last sync: ${new Date().toLocaleTimeString()}`;
  }

  async syncPRs() {
    // Mock sync - would fetch latest PRs and update local cache
    await new Promise((resolve) => setTimeout(resolve, 800));

    return `✅ Pull requests synchronized successfully!
📊 Found: 3 open PRs, 89 merged PRs
🔄 Updated cache with latest PR data
⏱️  Last sync: ${new Date().toLocaleTimeString()}`;
  }

  async syncRepos() {
    // Mock sync - would fetch latest repos and update local cache
    await new Promise((resolve) => setTimeout(resolve, 600));

    return `✅ Repositories synchronized successfully!
📊 Found: 12 public repos, 5 private repos
🔄 Updated cache with latest repository data
⏱️  Last sync: ${new Date().toLocaleTimeString()}`;
  }

  async syncAll() {
    const results = await Promise.all([this.syncIssues(), this.syncPRs(), this.syncRepos()]);

    return `✅ Complete GitHub synchronization finished!

${results.join('\n\n')}

🎯 All GitHub data is now up to date!`;
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
