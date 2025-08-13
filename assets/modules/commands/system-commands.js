/**
 * System Monitor Commands Module
 * Handles system monitoring, processes, and performance metrics
 */

export class SystemCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.monitorActive = false;
    this.monitorInterval = null;
    this.metrics = {
      cpu: 0,
      memory: 0,
      processes: 0,
      network: { up: 0, down: 0 },
    };
  }

  /**
   * Get command definitions
   */
  getCommands() {
    return {
      monitor: {
        handler: this.handleMonitor.bind(this),
        description: 'System monitor',
        usage: 'monitor [start|stop|metrics]',
        aliases: ['mon'],
      },

      htop: {
        handler: this.handleHtop.bind(this),
        description: 'Interactive process viewer',
        aliases: ['top'],
      },

      btop: {
        handler: this.handleBtop.bind(this),
        description: 'Beautiful process viewer',
      },

      ps: {
        handler: this.handlePs.bind(this),
        description: 'List processes',
        usage: 'ps [all|filter]',
      },

      split: {
        handler: this.handleSplit.bind(this),
        description: 'Split screen monitor',
      },

      metrics: {
        handler: this.handleMetrics.bind(this),
        description: 'Show system metrics',
      },

      'exit-monitor': {
        handler: this.exitMonitor.bind(this),
        description: 'Exit monitor mode',
        aliases: ['q'],
      },
    };
  }

  /**
   * Handle monitor command
   */
  async handleMonitor(args) {
    const action = args[0] || 'start';

    switch (action) {
      case 'start':
        return this.startMonitor();
      case 'stop':
        return this.stopMonitor();
      case 'metrics':
        return this.showMetrics();
      default:
        return 'Usage: monitor [start|stop|metrics]';
    }
  }

  /**
   * Start system monitor
   */
  startMonitor() {
    if (this.monitorActive) {
      return '📊 Monitor is already running';
    }

    this.monitorActive = true;
    this.terminal.state.updateState('features', 'monitorActive', true);

    // Start updating metrics
    this.monitorInterval = setInterval(() => {
      this.updateMetrics();
    }, 1000);

    this.terminal.ui.addOutput(
      `
╔══════════════════════════════════════════════════════════╗
║                   SYSTEM MONITOR                         ║
╠══════════════════════════════════════════════════════════╣
║  Monitoring system resources...                          ║
║  Press 'q' or type 'exit-monitor' to quit               ║
╚══════════════════════════════════════════════════════════╝`,
      'monitor-header'
    );

    // Show initial metrics
    setTimeout(() => this.displayMetrics(), 100);

    return null; // Don't return additional text
  }

  /**
   * Stop system monitor
   */
  stopMonitor() {
    if (!this.monitorActive) {
      return '⏸️ Monitor is not running';
    }

    this.monitorActive = false;
    this.terminal.state.updateState('features', 'monitorActive', false);

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    return '📊 Monitor stopped';
  }

  /**
   * Exit monitor (alias for stop)
   */
  exitMonitor() {
    return this.stopMonitor();
  }

  /**
   * Handle htop command
   */
  async handleHtop() {
    const processes = this.getProcessList();

    let output = '╔══════════════════════════════════════════════════════════╗\n';
    output += '║                      HTOP                                ║\n';
    output += '╠═══════╤═══════════════════╤════════╤════════╤══════════╣\n';
    output += '║  PID  │      PROCESS      │  CPU % │  MEM % │  STATUS  ║\n';
    output += '╠═══════╪═══════════════════╪════════╪════════╪══════════╣\n';

    processes.forEach((proc) => {
      const pid = proc.pid.toString().padEnd(5);
      const name = proc.name.substring(0, 17).padEnd(17);
      const cpu = proc.cpu.toFixed(1).padStart(6);
      const mem = proc.memory.toFixed(1).padStart(6);
      const status = proc.status.padEnd(8);
      output += `║ ${pid} │ ${name} │ ${cpu} │ ${mem} │ ${status} ║\n`;
    });

    output += '╚═══════╧═══════════════════╧════════╧════════╧══════════╝\n';
    output += '\nPress q to quit | F6 Sort | F9 Kill | F10 Quit';

    return output;
  }

  /**
   * Handle btop command
   */
  async handleBtop() {
    const cpu = Math.random() * 100;
    const mem = Math.random() * 100;
    const disk = Math.random() * 100;
    const net = Math.random() * 1000;

    return `
╔══════════════════════════════════════════════════════════╗
║                      BTOP++                              ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  CPU  [${this.createBar(cpu, 40)}] ${cpu.toFixed(1)}%
║  MEM  [${this.createBar(mem, 40)}] ${mem.toFixed(1)}%
║  DISK [${this.createBar(disk, 40)}] ${disk.toFixed(1)}%
║  NET  ↓${net.toFixed(0)} KB/s ↑${(net * 0.3).toFixed(0)} KB/s
║                                                          ║
║  ┌─ Processes ─────────────────────────────────────┐    ║
║  │ chrome     : 45.2% CPU, 2.1 GB RAM             │    ║
║  │ node       : 12.3% CPU, 512 MB RAM             │    ║
║  │ terminal   : 8.7% CPU, 128 MB RAM              │    ║
║  │ system     : 5.2% CPU, 256 MB RAM              │    ║
║  └──────────────────────────────────────────────────┘    ║
║                                                          ║
║  Uptime: ${this.getUptime()}                            ║
║  Load: 2.1 1.8 1.6                                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Handle ps command
   */
  async handlePs(args) {
    const filter = args[0];
    let processes = this.getProcessList();

    if (filter && filter !== 'all') {
      processes = processes.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()));
    }

    const headers = ['PID', 'TTY', 'TIME', 'CMD'];
    const rows = processes.map((p) => [p.pid, 'pts/0', this.formatTime(p.time), p.name]);

    this.terminal.ui.showTable(headers, rows);
    return '';
  }

  /**
   * Handle split screen monitor
   */
  async handleSplit() {
    return `
╔══════════════════════╤══════════════════════╗
║    CPU USAGE         │    MEMORY USAGE      ║
║  [████████░░░░░░] 45%│  [██████░░░░░░░░] 38%║
╠══════════════════════╪══════════════════════╣
║    NETWORK I/O       │    DISK I/O          ║
║  ↓ 1.2 MB/s         │  R: 5.3 MB/s        ║
║  ↑ 0.3 MB/s         │  W: 2.1 MB/s        ║
╠══════════════════════╧══════════════════════╣
║           ACTIVE PROCESSES: 142              ║
║           SYSTEM LOAD: 1.8                   ║
║           UPTIME: ${this.getUptime().padEnd(27)}║
╚══════════════════════════════════════════════╝

Type 'q' to exit split view`;
  }

  /**
   * Handle metrics command
   */
  async handleMetrics() {
    return this.showMetrics();
  }

  /**
   * Show current metrics
   */
  showMetrics() {
    this.updateMetrics();

    return `
╔══════════════════════════════════════════════════════════╗
║                   SYSTEM METRICS                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  CPU Usage:      ${this.metrics.cpu.toFixed(1)}%                                     ║
║  Memory Usage:   ${this.metrics.memory.toFixed(1)}%                                     ║
║  Processes:      ${this.metrics.processes}                                        ║
║  Network:        ↓${this.metrics.network.down} KB/s ↑${this.metrics.network.up} KB/s              ║
║                                                          ║
║  Browser:        ${navigator.userAgent.substring(0, 35)}...
║  Platform:       ${navigator.platform.padEnd(40)}║
║  Cores:          ${navigator.hardwareConcurrency || 'Unknown'}                                       ║
║  Memory:         ${this.getMemoryInfo()}                              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`;
  }

  /**
   * Update metrics (simulated)
   */
  updateMetrics() {
    // Simulate metrics with some randomness
    this.metrics.cpu = Math.min(100, Math.max(0, this.metrics.cpu + (Math.random() - 0.5) * 20));
    this.metrics.memory = Math.min(
      100,
      Math.max(0, this.metrics.memory + (Math.random() - 0.5) * 10)
    );
    this.metrics.processes = Math.floor(100 + Math.random() * 50);
    this.metrics.network.down = Math.floor(Math.random() * 1000);
    this.metrics.network.up = Math.floor(Math.random() * 500);
  }

  /**
   * Display live metrics
   */
  displayMetrics() {
    if (!this.monitorActive) return;

    const output = `
CPU:  [${this.createBar(this.metrics.cpu, 30)}] ${this.metrics.cpu.toFixed(1)}%
MEM:  [${this.createBar(this.metrics.memory, 30)}] ${this.metrics.memory.toFixed(1)}%
PROC: ${this.metrics.processes} active
NET:  ↓${this.metrics.network.down} KB/s ↑${this.metrics.network.up} KB/s`;

    this.terminal.ui.addOutput(output, 'monitor-metrics');
  }

  /**
   * Get process list (simulated)
   */
  getProcessList() {
    const processes = [
      { pid: 1, name: 'systemd', cpu: 0.1, memory: 0.5, status: 'running', time: 3600000 },
      { pid: 142, name: 'chrome', cpu: 45.2, memory: 32.1, status: 'running', time: 1800000 },
      { pid: 256, name: 'node', cpu: 12.3, memory: 8.5, status: 'running', time: 900000 },
      { pid: 512, name: 'terminal', cpu: 8.7, memory: 2.1, status: 'running', time: 60000 },
      { pid: 1024, name: 'vscode', cpu: 15.3, memory: 12.8, status: 'sleeping', time: 7200000 },
    ];

    // Add some random processes
    for (let i = 0; i < 5; i++) {
      processes.push({
        pid: 2000 + i,
        name: ['bash', 'ssh', 'git', 'npm', 'python'][i],
        cpu: Math.random() * 5,
        memory: Math.random() * 2,
        status: Math.random() > 0.5 ? 'running' : 'sleeping',
        time: Math.random() * 3600000,
      });
    }

    return processes;
  }

  /**
   * Create a progress bar
   */
  createBar(value, width = 20) {
    const filled = Math.floor((value / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Format time in HH:MM:SS
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  /**
   * Get system uptime
   */
  getUptime() {
    const uptime = Date.now() - (window.sessionStart || Date.now());
    return this.formatTime(uptime);
  }

  /**
   * Get memory info
   */
  getMemoryInfo() {
    if (performance.memory) {
      const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
      return `${used}MB / ${total}MB`;
    }
    return 'Not available';
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopMonitor();
  }
}

/**
 * Register system commands with terminal
 */
export function registerSystemCommands(terminal) {
  const systemCommands = new SystemCommands(terminal);
  const commands = systemCommands.getCommands();

  Object.entries(commands).forEach(([name, config]) => {
    terminal.commandRouter.register(name, config.handler, {
      description: config.description,
      usage: config.usage,
      aliases: config.aliases,
      module: 'system',
    });
  });

  // Store system commands instance
  terminal.systemCommands = systemCommands;

  return systemCommands;
}

export default { SystemCommands, registerSystemCommands };
