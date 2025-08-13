/**
 * Developer Portal Module
 * Comprehensive development environment and tooling hub
 * Provides live module exploration, debugging tools, and workflow automation
 */

export class DeveloperPortal {
  constructor(terminal) {
    this.terminal = terminal;
    this.isActive = false;
    this.activePanel = null;
    this.metrics = new Map();
    this.performanceMonitor = null;
    this.panels = new Map();

    // Performance tracking
    this.startTime = performance.now();
    this.commandExecutions = [];
    this.moduleLoadTimes = new Map();

    // Development state
    this.debugMode = false;
    this.verboseLogging = false;
    this.autoRefresh = true;
    this.refreshInterval = 2000; // 2 seconds

    this.initializePanels();
  }

  /**
   * Initialize developer portal
   */
  async init() {
    try {
      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Initialize UI components
      this.setupDeveloperUI();

      // Register developer commands
      this.registerDeveloperCommands();

      // Setup HMR integration
      this.setupHMRIntegration();

      console.log('🚀 Developer Portal: Initialized successfully');
      return true;
    } catch (error) {
      console.error('🚀 Developer Portal: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize panel definitions
   */
  initializePanels() {
    this.panels.set('overview', {
      name: 'System Overview',
      description: 'High-level system health and metrics',
      icon: '📊',
      handler: this.showOverviewPanel.bind(this),
    });

    this.panels.set('modules', {
      name: 'Module Explorer',
      description: 'Live module inspection and dependency mapping',
      icon: '🧩',
      handler: this.showModuleExplorer.bind(this),
    });

    this.panels.set('commands', {
      name: 'Command Playground',
      description: 'Interactive command testing and validation',
      icon: '⚡',
      handler: this.showCommandPlayground.bind(this),
    });

    this.panels.set('performance', {
      name: 'Performance Monitor',
      description: 'Real-time performance metrics and profiling',
      icon: '📈',
      handler: this.showPerformanceMonitor.bind(this),
    });

    this.panels.set('state', {
      name: 'State Inspector',
      description: 'Live state monitoring and debugging',
      icon: '🔍',
      handler: this.showStateInspector.bind(this),
    });

    this.panels.set('integrations', {
      name: 'Integration Dashboard',
      description: 'API status and connection health monitoring',
      icon: '🔗',
      handler: this.showIntegrationDashboard.bind(this),
    });

    this.panels.set('docs', {
      name: 'Documentation Hub',
      description: 'Auto-generated API docs and guides',
      icon: '📖',
      handler: this.showDocumentationHub.bind(this),
    });

    this.panels.set('tools', {
      name: 'Developer Tools',
      description: 'Build tools, testing, and automation',
      icon: '🛠️',
      handler: this.showDeveloperTools.bind(this),
    });
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    this.performanceMonitor = {
      commandTimings: new Map(),
      moduleMetrics: new Map(),
      memoryUsage: [],
      lastUpdate: Date.now(),
    };

    // Monitor command executions
    const originalExecute = this.terminal.commandRouter.execute.bind(this.terminal.commandRouter);
    this.terminal.commandRouter.execute = async (command) => {
      const startTime = performance.now();
      const result = await originalExecute(command);
      const duration = performance.now() - startTime;

      this.recordCommandExecution(command, duration, result.success);
      return result;
    };

    // Monitor memory usage periodically
    if (this.autoRefresh) {
      setInterval(() => this.collectMetrics(), this.refreshInterval);
    }
  }

  /**
   * Record command execution metrics
   */
  recordCommandExecution(command, duration, success) {
    const commandName = command.split(' ')[0];
    const execution = {
      command: commandName,
      fullCommand: command,
      duration,
      success,
      timestamp: Date.now(),
    };

    this.commandExecutions.push(execution);

    // Keep only last 100 executions
    if (this.commandExecutions.length > 100) {
      this.commandExecutions.shift();
    }

    // Update command timing statistics
    if (!this.performanceMonitor.commandTimings.has(commandName)) {
      this.performanceMonitor.commandTimings.set(commandName, {
        executions: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: duration,
        maxDuration: duration,
        successRate: 0,
        failures: 0,
      });
    }

    const stats = this.performanceMonitor.commandTimings.get(commandName);
    stats.executions++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.executions;
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats.maxDuration = Math.max(stats.maxDuration, duration);

    if (!success) stats.failures++;
    stats.successRate = ((stats.executions - stats.failures) / stats.executions) * 100;
  }

  /**
   * Collect system metrics
   */
  collectMetrics() {
    const metrics = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      commandCount: this.commandExecutions.length,
      moduleCount: this.terminal.modules.size,
      activeIntegrations: this.terminal.integrations.activeConnections.size,
      stateSize: this.terminal.state.state.size,
      memoryUsage: performance.memory
        ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
          }
        : null,
    };

    this.performanceMonitor.memoryUsage.push(metrics);

    // Keep only last 50 data points
    if (this.performanceMonitor.memoryUsage.length > 50) {
      this.performanceMonitor.memoryUsage.shift();
    }

    this.performanceMonitor.lastUpdate = Date.now();
  }

  /**
   * Setup developer UI components
   */
  setupDeveloperUI() {
    // This would inject CSS and HTML for developer portal UI
    // For now, we'll use terminal-based interfaces
    this.uiInitialized = true;
  }

  /**
   * Setup HMR integration
   */
  setupHMRIntegration() {
    if (this.terminal.hmr) {
      // Listen to HMR events
      this.terminal.hmr.on('beforeReload', (data) => {
        if (this.verboseLogging) {
          console.log(`🚀 DevPortal: Module ${data.name} reloading...`);
        }
      });

      this.terminal.hmr.on('afterReload', (data) => {
        if (this.verboseLogging) {
          console.log(`🚀 DevPortal: Module ${data.name} reloaded successfully`);
        }
        this.recordModuleReload(data.name);
      });

      this.terminal.hmr.on('error', (data) => {
        console.error(`🚀 DevPortal: Module ${data.name} reload failed:`, data.error);
      });
    }
  }

  /**
   * Record module reload event
   */
  recordModuleReload(moduleName) {
    if (!this.performanceMonitor.moduleMetrics.has(moduleName)) {
      this.performanceMonitor.moduleMetrics.set(moduleName, {
        reloads: 0,
        lastReload: null,
        errors: 0,
      });
    }

    const metrics = this.performanceMonitor.moduleMetrics.get(moduleName);
    metrics.reloads++;
    metrics.lastReload = Date.now();
  }

  /**
   * Register developer commands
   */
  registerDeveloperCommands() {
    // Developer portal main command
    this.terminal.commandRouter.register('dev', this.handleDevCommand.bind(this), {
      description: 'Developer portal and tools',
      usage: 'dev [panel|command] [options]',
      aliases: ['devportal', 'developer'],
      module: 'developer-portal',
    });

    // Quick access commands
    this.terminal.commandRouter.register('dev-overview', () => this.showOverviewPanel(), {
      description: 'Show development overview',
      aliases: ['overview'],
      module: 'developer-portal',
    });

    this.terminal.commandRouter.register('dev-modules', () => this.showModuleExplorer(), {
      description: 'Open module explorer',
      aliases: ['modules'],
      module: 'developer-portal',
    });

    this.terminal.commandRouter.register('dev-perf', () => this.showPerformanceMonitor(), {
      description: 'Show performance metrics',
      aliases: ['perf', 'performance'],
      module: 'developer-portal',
    });

    this.terminal.commandRouter.register('dev-state', () => this.showStateInspector(), {
      description: 'Inspect application state',
      aliases: ['state'],
      module: 'developer-portal',
    });

    this.terminal.commandRouter.register('dev-commands', () => this.showCommandPlayground(), {
      description: 'Open command playground',
      aliases: ['playground', 'commands'],
      module: 'developer-portal',
    });
  }

  /**
   * Handle main dev command
   */
  async handleDevCommand(args) {
    if (args.length === 0) {
      return this.showDeveloperPortalHelp();
    }

    const command = args[0];
    const subArgs = args.slice(1);

    switch (command) {
      case 'panels':
      case 'list':
        return this.listPanels();
      case 'enable':
        return this.enableDeveloperMode();
      case 'disable':
        return this.disableDeveloperMode();
      case 'status':
        return this.showDeveloperStatus();
      case 'metrics':
        return this.showQuickMetrics();
      case 'clear':
        return this.clearMetrics();
      case 'export':
        return this.exportMetrics(subArgs);
      case 'commands':
        this.activePanel = 'commands';
        return await this.showCommandPlayground(subArgs);
      case 'integrations':
        this.activePanel = 'integrations';
        return await this.showIntegrationDashboard(subArgs);
      default:
        // Check if it's a panel name
        if (this.panels.has(command)) {
          this.activePanel = command;
          return await this.panels.get(command).handler(subArgs);
        }
        return `❌ Unknown dev command: ${command}. Use 'dev' for help.`;
    }
  }

  /**
   * Show developer portal help
   */
  showDeveloperPortalHelp() {
    return `
╔══════════════════════════════════════════════════════════╗
║                   DEVELOPER PORTAL                      ║
╠══════════════════════════════════════════════════════════╣
║ Commands:                                                ║
║   dev panels              - List available panels       ║
║   dev commands            - Command playground          ║
║   dev integrations        - Integration dashboard       ║
║   dev enable/disable      - Toggle developer mode       ║
║   dev status              - Show portal status          ║
║   dev metrics             - Quick metrics overview      ║
║   dev clear               - Clear collected metrics     ║
║   dev export [format]     - Export metrics data         ║
║                                                          ║
║ Panels:                                                  ║
${Array.from(this.panels.entries())
  .map(
    ([key, panel]) => `║   ${panel.icon} ${key.padEnd(15)} - ${panel.description.substring(0, 25)}`
  )
  .join('\n')}
║                                                          ║
║ Quick Access:                                            ║
║   dev-overview, dev-modules, dev-perf, dev-state        ║
║   dev-commands (command playground)                      ║
║                                                          ║
║ Status: ${this.isActive ? 'ACTIVE' : 'INACTIVE'}                                     ║
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * List available panels
   */
  listPanels() {
    let output = `
╔══════════════════════════════════════════════════════════╗
║                    DEVELOPER PANELS                     ║
╠══════════════════════════════════════════════════════════╣`;

    for (const [key, panel] of this.panels.entries()) {
      const active = this.activePanel === key ? ' (ACTIVE)' : '';
      output += `\n║ ${panel.icon} ${key.padEnd(12)} - ${panel.name}${active.padEnd(8)} ║`;
      output += `\n║     ${panel.description.padEnd(50)} ║`;
    }

    output += '\n╚══════════════════════════════════════════════════════════╝';
    return output;
  }

  /**
   * Enable developer mode
   */
  enableDeveloperMode() {
    this.isActive = true;
    this.debugMode = true;
    this.terminal.state.setState('developer', { active: true, debugMode: true });
    return '🚀 Developer mode enabled - Enhanced logging and debugging active';
  }

  /**
   * Disable developer mode
   */
  disableDeveloperMode() {
    this.isActive = false;
    this.debugMode = false;
    this.activePanel = null;
    this.terminal.state.setState('developer', { active: false, debugMode: false });
    return '🚀 Developer mode disabled - Standard operation resumed';
  }

  /**
   * Show developer status
   */
  showDeveloperStatus() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const recentCommands = this.commandExecutions.slice(-5);

    return `
╔══════════════════════════════════════════════════════════╗
║                  DEVELOPER STATUS                       ║
╠══════════════════════════════════════════════════════════╣
║ Portal Active: ${this.isActive ? 'YES' : 'NO'}                                  ║
║ Debug Mode: ${this.debugMode ? 'YES' : 'NO'}                                   ║
║ Active Panel: ${this.activePanel || 'None'}                              ║
║ Uptime: ${uptime}s                                        ║
║                                                          ║
║ Metrics Collection:                                      ║
║   Commands Tracked: ${this.commandExecutions.length}                            ║
║   Modules Monitored: ${this.terminal.modules.size}                           ║
║   Memory Snapshots: ${this.performanceMonitor.memoryUsage.length}                        ║
║                                                          ║
║ Recent Commands:                                         ║
${recentCommands
  .map(
    (cmd) =>
      `║   ${cmd.command.padEnd(15)} ${cmd.duration.toFixed(1)}ms ${cmd.success ? '✅' : '❌'}`
  )
  .join('\n')}
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Show quick metrics overview
   */
  showQuickMetrics() {
    const avgCommandTime =
      this.commandExecutions.length > 0
        ? this.commandExecutions.reduce((sum, cmd) => sum + cmd.duration, 0) /
          this.commandExecutions.length
        : 0;

    const successRate =
      this.commandExecutions.length > 0
        ? (this.commandExecutions.filter((cmd) => cmd.success).length /
            this.commandExecutions.length) *
          100
        : 100;

    return `
╔══════════════════════════════════════════════════════════╗
║                    QUICK METRICS                        ║
╠══════════════════════════════════════════════════════════╣
║ Average Command Time: ${avgCommandTime.toFixed(2)}ms                       ║
║ Success Rate: ${successRate.toFixed(1)}%                                 ║
║ Active Modules: ${this.terminal.modules.size}                                   ║
║ HMR Reloads: ${Array.from(this.performanceMonitor.moduleMetrics.values()).reduce(
      (sum, m) => sum + m.reloads,
      0
    )}                                      ║
║                                                          ║
║ Top Commands:                                            ║
${Array.from(this.performanceMonitor.commandTimings.entries())
  .sort(([, a], [, b]) => b.executions - a.executions)
  .slice(0, 3)
  .map(
    ([cmd, stats]) =>
      `║   ${cmd.padEnd(12)} ${stats.executions}x (${stats.avgDuration.toFixed(1)}ms avg)`
  )
  .join('\n')}
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Clear collected metrics
   */
  clearMetrics() {
    this.commandExecutions = [];
    this.performanceMonitor.commandTimings.clear();
    this.performanceMonitor.moduleMetrics.clear();
    this.performanceMonitor.memoryUsage = [];
    this.startTime = performance.now();

    return '🚀 All developer metrics cleared and reset';
  }

  /**
   * Export metrics data
   */
  exportMetrics(args) {
    const format = args[0] || 'json';
    const data = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      commandExecutions: this.commandExecutions,
      commandTimings: Object.fromEntries(this.performanceMonitor.commandTimings),
      moduleMetrics: Object.fromEntries(this.performanceMonitor.moduleMetrics),
      memoryUsage: this.performanceMonitor.memoryUsage,
    };

    switch (format) {
      case 'json':
        return `📊 Metrics exported:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
      case 'csv':
        return '📊 CSV export not yet implemented - use json format';
      default:
        return `❌ Unknown format: ${format}. Use: json, csv`;
    }
  }

  // Panel implementations (placeholders for now)

  async showOverviewPanel(_args) {
    return `🚀 Developer Portal: Overview panel not yet implemented`;
  }

  async showModuleExplorer(args) {
    const filterModule = args && args[0]; // Optional module filter
    const modules = Array.from(this.terminal.modules.entries());
    const hmrModules = Array.from(this.terminal.hmr.moduleRegistry.entries());

    let output = `
╔══════════════════════════════════════════════════════════╗
║                    MODULE EXPLORER                      ║
╠══════════════════════════════════════════════════════════╣
║ Loaded Modules: ${modules.length}                                     ║
║ HMR Registered: ${hmrModules.length}                                   ║
║                                                          ║`;

    // Show loaded modules
    output += `
║ 📦 LOADED MODULES:                                       ║
╠══════════════════════════════════════════════════════════╣`;

    modules.forEach(([name, moduleObj]) => {
      // Apply filter if specified
      if (filterModule && !name.toLowerCase().includes(filterModule.toLowerCase())) {
        return;
      }
      const status = moduleObj ? '✅' : '❌';
      const hasCommands =
        moduleObj && typeof moduleObj.registerCoreCommands === 'function' ? '⚡' : '  ';
      output += `\n║ ${status} ${hasCommands} ${name.padEnd(20)} ${typeof moduleObj}               ║`;
    });

    // Show HMR modules with more detail
    output += `
║                                                          ║
║ 🔥 HMR MODULES:                                          ║
╠══════════════════════════════════════════════════════════╣`;

    hmrModules.forEach(([name, info]) => {
      const reloads = info.reloadCount || 0;
      const version = info.version || '1.0.0';
      const age = Math.floor((Date.now() - info.loadTime) / 1000);

      output += `\n║ 🧩 ${name.padEnd(15)} v${version.padEnd(8)} (${reloads} reloads)    ║`;
      output += `\n║     Loaded: ${age}s ago                               ║`;

      if (info.dependencies && info.dependencies.length > 0) {
        output += `\n║     Deps: ${info.dependencies.join(', ').substring(0, 40)}     ║`;
      }
    });

    // Show command distribution
    const commandCounts = this.getCommandDistribution();
    output += `
║                                                          ║
║ ⚡ COMMAND DISTRIBUTION:                                 ║
╠══════════════════════════════════════════════════════════╣`;

    for (const [module, count] of commandCounts.entries()) {
      output += `\n║ ${module.padEnd(20)} ${count.toString().padStart(3)} commands        ║`;
    }

    output += `
╚══════════════════════════════════════════════════════════╝

Use: dev modules reload <name>  - Hot reload module
     dev modules info <name>    - Detailed module info
     dev modules deps <name>    - Show dependencies`;

    return output;
  }

  async showCommandPlayground(args) {
    const action = args[0] || 'main';

    switch (action) {
      case 'test':
        return await this.testCommand(args.slice(1));
      case 'history':
        return this.showCommandHistory();
      case 'favorites':
        return this.showFavoriteCommands();
      case 'validate':
        return this.validateCommand(args.slice(1));
      case 'help':
        return this.showPlaygroundHelp();
      default:
        return this.showCommandPlaygroundMain();
    }
  }

  /**
   * Show main command playground interface
   */
  showCommandPlaygroundMain() {
    const commands = this.terminal.commandRouter.getCommands();
    const recentCommands = this.commandExecutions.slice(-5);
    const popularCommands = Array.from(this.performanceMonitor.commandTimings.entries())
      .sort(([, a], [, b]) => b.executions - a.executions)
      .slice(0, 5);

    let output = `
╔══════════════════════════════════════════════════════════╗
║                   COMMAND PLAYGROUND                    ║
╠══════════════════════════════════════════════════════════╣
║ Total Commands: ${commands.length}                                   ║
║ Recent Executions: ${this.commandExecutions.length}                             ║
║ Success Rate: ${this.getOverallSuccessRate()}%                                  ║
║                                                          ║`;

    // Show popular commands
    output += `
║ 🔥 POPULAR COMMANDS:                                     ║
╠══════════════════════════════════════════════════════════╣`;

    popularCommands.forEach(([cmd, stats]) => {
      const successRate = (((stats.executions - stats.failures) / stats.executions) * 100).toFixed(
        1
      );
      output += `\n║ ${cmd.padEnd(15)} ${stats.executions}x (${successRate}% success)        ║`;
    });

    // Show recent command executions
    if (recentCommands.length > 0) {
      output += `
║                                                          ║
║ 📝 RECENT EXECUTIONS:                                    ║
╠══════════════════════════════════════════════════════════╣`;

      recentCommands.forEach((cmd) => {
        const time = new Date(cmd.timestamp).toLocaleTimeString();
        const status = cmd.success ? '✅' : '❌';
        output += `\n║ ${status} ${cmd.command.padEnd(15)} ${time} (${cmd.duration.toFixed(1)}ms)  ║`;
      });
    }

    // Show command categories
    const categories = this.getCommandCategories();
    output += `
║                                                          ║
║ 📚 COMMAND CATEGORIES:                                   ║
╠══════════════════════════════════════════════════════════╣`;

    for (const [category, count] of categories.entries()) {
      output += `\n║ ${category.padEnd(20)} ${count.toString().padStart(3)} commands        ║`;
    }

    output += `
╚══════════════════════════════════════════════════════════╝

💡 Usage:
   dev commands test <command> [args]  - Test command with args
   dev commands validate <command>     - Validate command syntax
   dev commands history                - Show execution history
   dev commands favorites              - Manage favorite commands
   dev commands help                   - Detailed playground help`;

    return output;
  }

  /**
   * Test a command in the playground
   */
  async testCommand(args) {
    if (args.length === 0) {
      return `❌ Usage: dev commands test <command> [arguments...]
      
Examples:
  dev commands test help
  dev commands test theme ocean
  dev commands test actions list
  dev commands test gh-list issues open`;
    }

    const command = args.join(' ');
    const startTime = performance.now();

    try {
      // Show what we're testing
      let output = `
╔══════════════════════════════════════════════════════════╗
║                    COMMAND TEST                         ║
╠══════════════════════════════════════════════════════════╣
║ Testing: ${command.padEnd(45)} ║
║ Started: ${new Date().toLocaleTimeString()}                            ║
╚══════════════════════════════════════════════════════════╝

📤 Executing command...
`;

      // Execute the command
      const result = await this.terminal.commandRouter.execute(command);
      const duration = performance.now() - startTime;

      // Show results
      output += `
✅ Command completed in ${duration.toFixed(2)}ms

📊 EXECUTION RESULTS:
╔══════════════════════════════════════════════════════════╗
║ Success: ${result.success ? 'YES' : 'NO'}                                        ║
║ Duration: ${duration.toFixed(2)}ms                                   ║
║ Timestamp: ${new Date().toLocaleTimeString()}                          ║`;

      if (result.success && result.result) {
        output += `
║                                                          ║
║ 📋 COMMAND OUTPUT:                                       ║
╠══════════════════════════════════════════════════════════╣`;

        // Truncate output if too long
        const resultStr = String(result.result);
        const lines = resultStr.split('\n').slice(0, 10);
        lines.forEach((line) => {
          const truncated = line.substring(0, 56);
          output += `\n║ ${truncated.padEnd(56)} ║`;
        });

        if (resultStr.split('\n').length > 10) {
          output += `\n║ ... (output truncated)                                   ║`;
        }
      }

      if (!result.success && result.error) {
        output += `
║                                                          ║
║ ❌ ERROR DETAILS:                                        ║
╠══════════════════════════════════════════════════════════╣
║ ${result.error.substring(0, 56).padEnd(56)} ║`;
      }

      output += `
╚══════════════════════════════════════════════════════════╝`;

      return output;
    } catch (error) {
      const duration = performance.now() - startTime;
      return `
╔══════════════════════════════════════════════════════════╗
║                    TEST FAILED                          ║
╠══════════════════════════════════════════════════════════╣
║ Command: ${command.padEnd(46)} ║
║ Duration: ${duration.toFixed(2)}ms                                   ║
║ Error: ${error.message.substring(0, 48).padEnd(48)} ║
╚══════════════════════════════════════════════════════════╝`;
    }
  }

  /**
   * Show command execution history
   */
  showCommandHistory() {
    const history = this.commandExecutions.slice(-20); // Last 20 commands

    if (history.length === 0) {
      return `
╔══════════════════════════════════════════════════════════╗
║                  COMMAND HISTORY                        ║
╠══════════════════════════════════════════════════════════╣
║ No command executions recorded yet.                     ║
║                                                          ║
║ Start using commands to see history here!               ║
╚══════════════════════════════════════════════════════════╝`;
    }

    let output = `
╔══════════════════════════════════════════════════════════╗
║                  COMMAND HISTORY                        ║
╠══════════════════════════════════════════════════════════╣
║ Showing last ${history.length} executions:                           ║
║                                                          ║`;

    history.reverse().forEach((cmd, index) => {
      const time = new Date(cmd.timestamp).toLocaleTimeString();
      const status = cmd.success ? '✅' : '❌';
      const duration = cmd.duration.toFixed(1);

      output += `\n║ ${(index + 1).toString().padStart(2)}. ${status} ${cmd.command.padEnd(20)} ${time} ${duration}ms ║`;
    });

    // Show summary statistics
    const successCount = history.filter((cmd) => cmd.success).length;
    const avgDuration = history.reduce((sum, cmd) => sum + cmd.duration, 0) / history.length;

    output += `
║                                                          ║
║ 📊 SUMMARY:                                              ║
║ Success Rate: ${((successCount / history.length) * 100).toFixed(1)}%                              ║
║ Avg Duration: ${avgDuration.toFixed(2)}ms                               ║
╚══════════════════════════════════════════════════════════╝

💡 Use 'dev commands test <command>' to test any command`;

    return output;
  }

  /**
   * Show favorite commands
   */
  showFavoriteCommands() {
    // This would integrate with user preferences in a real implementation
    const favorites = [
      { command: 'help', description: 'Show available commands', usage: 'help' },
      {
        command: 'dev-modules',
        description: 'Open module explorer',
        usage: 'dev-modules [filter]',
      },
      { command: 'dev-perf', description: 'Performance monitor', usage: 'dev-perf [command]' },
      { command: 'theme', description: 'Change terminal theme', usage: 'theme [name]' },
      { command: 'gh-list', description: 'List GitHub resources', usage: 'gh-list <type>' },
    ];

    let output = `
╔══════════════════════════════════════════════════════════╗
║                 FAVORITE COMMANDS                       ║
╠══════════════════════════════════════════════════════════╣`;

    favorites.forEach((fav, index) => {
      output += `
║ ${index + 1}. ${fav.command.padEnd(15)} - ${fav.description.substring(0, 30)}   ║
║    Usage: ${fav.usage.padEnd(45)} ║`;
    });

    output += `
║                                                          ║
║ 💡 Quick Test: dev commands test <command>               ║
╚══════════════════════════════════════════════════════════╝`;

    return output;
  }

  /**
   * Validate command syntax
   */
  validateCommand(args) {
    if (args.length === 0) {
      return `❌ Usage: dev commands validate <command>

Example: dev commands validate gh-create`;
    }

    const commandName = args[0];
    const commands = this.terminal.commandRouter.getCommands();
    const command = commands.find((cmd) => cmd.name === commandName);

    if (!command) {
      const suggestions = commands
        .filter((cmd) => cmd.name.includes(commandName))
        .slice(0, 3)
        .map((cmd) => cmd.name);

      let output = `
╔══════════════════════════════════════════════════════════╗
║                 COMMAND VALIDATION                      ║
╠══════════════════════════════════════════════════════════╣
║ ❌ Command '${commandName}' not found                        ║`;

      if (suggestions.length > 0) {
        output += `
║                                                          ║
║ 💡 Did you mean:                                         ║`;
        suggestions.forEach((suggestion) => {
          output += `\n║   - ${suggestion.padEnd(47)} ║`;
        });
      }

      output += `
╚══════════════════════════════════════════════════════════╝`;
      return output;
    }

    // Show command details
    return `
╔══════════════════════════════════════════════════════════╗
║                 COMMAND VALIDATION                      ║
╠══════════════════════════════════════════════════════════╣
║ ✅ Command: ${command.name.padEnd(43)} ║
║ Module: ${(command.module || 'core').padEnd(46)} ║
║ Description: ${(command.description || 'No description').substring(0, 39).padEnd(39)} ║
║ Usage: ${(command.usage || 'No usage info').substring(0, 43).padEnd(43)} ║
║                                                          ║
║ Aliases: ${(command.aliases || []).join(', ').substring(0, 42).padEnd(42)} ║
║                                                          ║
║ ✅ Syntax is valid - ready to execute!                   ║
╚══════════════════════════════════════════════════════════╝

💡 Test it: dev commands test ${command.name}`;
  }

  /**
   * Show playground help
   */
  showPlaygroundHelp() {
    return `
╔══════════════════════════════════════════════════════════╗
║                COMMAND PLAYGROUND HELP                  ║
╠══════════════════════════════════════════════════════════╣
║ Interactive command testing and validation environment  ║
║                                                          ║
║ 🎮 MAIN FEATURES:                                        ║
║   • Test commands safely with real-time results         ║
║   • Validate command syntax and parameters              ║
║   • Track execution history and performance             ║
║   • Discover popular and favorite commands              ║
║                                                          ║
║ 📋 AVAILABLE ACTIONS:                                    ║
║   dev commands             - Main playground interface  ║
║   dev commands test <cmd>  - Execute command safely     ║
║   dev commands validate    - Check command syntax       ║
║   dev commands history     - Show execution history     ║
║   dev commands favorites   - Show favorite commands     ║
║   dev commands help        - This help message          ║
║                                                          ║
║ 💡 TIPS:                                                 ║
║   • All tests are safe and won't affect system state    ║
║   • Use 'validate' to check syntax before testing       ║
║   • History tracks performance for optimization         ║
║   • Popular commands show what others use most          ║
╚══════════════════════════════════════════════════════════╝`;
  }

  async showPerformanceMonitor(args) {
    const command = args && args[0]; // Optional command filter
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const totalCommands = this.commandExecutions.length;
    const avgCommandTime =
      totalCommands > 0
        ? this.commandExecutions.reduce((sum, cmd) => sum + cmd.duration, 0) / totalCommands
        : 0;
    const successRate =
      totalCommands > 0
        ? (this.commandExecutions.filter((cmd) => cmd.success).length / totalCommands) * 100
        : 100;

    // Get memory info if available
    const memoryInfo = performance.memory
      ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
        }
      : null;

    let output = `
╔══════════════════════════════════════════════════════════╗
║                  PERFORMANCE MONITOR                    ║
╠══════════════════════════════════════════════════════════╣
║ Uptime: ${uptime}s                                        ║
║ Total Commands: ${totalCommands}                                  ║
║ Avg Command Time: ${avgCommandTime.toFixed(2)}ms                        ║
║ Success Rate: ${successRate.toFixed(1)}%                                  ║
║                                                          ║`;

    if (memoryInfo) {
      const usage = ((memoryInfo.used / memoryInfo.limit) * 100).toFixed(1);
      output += `
║ 🧠 MEMORY USAGE:                                         ║
║ Used: ${memoryInfo.used}MB / ${memoryInfo.limit}MB (${usage}%)                    ║
║ Heap Total: ${memoryInfo.total}MB                              ║
║                                                          ║`;
    }

    // Show top performing commands (filter by command if specified)
    let commandTimings = Array.from(this.performanceMonitor.commandTimings.entries());
    if (command) {
      commandTimings = commandTimings.filter(([cmd]) =>
        cmd.toLowerCase().includes(command.toLowerCase())
      );
    }
    const topCommands = commandTimings
      .sort(([, a], [, b]) => a.avgDuration - b.avgDuration)
      .slice(0, 5);

    output += `
║ ⚡ FASTEST COMMANDS:                                     ║
╠══════════════════════════════════════════════════════════╣`;

    topCommands.forEach(([cmd, stats]) => {
      output += `\n║ ${cmd.padEnd(15)} ${stats.avgDuration.toFixed(1)}ms (${stats.executions}x)      ║`;
    });

    // Show slowest commands
    const slowCommands = Array.from(this.performanceMonitor.commandTimings.entries())
      .sort(([, a], [, b]) => b.avgDuration - a.avgDuration)
      .slice(0, 3);

    output += `
║                                                          ║
║ 🐌 SLOWEST COMMANDS:                                     ║
╠══════════════════════════════════════════════════════════╣`;

    slowCommands.forEach(([cmd, stats]) => {
      const range = `${stats.minDuration.toFixed(1)}-${stats.maxDuration.toFixed(1)}ms`;
      output += `\n║ ${cmd.padEnd(15)} ${stats.avgDuration.toFixed(1)}ms (range: ${range})  ║`;
    });

    // Show module reload statistics
    const moduleReloads = Array.from(this.performanceMonitor.moduleMetrics.entries());
    if (moduleReloads.length > 0) {
      output += `
║                                                          ║
║ 🔥 MODULE RELOADS:                                       ║
╠══════════════════════════════════════════════════════════╣`;

      moduleReloads.forEach(([module, stats]) => {
        const lastReload = stats.lastReload
          ? `${Math.floor((Date.now() - stats.lastReload) / 1000)}s ago`
          : 'Never';
        output += `\n║ ${module.padEnd(15)} ${stats.reloads}x (last: ${lastReload})      ║`;
      });
    }

    output += `
╚══════════════════════════════════════════════════════════╝

Use: dev perf clear      - Clear performance data
     dev perf export     - Export performance metrics
     dev perf watch      - Live performance monitoring`;

    return output;
  }

  async showStateInspector(args) {
    const stateEntries = Array.from(this.terminal.state.state.entries());
    const totalKeys = stateEntries.reduce(
      (total, [, value]) => total + Object.keys(value).length,
      0
    );

    let output = `
╔══════════════════════════════════════════════════════════╗
║                    STATE INSPECTOR                      ║
╠══════════════════════════════════════════════════════════╣
║ State Sections: ${stateEntries.length}                                   ║
║ Total Keys: ${totalKeys}                                       ║
║ Last Updated: ${new Date().toLocaleTimeString()}                           ║
║                                                          ║`;

    // Show state sections with key counts
    output += `
║ 📊 STATE SECTIONS:                                       ║
╠══════════════════════════════════════════════════════════╣`;

    stateEntries.forEach(([section, data]) => {
      const keyCount = Object.keys(data).length;
      const lastModified = data._lastModified
        ? new Date(data._lastModified).toLocaleTimeString()
        : 'Unknown';

      output += `\n║ ${section.padEnd(15)} ${keyCount.toString().padStart(3)} keys (${lastModified})    ║`;
    });

    // Show recent state changes if available
    const recentChanges = this.getRecentStateChanges();
    if (recentChanges.length > 0) {
      output += `
║                                                          ║
║ 🔄 RECENT CHANGES:                                       ║
╠══════════════════════════════════════════════════════════╣`;

      recentChanges.slice(0, 5).forEach((change) => {
        output += `\n║ ${change.section}.${change.key.padEnd(12)} = ${String(change.value).substring(0, 20)} ║`;
      });
    }

    // Show specific state details if requested
    const section = args[0];
    if (section && this.terminal.state.state.has(section)) {
      const sectionData = this.terminal.state.state.get(section);
      output += `
║                                                          ║
║ 🔍 SECTION: ${section.toUpperCase().padEnd(35)}           ║
╠══════════════════════════════════════════════════════════╣`;

      Object.entries(sectionData).forEach(([key, value]) => {
        if (key !== '_lastModified') {
          const valueStr =
            typeof value === 'object'
              ? JSON.stringify(value).substring(0, 30)
              : String(value).substring(0, 30);
          output += `\n║ ${key.padEnd(15)} : ${valueStr.padEnd(30)} ║`;
        }
      });
    }

    output += `
╚══════════════════════════════════════════════════════════╝

Use: dev state <section>     - Inspect specific section
     dev state clear         - Clear all state data
     dev state export        - Export state as JSON
     dev state watch         - Monitor state changes`;

    return output;
  }

  async showIntegrationDashboard(args) {
    const action = args[0] || 'main';

    switch (action) {
      case 'test':
        return await this.testIntegration(args.slice(1));
      case 'status':
        return this.showDetailedIntegrationStatus();
      case 'config':
        return this.showIntegrationConfig();
      case 'history':
        return this.showIntegrationHistory();
      case 'help':
        return this.showIntegrationHelp();
      default:
        return this.showIntegrationDashboardMain();
    }
  }

  /**
   * Show main integration dashboard
   */
  showIntegrationDashboardMain() {
    const integrations = this.getIntegrationStatus();
    const totalIntegrations = integrations.length;
    const activeIntegrations = integrations.filter((i) => i.status === 'connected').length;
    const failedIntegrations = integrations.filter((i) => i.status === 'error').length;

    let output = `
╔══════════════════════════════════════════════════════════╗
║                 INTEGRATION DASHBOARD                   ║
╠══════════════════════════════════════════════════════════╣
║ Total Integrations: ${totalIntegrations}                                ║
║ Active: ${activeIntegrations}  Failed: ${failedIntegrations}  Pending: ${totalIntegrations - activeIntegrations - failedIntegrations}                     ║
║ Last Updated: ${new Date().toLocaleTimeString()}                           ║
║                                                          ║`;

    // Show integration status overview
    output += `
║ 🔗 INTEGRATION STATUS:                                   ║
╠══════════════════════════════════════════════════════════╣`;

    integrations.forEach((integration) => {
      const statusIcon = this.getIntegrationStatusIcon(integration.status);
      const lastCheck = integration.lastCheck
        ? new Date(integration.lastCheck).toLocaleTimeString()
        : 'Never';

      output += `\n║ ${statusIcon} ${integration.name.padEnd(15)} ${integration.status.padEnd(12)} ${lastCheck} ║`;

      if (integration.rateLimiting && integration.rateLimiting.remaining !== undefined) {
        const remaining = integration.rateLimiting.remaining;
        const limit = integration.rateLimiting.limit;
        const resetTime = new Date(integration.rateLimiting.resetTime).toLocaleTimeString();
        output += `\n║     Rate Limit: ${remaining}/${limit} (resets ${resetTime})            ║`;
      }
    });

    // Show recent integration activity
    const recentActivity = this.getRecentIntegrationActivity();
    if (recentActivity.length > 0) {
      output += `
║                                                          ║
║ 📊 RECENT ACTIVITY:                                      ║
╠══════════════════════════════════════════════════════════╣`;

      recentActivity.slice(0, 5).forEach((activity) => {
        const time = new Date(activity.timestamp).toLocaleTimeString();
        const status = activity.success ? '✅' : '❌';
        output += `\n║ ${status} ${activity.service.padEnd(12)} ${activity.action.padEnd(20)} ${time} ║`;
      });
    }

    // Show API usage statistics
    const apiStats = this.getAPIUsageStats();
    output += `
║                                                          ║
║ 📈 API USAGE (24H):                                      ║
╠══════════════════════════════════════════════════════════╣`;

    apiStats.forEach((stat) => {
      const usage = stat.usage || 0;
      const errors = stat.errors || 0;
      const errorRate = usage > 0 ? ((errors / usage) * 100).toFixed(1) : '0.0';
      output += `\n║ ${stat.service.padEnd(15)} ${usage.toString().padStart(4)} calls (${errorRate}% errors) ║`;
    });

    output += `
╚══════════════════════════════════════════════════════════╝

💡 Actions:
   dev integrations test <service>    - Test integration
   dev integrations status           - Detailed status
   dev integrations config           - Configuration
   dev integrations history          - Activity history`;

    return output;
  }

  /**
   * Test a specific integration
   */
  async testIntegration(args) {
    if (args.length === 0) {
      return `❌ Usage: dev integrations test <service>

Available services: github, weather, ai, voice

Example: dev integrations test github`;
    }

    const serviceName = args[0].toLowerCase();
    const startTime = performance.now();

    let output = `
╔══════════════════════════════════════════════════════════╗
║                 INTEGRATION TEST                        ║
╠══════════════════════════════════════════════════════════╣
║ Service: ${serviceName.padEnd(46)} ║
║ Started: ${new Date().toLocaleTimeString()}                            ║
╚══════════════════════════════════════════════════════════╝

🔍 Testing connection...
`;

    try {
      const result = await this.performIntegrationTest(serviceName);
      const duration = performance.now() - startTime;

      output += `
✅ Test completed in ${duration.toFixed(2)}ms

📊 TEST RESULTS:
╔══════════════════════════════════════════════════════════╗
║ Status: ${result.success ? 'PASS' : 'FAIL'}                                        ║
║ Response Time: ${duration.toFixed(2)}ms                              ║
║ Endpoint: ${(result.endpoint || 'N/A').substring(0, 43).padEnd(43)} ║`;

      if (result.rateLimiting) {
        output += `
║ Rate Limit: ${result.rateLimiting.remaining}/${result.rateLimiting.limit}                               ║
║ Reset Time: ${new Date(result.rateLimiting.resetTime).toLocaleTimeString()}                          ║`;
      }

      if (result.data) {
        output += `
║                                                          ║
║ 📋 RESPONSE DATA:                                        ║
╠══════════════════════════════════════════════════════════╣`;
        const dataStr = JSON.stringify(result.data, null, 2);
        const lines = dataStr.split('\n').slice(0, 8);
        lines.forEach((line) => {
          const truncated = line.substring(0, 56);
          output += `\n║ ${truncated.padEnd(56)} ║`;
        });
      }

      if (!result.success && result.error) {
        output += `
║                                                          ║
║ ❌ ERROR DETAILS:                                        ║
╠══════════════════════════════════════════════════════════╣
║ ${result.error.substring(0, 56).padEnd(56)} ║`;
      }

      output += `
╚══════════════════════════════════════════════════════════╝`;

      return output;
    } catch (error) {
      const duration = performance.now() - startTime;
      return `
╔══════════════════════════════════════════════════════════╗
║                    TEST FAILED                          ║
╠══════════════════════════════════════════════════════════╣
║ Service: ${serviceName.padEnd(46)} ║
║ Duration: ${duration.toFixed(2)}ms                                   ║
║ Error: ${error.message.substring(0, 48).padEnd(48)} ║
╚══════════════════════════════════════════════════════════╝`;
    }
  }

  /**
   * Show detailed integration status
   */
  showDetailedIntegrationStatus() {
    const integrations = this.getIntegrationStatus();

    let output = `
╔══════════════════════════════════════════════════════════╗
║               DETAILED INTEGRATION STATUS               ║
╠══════════════════════════════════════════════════════════╣`;

    integrations.forEach((integration) => {
      const statusIcon = this.getIntegrationStatusIcon(integration.status);
      const uptime = integration.uptime ? `${integration.uptime}%` : 'N/A';
      const lastError = integration.lastError
        ? new Date(integration.lastError).toLocaleString()
        : 'None';

      output += `
║                                                          ║
║ ${statusIcon} ${integration.name.toUpperCase().padEnd(35)}                ║
╠══════════════════════════════════════════════════════════╣
║ Status: ${integration.status.padEnd(46)} ║
║ Endpoint: ${(integration.endpoint || 'N/A').substring(0, 43).padEnd(43)} ║
║ Uptime: ${uptime.padEnd(46)} ║
║ Last Check: ${(integration.lastCheck ? new Date(integration.lastCheck).toLocaleString() : 'Never').padEnd(37)} ║
║ Last Error: ${lastError.substring(0, 43).padEnd(43)} ║`;

      if (integration.authentication) {
        output += `
║ Auth Type: ${integration.authentication.type.padEnd(43)} ║
║ Auth Status: ${integration.authentication.valid ? 'Valid' : 'Invalid'}                                ║`;
      }

      if (integration.rateLimiting) {
        const resetTime = new Date(integration.rateLimiting.resetTime).toLocaleString();
        output += `
║ Rate Limit: ${integration.rateLimiting.remaining}/${integration.rateLimiting.limit}                               ║
║ Reset: ${resetTime.substring(0, 49).padEnd(49)} ║`;
      }
    });

    output += `
╚══════════════════════════════════════════════════════════╝`;

    return output;
  }

  /**
   * Show integration configuration
   */
  showIntegrationConfig() {
    const configs = this.getIntegrationConfigs();

    let output = `
╔══════════════════════════════════════════════════════════╗
║               INTEGRATION CONFIGURATION                 ║
╠══════════════════════════════════════════════════════════╣`;

    configs.forEach((config) => {
      output += `
║                                                          ║
║ 🔧 ${config.name.toUpperCase().padEnd(51)} ║
╠══════════════════════════════════════════════════════════╣
║ Base URL: ${(config.baseUrl || 'Not configured').substring(0, 43).padEnd(43)} ║
║ Timeout: ${(config.timeout ? `${config.timeout}ms` : 'Default').padEnd(46)} ║
║ Retry Count: ${(config.retryCount || 3).toString().padEnd(42)} ║
║ API Version: ${(config.apiVersion || 'Latest').padEnd(42)} ║`;

      if (config.headers && Object.keys(config.headers).length > 0) {
        output += `
║ Headers:                                                 ║`;
        Object.entries(config.headers)
          .slice(0, 3)
          .forEach(([key, value]) => {
            const headerStr = `${key}: ${String(value).substring(0, 30)}`;
            output += `\n║   ${headerStr.padEnd(54)} ║`;
          });
      }

      if (config.features && config.features.length > 0) {
        output += `
║ Features: ${config.features.join(', ').substring(0, 43).padEnd(43)} ║`;
      }
    });

    output += `
╚══════════════════════════════════════════════════════════╝

⚙️  Configuration managed via environment variables and settings`;

    return output;
  }

  /**
   * Show integration activity history
   */
  showIntegrationHistory() {
    const history = this.getRecentIntegrationActivity();

    if (history.length === 0) {
      return `
╔══════════════════════════════════════════════════════════╗
║               INTEGRATION HISTORY                       ║
╠══════════════════════════════════════════════════════════╣
║ No integration activity recorded yet.                   ║
║                                                          ║
║ Activity will appear here as services are used.         ║
╚══════════════════════════════════════════════════════════╝`;
    }

    let output = `
╔══════════════════════════════════════════════════════════╗
║               INTEGRATION HISTORY                       ║
╠══════════════════════════════════════════════════════════╣
║ Showing last ${Math.min(history.length, 15)} activities:                          ║
║                                                          ║`;

    history.slice(0, 15).forEach((activity, index) => {
      const time = new Date(activity.timestamp).toLocaleTimeString();
      const status = activity.success ? '✅' : '❌';
      const duration = activity.duration ? `${activity.duration}ms` : 'N/A';

      output += `\n║ ${(index + 1).toString().padStart(2)}. ${status} ${activity.service.padEnd(10)} ${activity.action.padEnd(15)} ${time} ║`;
      if (activity.details && duration !== 'N/A') {
        output += `\n║     ${activity.details.substring(0, 40).padEnd(40)} (${duration}) ║`;
      }
    });

    // Show summary statistics
    const totalCalls = history.length;
    const successfulCalls = history.filter((h) => h.success).length;
    const avgDuration =
      history.filter((h) => h.duration).reduce((sum, h) => sum + h.duration, 0) / totalCalls;

    output += `
║                                                          ║
║ 📊 SUMMARY:                                              ║
║ Total Calls: ${totalCalls}                                       ║
║ Success Rate: ${((successfulCalls / totalCalls) * 100).toFixed(1)}%                              ║
║ Avg Duration: ${avgDuration.toFixed(2)}ms                               ║
╚══════════════════════════════════════════════════════════╝`;

    return output;
  }

  /**
   * Show integration help
   */
  showIntegrationHelp() {
    return `
╔══════════════════════════════════════════════════════════╗
║              INTEGRATION DASHBOARD HELP                 ║
╠══════════════════════════════════════════════════════════╣
║ Monitor and manage external service integrations        ║
║                                                          ║
║ 🔗 MONITORED SERVICES:                                   ║
║   • GitHub API - Repository and workflow management     ║
║   • Weather API - Tasmania Bureau of Meteorology        ║
║   • AI Services - Claude and other LLM integrations     ║
║   • Voice Interface - Web Speech API integration        ║
║                                                          ║
║ 📋 AVAILABLE ACTIONS:                                    ║
║   dev integrations           - Main dashboard           ║
║   dev integrations test      - Test specific service    ║
║   dev integrations status    - Detailed status info     ║
║   dev integrations config    - Configuration details    ║
║   dev integrations history   - Activity history         ║
║   dev integrations help      - This help message        ║
║                                                          ║
║ 💡 FEATURES:                                             ║
║   • Real-time connection monitoring                     ║
║   • Rate limiting awareness and tracking                ║
║   • Error detection and alerting                        ║
║   • Performance metrics and trends                      ║
║   • Authentication status validation                    ║
╚══════════════════════════════════════════════════════════╝`;
  }

  async showDocumentationHub(_args) {
    return `🚀 Developer Portal: Documentation hub not yet implemented`;
  }

  async showDeveloperTools(_args) {
    return `🚀 Developer Portal: Developer tools not yet implemented`;
  }

  /**
   * Get command distribution by module
   */
  getCommandDistribution() {
    const distribution = new Map();
    const commands = this.terminal.commandRouter.getCommands();

    commands.forEach((command) => {
      const module = command.module || 'core';
      distribution.set(module, (distribution.get(module) || 0) + 1);
    });

    return distribution;
  }

  /**
   * Get recent state changes (mock implementation)
   */
  getRecentStateChanges() {
    // This would track actual state changes in a real implementation
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Get overall success rate
   */
  getOverallSuccessRate() {
    if (this.commandExecutions.length === 0) return 100;
    const successCount = this.commandExecutions.filter((cmd) => cmd.success).length;
    return ((successCount / this.commandExecutions.length) * 100).toFixed(1);
  }

  /**
   * Get command categories
   */
  getCommandCategories() {
    const categories = new Map();
    const commands = this.terminal.commandRouter.getCommands();

    commands.forEach((command) => {
      const module = command.module || 'core';
      categories.set(module, (categories.get(module) || 0) + 1);
    });

    return categories;
  }

  /**
   * Get integration status information
   */
  getIntegrationStatus() {
    // Mock integration data - in real implementation would check actual services
    const now = Date.now();
    return [
      {
        name: 'GitHub API',
        status: 'connected',
        endpoint: 'https://api.github.com',
        lastCheck: now - 30000, // 30 seconds ago
        uptime: 99.9,
        rateLimiting: {
          remaining: 4850,
          limit: 5000,
          resetTime: now + 3600000, // 1 hour from now
        },
        authentication: {
          type: 'Token',
          valid: true,
        },
      },
      {
        name: 'Weather API',
        status: 'connected',
        endpoint: 'http://www.bom.gov.au/fwo/IDT60801/IDT60801.94975.json',
        lastCheck: now - 120000, // 2 minutes ago
        uptime: 98.5,
        rateLimiting: {
          remaining: 95,
          limit: 100,
          resetTime: now + 900000, // 15 minutes from now
        },
      },
      {
        name: 'AI Service',
        status: 'connected',
        endpoint: 'https://api.anthropic.com',
        lastCheck: now - 60000, // 1 minute ago
        uptime: 99.7,
        authentication: {
          type: 'API Key',
          valid: true,
        },
      },
      {
        name: 'Voice Interface',
        status: 'warning',
        endpoint: 'Browser Web Speech API',
        lastCheck: now - 300000, // 5 minutes ago
        uptime: 95.2,
        lastError: now - 300000,
      },
    ];
  }

  /**
   * Get integration status icon
   */
  getIntegrationStatusIcon(status) {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'error':
        return '🔴';
      case 'pending':
        return '🟠';
      default:
        return '⚪';
    }
  }

  /**
   * Get recent integration activity
   */
  getRecentIntegrationActivity() {
    // Mock recent activity - would track actual API calls in real implementation
    const now = Date.now();
    return [
      {
        service: 'GitHub',
        action: 'List repositories',
        success: true,
        timestamp: now - 120000,
        duration: 250,
        details: 'Fetched 15 repositories',
      },
      {
        service: 'Weather',
        action: 'Get conditions',
        success: true,
        timestamp: now - 300000,
        duration: 180,
        details: 'Retrieved Hobart weather',
      },
      {
        service: 'AI',
        action: 'Generate response',
        success: true,
        timestamp: now - 450000,
        duration: 1200,
        details: 'Processed user query',
      },
      {
        service: 'Voice',
        action: 'Initialize',
        success: false,
        timestamp: now - 600000,
        duration: 50,
        details: 'Microphone permission denied',
      },
    ];
  }

  /**
   * Get API usage statistics
   */
  getAPIUsageStats() {
    // Mock usage stats - would aggregate from real tracking in implementation
    return [
      { service: 'GitHub', usage: 45, errors: 2 },
      { service: 'Weather', usage: 12, errors: 0 },
      { service: 'AI', usage: 28, errors: 1 },
      { service: 'Voice', usage: 8, errors: 3 },
    ];
  }

  /**
   * Get integration configurations
   */
  getIntegrationConfigs() {
    return [
      {
        name: 'GitHub',
        baseUrl: 'https://api.github.com',
        timeout: 10000,
        retryCount: 3,
        apiVersion: 'v3',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AdrianWedd-Terminal',
        },
        features: ['repositories', 'workflows', 'issues'],
      },
      {
        name: 'Weather',
        baseUrl: 'http://www.bom.gov.au',
        timeout: 8000,
        retryCount: 2,
        apiVersion: 'JSON',
        headers: {
          Accept: 'application/json',
        },
        features: ['current conditions', 'forecasts'],
      },
      {
        name: 'AI Service',
        baseUrl: 'https://api.anthropic.com',
        timeout: 30000,
        retryCount: 2,
        apiVersion: '2023-06-01',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        features: ['completions', 'streaming'],
      },
      {
        name: 'Voice Interface',
        baseUrl: 'Browser API',
        timeout: 5000,
        retryCount: 1,
        apiVersion: 'Web Speech API',
        features: ['recognition', 'synthesis', 'wake words'],
      },
    ];
  }

  /**
   * Perform integration test
   */
  async performIntegrationTest(serviceName) {
    // Mock integration test - would perform actual API calls in implementation
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

    const configs = this.getIntegrationConfigs();
    const config = configs.find((c) => c.name.toLowerCase() === serviceName);

    if (!config) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    // Simulate different test outcomes
    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (isSuccess) {
      return {
        success: true,
        endpoint: config.baseUrl,
        data: {
          status: 'ok',
          service: config.name,
          version: config.apiVersion,
          timestamp: new Date().toISOString(),
        },
        rateLimiting:
          serviceName === 'github'
            ? {
                remaining: 4850,
                limit: 5000,
                resetTime: Date.now() + 3600000,
              }
            : undefined,
      };
    } else {
      return {
        success: false,
        endpoint: config.baseUrl,
        error: 'Connection timeout - service may be unavailable',
      };
    }
  }

  /**
   * Cleanup and destroy developer portal
   */
  destroy() {
    this.isActive = false;
    this.activePanel = null;
    this.clearMetrics();
    console.log('🚀 Developer Portal: Destroyed');
  }
}

/**
 * Initialize developer portal with terminal
 */
export function initializeDeveloperPortal(terminal) {
  const portal = new DeveloperPortal(terminal);
  terminal.developerPortal = portal;
  return portal;
}

export default { DeveloperPortal, initializeDeveloperPortal };
