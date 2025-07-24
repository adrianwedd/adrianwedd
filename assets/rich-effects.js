class RichEffects {
    constructor(terminal) {
        this.terminal = terminal;
        this.progressBars = new Map();
        this.spinners = new Map();
        this.panels = new Map();
    }

    // Progress bar with percentage and styling
    createProgressBar(id, label, total = 100, style = 'default') {
        const progressData = {
            id,
            label,
            current: 0,
            total,
            style,
            element: null,
            startTime: Date.now()
        };
        
        this.progressBars.set(id, progressData);
        this.renderProgressBar(progressData);
        return progressData;
    }

    updateProgress(id, current) {
        const progress = this.progressBars.get(id);
        if (!progress) return;
        
        progress.current = Math.min(current, progress.total);
        this.renderProgressBar(progress);
        
        if (progress.current >= progress.total) {
            // Auto-cleanup completed progress bars after 2 seconds
            setTimeout(() => this.removeProgressBar(id), 2000);
        }
    }

    renderProgressBar(progress) {
        const percentage = Math.round((progress.current / progress.total) * 100);
        const barWidth = 30;
        const filledWidth = Math.round((percentage / 100) * barWidth);
        const emptyWidth = barWidth - filledWidth;
        
        // Different styles for progress bars
        const styles = {
            default: { fill: '█', empty: '░', color: 'success' },
            cyber: { fill: '▰', empty: '▱', color: 'info' },
            retro: { fill: '■', empty: '□', color: 'success' },
            minimal: { fill: '━', empty: '┅', color: 'info' }
        };
        
        const style = styles[progress.style] || styles.default;
        const bar = style.fill.repeat(filledWidth) + style.empty.repeat(emptyWidth);
        
        // Calculate ETA
        const elapsed = Date.now() - progress.startTime;
        const rate = progress.current / elapsed;
        const remaining = progress.total - progress.current;
        const eta = remaining > 0 ? Math.round(remaining / rate / 1000) : 0;
        
        const progressLine = `${progress.label} [${bar}] ${percentage}%${eta > 0 ? ` ETA: ${eta}s` : ' Complete!'}`;
        
        if (progress.element) {
            // Update existing element
            progress.element.textContent = progressLine;
        } else {
            // Create new element
            this.terminal.addOutput(progressLine, style.color);
            const outputs = document.querySelectorAll('.output-line');
            progress.element = outputs[outputs.length - 1];
        }
    }

    removeProgressBar(id) {
        const progress = this.progressBars.get(id);
        if (progress && progress.element) {
            progress.element.style.opacity = '0.5';
            setTimeout(() => {
                if (progress.element && progress.element.parentNode) {
                    progress.element.remove();
                }
            }, 1000);
        }
        this.progressBars.delete(id);
    }

    // Animated spinners for loading states
    createSpinner(id, message, type = 'dots') {
        const spinnerData = {
            id,
            message,
            type,
            element: null,
            interval: null,
            frame: 0
        };
        
        this.spinners.set(id, spinnerData);
        this.startSpinner(spinnerData);
        return spinnerData;
    }

    startSpinner(spinner) {
        const spinnerTypes = {
            dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
            line: ['|', '/', '-', '\\'],
            arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
            box: ['▖', '▘', '▝', '▗'],
            bounce: ['⠁', '⠂', '⠄', '⠂'],
            pulse: ['●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◘']
        };
        
        const frames = spinnerTypes[spinner.type] || spinnerTypes.dots;
        
        // Add initial spinner line
        this.terminal.addOutput(`${frames[0]} ${spinner.message}`, 'info');
        const outputs = document.querySelectorAll('.output-line');
        spinner.element = outputs[outputs.length - 1];
        
        spinner.interval = setInterval(() => {
            spinner.frame = (spinner.frame + 1) % frames.length;
            if (spinner.element) {
                spinner.element.textContent = `${frames[spinner.frame]} ${spinner.message}`;
            }
        }, 100);
    }

    stopSpinner(id, finalMessage = null) {
        const spinner = this.spinners.get(id);
        if (!spinner) return;
        
        if (spinner.interval) {
            clearInterval(spinner.interval);
        }
        
        if (spinner.element && finalMessage) {
            spinner.element.textContent = `✓ ${finalMessage}`;
            spinner.element.className += ' success';
        }
        
        this.spinners.delete(id);
    }

    // Rich panels with borders and styling
    createPanel(title, content, style = 'default') {
        const styles = {
            default: {
                topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
                horizontal: '─', vertical: '│', color: 'info'
            },
            double: {
                topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
                horizontal: '═', vertical: '║', color: 'success'
            },
            rounded: {
                topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
                horizontal: '─', vertical: '│', color: 'info'
            },
            thick: {
                topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛',
                horizontal: '━', vertical: '┃', color: 'success'
            }
        };
        
        const s = styles[style] || styles.default;
        const contentLines = Array.isArray(content) ? content : [content];
        const maxWidth = Math.max(title.length, ...contentLines.map(line => line.length)) + 4;
        
        // Top border
        const topBorder = s.topLeft + title.padEnd(maxWidth - 2, s.horizontal) + s.topRight;
        this.terminal.addOutput(topBorder, s.color);
        
        // Content lines
        contentLines.forEach(line => {
            const paddedLine = s.vertical + ' ' + line.padEnd(maxWidth - 4) + ' ' + s.vertical;
            this.terminal.addOutput(paddedLine, s.color);
        });
        
        // Bottom border
        const bottomBorder = s.bottomLeft + s.horizontal.repeat(maxWidth - 2) + s.bottomRight;
        this.terminal.addOutput(bottomBorder, s.color);
    }

    // Animated text effects
    async typeText(text, className = 'info', speed = 50) {
        const element = document.createElement('div');
        element.className = `output-line ${className}`;
        
        const terminal = document.getElementById('terminal');
        const promptLine = terminal.querySelector('.prompt-line');
        terminal.insertBefore(element, promptLine);
        
        for (let i = 0; i <= text.length; i++) {
            element.textContent = text.substring(0, i) + (i < text.length ? '█' : '');
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        
        element.textContent = text;
    }

    // Matrix-style text reveal
    async matrixReveal(text, className = 'success', duration = 2000) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const element = document.createElement('div');
        element.className = `output-line ${className}`;
        
        const terminal = document.getElementById('terminal');
        const promptLine = terminal.querySelector('.prompt-line');
        terminal.insertBefore(element, promptLine);
        
        const steps = 20;
        const stepDuration = duration / steps;
        
        for (let step = 0; step <= steps; step++) {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                if (step / steps > i / text.length) {
                    result += text[i];
                } else {
                    result += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            element.textContent = result;
            await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
        
        element.textContent = text;
    }

    // Rainbow text animation
    rainbowText(text) {
        const colors = ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'];
        const element = document.createElement('div');
        element.className = 'output-line';
        
        let html = '';
        for (let i = 0; i < text.length; i++) {
            const color = colors[i % colors.length];
            html += `<span style="color: ${color}">${text[i]}</span>`;
        }
        element.innerHTML = html;
        
        const terminal = document.getElementById('terminal');
        const promptLine = terminal.querySelector('.prompt-line');
        terminal.insertBefore(element, promptLine);
    }

    // System info table with alignment
    createTable(headers, rows, style = 'default') {
        const styles = {
            default: { border: '│', corner: '+', horizontal: '-' },
            double: { border: '║', corner: '╬', horizontal: '═' },
            minimal: { border: ' ', corner: ' ', horizontal: ' ' }
        };
        
        const s = styles[style] || styles.default;
        
        // Calculate column widths
        const colWidths = headers.map((header, i) => {
            const maxContentWidth = Math.max(...rows.map(row => String(row[i] || '').length));
            return Math.max(header.length, maxContentWidth) + 2;
        });
        
        // Header
        const headerRow = s.border + headers.map((header, i) => 
            ` ${header.padEnd(colWidths[i] - 1)}`
        ).join(s.border) + s.border;
        this.terminal.addOutput(headerRow, 'command');
        
        // Separator
        const separator = s.corner + colWidths.map(width => 
            s.horizontal.repeat(width)
        ).join(s.corner) + s.corner;
        this.terminal.addOutput(separator, 'info');
        
        // Data rows
        rows.forEach(row => {
            const dataRow = s.border + row.map((cell, i) => 
                ` ${String(cell || '').padEnd(colWidths[i] - 1)}`
            ).join(s.border) + s.border;
            this.terminal.addOutput(dataRow, 'info');
        });
    }

    // Status indicators
    showStatus(label, status, details = '') {
        const indicators = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ',
            loading: '⟳'
        };
        
        const colors = {
            success: 'success',
            error: 'error',
            warning: 'error',
            info: 'info',
            loading: 'info'
        };
        
        const icon = indicators[status] || '•';
        const color = colors[status] || 'info';
        const message = `${icon} ${label}${details ? ': ' + details : ''}`;
        
        this.terminal.addOutput(message, color);
    }

    // Cleanup all effects
    cleanup() {
        // Stop all spinners
        for (const [id, spinner] of this.spinners) {
            this.stopSpinner(id);
        }
        
        // Clear all progress bars
        for (const id of this.progressBars.keys()) {
            this.removeProgressBar(id);
        }
        
        this.progressBars.clear();
        this.spinners.clear();
        this.panels.clear();
    }
}

// Export for use in other modules
window.RichEffects = RichEffects;