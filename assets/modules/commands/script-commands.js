/**
 * Script Engine Commands Module
 * Handles script execution, editing, and automation
 */

export class ScriptCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.scriptEngine = null;
    this.scriptEditor = null;
    this.scripts = new Map();
    this.editorActive = false;
  }

  /**
   * Initialize script engine
   */
  async initializeScriptEngine() {
    if (!this.scriptEngine) {
      try {
        const { ScriptEngine } = await import('../../script-engine.js');
        this.scriptEngine = new ScriptEngine(this.terminal);
        return true;
      } catch (error) {
        console.error('Failed to initialize script engine:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Initialize script editor
   */
  async initializeScriptEditor() {
    if (!this.scriptEditor) {
      try {
        const { ScriptEditor } = await import('../../script-editor.js');
        this.scriptEditor = new ScriptEditor();
        return true;
      } catch (error) {
        console.error('Failed to initialize script editor:', error);
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
      script: {
        handler: this.handleScript.bind(this),
        description: 'Script management',
        usage: 'script [list|create|run|delete] [name]',
      },

      run: {
        handler: this.handleRun.bind(this),
        description: 'Run a script',
        usage: 'run <script-name>',
        aliases: ['exec'],
      },

      edit: {
        handler: this.handleEdit.bind(this),
        description: 'Edit a script',
        usage: 'edit <script-name>',
        aliases: ['nano', 'vim'],
      },

      save: {
        handler: this.handleSave.bind(this),
        description: 'Save current script',
        usage: 'save [name]',
      },

      load: {
        handler: this.handleLoad.bind(this),
        description: 'Load a script',
        usage: 'load <script-name>',
      },

      'exit-editor': {
        handler: this.handleExitEditor.bind(this),
        description: 'Exit script editor',
        aliases: [':q', 'exit'],
      },

      macro: {
        handler: this.handleMacro.bind(this),
        description: 'Record and playback macros',
        usage: 'macro [record|stop|play] [name]',
      },
    };
  }

  /**
   * Handle script command
   */
  async handleScript(args) {
    const action = args[0] || 'list';
    const name = args[1];

    switch (action) {
      case 'list':
        return this.listScripts();
      case 'create':
        return this.createScript(name);
      case 'run':
        return this.runScript(name);
      case 'delete':
        return this.deleteScript(name);
      case 'info':
        return this.scriptInfo(name);
      default:
        return `
╔══════════════════════════════════════════════════════════╗
║                   SCRIPT ENGINE                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Commands:                                               ║
║    script list           - List all scripts             ║
║    script create <name>  - Create new script            ║
║    script run <name>     - Run a script                 ║
║    script delete <name>  - Delete a script              ║
║                                                          ║
║  Quick commands:                                         ║
║    run <name>            - Execute script               ║
║    edit <name>           - Edit script in editor        ║
║                                                          ║
║  Scripts: ${this.scripts.size} loaded                                     ║
╚══════════════════════════════════════════════════════════╝`;
    }
  }

  /**
   * List available scripts
   */
  listScripts() {
    if (this.scripts.size === 0) {
      return `
No scripts available. Create one with:
  script create <name>
  edit <name>`;
    }

    let output = '╔══════════════════════════════════════════════════════════╗\n';
    output += '║                    AVAILABLE SCRIPTS                     ║\n';
    output += '╠══════════════════════════════════════════════════════════╣\n';

    for (const [name, script] of this.scripts) {
      const lines = script.content.split('\n').length;
      const size = script.content.length;
      const created = new Date(script.created).toLocaleDateString();

      output += `║ 📜 ${name.padEnd(48)}║\n`;
      output += `║    Lines: ${lines.toString().padEnd(6)} Size: ${size}b Created: ${created.padEnd(12)}║\n`;
    }

    output += '╚══════════════════════════════════════════════════════════╝';
    return output;
  }

  /**
   * Create a new script
   */
  async createScript(name) {
    if (!name) {
      return '❌ Script name required. Usage: script create <name>';
    }

    if (this.scripts.has(name)) {
      return `❌ Script "${name}" already exists. Use 'edit ${name}' to modify it.`;
    }

    const template = `#!/bin/adrian-sh
# Script: ${name}
# Created: ${new Date().toISOString()}

echo "Hello from ${name}!"
echo "This is a sample script."

# Available commands:
# echo <text>        - Print text
# sleep <seconds>    - Wait
# terminal <command> - Execute terminal command
# var name=value     - Set variable
# if/else/endif      - Conditionals
# for/done          - Loops
`;

    this.scripts.set(name, {
      content: template,
      created: Date.now(),
      modified: Date.now(),
    });

    return `✅ Script "${name}" created. Use 'edit ${name}' to modify it.`;
  }

  /**
   * Run a script
   */
  async runScript(name) {
    if (!name) {
      return '❌ Script name required. Usage: run <script-name>';
    }

    const script = this.scripts.get(name);
    if (!script) {
      return `❌ Script "${name}" not found. Use 'script list' to see available scripts.`;
    }

    const initialized = await this.initializeScriptEngine();
    if (!initialized) {
      return '❌ Script engine unavailable';
    }

    this.terminal.ui.addOutput(`🚀 Running script: ${name}`, 'info');

    try {
      const result = await this.scriptEngine.execute(script.content);
      return result || '✅ Script completed successfully';
    } catch (error) {
      return `❌ Script error: ${error.message}`;
    }
  }

  /**
   * Delete a script
   */
  deleteScript(name) {
    if (!name) {
      return '❌ Script name required. Usage: script delete <name>';
    }

    if (!this.scripts.has(name)) {
      return `❌ Script "${name}" not found`;
    }

    this.scripts.delete(name);
    return `✅ Script "${name}" deleted`;
  }

  /**
   * Get script info
   */
  scriptInfo(name) {
    if (!name) {
      return '❌ Script name required. Usage: script info <name>';
    }

    const script = this.scripts.get(name);
    if (!script) {
      return `❌ Script "${name}" not found`;
    }

    const lines = script.content.split('\n').length;
    const words = script.content.split(/\s+/).length;
    const chars = script.content.length;

    return `
╔══════════════════════════════════════════════════════════╗
║                    SCRIPT INFO                           ║
╠══════════════════════════════════════════════════════════╣
║  Name: ${name.padEnd(51)}║
║  Lines: ${lines.toString().padEnd(50)}║
║  Words: ${words.toString().padEnd(50)}║
║  Characters: ${chars.toString().padEnd(45)}║
║  Created: ${new Date(script.created).toLocaleString().padEnd(44)}║
║  Modified: ${new Date(script.modified).toLocaleString().padEnd(43)}║
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Handle run command
   */
  async handleRun(args) {
    if (args.length === 0) {
      return 'Usage: run <script-name>\nExample: run hello-world';
    }

    return this.runScript(args[0]);
  }

  /**
   * Handle edit command
   */
  async handleEdit(args) {
    if (args.length === 0) {
      return 'Usage: edit <script-name>\nExample: edit my-script';
    }

    const name = args[0];

    // Create script if it doesn't exist
    if (!this.scripts.has(name)) {
      await this.createScript(name);
    }

    const initialized = await this.initializeScriptEditor();
    if (!initialized) {
      return '❌ Script editor unavailable';
    }

    this.editorActive = true;
    this.currentScript = name;

    const script = this.scripts.get(name);

    return `
╔══════════════════════════════════════════════════════════╗
║                   SCRIPT EDITOR                          ║
╠══════════════════════════════════════════════════════════╣
║  Editing: ${name.padEnd(46)}║
║                                                          ║
║  Commands:                                               ║
║    :q, exit-editor  - Exit editor                       ║
║    save             - Save changes                      ║
║                                                          ║
║  Content:                                                ║
╚══════════════════════════════════════════════════════════╝

${script.content}

[EDITOR MODE] Type your script content...`;
  }

  /**
   * Handle save command
   */
  async handleSave(args) {
    if (!this.editorActive) {
      return '❌ No editor session active';
    }

    const name = args[0] || this.currentScript;
    if (!name) {
      return '❌ No script name specified';
    }

    // In a real implementation, this would save the current editor content
    const script = this.scripts.get(name);
    if (script) {
      script.modified = Date.now();
      return `✅ Script "${name}" saved`;
    }

    return `❌ Script "${name}" not found`;
  }

  /**
   * Handle load command
   */
  async handleLoad(args) {
    if (args.length === 0) {
      return 'Usage: load <script-name>';
    }

    const name = args[0];

    try {
      // Try to load from localStorage or server
      const saved = localStorage.getItem(`script-${name}`);
      if (saved) {
        const script = JSON.parse(saved);
        this.scripts.set(name, script);
        return `✅ Script "${name}" loaded from storage`;
      }

      return `❌ Script "${name}" not found in storage`;
    } catch (error) {
      return `❌ Failed to load script: ${error.message}`;
    }
  }

  /**
   * Handle exit editor command
   */
  async handleExitEditor() {
    if (!this.editorActive) {
      return '❌ No editor session active';
    }

    this.editorActive = false;
    this.currentScript = null;

    return '✅ Editor closed';
  }

  /**
   * Handle macro command
   */
  async handleMacro(args) {
    const action = args[0];
    const name = args[1];

    switch (action) {
      case 'record':
        if (!name) {
          return '❌ Macro name required. Usage: macro record <name>';
        }
        this.startMacroRecording(name);
        return `🔴 Recording macro: ${name}`;

      case 'stop':
        return this.stopMacroRecording();

      case 'play':
        if (!name) {
          return '❌ Macro name required. Usage: macro play <name>';
        }
        return this.playMacro(name);

      case 'list':
        return this.listMacros();

      default:
        return `
Macro Commands:
  macro record <name>  - Start recording
  macro stop           - Stop recording
  macro play <name>    - Play macro
  macro list          - List macros`;
    }
  }

  /**
   * Start macro recording
   */
  startMacroRecording(name) {
    // Implementation would track commands
    this.recordingMacro = name;
    this.macroCommands = [];
  }

  /**
   * Stop macro recording
   */
  stopMacroRecording() {
    if (!this.recordingMacro) {
      return '❌ No macro recording active';
    }

    const name = this.recordingMacro;
    this.recordingMacro = null;

    return `✅ Macro "${name}" saved with ${this.macroCommands.length} commands`;
  }

  /**
   * Play a macro
   */
  async playMacro(name) {
    // Implementation would replay recorded commands
    return `🎬 Playing macro: ${name}`;
  }

  /**
   * List available macros
   */
  listMacros() {
    return 'No macros recorded yet. Use "macro record <name>" to start.';
  }

  /**
   * Load built-in example scripts
   */
  loadExampleScripts() {
    const examples = {
      'hello-world': {
        content: `#!/bin/adrian-sh
echo "Hello, World!"
echo "Current time: $(date)"
echo "System uptime: $(uptime)"`,
        created: Date.now(),
        modified: Date.now(),
      },
      'system-info': {
        content: `#!/bin/adrian-sh
echo "=== SYSTEM INFORMATION ==="
terminal whoami
terminal neofetch
terminal ps`,
        created: Date.now(),
        modified: Date.now(),
      },
      'daily-routine': {
        content: `#!/bin/adrian-sh
echo "Starting daily routine..."
terminal weather
terminal magic
terminal actions
echo "Daily routine completed!"`,
        created: Date.now(),
        modified: Date.now(),
      },
    };

    for (const [name, script] of Object.entries(examples)) {
      this.scripts.set(name, script);
    }
  }

  /**
   * Initialize with example scripts
   */
  init() {
    this.loadExampleScripts();
  }

  /**
   * Cleanup
   */
  destroy() {
    this.editorActive = false;
    this.currentScript = null;
    this.recordingMacro = null;
  }
}

/**
 * Register script commands with terminal
 */
export function registerScriptCommands(terminal) {
  const scriptCommands = new ScriptCommands(terminal);
  const commands = scriptCommands.getCommands();

  Object.entries(commands).forEach(([name, config]) => {
    terminal.commandRouter.register(name, config.handler, {
      description: config.description,
      usage: config.usage,
      aliases: config.aliases,
      module: 'script',
    });
  });

  // Initialize with example scripts
  scriptCommands.init();

  // Store script commands instance
  terminal.scriptCommands = scriptCommands;

  return scriptCommands;
}

export default { ScriptCommands, registerScriptCommands };
