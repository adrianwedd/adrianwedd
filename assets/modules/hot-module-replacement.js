/**
 * Hot Module Replacement (HMR) System
 * Enables dynamic loading, reloading, and hot-swapping of modules during development
 */

/* global sessionStorage */

export class HotModuleReplacement {
  constructor(terminal) {
    this.terminal = terminal;
    this.moduleRegistry = new Map();
    this.moduleVersions = new Map();
    this.moduleWatchers = new Map();
    this.developmentMode = this.detectDevelopmentMode();
    this.reloadQueue = [];
    this.isReloading = false;

    // HMR event listeners
    this.listeners = {
      beforeReload: [],
      afterReload: [],
      moduleUpdate: [],
      error: [],
    };
  }

  /**
   * Initialize HMR system
   */
  async init() {
    if (!this.developmentMode) {
      console.log('HMR: Production mode detected, HMR disabled');
      return false;
    }

    console.log('🔥 HMR: Initializing Hot Module Replacement system...');

    try {
      // Register HMR commands
      this.registerHMRCommands();

      // Setup module watchers if in development
      if (this.isDevelopmentServer()) {
        await this.setupModuleWatchers();
      }

      // Setup global HMR API
      this.setupGlobalAPI();

      console.log('🔥 HMR: System initialized successfully');
      return true;
    } catch (error) {
      console.error('🔥 HMR: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Detect if we're in development mode
   */
  detectDevelopmentMode() {
    // Check for development indicators
    const indicators = [
      window.location.hostname === 'localhost',
      window.location.hostname === '127.0.0.1',
      window.location.port !== '' &&
        window.location.port !== '80' &&
        window.location.port !== '443',
      window.location.protocol === 'file:',
      document.querySelector('script[src*="localhost"]'),
      sessionStorage.getItem('development-mode') === 'true',
    ];

    return indicators.some((indicator) => indicator);
  }

  /**
   * Check if we're running on a development server
   */
  isDevelopmentServer() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  /**
   * Register a module in the HMR system
   */
  registerModule(name, path, moduleExports, version = '1.0.0') {
    const moduleInfo = {
      name,
      path,
      exports: moduleExports,
      version,
      loadTime: Date.now(),
      reloadCount: 0,
      dependencies: [],
      dependents: [],
    };

    this.moduleRegistry.set(name, moduleInfo);
    this.moduleVersions.set(name, version);

    this.emit('moduleUpdate', { name, action: 'register', module: moduleInfo });

    console.log(`🔥 HMR: Module '${name}' registered (v${version})`);
    return moduleInfo;
  }

  /**
   * Hot reload a specific module
   */
  async hotReloadModule(name, showOutput = true) {
    if (!this.developmentMode) {
      throw new Error('HMR: Hot reload only available in development mode');
    }

    const moduleInfo = this.moduleRegistry.get(name);
    if (!moduleInfo) {
      throw new Error(`HMR: Module '${name}' not found in registry`);
    }

    if (showOutput) {
      this.terminal.ui.showInfo(`🔥 Hot reloading module: ${name}...`);
    }

    try {
      this.emit('beforeReload', { name, module: moduleInfo });

      // Clear module from import cache by adding timestamp
      const cacheBuster = `?v=${Date.now()}`;
      const newPath = moduleInfo.path + cacheBuster;

      // Unregister old commands first
      await this.unregisterModuleCommands(name);

      // Import new version
      const newModule = await import(newPath);

      // Update module info
      moduleInfo.exports = newModule;
      moduleInfo.reloadCount++;
      moduleInfo.loadTime = Date.now();
      moduleInfo.version = this.incrementVersion(moduleInfo.version);

      // Re-register commands
      await this.reregisterModuleCommands(name, newModule);

      this.emit('afterReload', { name, module: moduleInfo });

      if (showOutput) {
        this.terminal.ui.showSuccess(
          `✅ Module '${name}' hot reloaded successfully (v${moduleInfo.version})`
        );
      }

      return moduleInfo;
    } catch (error) {
      this.emit('error', { name, error });
      if (showOutput) {
        this.terminal.ui.showError(`❌ Failed to hot reload module '${name}': ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Hot reload all modules
   */
  async hotReloadAll() {
    if (this.isReloading) {
      this.terminal.ui.showInfo('🔥 HMR: Reload already in progress...');
      return;
    }

    this.isReloading = true;
    const startTime = Date.now();

    try {
      this.terminal.ui.showInfo('🔥 HMR: Hot reloading all modules...');

      const moduleNames = Array.from(this.moduleRegistry.keys());
      const results = [];

      for (const name of moduleNames) {
        try {
          await this.hotReloadModule(name, false);
          results.push({ name, status: 'success' });
        } catch (error) {
          results.push({ name, status: 'error', error: error.message });
        }
      }

      const duration = Date.now() - startTime;
      const successful = results.filter((r) => r.status === 'success').length;
      const failed = results.filter((r) => r.status === 'error').length;

      this.terminal.ui.showSuccess(
        `✅ HMR: Completed reload of ${successful}/${moduleNames.length} modules in ${duration}ms`
      );

      if (failed > 0) {
        this.terminal.ui.showError(`❌ HMR: ${failed} modules failed to reload`);
      }

      return results;
    } finally {
      this.isReloading = false;
    }
  }

  /**
   * Unregister commands from a module
   */
  async unregisterModuleCommands(moduleName) {
    const commands = this.terminal.commandRouter.getCommandsByModule(moduleName);

    for (const commandName of commands) {
      this.terminal.commandRouter.unregister(commandName);
    }

    console.log(`🔥 HMR: Unregistered ${commands.length} commands from module '${moduleName}'`);
  }

  /**
   * Re-register commands from a reloaded module
   */
  async reregisterModuleCommands(moduleName, moduleExports) {
    // Use the same registration pattern as terminal-core.js
    const registrationMethods = [
      'registerCoreCommands',
      'registerAICommands',
      'registerGitHubCommands',
      'registerMusicCommands',
      'registerSystemCommands',
      'registerEffectsCommands',
      'registerScriptCommands',
      'registerVoiceCommands',
    ];

    for (const methodName of registrationMethods) {
      if (typeof moduleExports[methodName] === 'function') {
        try {
          moduleExports[methodName](this.terminal);
          console.log(`🔥 HMR: Re-registered commands using ${methodName}`);
          break;
        } catch (error) {
          console.warn(`🔥 HMR: Failed to re-register using ${methodName}:`, error);
        }
      }
    }
  }

  /**
   * Setup file watchers for modules (development server only)
   */
  async setupModuleWatchers() {
    if (!this.isDevelopmentServer()) {
      console.log('🔥 HMR: File watching requires development server');
      return;
    }

    // Note: This would typically use a development server with WebSocket connections
    // For browser-only implementation, we'll simulate with periodic checks
    console.log('🔥 HMR: Setting up module watchers...');

    // Setup periodic check for module changes (simplified simulation)
    this.watcherInterval = setInterval(() => {
      this.checkForModuleChanges();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Check for module changes (simplified implementation)
   */
  async checkForModuleChanges() {
    // In a real implementation, this would check file modification times
    // or receive WebSocket notifications from a development server

    // For now, we'll just simulate random updates for demo purposes
    const modules = Array.from(this.moduleRegistry.keys());
    if (modules.length > 0 && Math.random() < 0.01) {
      // 1% chance per check
      const randomModule = modules[Math.floor(Math.random() * modules.length)];
      console.log(`🔥 HMR: Simulated change detected in ${randomModule}`);
      // Uncomment to enable automatic hot reloading on changes
      // await this.hotReloadModule(randomModule);
    }
  }

  /**
   * Setup global HMR API
   */
  setupGlobalAPI() {
    // Expose HMR API globally for development
    window.HMR = {
      reload: (module) => this.hotReloadModule(module),
      reloadAll: () => this.hotReloadAll(),
      status: () => this.getStatus(),
      enable: () => this.enable(),
      disable: () => this.disable(),
      modules: () => Array.from(this.moduleRegistry.keys()),
      info: (module) => this.getModuleInfo(module),
    };

    console.log('🔥 HMR: Global API available as window.HMR');
  }

  /**
   * Register HMR-specific commands
   */
  registerHMRCommands() {
    // Register hmr command
    this.terminal.commandRouter.register(
      'hmr',
      async (args) => {
        const action = args[0] || 'status';

        switch (action) {
          case 'status':
            return this.getStatusOutput();
          case 'reload':
            if (args[1]) {
              await this.hotReloadModule(args[1]);
              return `🔥 Hot reloaded module: ${args[1]}`;
            } else {
              await this.hotReloadAll();
              return '🔥 Hot reloaded all modules';
            }
          case 'enable':
            this.enable();
            return '🔥 HMR enabled';
          case 'disable':
            this.disable();
            return '🔥 HMR disabled';
          case 'modules':
            return this.getModulesOutput();
          case 'info':
            if (args[1]) {
              return this.getModuleInfoOutput(args[1]);
            } else {
              return '❌ Usage: hmr info <module-name>';
            }
          default:
            return this.getHelpOutput();
        }
      },
      {
        description: 'Hot Module Replacement controls',
        usage: 'hmr [status|reload|enable|disable|modules|info] [module]',
        aliases: ['hot', 'reload'],
        module: 'hmr',
      }
    );

    // Register quick reload command
    this.terminal.commandRouter.register(
      'reload',
      async (args) => {
        if (args.length > 0) {
          await this.hotReloadModule(args[0]);
          return `🔥 Reloaded: ${args[0]}`;
        } else {
          await this.hotReloadAll();
          return '🔥 Reloaded all modules';
        }
      },
      {
        description: 'Quick module reload',
        usage: 'reload [module-name]',
        module: 'hmr',
      }
    );
  }

  /**
   * Get HMR status
   */
  getStatus() {
    return {
      enabled: this.developmentMode,
      developmentMode: this.developmentMode,
      moduleCount: this.moduleRegistry.size,
      isReloading: this.isReloading,
      watchersActive: !!this.watcherInterval,
    };
  }

  /**
   * Get formatted status output
   */
  getStatusOutput() {
    const status = this.getStatus();

    return `
╔══════════════════════════════════════════════════════════╗
║                   HMR SYSTEM STATUS                     ║
╠══════════════════════════════════════════════════════════╣
║ Enabled: ${status.enabled ? 'YES' : 'NO'}                                      ║
║ Development Mode: ${status.developmentMode ? 'YES' : 'NO'}                      ║
║ Modules Registered: ${status.moduleCount.toString().padEnd(35)} ║
║ Currently Reloading: ${status.isReloading ? 'YES' : 'NO'}                     ║
║ File Watchers: ${status.watchersActive ? 'ACTIVE' : 'INACTIVE'}                        ║
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Get modules list output
   */
  getModulesOutput() {
    const modules = Array.from(this.moduleRegistry.values());

    if (modules.length === 0) {
      return '🔥 HMR: No modules registered';
    }

    let output = `
╔══════════════════════════════════════════════════════════╗
║                   REGISTERED MODULES                    ║
╠══════════════════════════════════════════════════════════╣`;

    modules.forEach((module) => {
      const name = module.name.padEnd(15);
      const version = module.version.padEnd(8);
      const reloads = module.reloadCount.toString().padEnd(5);
      output += `\n║ ${name} v${version} (${reloads} reloads)        ║`;
    });

    output += '\n╚══════════════════════════════════════════════════════════╝';
    return output;
  }

  /**
   * Get module info output
   */
  getModuleInfoOutput(moduleName) {
    const module = this.moduleRegistry.get(moduleName);

    if (!module) {
      return `❌ Module '${moduleName}' not found`;
    }

    const loadTime = new Date(module.loadTime).toLocaleTimeString();

    return `
╔══════════════════════════════════════════════════════════╗
║                   MODULE INFO: ${moduleName.toUpperCase().padEnd(20)} ║
╠══════════════════════════════════════════════════════════╣
║ Version: ${module.version}                                    ║
║ Path: ${module.path.substring(0, 45)}      ║
║ Load Time: ${loadTime}                           ║
║ Reload Count: ${module.reloadCount}                                ║
║ Dependencies: ${module.dependencies.length}                           ║
║ Dependents: ${module.dependents.length}                             ║
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Get help output
   */
  getHelpOutput() {
    return `
╔══════════════════════════════════════════════════════════╗
║                    HMR COMMANDS                         ║
╠══════════════════════════════════════════════════════════╣
║ hmr status                  - Show HMR system status    ║
║ hmr reload [module]         - Reload module(s)          ║
║ hmr modules                 - List all modules          ║
║ hmr info <module>           - Show module details       ║
║ hmr enable/disable          - Toggle HMR system         ║
║                                                          ║
║ reload [module]             - Quick reload command      ║
║                                                          ║
║ Global API (window.HMR):                                ║
║   HMR.reload(module)        - Reload specific module    ║
║   HMR.reloadAll()           - Reload all modules        ║
║   HMR.status()              - Get system status         ║
║   HMR.modules()             - List module names         ║
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Get module info
   */
  getModuleInfo(moduleName) {
    return this.moduleRegistry.get(moduleName);
  }

  /**
   * Enable HMR
   */
  enable() {
    this.developmentMode = true;
    sessionStorage.setItem('development-mode', 'true');
    console.log('🔥 HMR: System enabled');
  }

  /**
   * Disable HMR
   */
  disable() {
    this.developmentMode = false;
    sessionStorage.removeItem('development-mode');
    if (this.watcherInterval) {
      clearInterval(this.watcherInterval);
      this.watcherInterval = null;
    }
    console.log('🔥 HMR: System disabled');
  }

  /**
   * Increment semantic version
   */
  incrementVersion(version) {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`🔥 HMR: Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Cleanup HMR system
   */
  destroy() {
    if (this.watcherInterval) {
      clearInterval(this.watcherInterval);
    }

    this.moduleRegistry.clear();
    this.moduleVersions.clear();
    this.moduleWatchers.clear();
    this.listeners = { beforeReload: [], afterReload: [], moduleUpdate: [], error: [] };

    delete window.HMR;
    console.log('🔥 HMR: System destroyed');
  }
}

/**
 * Initialize HMR system with terminal
 */
export function initializeHMR(terminal) {
  const hmr = new HotModuleReplacement(terminal);
  terminal.hmr = hmr;
  return hmr;
}

export default { HotModuleReplacement, initializeHMR };
