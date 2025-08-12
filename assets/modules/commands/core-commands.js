/**
 * Core Terminal Commands Module
 * Migrated from terminal.js
 */

export const coreCommands = {
  // System Information Commands
  whoami: {
    handler: async () => {
      return 'guest@adrianwedd.com - Digital Architect & Systems Thinker';
    },
    description: 'Display current user information',
  },

  pwd: {
    handler: async () => {
      return '/home/adrian/digital-nexus';
    },
    description: 'Print working directory',
  },

  ls: {
    handler: async () => {
      return `
projects/     - Technical projects and experiments
skills/       - Core competencies and expertise  
research/     - Academic papers and studies
music/        - Audio synthesis playground
about/        - Personal information
contact/      - Get in touch`;
    },
    description: 'List directory contents',
    aliases: ['dir'],
  },

  neofetch: {
    handler: async () => {
      const uptime = Math.floor((Date.now() - window.sessionStart) / 1000);
      return `
╔══════════════════════════════════════════════╗
║         Adrian Wedd@Digital-Nexus            ║
╠══════════════════════════════════════════════╣
║ OS:        Web Terminal v2.0                 ║
║ Host:      adrianwedd.com                    ║
║ Kernel:    ES6 Modular Architecture          ║
║ Uptime:    ${uptime} seconds                 ║
║ Shell:     adrian-sh 2.0                     ║
║ Terminal:  Chromium/Safari/Firefox           ║
║ CPU:       Neural Network @ 100%             ║
║ Memory:    ∞ TB (Unlimited Ideas)            ║
╚══════════════════════════════════════════════╝`;
    },
    description: 'Display system information',
  },

  // Navigation Commands
  home: {
    handler: async (args, terminal) => {
      terminal.ui.clearOutput();
      terminal.showWelcome();
      return null; // No additional output
    },
    description: 'Return to home screen',
  },

  projects: {
    handler: async () => {
      return `
╔══════════════════════════════════════════════════════════╗
║                    ACTIVE PROJECTS                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ 🧬 RECURSIVE SYSTEMS ARCHITECTURE                        ║
║    Self-organizing meta-frameworks for emergent          ║
║    intelligence and adaptive system design               ║
║                                                          ║
║ 🤖 AI INTEGRATION PATTERNS                              ║
║    Advanced prompt engineering and context management    ║
║    for production AI systems                            ║
║                                                          ║
║ 🌐 DISTRIBUTED KNOWLEDGE GRAPHS                         ║
║    Semantic networks for interconnected information      ║
║    architecture and discovery                           ║
║                                                          ║
║ 🎵 GENERATIVE AUDIO SYNTHESIS                          ║
║    Real-time WebAudio synthesis with fractal patterns   ║
║    and emergent musical structures                      ║
║                                                          ║
║ Type 'project <name>' for details                       ║
╚══════════════════════════════════════════════════════════╝`;
    },
    description: 'Show active projects',
  },

  skills: {
    handler: async () => {
      return `
╔══════════════════════════════════════════════════════════╗
║                   TECHNICAL EXPERTISE                     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ARCHITECTURE & DESIGN                                    ║
║ ├─ Distributed Systems      ████████████ 95%            ║
║ ├─ Event-Driven Design      ████████████ 92%            ║
║ ├─ Microservices           ████████████ 90%            ║
║ └─ Domain-Driven Design     ████████████ 88%            ║
║                                                          ║
║ LANGUAGES & FRAMEWORKS                                   ║
║ ├─ JavaScript/TypeScript    ████████████ 95%            ║
║ ├─ Python                   ████████████ 90%            ║
║ ├─ React/Vue/Svelte        ████████████ 92%            ║
║ └─ Node.js/Deno            ████████████ 90%            ║
║                                                          ║
║ AI & MACHINE LEARNING                                    ║
║ ├─ Prompt Engineering       ████████████ 94%            ║
║ ├─ LLM Integration         ████████████ 92%            ║
║ ├─ Neural Networks         ████████████ 85%            ║
║ └─ NLP/Computer Vision     ████████████ 82%            ║
║                                                          ║
║ CLOUD & INFRASTRUCTURE                                   ║
║ ├─ AWS/GCP/Azure           ████████████ 88%            ║
║ ├─ Kubernetes/Docker       ████████████ 90%            ║
║ ├─ Terraform/IaC           ████████████ 85%            ║
║ └─ CI/CD Pipelines         ████████████ 92%            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`;
    },
    description: 'Display technical skills',
  },

  veritas: {
    handler: async () => {
      return `
╔══════════════════════════════════════════════════════════╗
║                      VERITAS                             ║
║              "Truth in Digital Form"                     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  In the intersection of consciousness and code,          ║
║  where thoughts become electrons and ideas manifest      ║
║  as algorithms, we find the essence of digital truth.    ║
║                                                          ║
║  Every system we build is a reflection of our           ║
║  understanding, every bug a lesson in humility,         ║
║  every elegant solution a glimpse of deeper patterns.    ║
║                                                          ║
║  The terminal is not just an interface—                 ║
║  it's a bridge between mind and machine,               ║
║  a translator of human intent into digital reality.     ║
║                                                          ║
║  Through recursive thinking and emergent design,        ║
║  we don't just write code; we cultivate digital         ║
║  ecosystems that grow, adapt, and evolve.              ║
║                                                          ║
║              — Adrian Wedd, 2024                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`;
    },
    description: 'Display philosophy statement',
  },

  history: {
    handler: async (args, terminal) => {
      const history = terminal.commandRouter.history;
      if (history.length === 0) {
        return 'No command history available.';
      }
      return history
        .map((cmd, i) => `${(history.length - i).toString().padStart(4)}  ${cmd}`)
        .join('\n');
    },
    description: 'Show command history',
  },

  uptime: {
    handler: async () => {
      const startTime = window.sessionStart || Date.now();
      const uptime = Date.now() - startTime;
      const hours = Math.floor(uptime / 3600000);
      const minutes = Math.floor((uptime % 3600000) / 60000);
      const seconds = Math.floor((uptime % 60000) / 1000);
      return `System uptime: ${hours}h ${minutes}m ${seconds}s`;
    },
    description: 'Show system uptime',
  },

  // Fun Commands
  matrix: {
    handler: async (args, terminal) => {
      terminal.ui.setTheme('matrix');
      const matrixRain = `
╔══════════════════════════════════════════════════════════╗
║  01001000 01100101 01101100 01101100 01101111           ║
║  ワ タ シ ハ マ ト リ ッ ク ス デ ス                  ║
║  The Matrix has you...                                  ║
║  Follow the white rabbit. 🐇                            ║
╚══════════════════════════════════════════════════════════╝`;
      return matrixRain;
    },
    description: 'Enter the Matrix',
  },

  boot: {
    handler: async (args, terminal) => {
      const messages = [
        '[  OK  ] Starting Neural Network Interface...',
        '[  OK  ] Loading Consciousness Drivers...',
        '[  OK  ] Mounting /dev/brain...',
        '[  OK  ] Starting Creativity Daemon...',
        '[  OK  ] Initializing Quantum Thoughts...',
        '[  OK  ] System Ready.',
      ];

      for (const msg of messages) {
        terminal.ui.addOutput(msg, 'boot-message');
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return '\n🚀 Digital Nexus Online';
    },
    description: 'Boot sequence animation',
  },

  reboot: {
    handler: async (args, terminal) => {
      terminal.ui.addOutput('Rebooting system...', 'system');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      terminal.ui.clearOutput();
      terminal.showWelcome();
      return null;
    },
    description: 'Reboot the terminal',
    aliases: ['restart'],
  },
};

/**
 * Register all core commands with the terminal
 */
export function registerCoreCommands(terminal) {
  Object.entries(coreCommands).forEach(([name, config]) => {
    terminal.commandRouter.register(name, async (args) => {
      return await config.handler(args, terminal);
    }, {
      description: config.description,
      aliases: config.aliases,
    });
  });
}

export default { coreCommands, registerCoreCommands };