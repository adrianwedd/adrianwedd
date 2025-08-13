/**
 * Effects & Theme Commands Module
 * Handles visual effects, themes, particles, and weather
 */

export class EffectsCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.particlesActive = false;
    this.particleSystem = null;
    this.weatherData = null;
    this.weatherUpdateInterval = null;
  }

  /**
   * Get command definitions
   */
  getCommands() {
    return {
      theme: {
        handler: this.handleTheme.bind(this),
        description: 'Change terminal theme',
        usage: 'theme [matrix|ocean|sunset|neon|cyberpunk|retro]',
      },

      effects: {
        handler: this.handleEffects.bind(this),
        description: 'Toggle visual effects',
        usage: 'effects [on|off|list]',
      },

      particles: {
        handler: this.handleParticles.bind(this),
        description: 'Particle effects',
        usage: 'particles [on|off|type]',
      },

      weather: {
        handler: this.handleWeather.bind(this),
        description: 'Show weather information',
        usage: 'weather [location]',
      },

      magic: {
        handler: this.handleMagic.bind(this),
        description: 'Daily magic command',
        aliases: ['daily'],
      },

      screensaver: {
        handler: this.handleScreensaver.bind(this),
        description: 'Start screensaver',
        aliases: ['ss'],
      },

      rainbow: {
        handler: this.handleRainbow.bind(this),
        description: 'Rainbow text effect',
      },
    };
  }

  /**
   * Handle theme command
   */
  async handleTheme(args) {
    const themes = [
      'matrix',
      'ocean',
      'sunset',
      'neon',
      'cyberpunk',
      'retro',
      'minimal',
      'dracula',
    ];
    const theme = args[0];

    if (!theme) {
      return `
╔══════════════════════════════════════════════════════════╗
║                    TERMINAL THEMES                       ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Current: ${this.terminal.ui.currentTheme.padEnd(46)}║
║                                                          ║
║  Available Themes:                                       ║
║    • matrix    - Classic green terminal                 ║
║    • ocean     - Deep blue waters                       ║
║    • sunset    - Warm orange glow                       ║
║    • neon      - Bright pink cyberpunk                  ║
║    • cyberpunk - Dark future aesthetic                  ║
║    • retro     - 80s computer terminal                  ║
║    • minimal   - Clean and simple                       ║
║    • dracula   - Dark purple theme                      ║
║                                                          ║
║  Usage: theme <name>                                    ║
╚══════════════════════════════════════════════════════════╝`;
    }

    if (!themes.includes(theme)) {
      return `❌ Unknown theme: ${theme}\nAvailable: ${themes.join(', ')}`;
    }

    // Extended theme configurations
    const extendedThemes = {
      cyberpunk: {
        '--primary-color': '#ff0080',
        '--bg-color': '#0a0014',
        '--text-color': '#ff0080',
        '--secondary-color': '#00ffff',
      },
      retro: {
        '--primary-color': '#ffaa00',
        '--bg-color': '#2a2a2a',
        '--text-color': '#ffaa00',
        '--secondary-color': '#ff5500',
      },
      minimal: {
        '--primary-color': '#ffffff',
        '--bg-color': '#000000',
        '--text-color': '#ffffff',
        '--secondary-color': '#888888',
      },
      dracula: {
        '--primary-color': '#bd93f9',
        '--bg-color': '#282a36',
        '--text-color': '#f8f8f2',
        '--secondary-color': '#6272a4',
      },
    };

    // Apply extended theme if available
    if (extendedThemes[theme]) {
      const root = document.documentElement;
      Object.entries(extendedThemes[theme]).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      this.terminal.ui.currentTheme = theme;
      localStorage.setItem('terminal-theme', theme);
    } else {
      // Use built-in theme
      this.terminal.ui.setTheme(theme);
    }

    // Add theme transition effect
    this.playThemeTransition();

    return `✨ Theme changed to: ${theme}`;
  }

  /**
   * Handle effects command
   */
  async handleEffects(args) {
    const action = args[0] || 'status';

    switch (action) {
      case 'on':
        this.terminal.state.updateState('ui', 'animationsEnabled', true);
        this.terminal.state.updateState('features', 'effectsEnabled', true);
        return '✨ Visual effects enabled';

      case 'off':
        this.terminal.state.updateState('ui', 'animationsEnabled', false);
        this.terminal.state.updateState('features', 'effectsEnabled', false);
        if (this.particlesActive) {
          this.stopParticles();
        }
        return '✨ Visual effects disabled';

      case 'list':
        return `
Available Effects:
  • particles  - Floating particles
  • rainbow    - Rainbow text
  • glitch     - Glitch effect
  • matrix     - Matrix rain
  • screensaver - Animated screensaver
  • shake      - Screen shake
  • pulse      - Pulsing glow`;

      case 'status':
      default: {
        const effectsEnabled = this.terminal.state.getState('features', 'effectsEnabled');
        return `Effects: ${effectsEnabled ? 'ON' : 'OFF'}\nParticles: ${this.particlesActive ? 'ON' : 'OFF'}`;
      }
    }
  }

  /**
   * Handle particles command
   */
  async handleParticles(args) {
    const action = args[0] || 'toggle';

    switch (action) {
      case 'on':
        return this.startParticles(args[1]);
      case 'off':
        return this.stopParticles();
      case 'toggle':
        return this.particlesActive ? this.stopParticles() : this.startParticles();
      default:
        // Treat as particle type
        return this.startParticles(action);
    }
  }

  /**
   * Start particle effects
   */
  async startParticles(type = 'stars') {
    if (this.particlesActive) {
      this.stopParticles();
    }

    try {
      // Dynamically import particle effects if needed
      if (!this.particleSystem) {
        const { ParticleEffects } = await import('../../particle-effects.js');
        this.particleSystem = new ParticleEffects();
      }

      this.particleSystem.start(type);
      this.particlesActive = true;

      return `✨ ${type} particles activated`;
    } catch (error) {
      console.error('Failed to start particles:', error);
      return '❌ Particle system unavailable';
    }
  }

  /**
   * Stop particle effects
   */
  stopParticles() {
    if (this.particleSystem) {
      this.particleSystem.stop();
    }
    this.particlesActive = false;
    return '✨ Particles deactivated';
  }

  /**
   * Handle weather command
   */
  async handleWeather(args) {
    const location = args.join(' ') || 'Tasmania';
    const loading = this.terminal.ui.showLoading(`Fetching weather for ${location}...`);

    try {
      const weather = await this.terminal.integrations.fetchWeatherData(location);
      loading.stop();

      if (!weather) {
        return '❌ Weather data unavailable';
      }

      return `
╔══════════════════════════════════════════════════════════╗
║                     WEATHER REPORT                       ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Location: ${weather.location.padEnd(45)}║
║                                                          ║
║  ${weather.icon}  ${weather.condition.padEnd(50)}║
║                                                          ║
║  Temperature: ${weather.temperature}°C                                  ║
║  Humidity:    ${weather.humidity}%                                     ║
║  Wind Speed:  ${weather.windSpeed} km/h                                ║
║                                                          ║
║  Last Updated: ${new Date(weather.timestamp).toLocaleTimeString()}                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`;
    } catch (error) {
      loading.stop();
      return `❌ Failed to fetch weather: ${error.message}`;
    }
  }

  /**
   * Handle magic/daily command
   */
  async handleMagic() {
    const loading = this.terminal.ui.showLoading('Summoning daily magic...');

    try {
      // Fetch daily content
      const response = await fetch('/assets/daily-magic.json');
      const magicData = await response.json();

      loading.stop();

      const today = new Date().toDateString();
      const todaysMagic = magicData.daily[new Date().getDay()];

      return `
╔══════════════════════════════════════════════════════════╗
║                    ✨ DAILY MAGIC ✨                     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ${today.padEnd(55)}║
║                                                          ║
║  Today's Theme: ${todaysMagic.theme.padEnd(40)}║
║                                                          ║
║  Quote:                                                  ║
║  "${todaysMagic.quote}"
║     - ${todaysMagic.author.padEnd(49)}║
║                                                          ║
║  Challenge: ${todaysMagic.challenge.padEnd(44)}║
║                                                          ║
║  Lucky Command: ${todaysMagic.command.padEnd(40)}║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`;
    } catch {
      loading.stop();

      // Fallback magic
      const quotes = [
        { text: 'Code is poetry written in logic', author: 'Unknown' },
        { text: 'Bugs are just features in disguise', author: 'Developer Wisdom' },
        { text: "There is no cloud, just someone else's computer", author: 'Tech Truth' },
      ];

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      return `
✨ Today's Magic ✨
"${randomQuote.text}"
    - ${randomQuote.author}

Lucky number: ${Math.floor(Math.random() * 100)}
Try command: ${['matrix', 'particles', 'music'][Math.floor(Math.random() * 3)]}`;
    }
  }

  /**
   * Handle screensaver command
   */
  async handleScreensaver() {
    this.terminal.ui.addOutput('Starting screensaver... Press any key to exit', 'info');

    // Create screensaver overlay
    const overlay = document.createElement('div');
    overlay.className = 'screensaver-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: black;
      z-index: 9999;
      cursor: none;
    `;

    document.body.appendChild(overlay);

    // Animated text
    const text = document.createElement('div');
    text.textContent = 'ADRIAN.WEDD';
    text.style.cssText = `
      position: absolute;
      color: #00ff00;
      font-size: 3em;
      font-family: monospace;
      animation: bounce 3s infinite;
    `;
    overlay.appendChild(text);

    // Random position animation
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    let dx = 2;
    let dy = 2;

    const animate = () => {
      x += dx;
      y += dy;

      if (x <= 0 || x >= window.innerWidth - 200) dx = -dx;
      if (y <= 0 || y >= window.innerHeight - 50) dy = -dy;

      text.style.left = x + 'px';
      text.style.top = y + 'px';

      if (overlay.parentNode) {
        requestAnimationFrame(animate);
      }
    };

    animate();

    // Exit on any key
    const exitHandler = () => {
      overlay.remove();
      document.removeEventListener('keydown', exitHandler);
      document.removeEventListener('click', exitHandler);
    };

    document.addEventListener('keydown', exitHandler);
    document.addEventListener('click', exitHandler);

    return null; // No additional output
  }

  /**
   * Handle rainbow text effect
   */
  async handleRainbow(args) {
    const text = args.join(' ') || 'RAINBOW TEXT';
    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];

    let output = '';
    for (let i = 0; i < text.length; i++) {
      const color = colors[i % colors.length];
      output += `<span style="color: ${color}">${text[i]}</span>`;
    }

    this.terminal.ui.addOutput(output, 'rainbow-text', { isHTML: true });
    return null;
  }

  /**
   * Play theme transition effect
   */
  playThemeTransition() {
    const terminal = document.getElementById('terminal') || document.querySelector('.terminal');
    if (terminal) {
      terminal.style.transition = 'all 0.5s ease';
      terminal.style.transform = 'scale(0.98)';
      setTimeout(() => {
        terminal.style.transform = 'scale(1)';
      }, 100);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.particlesActive) {
      this.stopParticles();
    }
    if (this.weatherUpdateInterval) {
      clearInterval(this.weatherUpdateInterval);
    }
  }
}

/**
 * Register effects commands with terminal
 */
export function registerEffectsCommands(terminal) {
  const effectsCommands = new EffectsCommands(terminal);
  const commands = effectsCommands.getCommands();

  Object.entries(commands).forEach(([name, config]) => {
    terminal.commandRouter.register(name, config.handler, {
      description: config.description,
      usage: config.usage,
      aliases: config.aliases,
      module: 'effects',
    });
  });

  // Store effects commands instance
  terminal.effectsCommands = effectsCommands;

  return effectsCommands;
}

export default { EffectsCommands, registerEffectsCommands };
