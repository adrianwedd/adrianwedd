/**
 * Terminal Core Module
 * Main terminal orchestrator using modular architecture
 */

import { CommandRouter } from './command-router.js';
import { UIController } from './ui-controller.js';
import { IntegrationManager } from './integration-manager.js';
import { StateManager } from './state-manager.js';
import { initializeHMR } from './hot-module-replacement.js';

export class TerminalCore {
  constructor(config = {}) {
    this.config = config;

    // Initialize core modules
    this.commandRouter = new CommandRouter();
    this.ui = new UIController(config.ui);
    this.integrations = new IntegrationManager();
    this.state = new StateManager();

    // Initialize HMR system
    this.hmr = initializeHMR(this);

    // Track initialization
    this.initialized = false;
    this.modules = new Map();
  }

  /**
   * Initialize the terminal
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      // Set session start time
      window.sessionStart = Date.now();

      // Initialize UI
      this.ui.init();

      // Register core commands
      this.registerCoreCommands();

      // Load external modules
      await this.loadModules();

      // Initialize HMR system
      await this.hmr.init();

      // Setup event listeners
      this.setupEventListeners();

      // Initialize integrations
      await this.initializeIntegrations();

      // Update state
      this.state.setState('terminal', {
        isReady: true,
        currentDirectory: '~',
        user: 'guest',
        hostname: 'adrianwedd.com',
      });

      // Show welcome message
      this.showWelcome();

      this.initialized = true;
    } catch (error) {
      console.error('Terminal initialization failed:', error);
      this.ui.showError('Failed to initialize terminal');
    }
  }

  /**
   * Register core commands
   */
  registerCoreCommands() {
    // Help command
    this.commandRouter.register(
      'help',
      async () => {
        const commands = this.commandRouter.getCommands();
        const helpText = this.formatHelp(commands);
        this.ui.addOutput(helpText, 'help');
      },
      {
        description: 'Show available commands',
        aliases: ['h', '?'],
      }
    );

    // Clear command
    this.commandRouter.register(
      'clear',
      async () => {
        this.ui.clearOutput();
      },
      {
        description: 'Clear terminal output',
        aliases: ['cls'],
      }
    );

    // Theme command
    this.commandRouter.register(
      'theme',
      async (args) => {
        if (args.length === 0) {
          this.ui.showInfo(`Current theme: ${this.ui.currentTheme}`);
          this.ui.showInfo('Available themes: matrix, ocean, sunset, neon');
        } else {
          this.ui.setTheme(args[0]);
          this.ui.showSuccess(`Theme changed to: ${args[0]}`);
        }
      },
      {
        description: 'Change terminal theme',
        usage: 'theme [matrix|ocean|sunset|neon]',
      }
    );

    // About command
    this.commandRouter.register(
      'about',
      async () => {
        const about = `
╔══════════════════════════════════════╗
║     Adrian Wedd - Digital Nexus     ║
╠══════════════════════════════════════╣
║ Terminal Interface v2.0              ║
║ Modular Architecture Edition         ║
║                                      ║
║ Features:                            ║
║ • AI-Powered Assistance              ║
║ • Voice Commands                     ║
║ • GitHub Integration                 ║
║ • Real-time System Monitoring        ║
║ • Interactive Music Synthesizer      ║
║                                      ║
║ Type 'help' for available commands   ║
╚══════════════════════════════════════╝`;
        this.ui.addOutput(about, 'ascii-art');
      },
      {
        description: 'About this terminal',
      }
    );

    // Debug command
    this.commandRouter.register(
      'debug',
      async (args) => {
        const debugMode = this.state.getState('features', 'debugMode');

        if (args[0] === 'on') {
          this.state.updateState('features', 'debugMode', true);
          this.ui.showSuccess('Debug mode enabled');
        } else if (args[0] === 'off') {
          this.state.updateState('features', 'debugMode', false);
          this.ui.showSuccess('Debug mode disabled');
        } else if (args[0] === 'stats') {
          const stats = this.getDebugStats();
          this.ui.showTable(['Metric', 'Value'], Object.entries(stats));
        } else {
          this.ui.showInfo(`Debug mode is ${debugMode ? 'ON' : 'OFF'}`);
        }
      },
      {
        description: 'Toggle debug mode',
        usage: 'debug [on|off|stats]',
      }
    );
  }

  /**
   * Load external modules dynamically
   */
  async loadModules() {
    // Load command modules
    const commandModules = [
      { name: 'core', path: './commands/core-commands.js', enabled: true },
      { name: 'ai', path: './commands/ai-commands.js', enabled: true },
      { name: 'github', path: './commands/github-commands.js', enabled: true },
      { name: 'music', path: './commands/music-commands.js', enabled: true },
      { name: 'system', path: './commands/system-commands.js', enabled: true },
      { name: 'effects', path: './commands/effects-commands.js', enabled: true },
      { name: 'script', path: './commands/script-commands.js', enabled: true },
      { name: 'voice', path: './commands/voice-commands.js', enabled: true },
    ];

    for (const module of commandModules) {
      if (module.enabled) {
        try {
          const imported = await import(module.path);
          this.modules.set(module.name, imported);

          // Register with HMR system
          this.hmr.registerModule(module.name, module.path, imported);

          // Register commands based on module type
          if (imported.registerCoreCommands) {
            imported.registerCoreCommands(this);
          } else if (imported.registerAICommands) {
            imported.registerAICommands(this);
          } else if (imported.registerGitHubCommands) {
            imported.registerGitHubCommands(this);
          } else if (imported.registerMusicCommands) {
            imported.registerMusicCommands(this);
          } else if (imported.registerSystemCommands) {
            imported.registerSystemCommands(this);
          } else if (imported.registerEffectsCommands) {
            imported.registerEffectsCommands(this);
          } else if (imported.registerScriptCommands) {
            imported.registerScriptCommands(this);
          } else if (imported.registerVoiceCommands) {
            imported.registerVoiceCommands(this);
          }
        } catch (error) {
          console.warn(`Failed to load module ${module.name}:`, error);
        }
      }
    }

    // Load service modules (legacy compatibility)
    const serviceModules = [
      { name: 'voice', path: '../voice-interface.js', enabled: false },
      { name: 'music', path: '../music-player.js', enabled: false },
      { name: 'system', path: '../system-monitor.js', enabled: false },
      { name: 'script', path: '../script-engine.js', enabled: false },
    ];

    for (const module of serviceModules) {
      if (module.enabled) {
        try {
          const imported = await import(module.path);
          this.modules.set(module.name, imported);
        } catch (error) {
          console.warn(`Failed to load service ${module.name}:`, error);
        }
      }
    }
  }

  /**
   * Register commands from a module
   */
  registerModuleCommands(moduleName, commands) {
    for (const [name, config] of Object.entries(commands)) {
      this.commandRouter.register(name, config.handler, {
        ...config,
        module: moduleName,
      });
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const input = document.getElementById('cli-input');
    const form = document.getElementById('cli-form');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCommand();
      });
    }

    if (input) {
      // Command history navigation
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const command = this.commandRouter.navigateHistory('up');
          if (command !== null) {
            this.ui.setInputValue(command);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const command = this.commandRouter.navigateHistory('down');
          if (command !== null) {
            this.ui.setInputValue(command);
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          this.handleAutocomplete();
        }
      });

      // Auto-focus
      document.addEventListener('click', () => {
        this.ui.focusInput();
      });
    }
  }

  /**
   * Initialize integrations
   */
  async initializeIntegrations() {
    // Register integrations
    this.integrations.register('github', {
      init: async () => {
        // GitHub integration initialization
        return { connected: true };
      },
    });

    this.integrations.register('weather', {
      init: async () => {
        // Weather integration initialization
        return { connected: true };
      },
    });

    // Initialize registered integrations
    try {
      await this.integrations.initialize('github');
      await this.integrations.initialize('weather');
    } catch (error) {
      console.warn('Some integrations failed to initialize:', error);
    }
  }

  /**
   * Handle command execution
   */
  async handleCommand() {
    const command = this.ui.getInputValue().trim();
    if (!command) return;

    // Add command to output
    this.ui.addCommandLine(command);

    // Clear input
    this.ui.clearInput();

    // Update session state
    this.state.updateState(
      'session',
      'commandCount',
      this.state.getState('session', 'commandCount') + 1
    );
    this.state.updateState('session', 'lastActivity', Date.now());

    // Execute command
    const result = await this.commandRouter.execute(command);

    if (!result.success && result.error) {
      this.ui.showError(result.error);
    }
  }

  /**
   * Handle autocomplete
   */
  handleAutocomplete() {
    const input = this.ui.getInputValue();
    const suggestions = this.commandRouter.getSuggestions(input);

    if (suggestions.length === 1) {
      this.ui.setInputValue(suggestions[0].command + ' ');
    } else if (suggestions.length > 1) {
      this.ui.addOutput('Suggestions: ' + suggestions.map((s) => s.command).join(', '), 'info');
    }
  }

  /**
   * Show welcome message
   */
  showWelcome() {
    const welcome = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ▄▄▄      ▓█████▄  ██▀███   ██▓ ▄▄▄       ███▄    █     ║
║    ▒████▄    ▒██▀ ██▌▓██ ▒ ██▒▓██▒▒████▄     ██ ▀█   █     ║
║    ▒██  ▀█▄  ░██   █▌▓██ ░▄█ ▒▒██▒▒██  ▀█▄  ▓██  ▀█ ██▒    ║
║    ░██▄▄▄▄██ ░▓█▄   ▌▒██▀▀█▄  ░██░░██▄▄▄▄██ ▓██▒  ▐▌██▒    ║
║     ▓█   ▓██▒░▒████▓ ░██▓ ▒██▒░██░ ▓█   ▓██▒▒██░   ▓██░    ║
║     ▒▒   ▓▒█░ ▒▒▓  ▒ ░ ▒▓ ░▒▓░░▓   ▒▒   ▓▒█░░ ▒░   ▒ ▒     ║
║                                                              ║
║              Welcome to Adrian's Digital Nexus              ║
║                  Terminal Interface v2.0                    ║
║                                                              ║
║    Type 'help' for available commands or click them below   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;

    this.ui.addOutput(welcome, 'ascii-art welcome');

    // Add clickable commands
    const quickCommands = ['help', 'about', 'projects', 'chat', 'music'];
    const commandLinks = quickCommands
      .map((cmd) => `<span class="command-link" data-command="${cmd}">${cmd}</span>`)
      .join(' | ');

    this.ui.addOutput(`Quick commands: ${commandLinks}`, 'quick-commands', { isHTML: true });

    // Setup click handlers for command links
    setTimeout(() => {
      document.querySelectorAll('.command-link').forEach((link) => {
        link.addEventListener('click', (e) => {
          const command = e.target.dataset.command;
          this.ui.setInputValue(command);
          this.handleCommand();
        });
      });
    }, 100);
  }

  /**
   * Format help text
   */
  formatHelp(commands) {
    let help = '╔══════════════════════════════════════════════════════╗\n';
    help += '║                   Available Commands                  ║\n';
    help += '╠════════════════════════════════════════════════════════╣\n';

    const grouped = this.groupCommandsByModule(commands);

    for (const [module, cmds] of Object.entries(grouped)) {
      help += `║ ${module.toUpperCase()}:\n`;
      cmds.forEach((cmd) => {
        const aliases = cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        help += `║   ${cmd.name.padEnd(15)} - ${cmd.description}${aliases}\n`;
      });
    }

    help += '╚══════════════════════════════════════════════════════╝';
    return help;
  }

  /**
   * Group commands by module
   */
  groupCommandsByModule(commands) {
    const grouped = { core: [] };

    commands.forEach((cmd) => {
      const module = cmd.module || 'core';
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(cmd);
    });

    return grouped;
  }

  /**
   * Get debug statistics
   */
  getDebugStats() {
    const session = this.state.getState('session');
    const uptime = Date.now() - session.startTime;

    return {
      Uptime: `${Math.floor(uptime / 1000)}s`,
      'Commands Run': session.commandCount,
      'Active Modules': this.modules.size,
      'Active Integrations': this.integrations.activeConnections.size,
      'State Items': this.state.state.size,
      'Command History': this.commandRouter.history.length,
    };
  }

  /**
   * Cleanup and destroy terminal
   */
  destroy() {
    this.integrations.cleanup();
    this.state.clearState();
    this.ui.clearOutput();
    this.initialized = false;
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new TerminalCore();
    window.terminal.init();
  });
} else {
  window.terminal = new TerminalCore();
  window.terminal.init();
}

export default TerminalCore;
