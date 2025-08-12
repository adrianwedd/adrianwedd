/**
 * Command Router Module
 * Handles command parsing, routing, and execution
 */

export class CommandRouter {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 100;
  }

  /**
   * Register a command handler
   */
  register(command, handler, options = {}) {
    this.commands.set(command, { handler, ...options });
    
    if (options.aliases) {
      options.aliases.forEach(alias => {
        this.aliases.set(alias, command);
      });
    }
  }

  /**
   * Execute a command string
   */
  async execute(commandString) {
    if (!commandString?.trim()) return null;
    
    this.addToHistory(commandString);
    
    const [command, ...args] = commandString.trim().split(/\s+/);
    const lowerCommand = command.toLowerCase();
    
    // Check for alias
    const actualCommand = this.aliases.get(lowerCommand) || lowerCommand;
    
    const commandDef = this.commands.get(actualCommand);
    if (!commandDef) {
      return { 
        success: false, 
        error: `Unknown command: ${command}. Type 'help' for available commands.` 
      };
    }
    
    try {
      const result = await commandDef.handler(args, commandString);
      return { success: true, result };
    } catch (error) {
      console.error(`Command execution error:`, error);
      return { 
        success: false, 
        error: `Error executing command: ${error.message}` 
      };
    }
  }

  /**
   * Add command to history
   */
  addToHistory(command) {
    if (this.history[0] !== command) {
      this.history.unshift(command);
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }
    }
    this.historyIndex = -1;
  }

  /**
   * Navigate command history
   */
  navigateHistory(direction) {
    if (direction === 'up') {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        return this.history[this.historyIndex];
      }
    } else if (direction === 'down') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        return this.history[this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        return '';
      }
    }
    return null;
  }

  /**
   * Get command suggestions for autocomplete
   */
  getSuggestions(partial) {
    const lowerPartial = partial.toLowerCase();
    const suggestions = [];
    
    // Check direct commands
    for (const [cmd, def] of this.commands) {
      if (cmd.startsWith(lowerPartial)) {
        suggestions.push({
          command: cmd,
          description: def.description || ''
        });
      }
    }
    
    // Check aliases
    for (const [alias, cmd] of this.aliases) {
      if (alias.startsWith(lowerPartial) && !suggestions.find(s => s.command === alias)) {
        suggestions.push({
          command: alias,
          description: `Alias for ${cmd}`,
          isAlias: true
        });
      }
    }
    
    return suggestions.sort((a, b) => a.command.localeCompare(b.command));
  }

  /**
   * Get all available commands
   */
  getCommands() {
    return Array.from(this.commands.entries()).map(([name, def]) => ({
      name,
      description: def.description || '',
      usage: def.usage || '',
      aliases: def.aliases || []
    }));
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.history = [];
    this.historyIndex = -1;
  }
}

export default CommandRouter;