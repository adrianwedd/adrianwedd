/**
 * AI Integration Commands Module
 * Handles AI chat, context management, and LLM interactions
 */

export class AICommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.aiService = null;
    this.chatActive = false;
    this.context = [];
    this.maxContextSize = 10;
  }

  /**
   * Initialize AI service
   */
  async initializeAI() {
    if (!this.aiService) {
      try {
        // Dynamically import AI service when needed
        const { AIService } = await import('../../ai-service.js');
        this.aiService = new AIService();
        await this.aiService.initialize();
        return true;
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
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
      chat: {
        handler: this.handleChat.bind(this),
        description: 'Start AI chat session',
        usage: 'chat [message]',
      },

      ai: {
        handler: this.handleAI.bind(this),
        description: 'Send a message to AI',
        usage: 'ai <prompt>',
        aliases: ['ask', 'gpt'],
      },

      context: {
        handler: this.handleContext.bind(this),
        description: 'Manage AI context',
        usage: 'context [clear|show|save|load]',
      },

      'chat-exit': {
        handler: this.handleChatExit.bind(this),
        description: 'Exit chat mode',
        aliases: ['exit-chat', '/exit'],
      },
    };
  }

  /**
   * Handle chat command
   */
  async handleChat(args) {
    const initialized = await this.initializeAI();
    if (!initialized) {
      return '❌ AI service is currently unavailable. Please try again later.';
    }

    if (args.length > 0) {
      // Direct message to AI
      const prompt = args.join(' ');
      return await this.sendToAI(prompt);
    }

    // Enter chat mode
    this.chatActive = true;
    this.terminal.state.updateState('features', 'aiChatActive', true);

    return `
╔══════════════════════════════════════════════════════════╗
║                    AI CHAT MODE                          ║
╠══════════════════════════════════════════════════════════╣
║  You are now in AI chat mode.                           ║
║  Type your messages directly to chat with Claude.        ║
║  Type '/exit' or 'chat-exit' to leave chat mode.        ║
║                                                          ║
║  Context: ${this.context.length} messages                ║
╚══════════════════════════════════════════════════════════╝

AI: Hello! I'm Claude, your AI assistant. How can I help you today?`;
  }

  /**
   * Handle AI command (single prompt)
   */
  async handleAI(args) {
    if (args.length === 0) {
      return 'Usage: ai <your prompt>\nExample: ai explain quantum computing';
    }

    const initialized = await this.initializeAI();
    if (!initialized) {
      return '❌ AI service is currently unavailable.';
    }

    const prompt = args.join(' ');
    return await this.sendToAI(prompt);
  }

  /**
   * Handle context management
   */
  async handleContext(args) {
    const action = args[0] || 'show';

    switch (action) {
      case 'clear':
        this.context = [];
        return '✅ AI context cleared.';

      case 'show':
        if (this.context.length === 0) {
          return 'No context messages stored.';
        }
        return this.formatContext();

      case 'save': {
        const filename = args[1] || 'ai-context.json';
        try {
          localStorage.setItem(`ai-context-${filename}`, JSON.stringify(this.context));
          return `✅ Context saved to ${filename}`;
        } catch (error) {
          return `❌ Failed to save context: ${error.message}`;
        }
      }

      case 'load': {
        const loadFile = args[1] || 'ai-context.json';
        try {
          const saved = localStorage.getItem(`ai-context-${loadFile}`);
          if (saved) {
            this.context = JSON.parse(saved);
            return `✅ Context loaded from ${loadFile} (${this.context.length} messages)`;
          }
          return `❌ No saved context found: ${loadFile}`;
        } catch (error) {
          return `❌ Failed to load context: ${error.message}`;
        }
      }

      default:
        return 'Usage: context [clear|show|save|load]';
    }
  }

  /**
   * Handle chat exit
   */
  async handleChatExit() {
    this.chatActive = false;
    this.terminal.state.updateState('features', 'aiChatActive', false);

    return `
╔══════════════════════════════════════════════════════════╗
║                  CHAT MODE ENDED                         ║
╠══════════════════════════════════════════════════════════╣
║  Chat session closed.                                    ║
║  Context preserved: ${String(this.context.length).padEnd(37)}║
║  Type 'chat' to start a new session.                    ║
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Send message to AI service
   */
  async sendToAI(prompt) {
    // Show loading indicator
    const loading = this.terminal.ui.showLoading('Thinking...');

    try {
      // Add to context
      this.addToContext('user', prompt);

      // Prepare messages for API
      const messages = this.context.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to AI service
      const response = await this.aiService.sendMessage(prompt, {
        context: messages,
        stream: true,
      });

      // Stop loading
      loading.stop();

      // Add response to context
      this.addToContext('assistant', response);

      // Format and return response
      return this.formatAIResponse(response);
    } catch (error) {
      loading.stop();
      console.error('AI request failed:', error);
      return `❌ AI Error: ${error.message || 'Failed to get response'}`;
    }
  }

  /**
   * Add message to context
   */
  addToContext(role, content) {
    this.context.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Trim context if too large
    if (this.context.length > this.maxContextSize * 2) {
      // Keep system messages and recent messages
      const systemMessages = this.context.filter((m) => m.role === 'system');
      const recentMessages = this.context.slice(-this.maxContextSize);
      this.context = [...systemMessages, ...recentMessages];
    }
  }

  /**
   * Format context for display
   */
  formatContext() {
    let output = '╔══════════════════════════════════════════════════════════╗\n';
    output += '║                    AI CONTEXT                            ║\n';
    output += '╠══════════════════════════════════════════════════════════╣\n';

    this.context.forEach((msg, i) => {
      const role = msg.role.toUpperCase().padEnd(10);
      const preview = msg.content.substring(0, 40) + '...';
      output += `║ ${i + 1}. ${role} ${preview.padEnd(43)}║\n`;
    });

    output += '╚══════════════════════════════════════════════════════════╝';
    return output;
  }

  /**
   * Format AI response for terminal display
   */
  formatAIResponse(response) {
    // Handle code blocks
    response = response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `\n[CODE${lang ? ` - ${lang}` : ''}]\n${code.trim()}\n[/CODE]\n`;
    });

    // Handle inline code
    response = response.replace(/`([^`]+)`/g, '[$1]');

    // Add AI prefix
    return `AI: ${response}`;
  }

  /**
   * Check if in chat mode
   */
  isInChatMode() {
    return this.chatActive;
  }

  /**
   * Process chat mode input
   */
  async processChatInput(input) {
    if (input === '/exit' || input === 'exit') {
      return await this.handleChatExit();
    }
    return await this.sendToAI(input);
  }
}

/**
 * Register AI commands with terminal
 */
export function registerAICommands(terminal) {
  const aiCommands = new AICommands(terminal);
  const commands = aiCommands.getCommands();

  Object.entries(commands).forEach(([name, config]) => {
    terminal.commandRouter.register(name, config.handler, {
      description: config.description,
      usage: config.usage,
      aliases: config.aliases,
      module: 'ai',
    });
  });

  // Store AI commands instance for chat mode
  terminal.aiCommands = aiCommands;

  return aiCommands;
}

export default { AICommands, registerAICommands };
