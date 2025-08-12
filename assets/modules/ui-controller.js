/**
 * UI Controller Module
 * Manages terminal UI elements, output, and visual effects
 */

export class UIController {
  constructor(options = {}) {
    this.outputElement = options.outputElement || document.getElementById('output');
    this.inputElement = options.inputElement || document.getElementById('cli-input');
    this.promptElement = options.promptElement || document.getElementById('prompt');
    
    this.currentTheme = 'matrix';
    this.outputBuffer = [];
    this.maxOutputLines = 1000;
    this.isAnimating = false;
  }

  /**
   * Initialize UI elements
   */
  init() {
    this.setupTheme();
    this.setupScrollBehavior();
    this.clearOutput();
  }

  /**
   * Add output to terminal
   */
  addOutput(text, className = '', options = {}) {
    const outputDiv = document.createElement('div');
    outputDiv.className = `output-line ${className}`;
    
    if (options.isHTML) {
      outputDiv.innerHTML = text;
    } else {
      outputDiv.textContent = text;
    }
    
    if (options.animate) {
      this.animateText(outputDiv, text);
    } else {
      this.outputElement.appendChild(outputDiv);
    }
    
    this.trimOutput();
    this.scrollToBottom();
    
    return outputDiv;
  }

  /**
   * Add command line to output
   */
  addCommandLine(command) {
    const commandDiv = document.createElement('div');
    commandDiv.className = 'command-line';
    commandDiv.innerHTML = `<span class="prompt">guest@adrianwedd.com:~$</span> <span class="command">${this.escapeHtml(command)}</span>`;
    this.outputElement.appendChild(commandDiv);
    this.scrollToBottom();
  }

  /**
   * Clear terminal output
   */
  clearOutput() {
    if (this.outputElement) {
      this.outputElement.innerHTML = '';
      this.outputBuffer = [];
    }
  }

  /**
   * Animate text output character by character
   */
  async animateText(element, text, speed = 10) {
    this.isAnimating = true;
    element.textContent = '';
    this.outputElement.appendChild(element);
    
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await this.sleep(speed);
      this.scrollToBottom();
    }
    
    this.isAnimating = false;
  }

  /**
   * Stream text output
   */
  async streamText(text, className = '', chunkSize = 50) {
    const element = this.addOutput('', className);
    const chunks = this.chunkText(text, chunkSize);
    
    for (const chunk of chunks) {
      element.textContent += chunk;
      this.scrollToBottom();
      await this.sleep(20);
    }
    
    return element;
  }

  /**
   * Show loading indicator
   */
  showLoading(message = 'Processing...') {
    const loadingDiv = this.addOutput('', 'loading');
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frameIndex = 0;
    
    const interval = setInterval(() => {
      loadingDiv.textContent = `${frames[frameIndex]} ${message}`;
      frameIndex = (frameIndex + 1) % frames.length;
    }, 80);
    
    return {
      element: loadingDiv,
      stop: () => {
        clearInterval(interval);
        loadingDiv.remove();
      }
    };
  }

  /**
   * Show error message
   */
  showError(message) {
    return this.addOutput(`❌ Error: ${message}`, 'error');
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    return this.addOutput(`✅ ${message}`, 'success');
  }

  /**
   * Show info message
   */
  showInfo(message) {
    return this.addOutput(`ℹ️ ${message}`, 'info');
  }

  /**
   * Setup theme
   */
  setupTheme() {
    const savedTheme = localStorage.getItem('terminal-theme') || 'matrix';
    this.setTheme(savedTheme);
  }

  /**
   * Set terminal theme
   */
  setTheme(theme) {
    const root = document.documentElement;
    const themes = {
      matrix: {
        '--primary-color': '#00ff00',
        '--bg-color': '#0a0a0a',
        '--text-color': '#00ff00',
        '--secondary-color': '#008800'
      },
      ocean: {
        '--primary-color': '#00ccff',
        '--bg-color': '#001525',
        '--text-color': '#00ccff',
        '--secondary-color': '#0066aa'
      },
      sunset: {
        '--primary-color': '#ff6b35',
        '--bg-color': '#1a0f0a',
        '--text-color': '#ff6b35',
        '--secondary-color': '#cc4422'
      },
      neon: {
        '--primary-color': '#ff00ff',
        '--bg-color': '#0a0015',
        '--text-color': '#ff00ff',
        '--secondary-color': '#aa00aa'
      }
    };
    
    const themeColors = themes[theme] || themes.matrix;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    this.currentTheme = theme;
    localStorage.setItem('terminal-theme', theme);
  }

  /**
   * Scroll to bottom of output
   */
  scrollToBottom() {
    if (this.outputElement) {
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
  }

  /**
   * Setup scroll behavior
   */
  setupScrollBehavior() {
    if (this.outputElement) {
      this.outputElement.style.scrollBehavior = 'smooth';
    }
  }

  /**
   * Trim output to max lines
   */
  trimOutput() {
    const lines = this.outputElement.querySelectorAll('.output-line, .command-line');
    if (lines.length > this.maxOutputLines) {
      const toRemove = lines.length - this.maxOutputLines;
      for (let i = 0; i < toRemove; i++) {
        lines[i].remove();
      }
    }
  }

  /**
   * Focus input
   */
  focusInput() {
    if (this.inputElement) {
      this.inputElement.focus();
    }
  }

  /**
   * Get input value
   */
  getInputValue() {
    return this.inputElement?.value || '';
  }

  /**
   * Set input value
   */
  setInputValue(value) {
    if (this.inputElement) {
      this.inputElement.value = value;
    }
  }

  /**
   * Clear input
   */
  clearInput() {
    this.setInputValue('');
  }

  /**
   * Utility: Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Utility: Chunk text
   */
  chunkText(text, size) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Utility: Sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create ASCII art banner
   */
  createBanner(text) {
    return `
╔${'═'.repeat(text.length + 2)}╗
║ ${text} ║
╚${'═'.repeat(text.length + 2)}╝`;
  }

  /**
   * Show formatted table
   */
  showTable(headers, rows) {
    const maxLengths = headers.map((h, i) => 
      Math.max(h.length, ...rows.map(r => String(r[i]).length))
    );
    
    const separator = '+' + maxLengths.map(l => '-'.repeat(l + 2)).join('+') + '+';
    const headerRow = '|' + headers.map((h, i) => ` ${h.padEnd(maxLengths[i])} `).join('|') + '|';
    
    let table = separator + '\n' + headerRow + '\n' + separator;
    
    rows.forEach(row => {
      const dataRow = '|' + row.map((cell, i) => 
        ` ${String(cell).padEnd(maxLengths[i])} `
      ).join('|') + '|';
      table += '\n' + dataRow;
    });
    
    table += '\n' + separator;
    
    return this.addOutput(table, 'table');
  }
}

export default UIController;