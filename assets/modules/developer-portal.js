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

  async showCommandPlayground(_args) {
    return `🚀 Developer Portal: Command playground not yet implemented`;
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

  async showIntegrationDashboard(_args) {
    return `🚀 Developer Portal: Integration dashboard not yet implemented`;
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
