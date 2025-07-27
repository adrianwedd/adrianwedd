class GitHubTaskManager {
  constructor() {
    this.config = null;
    this.cache = new Map();
    this.initialized = false;

    // Default labels mapping (fallback if initialization fails)
    this.labels = {
      high: 'priority: high',
      medium: 'priority: medium',
      low: 'priority: low',
      task: 'type: task',
      enhancement: 'type: enhancement',
      bug: 'type: bug',
      documentation: 'type: documentation',
    };
  }

  async loadConfig() {
    try {
      const response = await fetch('/tasks.yml');
      if (!response.ok) {
        throw new Error('Cannot load tasks.yml');
      }
      const yamlText = await response.text();
      this.config = this.parseYAML(yamlText);

      // Set properties from config
      this.repo = this.config.task_management?.repository || 'adrianwedd/adrianwedd';
      this.apiBase = 'https://api.github.com';
      this.defaultAssignee = this.config.task_management?.default_assignee || 'adrianwedd';

      return true;
    } catch (error) {
      console.warn('Failed to load tasks.yml, using defaults:', error);
      // Fallback to hardcoded config
      this.repo = 'adrianwedd/adrianwedd';
      this.apiBase = 'https://api.github.com';
      this.defaultAssignee = 'adrianwedd';
      this.config = this.getDefaultConfig();
      return false;
    }
  }

  parseYAML(yamlText) {
    // Simple YAML parser for our specific use case
    // This is a basic implementation - in production you'd use js-yaml
    const lines = yamlText.split('\n');
    const result = {};
    let currentSection = result;
    const sectionStack = [result];
    const indentStack = [0];

    for (const line of lines) {
      if (line.trim() === '' || line.trim().startsWith('#')) continue;

      const indent = line.length - line.trimLeft().length;
      const content = line.trim();

      // Handle section changes based on indentation
      while (indentStack.length > 1 && indent <= indentStack[indentStack.length - 1]) {
        indentStack.pop();
        sectionStack.pop();
      }
      currentSection = sectionStack[sectionStack.length - 1];

      if (content.includes(':')) {
        const [key, ...valueParts] = content.split(':');
        const value = valueParts.join(':').trim();

        if (value === '' || value === '|') {
          // This is a section header
          currentSection[key.trim()] = {};
          sectionStack.push(currentSection[key.trim()]);
          indentStack.push(indent);
        } else {
          // This is a key-value pair
          let parsedValue = value.replace(/"/g, '');
          if (parsedValue === 'true') parsedValue = true;
          else if (parsedValue === 'false') parsedValue = false;
          else if (parsedValue.match(/^\d+$/)) parsedValue = parseInt(parsedValue);

          currentSection[key.trim()] = parsedValue;
        }
      }
    }

    return result;
  }

  getDefaultConfig() {
    return {
      task_management: {
        repository: 'adrianwedd/adrianwedd',
        default_assignee: 'adrianwedd',
        labels: {
          priority: {
            high: 'priority: high',
            medium: 'priority: medium',
            low: 'priority: low',
          },
          type: {
            task: 'type: task',
            enhancement: 'type: enhancement',
            bug: 'type: bug',
            documentation: 'type: documentation',
          },
          status: {
            in_progress: 'status: in-progress',
            blocked: 'status: blocked',
          },
          agent: {
            claude: 'agent: claude',
          },
        },
      },
      automation: {
        auto_create_from_todos: true,
        sync_interval: '30m',
        close_completed_tasks: true,
      },
      integrations: {
        terminal_commands: {
          create_task: 'task create',
          list_tasks: 'task list',
          update_task: 'task update',
          close_task: 'task close',
        },
        ai_assistant: {
          auto_categorize: true,
          suggest_labels: true,
          estimate_priority: true,
        },
      },
    };
  }

  async init() {
    if (this.initialized) return true;

    // Load configuration first
    await this.loadConfig();

    try {
      // Check if we can access GitHub API
      const response = await fetch(`${this.apiBase}/repos/${this.repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
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
      { name: 'status: blocked', color: '888888', description: 'Blocked waiting for something' },
    ];

    // Initialize labels lookup object
    this.labels = {
      high: 'priority: high',
      medium: 'priority: medium',
      low: 'priority: low',
      task: 'type: task',
      enhancement: 'type: enhancement',
      bug: 'type: bug',
      documentation: 'type: documentation',
    };

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
    if (!this.initialized && !(await this.init())) {
      throw new Error('GitHub integration not available');
    }

    // Validate inputs
    if (!title || typeof title !== 'string') {
      throw new Error('Title is required and must be a string');
    }

    // Ensure labels object exists
    if (!this.labels) {
      console.warn('Labels not initialized, using defaults');
      this.labels = {
        high: 'priority: high',
        medium: 'priority: medium',
        low: 'priority: low',
        task: 'type: task',
        enhancement: 'type: enhancement',
        bug: 'type: bug',
        documentation: 'type: documentation',
      };
    }

    const labels = [
      this.labels[priority] || `priority: ${priority}`,
      this.labels[type] || `type: ${type}`,
      'agent: claude',
    ].filter(Boolean);

    const issueData = {
      title,
      body: this.formatIssueBody(body),
      labels,
      assignees: assignee ? [assignee] : [],
    };

    try {
      // Use GitHub CLI for issue creation since it handles auth
      const labelsArg = labels.map((l) => `"${l}"`).join(',');
      const assigneeArg = assignee ? `--assignee "${assignee}"` : '';

      const command =
        `gh issue create --repo "${this.repo}" --title "${title}" --body "${body}" --label ${labelsArg} ${assigneeArg}`.trim();

      // For security, we'll return the command instead of executing it
      return {
        success: false,
        command,
        data: issueData,
        message: 'GitHub CLI command ready for execution',
      };
    } catch (error) {
      throw new Error(`Failed to create GitHub issue: ${error.message}`);
    }
  }

  formatIssueBody(body, type = 'task') {
    const templates = this.config?.task_management?.templates || {};
    const template = templates[type];

    if (template && template.body) {
      // Simple template substitution
      return template.body
        .replace('{description}', body)
        .replace('{criteria}', '')
        .replace('{notes}', '')
        .replace('{solution}', '')
        .replace('{benefits}', '')
        .replace('{steps}', '')
        .replace('{expected}', '')
        .replace('{actual}', '')
        .replace('{browser}', '')
        .replace('{os}', '');
    }

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

  // AI Assistant methods
  categorizePriority(taskDescription) {
    if (!this.config?.integrations?.ai_assistant?.estimate_priority) {
      return 'medium';
    }

    const urgent = /urgent|critical|asap|immediately|emergency|blocking/i;
    const low = /nice to have|when possible|low priority|future|someday/i;

    if (urgent.test(taskDescription)) return 'high';
    if (low.test(taskDescription)) return 'low';
    return 'medium';
  }

  categorizeType(taskDescription) {
    if (!this.config?.integrations?.ai_assistant?.auto_categorize) {
      return 'task';
    }

    const bug = /bug|error|broken|fail|issue|problem|fix/i;
    const enhancement = /enhance|improve|feature|add|new|upgrade|better/i;
    const docs = /document|readme|help|guide|wiki|doc/i;

    if (bug.test(taskDescription)) return 'bug';
    if (enhancement.test(taskDescription)) return 'enhancement';
    if (docs.test(taskDescription)) return 'documentation';
    return 'task';
  }

  suggestLabels(taskDescription) {
    if (!this.config?.integrations?.ai_assistant?.suggest_labels) {
      return [];
    }

    const priority = this.categorizePriority(taskDescription);
    const type = this.categorizeType(taskDescription);

    return this.getLabelsForTask(priority, type);
  }

  async updateIssue(issueNumber, updates) {
    if (!this.initialized && !(await this.init())) {
      throw new Error('GitHub integration not available');
    }

    const commands = [];

    if (updates.status) {
      commands.push(`gh issue edit ${issueNumber} --add-label "status: ${updates.status}"`);
    }

    if (updates.priority) {
      // Remove old priority labels and add new one
      commands.push(
        `gh issue edit ${issueNumber} --remove-label "priority: high,priority: medium,priority: low"`
      );
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
      message: 'GitHub CLI commands ready for execution',
    };
  }

  async listIssues(state = 'open', labels = null) {
    if (!this.initialized && !(await this.init())) {
      throw new Error('GitHub integration not available');
    }

    try {
      // Try direct API access for read-only operations (no auth required for public repos)
      let apiUrl = `${this.apiBase}/repos/${this.repo}/issues?state=${state}&per_page=20`;

      if (labels && labels.length > 0) {
        const labelFilter = labels.join(',');
        apiUrl += `&labels=${encodeURIComponent(labelFilter)}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Adrian-Terminal-Interface',
        },
      });

      if (response.ok) {
        const issues = await response.json();
        return {
          success: true,
          issues: issues.map((issue) => ({
            number: issue.number,
            title: issue.title,
            state: issue.state,
            labels: issue.labels.map((l) => l.name),
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            assignees: issue.assignees.map((a) => a.login),
            url: issue.html_url,
          })),
          message: `Found ${issues.length} ${state} issues`,
        };
      } else {
        throw new Error(`GitHub API returned ${response.status}`);
      }
    } catch (error) {
      console.warn('Direct GitHub API access failed, falling back to CLI:', error);

      // Fallback to CLI command
      let command = `gh issue list --repo "${this.repo}" --state ${state}`;

      if (labels) {
        const labelFilter = labels.join(',');
        command += ` --label "${labelFilter}"`;
      }

      return {
        success: false,
        command,
        message: 'GitHub CLI command (direct API access failed)',
      };
    }
  }

  async syncTodosWithIssues(todos) {
    if (!this.initialized && !(await this.init())) {
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
          command: issueData.command,
        });
      } else if (todo.status === 'completed' && todo.githubIssue) {
        // Close completed issues
        const closeData = await this.updateIssue(todo.githubIssue, {
          close: true,
          comment: `Task completed successfully.

**Final Status:** ${todo.status}
**Task ID:** ${todo.id}`,
        });

        commands.push(...closeData.commands);
      }
    }

    return {
      todos,
      commands,
      issueCreations,
      message: 'GitHub issue sync commands prepared',
    };
  }

  // Convert GitHub issues back to todo format
  async parseIssuesAsTodos(issues) {
    return issues.map((issue) => {
      // Extract priority from labels
      const priorityLabel = issue.labels.find((l) => l.name.startsWith('priority:'));
      const priority = priorityLabel ? priorityLabel.name.split(': ')[1] : 'medium';

      // Extract status from labels and issue state
      let status = 'pending';
      if (issue.state === 'closed') {
        status = 'completed';
      } else if (issue.labels.some((l) => l.name === 'status: in-progress')) {
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
        updated: issue.updated_at,
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
        },
      },
      'gh-sync': {
        description: 'Sync todos with GitHub issues',
        usage: 'gh-sync',
        handler: async () => {
          // This would integrate with the existing todo system
          return 'GitHub sync functionality ready - integrate with existing todo system';
        },
      },
      'gh-list': {
        description: 'List GitHub issues',
        usage: 'gh-list [state] [labels]',
        handler: async (args) => {
          const [state = 'open', labels] = args;
          const result = await this.listIssues(state, labels ? labels.split(',') : null);
          return `GitHub list command:\n${result.command}`;
        },
      },
    };
  }
}

// Export for use in terminal
window.GitHubTaskManager = GitHubTaskManager;
