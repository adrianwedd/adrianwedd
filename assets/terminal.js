// Sentry initialization temporarily removed for compatibility
// TODO: Add proper module system or CDN loading for Sentry

class Terminal {
    constructor() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.maxHistorySize = 1000;
        this.historySearchMode = false;
        this.historySearchTerm = '';
        this.filteredHistory = [];
        this.currentPath = '~';
        this.musicPlayer = new RetroMusicPlayer();
        this.inChatMode = false;
        this.chatSessionId = null;
        this.systemMonitor = new SystemMonitor();
        this.textStreamer = new TextStreamer();
        this.aiResponses = null;
        this.terminalLines = [];
        this.maxLines = 50; // Maximum lines to keep in terminal
        
        // Initialize AI service for advanced prompt caching
        this.aiService = new AIService();
        
        // Theme system
        this.currentTheme = localStorage.getItem('terminal-theme') || 'matrix';
        this.availableThemes = ['matrix', 'cyberpunk', 'amber', 'synthwave'];
        
        // Initialize voice interface
        this.voiceInterface = null;
        this.voiceEnabled = false;
        
        // Initialize markdown loader for content
        this.markdownLoader = new MarkdownLoader();
        
        // Initialize GitHub task manager
        this.githubTaskManager = new GitHubTaskManager();
        
        // Initialize GitHub Actions manager
        this.githubActionsManager = new GitHubActionsManager();
        
        // Initialize particle effects system
        this.particleEffects = new ParticleEffects();
        
        // Initialize enhanced research streamer
        this.researchStreamer = null;
        this.initResearchStreamer();
        
        // Matrix rain state
        this.matrixInterval = null;
        
        // Command completion state
        this.availableCommands = [
            'about', 'actions', 'adrian', 'boot', 'cache', 'cat', 'chat', 'clear', 'effects', 'gemini', 'gh-create', 'gh-list', 'gh-sync', 'grep', 'help', 'history', 'home', 'ls', 'magic', 'matrix',
            'monitor', 'music', 'neofetch', 'particles', 'projects', 'ps', 'pwd', 'reboot', 'research', 'runs',
            'skills', 'speak', 'split', 'stop', 'tail', 'tokens', 'trigger', 'uptime', 'veritas', 'voice',
            'volume', 'weather', 'whoami', 'theme'
        ];
        this.completionIndex = -1;
        this.lastInput = '';
        this.currentTheme = 'default'; // Default theme
        
        this.init();
        this.loadHistoryFromStorage();
    }

    init() {
        const input = document.getElementById('commandInput');
        if (!input) {
            console.error('Command input element not found');
            return;
        }
        
        input.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Initialize chat - only if element exists
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keydown', this.handleChatKeydown.bind(this));
        }
        
        // Matrix rain effect
        this.createMatrixRain();
        
        // Focus input and scroll to top
        input.focus();
        this.scrollToTop();

        // Load AI responses from GitHub
        this.loadAIResponses();
        
        // Initialize voice interface
        this.initVoiceInterface();
        
        // Set up terminal-style input focus
        this.setupTerminalFocus();

        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Start boot sequence
        this.startBootSequence();
    }

    handleKeydown(event) {
        const input = event.target;
        
        // Handle Ctrl+C to exit chat mode
        if (event.ctrlKey && event.key === 'c') {
            if (this.inChatMode) {
                this.exitChatMode();
                event.preventDefault();
                return;
            }
        }
        
        if (event.key === 'Tab') {
            event.preventDefault();
            this.handleTabCompletion(input);
        } else if (event.key === 'Enter') {
            const command = input.value.trim();
            if (command) {
                if (this.inChatMode) {
                    this.handleChatMessage(command);
                } else {
                    this.executeCommand(command);
                    this.commandHistory.push(command);
                    this.historyIndex = this.commandHistory.length;
                }
            }
            input.value = '';
            this.resetCompletion();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                input.value = this.commandHistory[this.historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                input.value = '';
            }
        } else {
            // Reset completion on any other key
            this.resetCompletion();
        }
    }

    executeCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        this.addOutput(`$ ${command}`, 'prompt');

        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'about':
                this.showMarkdownContent('about');
                break;
            case 'projects':
                this.showMarkdownContent('projects');
                break;
            case 'skills':
                this.showMarkdownContent('skills');
                break;
            case 'home':
                this.showMarkdownContent('home');
                break;
            case 'veritas':
                this.showMarkdownContent('veritas');
                break;
            case 'chat':
                this.openChat();
                break;
            case 'matrix':
                this.toggleMatrixRain();
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'ls':
                this.listDirectory();
                break;
            case 'whoami':
                this.addOutput('adrian - Recursive Systems Architect & Off-Grid Permanaut', 'success');
                break;
            case 'pwd':
                this.addOutput(`/home/adrian/tasmania${this.currentPath}`, 'info');
                break;
            case 'uptime':
                this.showUptime();
                break;
            case 'magic':
                this.showDailyMagic();
                break;
            case 'weather':
                this.showWeather();
                break;
            case 'theme':
                this.handleThemeCommand(args);
                break;
            case 'effects':
            case 'particles':
                this.handleParticleEffects(parts.slice(1));
                break;
            case 'history':
                this.showHistory(parts.slice(1));
                break;
            case 'actions':
                this.handleActionsCommand(parts.slice(1));
                break;
            case 'trigger':
                this.handleTriggerCommand(parts.slice(1));
                break;
            case 'runs':
                this.handleRunsCommand(parts.slice(1));
                break;
            case 'ps':
                this.showProcesses();
                break;
            case 'neofetch':
                this.showNeofetch();
                break;
            case 'monitor':
            case 'htop':
            case 'btop':
                this.enterMonitorMode();
                break;
            case 'split':
                this.enterSplitMode();
                break;
            case 'boot':
            case 'reboot':
                this.addOutput('🔄 Restarting system...', 'info');
                this.addOutput('', 'info');
                setTimeout(() => {
                    this.startBootSequence();
                }, 500);
                break;
            case 'music':
            case 'play':
                this.handleMusicCommand(args);
                break;
            case 'stop':
                this.stopMusic();
                break;
            case 'volume':
                this.setVolume(args[0]);
                break;
            case 'shader':
                this.setShader(args[0]);
                break;
            case 'tokens':
                this.showTokenStats();
                break;
            case 'cache':
                this.handleCacheCommand(args);
                break;
            case 'voice':
                this.handleVoiceCommand(args);
                break;
            case 'speak':
                this.handleSpeakCommand(args);
                break;
            case 'research':
                this.handleResearchCommand(args);
                break;
            case 'theme':
                this.handleThemeCommand(args);
                break;
            case 'grep':
                this.handleGrepCommand(args);
                break;
            case 'tail':
                this.handleTailCommand(args);
                break;
            case 'cat':
                this.handleCatCommand(args);
                break;
            case 'gemini':
                this.showGeminiLogo();
                break;
            case 'adrian':
                this.showAdrianLogo();
                break;
            case 'sudo':
                this.addOutput('adrian is not in the sudoers file. This incident will be reported.', 'error');
                break;
            default:
                this.addOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }

        this.scrollToBottom();
    }

    addOutput(text, className = '', allowHTML = false) {
        const terminal = document.getElementById('terminal');
        const output = document.createElement('div');
        output.className = `output-line ${className}`;
        
        if (typeof text === 'string') {
            if (allowHTML) {
                output.innerHTML = text;
            } else {
                output.textContent = text;
            }
        } else {
            output.appendChild(text);
        }
        
        // Add to terminal lines array
        this.terminalLines.push({
            element: output,
            text: text,
            className: className
        });
        
        // Remove old lines if we exceed max
        if (this.terminalLines.length > this.maxLines) {
            const removedLine = this.terminalLines.shift();
            if (removedLine.element && removedLine.element.parentNode) {
                removedLine.element.remove();
            }
        }
        
        const terminalContent = terminal.querySelector('.terminal-content');
        if (terminalContent) {
            terminalContent.appendChild(output);
        } else {
            // Fallback for backwards compatibility
            const promptLine = terminal.querySelector('.prompt-line');
            terminal.insertBefore(output, promptLine);
        }
        
        // Animate the scroll effect
        this.animateTerminalScroll();
    }

    animateTerminalScroll() {
        const terminal = document.getElementById('terminal');
        const outputs = terminal.querySelectorAll('.output-line');
        
        // If we have too many lines, animate them moving up
        if (outputs.length > this.maxLines) {
            outputs.forEach((line, index) => {
                if (index < outputs.length - this.maxLines) {
                    line.style.transform = 'translateY(-100%)';
                    line.style.opacity = '0';
                    setTimeout(() => {
                        if (line.parentNode) {
                            line.remove();
                        }
                    }, 300);
                }
            });
        }
    }

    showHelp() {
        const helpLines = [
            '',
            '══════════════════════════════════════════════════════════════════════',
            '    🧠 ADRIAN.TERMINAL - Advanced Interactive Command Interface',
            '══════════════════════════════════════════════════════════════════════',
            '',
            'CORE COMMANDS',
            '    help         display this comprehensive help',
            '    about        personal information & background',
            '    projects     technical projects & repositories',
            '    skills       technical skills & expertise',
            '    home         off-grid Tasmania home details',
            '    veritas      AI safety research platform',
            '    whoami       current user information',
            '    pwd          print working directory',
            '    ls           list directory contents',
            '    cat          display file contents',
            '    grep         search files and command output',
            '    tail         show last lines of files/logs',
            '    clear        clear terminal screen',
            '    boot         restart boot sequence',
            '    uptime       show system uptime',
            '    neofetch     display system information',
            '    gemini       display GEMINI ASCII art logo',
            '    adrian       display ADRIAN ASCII art logo',
            '    ps           show running processes',
            '',
            'AI & CHAT SYSTEM',
            '    chat         enter interactive AI chat mode',
            '    tokens       AI token usage statistics & analytics',
            '    cache        manage prompt cache [clear|stats]',
            '    magic        daily Claude creativity showcase',
            '    speak        text-to-speech synthesis [text]',
            '',
            'VOICE INTERFACE 🎤',
            '    voice        voice controls [on|off|status|rate|pitch|volume]',
            '    Wake Words:  "Adrian", "Computer", "Terminal", "Hey Adrian"',
            '    Commands:    "show help", "clear screen", "show projects"',
            '    Usage:       Click "Voice Ready" → say wake word → speak command',
            '    Features:    - Speech-to-text transcription',
            '                 - Direct command execution',
            '                 - Voice transcripts → terminal input',
            '                 - Configurable voice synthesis',
            '',
            'AUDIO & VISUAL EFFECTS 🎵',
            '    music        play background music [track]',
            '    stop         stop currently playing music',
            '    volume       set music volume [0.0-1.0]',
            '    effects      particle effects [matrix|stars|rain|fireflies|neural]',
            '    matrix       toggle matrix rain effect',
            '    theme        change terminal theme [matrix|cyberpunk|amber|synthwave]',
            '',
            'AVAILABLE MUSIC TRACKS',
            '    ambient      peaceful ambient drones',
            '    cyberpunk    dark synthwave beats', 
            '    mathematical algorithmic patterns with drums',
            '    matrix       digital rain sounds',
            '    synthwave    retro 80s synthesizer',
            '',
            'PARTICLE EFFECTS SYSTEM',
            '    effects matrix on     - Start matrix digital rain',
            '    effects stars         - Twinkling starfield',
            '    effects rain          - Falling rain particles',
            '    effects fireflies     - Organic floating lights',
            '    effects neural        - Neural network visualization',
            '    effects opacity 0.5   - Set effects transparency',
            '    effects clear         - Stop all effects',
            '',
            'SYSTEM MONITORING 📊',
            '    monitor      system monitor (htop/btop style)',
            '    split        terminal + monitor split screen',
            '    weather      Tasmania weather data (BOM API)',
            '    actions      list GitHub Actions workflows',
            '    runs         show recent workflow runs',
            '    trigger      trigger GitHub Actions workflow',
            '',
            'ADVANCED FEATURES',
            '    research     stream research papers [personal|global]',
            '    theme        change terminal theme [default|cyberpunk|matrix]',
            '    Tab          autocomplete commands (fuzzy matching)',
            '    History:     ↑/↓ arrows navigate command history',
            '    Search:      history search <term>',
            '',
            'KEYBOARD SHORTCUTS',
            '    Tab          command autocomplete & cycling',
            '    ↑/↓          command history navigation',
            '    Ctrl+C       exit chat/monitor mode',
            '    Escape       return focus to terminal input',
            '    q            quit monitor mode',
            '    Click        anywhere to focus input',
            '',
            'TERMINAL FEATURES',
            '    • Authentic retro terminal scrolling (no scroll bars)',
            '    • Desktop width constraint (max 1400px, centered)',
            '    • Responsive design (mobile & desktop optimized)',
            '    • WebGL audio visualizations with FFT analysis',
            '    • Mathematical music synthesis & modulation',
            '    • Real-time system monitoring with live data',
            '    • Advanced AI integration with prompt caching',
            '    • Persistent command history with search',
            '    • Click-anywhere input focus management',
            '    • Fuzzy command completion & suggestions',
            '',
            'AI INTEGRATION 🤖',
            '    • Claude-powered chat with context awareness',
            '    • Advanced prompt caching for efficiency',
            '    • Token usage tracking & optimization',
            '    • Voice recognition with wake word detection',
            '    • Text-to-speech synthesis with voice controls',
            '    • Real-time GitHub Actions integration',
            '    • Daily automated content generation',
            '',
            'TECHNICAL ARCHITECTURE',
            '    • ES6+ JavaScript with modern APIs',
            '    • WebGL shaders for visual effects',
            '    • Web Audio API for real-time synthesis',
            '    • Canvas-based particle systems',
            '    • CSS3 animations & responsive design',
            '    • GitHub Actions CI/CD automation',
            '    • RESTful API integrations (BOM, GitHub)',
            '    • Local storage for persistent data',
            '',
            'USAGE EXAMPLES',
            '    help                     - Show this help',
            '    music cyberpunk          - Play cyberpunk beats',
            '    effects matrix on        - Start matrix rain',
            '    voice on                 - Enable voice recognition',
            '    weather                  - Show Tasmania weather',
            '    chat                     - Enter AI chat mode',
            '    history search git       - Search command history',
            '    cache stats              - Show prompt cache info',
            '    monitor                  - Enter system monitor',
            '',
            'DEVELOPER INFO',
            '    Repository:   github.com/adrianwedd/adrianwedd',
            '    Technology:   Vanilla JS, WebGL, Web Audio API',
            '    Deployment:   GitHub Pages with Actions automation',
            '    Architecture: Client-side with API integrations',
            '    Author:       Adrian Wedd (Recursive Systems Architect)',
            '',
            '══════════════════════════════════════════════════════════════════════',
            '  Type any command above or explore with Tab completion! 🚀',
            '══════════════════════════════════════════════════════════════════════',
            ''
        ];
        
        helpLines.forEach(line => {
            if (line.includes('══') || line.includes('🧠')) {
                this.addOutput(line, 'section-header');
            } else if (line.includes('COMMANDS') || line.includes('SYSTEM') || line.includes('VOICE') || 
                      line.includes('AUDIO') || line.includes('TRACKS') || line.includes('EFFECTS') ||
                      line.includes('MONITORING') || line.includes('FEATURES') || line.includes('SHORTCUTS') ||
                      line.includes('INTEGRATION') || line.includes('ARCHITECTURE') || line.includes('EXAMPLES') ||
                      line.includes('DEVELOPER')) {
                this.addOutput(line, 'feature-highlight');
            } else if (line.startsWith('    ') && line.includes(' ') && !line.includes('•')) {
                // Format command lines with proper spacing
                const trimmed = line.trim();
                if (trimmed.includes('-')) {
                    this.addOutput(line, 'ai-highlight');
                } else {
                    const parts = trimmed.split(/\s+/);
                    const command = parts[0];
                    const description = parts.slice(1).join(' ');
                    const formatted = `    <span class="command-name">${command.padEnd(15)}</span> <span class="command-line">${description}</span>`;
                    this.addOutput(formatted, 'info', true); // allowHTML flag for styled commands
                }
            } else if (line.includes('•')) {
                this.addOutput(line, 'success');
            } else if (line.includes('Wake Words:') || line.includes('Commands:') || line.includes('Usage:') || 
                      line.includes('Features:') || line.includes('Repository:') || line.includes('Technology:')) {
                this.addOutput(line, 'philosophy');
            } else {
                this.addOutput(line, 'info');
            }
        });
    }

    showAbout() {
        const aboutLines = [
            '',
            'Adrian Wedd - Systems Architect',
            '',
            '• Neurodivergent (ADHD/Autism) systems thinker',
            '• Architecting LLM-powered agent systems', 
            '• Building the future of human-AI collaboration',
            ''
        ];
        
        aboutLines.forEach(line => {
            this.addOutput(line, line.includes('Adrian Wedd') ? 'success' : 'info');
        });
    }

    showProjects() {
        const projectLines = [
            '',
            '🚀 Active Projects:',
            '',
            '┌─ TicketSmith ──────────────────────────────────┐',
            '│ LLM-powered Jira/Confluence automation        │',
            '│ Tech: LangChain, OpenTelemetry                 │',
            '│ Status: Production                             │',
            '└────────────────────────────────────────────────┘',
            '',
            '┌─ Personal Intelligence Node ───────────────────┐',
            '│ Self-updating AI-powered GitHub profile       │',
            '│ Tech: GitHub Actions, AI, Recursive Systems   │',
            '│ Status: You\'re looking at it!                 │',
            '└────────────────────────────────────────────────┘',
            '',
            '┌─ VERITAS ──────────────────────────────────────┐',
            '│ AI safety research & jailbreak simulation     │',
            '│ Tech: LLM Security, Recursive Testing         │',
            '│ Status: Active Research                        │',
            '└────────────────────────────────────────────────┘',
            ''
        ];
        
        projectLines.forEach(line => {
            this.addOutput(line, line.includes('🚀') ? 'success' : 
                           line.includes('┌─') || line.includes('└─') ? 'project-border' :
                           line.includes('│') ? 'project-content' : 'info');
        });
    }

    showSkills() {
        const skillLines = [
            '',
            '🧰 Technical Arsenal:',
            '',
            'AI/ML:          GPT-x, Codex, LangChain, Whisper/Vocode',
            'Languages:      Python, JavaScript, Rust, Go',
            'Infrastructure: Docker, Kubernetes, AWS, Home Assistant',
            'Databases:      Postgres, Redis, Vector DBs',
            'Monitoring:     Grafana, Prometheus, OpenTelemetry',
            'IoT:            ESPHome, MQTT, Home Automation',
            'Other:          FastAPI, React, Permaculture Design',
            '',
            '🔍 Specialized in:',
            '• Agentic AI system architecture',
            '• LLM jailbreak testing & AI safety',
            '• Recursive system design patterns',
            '• Off-grid technology integration',
            ''
        ];
        
        skillLines.forEach(line => {
            this.addOutput(line, line.includes('🧰') || line.includes('🔍') ? 'success' : 
                           line.includes(':') && !line.includes('•') ? 'skill-category' : 'info');
        });
    }

    showHome() {
        const home = `
🏔️ Tasmania Off-Grid Home:

Location:     170 acres of Tasmanian bushland
Power:        Solar + Battery bank + Backup generator
Water:        Rainwater collection + Natural springs
Internet:     Starlink (when the weather cooperates)
Growing:      Food forest, market garden, livestock

Current Sensor Network:
• Solar panel monitoring via ESPHome
• Weather station with wind/rain/temp
• Soil moisture sensors in garden beds
• Battery bank telemetry
• Water tank level monitoring

Philosophy: Technology should enhance, not dominate, natural systems.
        `;
        this.addOutput(home, 'success');
    }

    showVeritas() {
        const veritas = `
🔬 VERITAS - AI Safety Research Platform:

Mission:      Understanding LLM vulnerabilities through systematic testing
Approach:     Recursive jailbreak simulation & safety analysis
Status:       Active research (details classified for obvious reasons)

Key Components:
• Automated prompt injection testing
• Multi-model vulnerability assessment  
• Recursive system boundary exploration
• Safety measure effectiveness analysis

"Truth emerges through systematic probing of boundaries."

[WARNING: This is defensive security research only]
        `;
        this.addOutput(veritas, 'info');
    }

    openChat() {
        this.addOutput('', 'info');
        this.addOutput('╭─ 🧠 ADRIAN.AI CHAT SESSION ─────────────────────╮', 'chat-border');
        this.addOutput('│ Interactive chat with Adrian\'s AI persona       │', 'chat-content');
        this.addOutput('│ Type your message and press Enter               │', 'chat-content');
        this.addOutput('│ Use "exit" or Ctrl+C to end chat session       │', 'chat-content');
        this.addOutput('╰─────────────────────────────────────────────────╯', 'chat-border');
        this.addOutput('', 'info');
        
        this.inChatMode = true;
        this.updatePrompt();
    }

    showUptime() {
        const uptime = `
System uptime: 42 days, 13:37:42
Load average: 0.13, 0.42, 1.33
Off-grid power: 87% (solar charging)
Tasmania weather: Mostly cloudy, light rain
Current focus: Deep work mode - VERITAS research
        `;
        this.addOutput(uptime, 'info');
    }

    async showDailyMagic() {
        try {
            // Try to load today's magic from the daily magic file
            const response = await fetch('./assets/daily-magic.json');
            if (response.ok) {
                const magic = await response.json();
                const date = new Date(magic.timestamp);
                const isToday = date.toDateString() === new Date().toDateString();
                
                this.addOutput('', 'info');
                this.addOutput('✨ DAILY CLAUDE MAGIC', 'success');
                this.addOutput('', 'info');
                
                if (isToday) {
                    this.addOutput('🌅 Today\'s Magic:', 'feature-highlight');
                } else {
                    this.addOutput(`🕰️  Last Magic (${date.toLocaleDateString()}):`, 'info');
                }
                
                this.addOutput('', 'info');
                this.addOutput(`🎯 Challenge: ${magic.prompt}`, 'info');
                this.addOutput('', 'info');
                this.addOutput('🤖 Claude\'s Response:', 'ai-highlight');
                this.addOutput(`   ${magic.response}`, 'success');
                this.addOutput('', 'info');
                
                // Token efficiency visualization
                const efficiency = Math.round((magic.tokens / 50) * 100);
                const bars = Math.floor(magic.tokens / 5);
                const tokenBar = '█'.repeat(bars) + '░'.repeat(10 - bars);
                
                this.addOutput(`📊 Efficiency: [${tokenBar}] ${magic.tokens}/50 tokens (${efficiency}%)`, 'info');
                this.addOutput(`🎲 Seed: ${magic.seed}`, 'info');
                
                // Show stats if available
                try {
                    const statsResponse = await fetch('./magic/stats.json');
                    if (statsResponse.ok) {
                        const stats = await statsResponse.json();
                        this.addOutput('', 'info');
                        this.addOutput('📈 Total Magic Stats:', 'feature-highlight');
                        this.addOutput(`   Days of Magic: ${stats.total_days}`, 'info');
                        this.addOutput(`   Average Tokens: ${stats.average_tokens}`, 'info');
                        this.addOutput(`   Token Range: ${stats.min_tokens}-${stats.max_tokens}`, 'info');
                    }
                } catch (_e) {
                    // Stats not available yet
                }
                
            } else {
                // No magic file exists yet
                this.addOutput('', 'info');
                this.addOutput('✨ DAILY CLAUDE MAGIC', 'success');
                this.addOutput('', 'info');
                this.addOutput('🎭 No magic has been generated yet!', 'info');
                this.addOutput('', 'info');
                this.addOutput('The Daily Claude Magic CI workflow runs every day at 9pm', 'info');
                this.addOutput('Tasmania time, creating something incredible with just 50 tokens.', 'info');
                this.addOutput('', 'info');
                this.addOutput('💡 Each day brings a unique prompt generated from date entropy:', 'feature-highlight');
                this.addOutput('   • Philosophical haikus about systems and nature', 'info');
                this.addOutput('   • Code comments with unexpected depth', 'info');
                this.addOutput('   • Imaginary Unix commands that should exist', 'info');
                this.addOutput('   • Recursive wordplay with constrained vocabulary', 'info');
                this.addOutput('   • Git messages for impossible merges', 'info');
                this.addOutput('   • ASCII art with mathematical beauty', 'info');
                this.addOutput('', 'info');
                this.addOutput('🎯 Philosophy: "True creativity emerges from constraints, not abundance."', 'philosophy');
            }
        } catch (_error) {
            this.addOutput('❌ Could not load daily magic data', 'error');
            this.addOutput('The Daily Claude Magic system may not be initialized yet.', 'info');
        }
    }

    async handleActionsCommand(args) {
        try {
            await this.githubActionsManager.init();
            const commands = this.githubActionsManager.getTerminalCommands();
            const result = await commands.actions.handler(args);
            
            this.addOutput('', 'info');
            result.split('\n').forEach(line => {
                if (line.startsWith('🚀') || line.startsWith('📊')) {
                    this.addOutput(line, 'success');
                } else if (line.includes('✅')) {
                    this.addOutput(line, 'success');
                } else if (line.includes('❌')) {
                    this.addOutput(line, 'error');
                } else if (line.includes('💡')) {
                    this.addOutput(line, 'feature-highlight');
                } else {
                    this.addOutput(line, 'info');
                }
            });
        } catch (_error) {
            this.addOutput('❌ GitHub Actions integration not available', 'error');
            this.addOutput('Make sure you are authenticated with GitHub CLI (gh auth login)', 'info');
        }
    }

    async handleTriggerCommand(args) {
        try {
            await this.githubActionsManager.init();
            const commands = this.githubActionsManager.getTerminalCommands();
            const result = await commands.trigger.handler(args);
            
            this.addOutput('', 'info');
            result.split('\n').forEach(line => {
                if (line.startsWith('🚀')) {
                    this.addOutput(line, 'success');
                } else if (line.includes('Command to execute:')) {
                    this.addOutput(line, 'feature-highlight');
                } else if (line.startsWith('gh ')) {
                    this.addOutput(line, 'command');
                } else if (line.includes('✨')) {
                    this.addOutput(line, 'ai-highlight');
                } else {
                    this.addOutput(line, 'info');
                }
            });
            
            // Show helpful tip
            this.addOutput('', 'info');
            this.addOutput('💡 Copy and run the command above in your terminal to trigger the workflow!', 'philosophy');
        } catch (_error) {
            this.addOutput('❌ Could not trigger workflow', 'error');
            this.addOutput('Make sure you are authenticated with GitHub CLI', 'info');
        }
    }

    async handleRunsCommand(args) {
        try {
            await this.githubActionsManager.init();
            const commands = this.githubActionsManager.getTerminalCommands();
            const result = await commands.runs.handler(args);
            
            this.addOutput('', 'info');
            result.split('\n').forEach(line => {
                if (line.startsWith('📊')) {
                    this.addOutput(line, 'success');
                } else if (line.includes('✅')) {
                    this.addOutput(line, 'success');
                } else if (line.includes('❌')) {
                    this.addOutput(line, 'error');
                } else if (line.includes('🔄')) {
                    this.addOutput(line, 'info');
                } else {
                    this.addOutput(line, 'info');
                }
            });
        } catch (_error) {
            this.addOutput('❌ Could not fetch workflow runs', 'error');
            this.addOutput('GitHub Actions integration may not be available', 'info');
        }
    }

    handleParticleEffects(args) {
        if (args.length === 0) {
            this.addOutput('🎨 PARTICLE EFFECTS SYSTEM', 'success');
            this.addOutput('', 'info');
            this.addOutput('Available effects:', 'feature-highlight');
            
            const effects = this.particleEffects.getAvailableEffects();
            effects.forEach(effect => {
                const status = this.particleEffects.effects[effect].active ? '✅ active' : '❌ inactive';
                this.addOutput(`   ${effect.padEnd(12)} ${status}`, 'info');
            });
            
            this.addOutput('', 'info');
            this.addOutput('Usage:', 'feature-highlight');
            this.addOutput('   effects <effect> [on|off]  - Toggle or set effect state', 'info');
            this.addOutput('   effects opacity <0.0-1.0>  - Set effects opacity', 'info');
            this.addOutput('   effects clear              - Stop all effects', 'info');
            this.addOutput('', 'info');
            this.addOutput('Examples:', 'feature-highlight');
            this.addOutput('   effects matrix on          - Start matrix rain', 'ai-highlight');
            this.addOutput('   effects fireflies          - Toggle fireflies', 'ai-highlight');
            this.addOutput('   effects neural on          - Start neural network', 'ai-highlight');
            this.addOutput('   effects stars rain         - Multiple effects', 'ai-highlight');
            this.addOutput('   effects opacity 0.3        - Set to 30% opacity', 'ai-highlight');
            
            return;
        }

        const command = args[0].toLowerCase();
        
        if (command === 'clear' || command === 'stop') {
            this.particleEffects.getAvailableEffects().forEach(effect => {
                this.particleEffects.stopEffect(effect);
            });
            this.addOutput('✨ All particle effects stopped', 'success');
            return;
        }
        
        if (command === 'opacity') {
            const opacity = parseFloat(args[1]);
            if (isNaN(opacity) || opacity < 0 || opacity > 1) {
                this.addOutput('❌ Invalid opacity value. Use 0.0 to 1.0', 'error');
                return;
            }
            
            this.particleEffects.setOpacity(opacity);
            this.addOutput(`🎨 Effects opacity set to ${Math.round(opacity * 100)}%`, 'success');
            return;
        }
        
        // Handle effect commands
        const availableEffects = this.particleEffects.getAvailableEffects();
        
        for (const arg of args) {
            const effectName = arg.toLowerCase();
            const isToggleOff = args.includes('off') || args.includes('stop');
            const isToggleOn = args.includes('on') || args.includes('start');
            
            if (availableEffects.includes(effectName)) {
                if (isToggleOff) {
                    this.particleEffects.stopEffect(effectName);
                    this.addOutput(`❌ ${effectName} effect stopped`, 'info');
                } else if (isToggleOn || args.length === 1) {
                    // Set effect-specific options
                    const options = this.getEffectOptions(effectName);
                    this.particleEffects.startEffect(effectName, options);
                    this.addOutput(`✨ ${effectName} effect started`, 'success');
                } else {
                    // Toggle effect
                    this.particleEffects.toggleEffect(effectName);
                    const isActive = this.particleEffects.effects[effectName].active;
                    this.addOutput(`${isActive ? '✨' : '❌'} ${effectName} effect ${isActive ? 'started' : 'stopped'}`, 
                                 isActive ? 'success' : 'info');
                }
            }
        }
        
        // Handle unknown effects
        const unknownEffects = args.filter(arg => 
            !availableEffects.includes(arg.toLowerCase()) && 
            !['on', 'off', 'start', 'stop'].includes(arg.toLowerCase())
        );
        
        if (unknownEffects.length > 0) {
            this.addOutput(`❌ Unknown effects: ${unknownEffects.join(', ')}`, 'error');
            this.addOutput(`Available: ${availableEffects.join(', ')}`, 'info');
        }
    }

    getEffectOptions(effectName) {
        const options = {};
        
        switch (effectName) {
            case 'matrix':
                options.intensity = 0.4;
                options.speed = 1.2;
                break;
            case 'stars':
                options.count = 150;
                options.speed = 0.8;
                break;
            case 'rain':
                options.intensity = 0.2;
                break;
            case 'fireflies':
                options.count = 20;
                break;
            case 'neural':
                options.nodeCount = 25;
                options.connectionDistance = 120;
                break;
        }
        
        return options;
    }

    showHistory(args) {
        const [command, ...params] = args;
        
        if (!command) {
            this.addOutput('📜 COMMAND HISTORY', 'success');
            this.addOutput('', 'info');
            
            if (this.commandHistory.length === 0) {
                this.addOutput('No commands in history.', 'info');
                return;
            }
            
            const recent = this.commandHistory.slice(-20);
            recent.forEach((cmd, index) => {
                const actualIndex = this.commandHistory.length - recent.length + index;
                this.addOutput(`${String(actualIndex + 1).padStart(4)}: ${cmd}`, 'info');
            });
            
            this.addOutput('', 'info');
            this.addOutput(`Showing last 20 of ${this.commandHistory.length} commands`, 'info');
            this.addOutput('Use: history clear, history search <term>', 'feature-highlight');
            return;
        }
        
        switch (command.toLowerCase()) {
            case 'clear':
                this.commandHistory = [];
                this.historyIndex = -1;
                this.saveHistoryToStorage();
                this.addOutput('✨ Command history cleared', 'success');
                break;
                
            case 'search': {
                const searchTerm = params.join(' ');
                if (!searchTerm) {
                    this.addOutput('❌ Please provide a search term', 'error');
                    return;
                }
                
                const matches = this.commandHistory.filter(cmd => 
                    cmd.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                if (matches.length === 0) {
                    this.addOutput(`🔍 No commands found containing: ${searchTerm}`, 'info');
                } else {
                    this.addOutput(`🔍 Found ${matches.length} commands containing: ${searchTerm}`, 'success');
                    this.addOutput('', 'info');
                    matches.slice(-10).forEach(cmd => {
                        const index = this.commandHistory.lastIndexOf(cmd);
                        this.addOutput(`${String(index + 1).padStart(4)}: ${cmd}`, 'ai-highlight');
                    });
                }
                break;
            }
                
            default:
                this.addOutput('❌ Unknown history command', 'error');
                this.addOutput('Available: clear, search <term>', 'info');
        }
    }

    async showWeather() {
        try {
            // Try to load current weather data
            const response = await fetch('./assets/current-weather.json');
            if (response.ok) {
                const weather = await response.json();
                const updateTime = new Date(weather.updated_at);
                const isRecent = (Date.now() - updateTime.getTime()) < 4 * 60 * 60 * 1000; // 4 hours
                
                this.addOutput('', 'info');
                this.addOutput('🌤️ TASMANIA WEATHER', 'success');
                this.addOutput('', 'info');
                
                if (isRecent) {
                    this.addOutput(`📍 ${weather.station}`, 'feature-highlight');
                } else {
                    this.addOutput(`📍 ${weather.station} (Data may be outdated)`, 'info');
                }
                
                this.addOutput('', 'info');
                
                // Current conditions with emoji
                this.addOutput(`${weather.weather_emoji} Current: ${weather.conditions}`, 'ai-highlight');
                this.addOutput(`🌡️  Temperature: ${weather.temperature}°C (feels like ${weather.apparent_temperature}°C)`, 'info');
                this.addOutput(`😌 Comfort Level: ${weather.comfort_level}`, 'success');
                this.addOutput('', 'info');
                
                // Visual bars
                this.addOutput('📊 Conditions Overview:', 'feature-highlight');
                this.addOutput(`   Temperature [${weather.visualizations.temperature_bar}] ${weather.temperature}°C`, 'info');
                this.addOutput(`   Humidity    [${weather.visualizations.humidity_bar}] ${weather.humidity}%`, 'info');
                this.addOutput(`   Wind Speed  [${weather.visualizations.wind_bar}] ${weather.wind_speed_kmh} km/h`, 'info');
                this.addOutput('', 'info');
                
                // Detailed measurements
                this.addOutput('🔍 Detailed Measurements:', 'feature-highlight');
                this.addOutput(`   💧 Humidity: ${weather.humidity}%`, 'info');
                this.addOutput(`   💨 Wind: ${weather.wind_direction} ${weather.wind_speed_kmh} km/h`, 'info');
                this.addOutput(`   🌪️  Gusts: ${weather.wind_gust_kmh} km/h`, 'info');
                this.addOutput(`   🔽 Pressure: ${weather.pressure_hpa} hPa`, 'info');
                this.addOutput(`   🌧️  Rainfall: ${weather.rainfall_mm} mm`, 'info');
                this.addOutput('', 'info');
                
                // Environmental impact assessment
                this.addOutput('🌱 Environmental Impact:', 'feature-highlight');
                
                // Solar conditions assessment
                const solarCondition = weather.conditions.toLowerCase().includes('clear') || 
                                     weather.conditions.toLowerCase().includes('fine') ? 
                                     'Optimal ☀️' : 'Reduced ☁️';
                this.addOutput(`   ☀️ Solar Conditions: ${solarCondition}`, 'info');
                
                // Precipitation assessment  
                const precipitationStatus = parseFloat(weather.rainfall_mm) > 5 ? 'Natural irrigation 🌧️' : 'Dry conditions 🌵';
                this.addOutput(`   🌧️ Precipitation: ${precipitationStatus}`, 'info');
                
                // Energy/comfort assessment
                const temp = parseFloat(weather.temperature);
                let energyNeeds = 'Comfortable 😌';
                if (temp < 10) {
                    energyNeeds = 'Heating required 🔥';
                } else if (temp > 30) {
                    energyNeeds = 'Cooling beneficial ❄️';
                }
                this.addOutput(`   🔋 Energy Needs: ${energyNeeds}`, 'info');
                
                this.addOutput('', 'info');
                this.addOutput(`⏰ Last Updated: ${weather.observation_time}`, 'info');
                this.addOutput(`🔄 Auto-refreshed: ${updateTime.toLocaleString()}`, 'info');
                
            } else {
                // No weather data available yet
                this.addOutput('', 'info');
                this.addOutput('🌤️ TASMANIA WEATHER', 'success');
                this.addOutput('', 'info');
                this.addOutput('📡 No weather data available yet!', 'info');
                this.addOutput('', 'info');
                this.addOutput('The Weather Update CI workflow fetches live data from the', 'info');
                this.addOutput('Australian Bureau of Meteorology every 3 hours.', 'info');
                this.addOutput('', 'info');
                this.addOutput('🎯 Weather Station: Grove (Cygnet Area)', 'feature-highlight');
                this.addOutput('📍 Coordinates: -43.1647, 147.0584', 'info');
                this.addOutput('📊 Data Source: reg.bom.gov.au', 'info');
                this.addOutput('', 'info');
                this.addOutput('💡 Features:', 'feature-highlight');
                this.addOutput('   • Real-time temperature and conditions', 'info');
                this.addOutput('   • Wind speed and direction', 'info');
                this.addOutput('   • Humidity and pressure readings', 'info');
                this.addOutput('   • Rainfall measurements', 'info');
                this.addOutput('   • Home impact assessment', 'info');
                this.addOutput('   • ASCII visualizations', 'info');
                this.addOutput('', 'info');
                this.addOutput('🔄 Trigger a manual update using GitHub Actions!', 'philosophy');
            }
        } catch (_error) {
            this.addOutput('❌ Could not load weather data', 'error');
            this.addOutput('The weather system may not be initialized yet.', 'info');
        }
    }

    showProcesses() {
        const processes = `
  PID  COMMAND                    CPU  MEM
  1337 veritas-research-daemon   2.1%  15%
  2048 home-monitoring           0.8%  8%
  3141 ai-persona-server         1.2%  12%
  4096 recursive-thought-loop    99%   42%
  8080 off-grid-optimization     0.3%  5%
        `;
        this.addOutput(processes, 'info');
    }

    showNeofetch() {
        const logoLines = [
            '',
            '    ╔═══════════════════════════════════╗',
            '    ║     █████╗ ██████╗ ██████╗ ██╗   ██╗ ███╗   ██╗    ║',
            '    ║    ██╔══██╗██╔══██╗██╔══██╗██║   ██║ ████╗  ██║    ║',
            '    ║    ███████║██║  ██║██████╔╝██║   ██║ ██╔██╗ ██║    ║',
            '    ║    ██╔══██║██║  ██║██╔══██╗██║   ██║ ██║╚██╗██║    ║',
            '    ║    ██║  ██║██████╔╝██║  ██║╚██████╔╝ ██║ ╚████║    ║',
            '    ║    ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═╝  ╚═══╝    ║',
            '    ║                                                   ║',
            '    ║         🧠 Recursive Systems Architect            ║',
            '    ║         🌱 Off-Grid Tasmanian Home                ║',
            '    ║         🤖 AI Safety Research • VERITAS           ║',
            '    ╚═══════════════════════════════════════════════════╝',
            '',
            '    adrian@tasmania-home',
            '    ──────────────────────────',
            '    OS: Tasmania Linux (Off-Grid Edition)',
            '    Host: 170-Acre Permaculture Node',
            '    Kernel: NeurodivergentOS 2024.7',
            '    Uptime: ∞ recursive cycles',
            '    Shell: zsh + AI augmentation',
            '    Memory: Organic + Silicon Hybrid',
            '    CPU: Biological Neural Network',
            '    GPU: Pattern Recognition Cortex',
            ''
        ];
        
        logoLines.forEach((line, index) => {
            this.addOutput(line, index < 13 ? 'logo-art' : 'system-info');
        });
    }

    listDirectory() {
        const files = `
drwxr-xr-x  adrian adrian  4096 Jul 24 13:37 projects/
drwxr-xr-x  adrian adrian  4096 Jul 24 12:00 home/
drwxr-xr-x  adrian adrian  4096 Jul 24 14:20 research/
-rw-r--r--  adrian adrian  2048 Jul 24 10:30 thoughts.md
-rw-r--r--  adrian adrian  1024 Jul 24 09:15 todo.txt
-rwxr-xr-x  adrian adrian  8192 Jul 24 11:45 ai-persona*
        `;
        this.addOutput(files, 'info');
    }

    toggleMatrixRain() {
        const rain = document.querySelector('.matrix-rain');
        if (rain) {
            // Clear the interval and remove canvas
            if (this.matrixInterval) {
                clearInterval(this.matrixInterval);
                this.matrixInterval = null;
            }
            rain.remove();
            this.addOutput('Matrix rain disabled.', 'success');
        } else {
            this.createMatrixRain();
            this.addOutput('Matrix rain enabled. Welcome to the real world.', 'success');
        }
    }

    createMatrixRain() {
        const canvas = document.createElement('canvas');
        canvas.className = 'matrix-rain';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff41';
            ctx.font = `${fontSize}px monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        this.matrixInterval = setInterval(draw, 35);
    }

    clearTerminal() {
        const terminal = document.getElementById('terminal');
        const terminalContent = terminal.querySelector('.terminal-content');
        // const promptLine = terminal.querySelector('.prompt-line'); // Unused variable
        
        // Clear terminal lines array
        this.terminalLines = [];
        
        // Remove all output lines from terminal content
        if (terminalContent) {
            const outputs = terminalContent.querySelectorAll('.output-line');
            outputs.forEach(output => output.remove());
        } else {
            // Fallback: remove all output lines from terminal
            const outputs = terminal.querySelectorAll('.output-line');
            outputs.forEach(output => output.remove());
        }
    }

    scrollToBottom() {
        const terminal = document.getElementById('terminal');
        terminal.scrollTop = terminal.scrollHeight;
    }

    scrollToTop() {
        const terminal = document.getElementById('terminal');
        terminal.scrollTop = 0;
        // Also scroll the window to top
        window.scrollTo(0, 0);
    }

    handleChatKeydown(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        this.addChatMessage(message, 'user');
        input.value = '';

        // Generate unique session ID
        const sessionId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Show thinking indicator
        this.addChatMessage('🤖 Connecting to neural pathways...', 'ai', true);

        try {
            // Try real LLM response first
            const response = await this.sendLLMRequest(message, sessionId);
            
            if (response.status === 'processing') {
                this.removeChatMessage();
                this.addChatMessage('🧠 Adrian.AI is thinking... (This uses real Claude via GitHub Actions)', 'ai', true);
                
                // Poll for response
                this.pollForResponse(sessionId);
            } else {
                this.removeChatMessage();
                this.addChatMessage(response.response || 'Error generating response', 'ai');
            }
        } catch (error) {
            console.warn('LLM API not available, falling back to local responses:', error);
            this.removeChatMessage();
            this.addChatMessage('⚠️ Real-time AI unavailable. Using local responses.', 'ai', true);
            
            setTimeout(() => {
                this.removeChatMessage();
                const fallbackResponse = this.generateAIResponse(message);
                this.addChatMessage(fallbackResponse, 'ai');
            }, 1500);
        }
    }

    async sendLLMRequest(message, sessionId) {
        // Try different API endpoints (adjust for your deployment)
        const apiEndpoints = [
            '/api/chat',  // Vercel/Netlify
            'https://your-domain.com/api/chat',  // Custom domain
            'http://localhost:3000/api/chat'  // Local development
        ];

        for (const endpoint of apiEndpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        sessionId: sessionId
                    })
                });

                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn(`API endpoint ${endpoint} failed:`, error);
                continue;
            }
        }

        throw new Error('All API endpoints failed');
    }

    async pollForResponse(sessionId, attempts = 0, maxAttempts = 20) {
        if (attempts >= maxAttempts) {
            this.removeChatMessage();
            this.addChatMessage('⏰ AI response timed out. The neural networks may be overloaded.', 'ai');
            return;
        }

        try {
            const response = await fetch(`/api/chat-status?sessionId=${sessionId}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.status === 'completed') {
                    this.removeChatMessage();
                    // Format the response with rich formatting
                    const formattedResponse = this.formatLLMResponse(data.response);
                    this.addChatMessage(formattedResponse, 'ai');
                    return;
                }
            }
        } catch (error) {
            console.warn('Polling error:', error);
        }

        // Continue polling every 3 seconds
        setTimeout(() => {
            this.pollForResponse(sessionId, attempts + 1, maxAttempts);
        }, 3000);
    }

    formatLLMResponse(response) {
        // Add rich formatting for LLM responses
        return response
            .replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>')
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gm, '• $1')
            .replace(/\n/g, '<br>');
    }

    addChatMessage(message, sender, isTyping = false) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message${isTyping ? ' typing-indicator' : ''}`;
        
        // For AI messages, allow HTML formatting
        if (sender === 'ai' && !isTyping && message.includes('<')) {
            messageDiv.innerHTML = message;
        } else {
            messageDiv.textContent = message;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeChatMessage() {
        const chatMessages = document.getElementById('chatMessages');
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('typing-indicator')) {
            lastMessage.remove();
        }
    }

    async loadAIResponses() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/adrianwedd/adrianwedd/main/ai-responses/responses.json');
            if (response.ok) {
                const data = await response.json();
                this.aiResponses = data.responses;
            }
        } catch (error) {
            console.warn('Could not load AI responses from GitHub:', error);
            // Fallback to local responses
            this.aiResponses = {
                'hello': ['Greetings. System online and ready for interaction.'],
                'projects': ['Current focus: TicketSmith automation and this interactive terminal interface.'],
                'ai': ['AI should amplify human creativity through recursive collaboration.'],
                'default': ['Interesting query. Tell me more about your perspective.']
            };
        }
    }

    generateAIResponse(userMessage) {
        if (!this.aiResponses) {
            return 'AI responses loading... Please try again.';
        }

        const message = userMessage.toLowerCase();
        let responses = null;

        // Find matching keyword
        for (const keyword in this.aiResponses) {
            if (keyword !== 'default' && message.includes(keyword)) {
                responses = this.aiResponses[keyword];
                break;
            }
        }

        // Use default if no match
        if (!responses) {
            responses = this.aiResponses.default || ['Processing query...'];
        }

        // Return random response from array
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Music Player Methods
    async handleMusicCommand(args) {
        if (args.length === 0) {
            const status = this.musicPlayer.getStatus();
            this.addOutput('🎵 Retro Music Player', 'success');
            this.addOutput(`Status: ${status.isPlaying ? `Playing "${status.currentTrack}"` : 'Stopped'}`, 'info');
            this.addOutput(`Volume: ${Math.round(status.volume * 100)}%`, 'info');
            this.addOutput('Available tracks: ' + status.availableTracks.join(', '), 'info');
            this.addOutput('Usage: music <track> | music stop | volume <0.0-1.0>', 'info');
            return;
        }

        const track = args[0].toLowerCase();
        if (track === 'stop') {
            this.stopMusic();
            return;
        }

        const success = await this.musicPlayer.playTrack(track);
        if (success) {
            this.addOutput(`🎵 Now playing: ${track} (retro synth)`, 'success');
            this.addOutput('Use "stop" to stop music or "volume <0.0-1.0>" to adjust volume', 'info');
        } else {
            this.addOutput(`❌ Track "${track}" not found`, 'error');
            this.addOutput('Available: cyberpunk, ambient, synthwave, matrix', 'info');
        }
    }

    stopMusic() {
        this.musicPlayer.stopTrack();
        this.addOutput('🔇 Music stopped', 'info');
    }

    setVolume(volumeStr) {
        if (!volumeStr) {
            this.addOutput('Usage: volume <0.0-1.0>', 'error');
            return;
        }

        const volume = parseFloat(volumeStr);
        if (isNaN(volume) || volume < 0 || volume > 1) {
            this.addOutput('Volume must be between 0.0 and 1.0', 'error');
            return;
        }

        this.musicPlayer.setVolume(volume);
        this.addOutput(`🔊 Volume set to ${Math.round(volume * 100)}%`, 'success');
    }

    setShader(shaderName) {
        if (!shaderName) {
            this.addOutput('Usage: shader <spectrum|waveform|cyberpunk|minimal|particles>', 'error');
            return;
        }
        this.musicPlayer.visualizer.switchShader(shaderName);
        this.addOutput(`🎨 Switched shader to: ${shaderName}`, 'success');
    }

    // System Monitor Methods
    async enterMonitorMode() {
        this.addOutput('', 'info');
        this.addOutput('🖥️  Entering system monitor mode...', 'success');
        this.addOutput('Press \'q\' to return to terminal', 'info');
        await this.systemMonitor.enterMonitorMode();
    }

    // Split Screen Mode Methods
    async enterSplitMode() {
        this.addOutput('', 'info');
        this.addOutput('🔗 Entering split screen mode...', 'success');
        this.addOutput('Terminal + Monitor side-by-side view', 'info');
        this.addOutput('Click [✕] or type "exit" to return to normal mode', 'info');
        this.addOutput('', 'info');
        
        // Initialize split screen
        this.initializeSplitScreen();
    }

    initializeSplitScreen() {
        // Hide main terminal and monitor interfaces
        document.getElementById('terminal').style.display = 'none';
        document.getElementById('monitorInterface').style.display = 'none';
        
        // Show split screen container
        const splitContainer = document.getElementById('splitScreenContainer');
        splitContainer.style.display = 'flex';
        
        // Mirror current terminal output to split view
        this.mirrorTerminalToSplit();
        
        // Initialize split system monitor
        this.initializeSplitMonitor();
        
        // Set up split screen event handlers
        this.setupSplitEventHandlers();
        
        // Focus split terminal input
        const splitInput = document.getElementById('commandInputSplit');
        if (splitInput) {
            splitInput.focus();
        }
    }

    mirrorTerminalToSplit() {
        const mainOutput = document.getElementById('terminalOutput');
        const splitOutput = document.getElementById('terminalOutputSplit');
        
        if (mainOutput && splitOutput) {
            // Copy current terminal output
            splitOutput.innerHTML = mainOutput.innerHTML;
            
            // Scroll to bottom
            splitOutput.scrollTop = splitOutput.scrollHeight;
        }
    }

    async initializeSplitMonitor() {
        // Initialize mini system monitor for split view
        if (!this.splitSystemMonitor) {
            this.splitSystemMonitor = new SystemMonitor();
        }
        
        // Start monitoring in split mode
        this.splitSystemMonitor.isActive = true;
        await this.splitSystemMonitor.updateAllData();
        
        // Set up split monitor update intervals
        this.splitMonitorInterval = setInterval(async () => {
            if (this.splitSystemMonitor && this.splitSystemMonitor.isActive) {
                await this.splitSystemMonitor.updateAllData();
            }
        }, 10000);
    }

    setupSplitEventHandlers() {
        // Split terminal input handler
        const splitInput = document.getElementById('commandInputSplit');
        if (splitInput) {
            splitInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    const command = splitInput.value.trim();
                    if (command) {
                        if (command.toLowerCase() === 'exit') {
                            this.exitSplitMode();
                            return;
                        }
                        
                        // Execute command in split context
                        this.executeSplitCommand(command);
                        splitInput.value = '';
                    }
                } else if (event.key === 'Tab') {
                    event.preventDefault();
                    this.handleTabCompletion(splitInput);
                }
            });
        }
        
        // Close split button
        const closeSplitBtn = document.getElementById('closeSplit');
        if (closeSplitBtn) {
            closeSplitBtn.addEventListener('click', () => {
                this.exitSplitMode();
            });
        }
        
        // Focus buttons
        const focusTerminalBtn = document.getElementById('focusTerminal');
        const focusMonitorBtn = document.getElementById('focusMonitor');
        
        if (focusTerminalBtn) {
            focusTerminalBtn.addEventListener('click', () => {
                document.getElementById('commandInputSplit').focus();
            });
        }
        
        if (focusMonitorBtn) {
            focusMonitorBtn.addEventListener('click', () => {
                // Scroll monitor to top or refresh
                const monitorContent = document.querySelector('.monitor-content-split');
                if (monitorContent) {
                    monitorContent.scrollTop = 0;
                }
            });
        }
        
        // Refresh monitor button
        const refreshMonitorBtn = document.getElementById('refreshMonitor');
        if (refreshMonitorBtn) {
            refreshMonitorBtn.addEventListener('click', async () => {
                if (this.splitSystemMonitor) {
                    await this.splitSystemMonitor.updateAllData();
                }
            });
        }
        
        // Draggable divider functionality
        this.setupSplitDividerResize();
    }

    setupSplitDividerResize() {
        const divider = document.getElementById('splitDivider');
        const container = document.getElementById('splitScreenContainer');
        const terminalPane = document.querySelector('.terminal-pane');
        const monitorPane = document.querySelector('.monitor-pane');
        
        if (!divider || !container || !terminalPane || !monitorPane) return;
        
        let isResizing = false;
        
        divider.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = window.innerWidth > 768 ? 'col-resize' : 'row-resize';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const containerRect = container.getBoundingClientRect();
            
            if (window.innerWidth > 768) {
                // Desktop: horizontal resize
                const newTerminalWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
                const clampedWidth = Math.max(30, Math.min(70, newTerminalWidth));
                
                terminalPane.style.flex = `0 0 ${clampedWidth}%`;
                monitorPane.style.flex = `0 0 ${100 - clampedWidth}%`;
            } else {
                // Mobile: vertical resize
                const newTerminalHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
                const clampedHeight = Math.max(30, Math.min(70, newTerminalHeight));
                
                terminalPane.style.flex = `0 0 ${clampedHeight}%`;
                monitorPane.style.flex = `0 0 ${100 - clampedHeight}%`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
            }
        });
    }

    executeSplitCommand(command) {
        // Add command to split terminal output
        this.addSplitOutput(`adrian@split:~$ ${command}`, 'command');
        
        // Execute the command normally but redirect output to split
        const originalAddOutput = this.addOutput;
        this.addOutput = this.addSplitOutput.bind(this);
        
        // Execute command
        this.executeCommand(command);
        
        // Restore original output method
        this.addOutput = originalAddOutput;
        
        // Also add to main terminal history for consistency
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
    }

    addSplitOutput(text, className = 'info') {
        const splitOutput = document.getElementById('terminalOutputSplit');
        if (!splitOutput) return;
        
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        line.textContent = text;
        
        splitOutput.appendChild(line);
        splitOutput.scrollTop = splitOutput.scrollHeight;
        
        // Also add to main terminal for consistency
        const mainOutput = document.getElementById('terminalOutput');
        if (mainOutput) {
            const mainLine = document.createElement('div');
            mainLine.className = `output-line ${className}`;
            mainLine.textContent = text;
            mainOutput.appendChild(mainLine);
        }
    }

    exitSplitMode() {
        // Hide split screen container
        const splitContainer = document.getElementById('splitScreenContainer');
        splitContainer.style.display = 'none';
        
        // Show main terminal
        document.getElementById('terminal').style.display = 'block';
        
        // Clean up split monitor
        if (this.splitSystemMonitor) {
            this.splitSystemMonitor.isActive = false;
        }
        
        if (this.splitMonitorInterval) {
            clearInterval(this.splitMonitorInterval);
        }
        
        // Focus main terminal input
        document.getElementById('commandInput').focus();
        
        this.addOutput('', 'info');
        this.addOutput('🔗 Exited split screen mode', 'success');
    }

    // Boot Sequence Methods
    startBootSequence() {
        const bootContainer = document.getElementById('bootSequence');
        if (!bootContainer) return;
        
        // Clear any existing content
        bootContainer.innerHTML = '';
        
        // Define realistic boot sequence messages
        const bootMessages = [
            'BIOS: UEFI Boot Manager v2.4.1',
            'Initializing hardware components...',
            'CPU: AMD Ryzen 9 7900X @ 4.7GHz [OK]',
            'Memory: 64GB DDR5-5600 [OK]',
            'Storage: 2TB NVMe SSD Samsung 980 PRO [OK]',
            'GPU: NVIDIA RTX 4090 24GB [OK]',
            'Network: Gigabit Ethernet [OK]',
            'USB: 12 ports detected [OK]',
            '',
            'Loading kernel modules...',
            'systemd: Starting system initialization',
            'Loading neural network drivers...',
            'AI subsystem: Claude integration [OK]',
            'Voice recognition engine [OK]',
            'Audio synthesis engine [OK]',
            'WebGL renderer [OK]',
            'Chart.js visualization [OK]',
            '',
            'Starting network services...',
            'GitHub Actions API [OK]',
            'Weather API (BOM) [OK]',
            'Research paper indexing [OK]',
            'Terminal interface [OK]',
            'System monitor [OK]',
            '',
            'Recursive systems architecture: ACTIVE',
            'Self-improving algorithms: ENABLED',
            'Neural pathways: SYNCHRONIZED',
            'Quantum entanglement matrix: STABLE',
            'Reality.exe: RUNNING',
            '',
            'System initialization complete.',
            'Welcome to ADRIAN.SYS Terminal Interface',
            'Type "help" for available commands',
        ];
        
        this.typeBootMessages(bootMessages, 0);
    }
    
    typeBootMessages(messages, index) {
        if (index >= messages.length) {
            // Boot complete - show ready prompt
            setTimeout(() => {
                this.showBootComplete();
            }, 500);
            return;
        }
        
        const message = messages[index];
        const bootContainer = document.getElementById('bootSequence');
        
        if (message === '') {
            // Empty line - just add space and continue quickly
            const line = document.createElement('div');
            line.className = 'boot-line';
            line.innerHTML = '&nbsp;';
            bootContainer.appendChild(line);
            
            setTimeout(() => {
                this.typeBootMessages(messages, index + 1);
            }, 50);
            return;
        }
        
        // Create line element
        const line = document.createElement('div');
        line.className = 'boot-line';
        bootContainer.appendChild(line);
        
        // Type out the message character by character (fast)
        let charIndex = 0;
        const typeChar = () => {
            if (charIndex < message.length) {
                line.textContent += message[charIndex];
                charIndex++;
                // Very fast typing - 10-20ms per character
                setTimeout(typeChar, Math.random() * 10 + 5);
            } else {
                // Line complete - scroll and continue to next
                bootContainer.scrollTop = bootContainer.scrollHeight;
                
                // Short delay before next line (50-150ms)
                setTimeout(() => {
                    this.typeBootMessages(messages, index + 1);
                }, Math.random() * 100 + 25);
            }
        };
        
        typeChar();
    }
    
    showBootComplete() {
        const bootContainer = document.getElementById('bootSequence');
        
        // Add final status line
        const statusLine = document.createElement('div');
        statusLine.className = 'boot-line status-line';
        statusLine.innerHTML = 'Ready for interaction: <span class="status-online">ACTIVE</span>';
        bootContainer.appendChild(statusLine);
        
        // Focus the command input
        const commandInput = document.getElementById('commandInput');
        if (commandInput) {
            commandInput.focus();
        }
        
        // Optional: Add subtle completion effect
        setTimeout(() => {
            bootContainer.style.borderLeft = '3px solid #00ff41';
            setTimeout(() => {
                bootContainer.style.borderLeft = 'none';
            }, 1000);
        }, 200);
    }

    // Inline Chat Methods
    async handleChatMessage(message) {
        // Check for exit commands
        if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
            this.exitChatMode();
            return;
        }

        // Display user message
        this.addOutput(message, 'chat-user');
        this.addOutput('', 'info');
        
        // Show thinking indicator
        this.addOutput('Adrian.AI: 🤖 Processing...', 'chat-ai-thinking');

        try {
            // Generate session ID if needed
            if (!this.chatSessionId) {
                this.chatSessionId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }

            // Use enhanced AI service with caching
            const contextPrompt = `Current session context: Interactive terminal chat with Adrian Wedd's AI persona. 
            User is exploring the terminal interface with retro computing aesthetics, music synthesis, 
            and advanced AI token optimization features.`;
            
            const result = await this.aiService.sendChatRequest(message, this.chatSessionId, contextPrompt);
            
            // Remove thinking indicator
            this.removeLastOutput();
            
            if (result.fromCache) {
                this.addOutput('Adrian.AI: 🎯 Retrieved from cache...', 'chat-ai-thinking');
                setTimeout(async () => {
                    this.removeLastOutput();
                    await this.displayChatResponse(result.response + '\n\n💾 [Cached Response]');
                }, 500);
            } else {
                this.displayChatResponse(result.response);
            }
        } catch (error) {
            console.warn('Enhanced AI service not available, using fallback:', error);
            // Remove thinking indicator
            this.removeLastOutput();
            
            // Use local response
            const fallbackResponse = this.generateAIResponse(message);
            setTimeout(async () => {
                await this.displayChatResponse(fallbackResponse + '\n\n⚠️ [Offline Mode]');
            }, 1000);
        }
    }

    async displayChatResponse(response) {
        // Create output element for streaming
        const terminal = document.getElementById('terminal');
        const outputElement = document.createElement('div');
        outputElement.className = 'output-line chat-ai';
        
        const terminalContent = terminal.querySelector('.terminal-content');
        if (terminalContent) {
            terminalContent.appendChild(outputElement);
        } else {
            // Fallback for backwards compatibility
            const promptLine = terminal.querySelector('.prompt-line');
            terminal.insertBefore(outputElement, promptLine);
        }
        
        // Stream the response with typing effect
        const profile = this.textStreamer.getTypingProfile('chat');
        await this.textStreamer.streamText(outputElement, 'Adrian.AI: ' + response, profile);
        
        this.addOutput('', 'info');
        this.scrollToBottom();
    }

    async pollForChatResponse(sessionId, attempts = 0, maxAttempts = 20) {
        if (attempts >= maxAttempts) {
            this.removeLastOutput();
            this.addOutput('Adrian.AI: ⏰ Response timed out. Neural networks may be overloaded.', 'chat-ai');
            this.addOutput('', 'info');
            return;
        }

        try {
            const response = await fetch(`/api/chat-status?sessionId=${sessionId}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.status === 'completed') {
                    this.removeLastOutput();
                    this.displayChatResponse(data.response);
                    return;
                }
            }
        } catch (error) {
            console.warn('Polling error:', error);
        }

        // Continue polling
        setTimeout(() => {
            this.pollForChatResponse(sessionId, attempts + 1, maxAttempts);
        }, 3000);
    }

    exitChatMode() {
        this.inChatMode = false;
        this.chatSessionId = null;
        this.addOutput('', 'info');
        this.addOutput('╭─ CHAT SESSION ENDED ───────────────────────────╮', 'chat-border');
        this.addOutput('│ Returned to terminal mode                      │', 'chat-content');
        this.addOutput('╰─────────────────────────────────────────────────╯', 'chat-border');
        this.addOutput('', 'info');
        this.updatePrompt();
    }

    updatePrompt() {
        const promptElement = document.querySelector('.prompt');
        if (this.inChatMode) {
            promptElement.textContent = 'chat>';
        } else {
            promptElement.textContent = 'adrian@home:~$';
        }
    }

    removeLastOutput() {
        const terminal = document.getElementById('terminal');
        const outputLines = terminal.querySelectorAll('.output-line');
        if (outputLines.length > 0) {
            const lastOutput = outputLines[outputLines.length - 1];
            if (!lastOutput.classList.contains('prompt-line')) {
                lastOutput.remove();
            }
        }
    }

    // Token Statistics Display
    showTokenStats() {
        const stats = this.aiService.getTokenStats();
        const sessionDuration = this.formatDuration(stats.sessionDuration);
        
        const tokenLines = [
            '',
            '🧠 AI TOKEN ANALYTICS',
            '',
            `Total Requests:     ${stats.totalRequests}`,
            `Cache Efficiency:   ${stats.cacheEfficiency}%`,
            `Cache Hits/Misses:  ${stats.cacheHits}/${stats.cacheMisses}`,
            '',
            `Input Tokens:       ${stats.inputTokens.toLocaleString()}`,
            `Output Tokens:      ${stats.outputTokens.toLocaleString()}`,
            `Cached Tokens:      ${stats.cachedTokens.toLocaleString()}`,
            `Total Tokens:       ${stats.totalTokens.toLocaleString()}`,
            '',
            `Avg per Request:    ${stats.tokensPerRequest}`,
            `Cache Size:         ${stats.cacheSize}/50`,
            `Session Time:       ${sessionDuration}`,
            '',
            'Use "cache stats" for detailed cache information',
            'Use "cache clear" to reset prompt cache',
            ''
        ];

        tokenLines.forEach(line => {
            if (line.includes('🧠')) {
                this.addOutput(line, 'success');
            } else if (line.includes(':')) {
                const [label, value] = line.split(':');
                const formatted = `${label}:${value}`;
                this.addOutput(formatted, 'info');
            } else {
                this.addOutput(line, 'info');
            }
        });
    }

    // Cache Management Commands
    handleCacheCommand(args) {
        if (args.length === 0) {
            this.addOutput('Cache commands: stats, clear', 'info');
            return;
        }

        const subcommand = args[0].toLowerCase();
        
        switch (subcommand) {
            case 'stats':
                this.showCacheStats();
                break;
            case 'clear':
                this.clearCache();
                break;
            default:
                this.addOutput(`Unknown cache command: ${subcommand}`, 'error');
                this.addOutput('Available: stats, clear', 'info');
        }
    }

    showCacheStats() {
        const stats = this.aiService.getTokenStats();
        const cacheMap = this.aiService.promptCache;
        
        this.addOutput('', 'info');
        this.addOutput('📊 PROMPT CACHE STATISTICS', 'success');
        this.addOutput('', 'info');
        this.addOutput(`Cache Size:        ${stats.cacheSize}/50 entries`, 'info');
        this.addOutput(`Cache Efficiency:  ${stats.cacheEfficiency}% hit rate`, 'info');
        this.addOutput(`Total Hits:        ${stats.cacheHits}`, 'info');
        this.addOutput(`Total Misses:      ${stats.cacheMisses}`, 'info');
        
        if (cacheMap.size > 0) {
            this.addOutput('', 'info');
            this.addOutput('Recent Cache Entries:', 'command');
            
            // Show most recent 5 cache entries
            const entries = Array.from(cacheMap.entries()).slice(-5);
            entries.forEach(([key, value]) => {
                const age = Math.floor((Date.now() - value.timestamp) / 1000);
                const hits = value.hits;
                this.addOutput(`  ${key.substring(0, 8)}... (${hits} hits, ${age}s ago)`, 'info');
            });
        }
        
        this.addOutput('', 'info');
        this.addOutput(`Token Savings:     ~${stats.cachedTokens.toLocaleString()} tokens cached`, 'success');
        this.addOutput('', 'info');
    }

    clearCache() {
        this.aiService.clearCache();
        this.addOutput('🗑️  Prompt cache cleared', 'success');
        this.addOutput('Cache will rebuild as new patterns are detected', 'info');
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Voice Interface Methods
    async initVoiceInterface() {
        try {
            this.voiceInterface = new VoiceInterface();
            const initialized = await this.voiceInterface.init();
            const button = document.getElementById('voiceToggle');
            
            if (initialized) {
                this.addOutput('🎤 Voice interface initialized', 'success');
                this.addOutput('Say "Adrian" or "Computer" to activate voice commands', 'info');
                
                // Update button text to show it's ready
                if (button) {
                    button.textContent = 'Voice Ready';
                    button.classList.remove('error');
                }
            } else {
                this.addOutput('⚠️ Voice interface not available', 'error');
                if (button) {
                    button.textContent = 'Voice Unavailable';
                    button.classList.add('error');
                }
            }
        } catch (error) {
            console.error('Voice interface initialization failed:', error);
            this.addOutput('❌ Voice interface failed to initialize', 'error');
            const button = document.getElementById('voiceToggle');
            if (button) {
                button.textContent = 'Voice Error';
                button.classList.add('error');
            }
        }
    }

    toggleVoice() {
        if (!this.voiceInterface) {
            this.addOutput('Voice interface not available', 'error');
            return;
        }

        const success = this.voiceInterface.toggle();
        const button = document.getElementById('voiceToggle');
        
        if (success) {
            this.voiceEnabled = true;
            button.textContent = 'Disable Voice';
            button.classList.add('active');
            this.addOutput('🎤 Voice interface activated', 'success');
            this.addOutput('Say "Adrian", "Computer", or "Hey Adrian" to get my attention', 'info');
        } else {
            this.voiceEnabled = false;
            button.textContent = 'Voice Ready';
            button.classList.remove('active');
            this.addOutput('🔇 Voice interface deactivated', 'info');
        }
    }

    handleVoiceCommand(args) {
        if (!this.voiceInterface) {
            this.addOutput('Voice interface not available', 'error');
            return;
        }

        if (args.length === 0) {
            this.showVoiceStatus();
            return;
        }

        const subcommand = args[0].toLowerCase();
        
        switch (subcommand) {
            case 'on':
            case 'start':
                if (this.voiceInterface.startListening()) {
                    this.voiceEnabled = true;
                    document.getElementById('voiceToggle').classList.add('active');
                    this.addOutput('🎤 Voice listening started', 'success');
                } else {
                    this.addOutput('❌ Failed to start voice listening', 'error');
                }
                break;
                
            case 'off':
            case 'stop':
                this.voiceInterface.stopListening();
                this.voiceEnabled = false;
                document.getElementById('voiceToggle').classList.remove('active');
                this.addOutput('🔇 Voice listening stopped', 'info');
                break;
                
            case 'status':
                this.showVoiceStatus();
                break;
                
            case 'rate':
                if (args[1]) {
                    const rate = parseFloat(args[1]);
                    this.voiceInterface.setVoiceRate(rate);
                    this.addOutput(`🗣️ Voice rate set to ${rate}`, 'success');
                } else {
                    this.addOutput('Usage: voice rate <0.1-3.0>', 'error');
                }
                break;
                
            case 'pitch':
                if (args[1]) {
                    const pitch = parseFloat(args[1]);
                    this.voiceInterface.setVoicePitch(pitch);
                    this.addOutput(`🎵 Voice pitch set to ${pitch}`, 'success');
                } else {
                    this.addOutput('Usage: voice pitch <0.0-2.0>', 'error');
                }
                break;
                
            case 'volume':
                if (args[1]) {
                    const volume = parseFloat(args[1]);
                    this.voiceInterface.setVoiceVolume(volume);
                    this.addOutput(`🔊 Voice volume set to ${volume}`, 'success');
                } else {
                    this.addOutput('Usage: voice volume <0.0-1.0>', 'error');
                }
                break;
                
            default:
                this.addOutput(`Unknown voice command: ${subcommand}`, 'error');
                this.addOutput('Available: on, off, status, rate, pitch, volume', 'info');
        }
    }

    handleSpeakCommand(args) {
        if (!this.voiceInterface) {
            this.addOutput('Voice interface not available', 'error');
            return;
        }

        if (args.length === 0) {
            this.addOutput('Usage: speak <text to say>', 'error');
            return;
        }

        const text = args.join(' ');
        this.voiceInterface.speak(text);
        this.addOutput(`🗣️ Speaking: "${text}"`, 'info');
    }

    showVoiceStatus() {
        if (!this.voiceInterface) {
            this.addOutput('Voice interface not available', 'error');
            return;
        }

        const status = this.voiceInterface.getVoiceStatus();
        
        this.addOutput('', 'info');
        this.addOutput('🎤 VOICE INTERFACE STATUS', 'success');
        this.addOutput('', 'info');
        this.addOutput(`Active:         ${status.isActive ? 'Yes' : 'No'}`, 'info');
        this.addOutput(`Listening:      ${status.isListening ? 'Yes' : 'No'}`, 'info');
        this.addOutput(`Wake Word:      ${status.wakeWordActive ? 'Detected' : 'Waiting'}`, 'info');
        this.addOutput(`Current Voice:  ${status.currentVoice || 'None'}`, 'info');
        this.addOutput('', 'info');
        this.addOutput('Settings:', 'command');
        this.addOutput(`  Rate:         ${status.settings.rate}`, 'info');
        this.addOutput(`  Pitch:        ${status.settings.pitch}`, 'info');
        this.addOutput(`  Volume:       ${status.settings.volume}`, 'info');
        this.addOutput('', 'info');
        this.addOutput('Wake Words: "Adrian", "Computer", "Terminal", "Hey Adrian"', 'info');
        this.addOutput('Commands: voice [on|off|status], speak <text>', 'info');
        this.addOutput('', 'info');
    }

    // Markdown Content Loading
    async showMarkdownContent(key) {
        this.addOutput('', 'info');
        this.addOutput('📄 Loading content...', 'info');
        
        try {
            await this.markdownLoader.renderContentToTerminal(key, this);
        } catch (error) {
            this.addOutput(`❌ Failed to load ${key}: ${error.message}`, 'error');
            // Fallback to original content methods
            this.showFallbackContent(key);
        }
    }

    showFallbackContent(key) {
        switch (key) {
            case 'about':
                this.showAbout();
                break;
            case 'projects':
                this.showProjects();
                break;
            case 'skills':
                this.showSkills();
                break;
            case 'home':
                this.showHome();
                break;
            case 'veritas':
                this.showVeritas();
                break;
        }
    }

    // Terminal-style focus management
    setupTerminalFocus() {
        const input = document.getElementById('commandInput');
        
        // Focus input when clicking anywhere on the page (except interactive elements)
        document.addEventListener('click', (e) => {
            // Don't interfere with interactive elements
            if (e.target.tagName === 'A' || 
                e.target.tagName === 'BUTTON' || 
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.tagName === 'SELECT' ||
                e.target.type === 'text' ||
                e.target.type === 'button' ||
                e.target.contentEditable === 'true' ||
                e.target.classList.contains('voice-toggle') ||
                e.target.classList.contains('paper-link') ||
                e.target.closest('.voice-controls') ||
                e.target.closest('button') ||
                e.target.closest('a')) {
                return;
            }
            
            // Focus the command input and prevent default
            e.preventDefault();
            input.focus();
            
            // Move cursor to end if there's text
            if (input.value) {
                input.setSelectionRange(input.value.length, input.value.length);
            }
        });
        
        // Keep focus on input unless explicitly focusing elsewhere
        document.addEventListener('focusin', (e) => {
            // Allow focus on interactive elements, but return to input afterward for non-interactive elements
            if (e.target !== input && 
                e.target.tagName !== 'A' && 
                e.target.tagName !== 'BUTTON' &&
                e.target.tagName !== 'INPUT' &&
                e.target.tagName !== 'TEXTAREA' &&
                e.target.tagName !== 'SELECT' &&
                !e.target.classList.contains('voice-toggle') &&
                !e.target.closest('.voice-controls')) {
                setTimeout(() => {
                    if (document.activeElement !== input) {
                        input.focus();
                    }
                }, 100);
            }
        });
        
        // Ensure input stays focused when terminal gains focus
        window.addEventListener('focus', () => {
            setTimeout(() => {
                if (!document.activeElement || 
                    (document.activeElement.tagName !== 'INPUT' && 
                     document.activeElement.tagName !== 'TEXTAREA' &&
                     document.activeElement.tagName !== 'BUTTON')) {
                    input.focus();
                }
            }, 100);
        });
        
        // Handle escape key to return focus to input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.activeElement !== input) {
                e.preventDefault();
                input.focus();
            }
        });
        
        // Re-focus input after commands execute
        const originalAddOutput = this.addOutput.bind(this);
        this.addOutput = function(text, className) {
            originalAddOutput(text, className);
            // Re-focus after a brief delay to allow command processing
            setTimeout(() => {
                if (!this.inChatMode && document.activeElement !== input) {
                    input.focus();
                }
            }, 50);
        };
    }

    // Initialize research streamer
    async initResearchStreamer() {
        try {
            if (window.EnhancedResearchStreamer) {
                this.researchStreamer = new EnhancedResearchStreamer();
                console.log('Enhanced research streamer initialized');
            } else {
                console.warn('EnhancedResearchStreamer not available, using fallback');
            }
        } catch (error) {
            console.error('Failed to initialize research streamer:', error);
        }
    }

    // Enhanced research command handler
    async handleResearchCommand(args) {
        if (!this.researchStreamer) {
            this.addOutput('❌ Research streamer not available', 'error');
            this.addOutput('Enhanced research features require research-streamer-enhanced.js', 'info');
            return;
        }

        if (args.length === 0) {
            this.showResearchHelp();
            return;
        }

        const subcommand = args[0].toLowerCase();
        const remainingArgs = args.slice(1);
        
        switch (subcommand) {
            case 'stream':
                await this.startResearchStream(remainingArgs);
                break;
                
            case 'search':
                this.searchResearchPapers(remainingArgs);
                break;
                
            case 'list':
                this.listResearchPapers(remainingArgs);
                break;
                
            case 'categories':
                this.showResearchCategories();
                break;
                
            case 'stats':
                this.showResearchStats();
                break;
                
            case 'local':
            case 'personal':
                await this.startResearchStream(['local']);
                break;
                
            case 'global':
                await this.startResearchStream(['global']);
                break;
                
            case 'hybrid':
                await this.startResearchStream(['hybrid']);
                break;
                
            default:
                this.addOutput(`Unknown research command: ${subcommand}`, 'error');
                this.showResearchHelp();
        }
    }

    showResearchHelp() {
        this.addOutput('', 'info');
        this.addOutput('📚 RESEARCH STREAMING SYSTEM', 'success');
        this.addOutput('', 'info');
        this.addOutput('Commands:', 'feature-highlight');
        this.addOutput('  research stream [mode]     Start interactive research stream', 'info');
        this.addOutput('  research search <query>    Search research papers', 'info');
        this.addOutput('  research list [category]   List papers by category', 'info');
        this.addOutput('  research categories        Show available categories', 'info');
        this.addOutput('  research stats             Show research statistics', 'info');
        this.addOutput('', 'info');
        this.addOutput('Streaming Modes:', 'feature-highlight');
        this.addOutput('  local     - Local markdown papers only', 'ai-highlight');
        this.addOutput('  global    - External sources (arXiv, Semantic Scholar)', 'ai-highlight');
        this.addOutput('  hybrid    - Combined local and global sources', 'ai-highlight');
        this.addOutput('', 'info');
        this.addOutput('Examples:', 'feature-highlight');
        this.addOutput('  research stream local              # Stream local papers', 'info');
        this.addOutput('  research search "ai safety"        # Search for AI safety papers', 'info');
        this.addOutput('  research list agent-systems        # List multi-agent papers', 'info');
        this.addOutput('', 'info');
    }

    async startResearchStream(args) {
        const mode = args[0] || 'local';
        const category = args[1] || 'all';
        const query = args.slice(2).join(' ');
        
        this.addOutput('', 'info');
        this.addOutput(`🔄 Starting research stream in ${mode} mode...`, 'success');
        
        if (category !== 'all') {
            this.addOutput(`📂 Category filter: ${category}`, 'info');
        }
        
        if (query) {
            this.addOutput(`🔍 Search query: "${query}"`, 'info');
        }
        
        this.addOutput('', 'info');
        this.addOutput('📊 Research papers will be displayed below:', 'feature-highlight');
        this.addOutput('', 'info');
        
        // Create a container for the research stream
        const streamContainer = document.createElement('div');
        streamContainer.className = 'research-stream-display';
        streamContainer.style.cssText = `
            margin: 20px 0;
            padding: 20px;
            border: 1px solid var(--terminal-green);
            border-radius: 8px;
            background: rgba(0, 255, 65, 0.05);
            max-height: 600px;
            overflow-y: auto;
        `;
        
        this.addOutput(streamContainer, 'info');
        
        // Start the enhanced streaming
        try {
            await this.researchStreamer.startStreaming(streamContainer, {
                mode: mode,
                category: category,
                query: query
            });
            
            this.addOutput('', 'info');
            this.addOutput('✨ Research stream active! Click on papers for details.', 'success');
            this.addOutput('Use Ctrl+C or type a new command to exit stream mode.', 'info');
            this.addOutput('', 'info');
            
        } catch (error) {
            this.addOutput(`❌ Failed to start research stream: ${error.message}`, 'error');
        }
    }

    searchResearchPapers(args) {
        if (args.length === 0) {
            this.addOutput('Usage: research search <query>', 'error');
            return;
        }
        
        const query = args.join(' ');
        const results = this.researchStreamer.searchPapers(query);
        
        this.addOutput('', 'info');
        this.addOutput(`🔍 SEARCH RESULTS for "${query}"`, 'success');
        this.addOutput('', 'info');
        
        if (results.length === 0) {
            this.addOutput('No papers found matching your search query.', 'info');
            this.addOutput('Try different keywords or check available categories.', 'info');
        } else {
            this.addOutput(`Found ${results.length} matching papers:`, 'feature-highlight');
            this.addOutput('', 'info');
            
            results.slice(0, 10).forEach((paper, index) => {
                this.addOutput(`${index + 1}. ${paper.title}`, 'ai-highlight');
                this.addOutput(`   Authors: ${paper.authors.slice(0, 2).join(', ')}`, 'info');
                this.addOutput(`   Source: ${paper.source} | Relevance: ${paper.relevanceScore}%`, 'info');
                this.addOutput('', 'info');
            });
            
            if (results.length > 10) {
                this.addOutput(`... and ${results.length - 10} more papers`, 'info');
                this.addOutput('Use "research stream" to view all results interactively', 'feature-highlight');
            }
        }
        this.addOutput('', 'info');
    }

    listResearchPapers(args) {
        const category = args[0] || 'all';
        
        let papers;
        if (category === 'all') {
            papers = this.researchStreamer.getPapers();
        } else {
            papers = this.researchStreamer.getPapersByCategory(category);
        }
        
        this.addOutput('', 'info');
        this.addOutput(`📋 RESEARCH PAPERS - ${category.toUpperCase()}`, 'success');
        this.addOutput('', 'info');
        
        if (papers.length === 0) {
            this.addOutput(`No papers found in category: ${category}`, 'info');
            this.addOutput('Use "research categories" to see available categories', 'feature-highlight');
        } else {
            this.addOutput(`Total papers: ${papers.length}`, 'feature-highlight');
            this.addOutput('', 'info');
            
            // Show top 15 papers
            papers.slice(0, 15).forEach((paper, index) => {
                const relevanceBar = '█'.repeat(Math.floor(paper.relevanceScore / 10)) + 
                                   '░'.repeat(10 - Math.floor(paper.relevanceScore / 10));
                
                this.addOutput(`${index + 1}. ${paper.title}`, 'ai-highlight');
                this.addOutput(`   [${relevanceBar}] ${paper.relevanceScore}% | ${paper.source}`, 'info');
                this.addOutput('', 'info');
            });
            
            if (papers.length > 15) {
                this.addOutput(`... and ${papers.length - 15} more papers`, 'info');
                this.addOutput('Use "research stream" for full interactive view', 'feature-highlight');
            }
        }
        this.addOutput('', 'info');
    }

    showResearchCategories() {
        if (!this.researchStreamer.categories) {
            this.addOutput('❌ Research categories not available', 'error');
            return;
        }
        
        this.addOutput('', 'info');
        this.addOutput('📂 RESEARCH CATEGORIES', 'success');
        this.addOutput('', 'info');
        
        Object.entries(this.researchStreamer.categories).forEach(([key, label]) => {
            const count = this.researchStreamer.getPapersByCategory(key).length;
            this.addOutput(`${key.padEnd(20)} ${label} (${count} papers)`, 'info');
        });
        
        this.addOutput('', 'info');
        this.addOutput('Usage: research list <category-key>', 'feature-highlight');
        this.addOutput('', 'info');
    }

    showResearchStats() {
        const allPapers = this.researchStreamer.getPapers();
        const localPapers = this.researchStreamer.getLocalPapers();
        
        this.addOutput('', 'info');
        this.addOutput('📊 RESEARCH STATISTICS', 'success');
        this.addOutput('', 'info');
        
        this.addOutput(`Total Papers:        ${allPapers.length}`, 'info');
        this.addOutput(`Local Papers:        ${localPapers.length}`, 'info');
        this.addOutput(`External Papers:     ${allPapers.length - localPapers.length}`, 'info');
        this.addOutput('', 'info');
        
        // Category breakdown
        this.addOutput('Category Breakdown:', 'feature-highlight');
        Object.entries(this.researchStreamer.categories).forEach(([key, label]) => {
            if (key !== 'all') {
                const count = this.researchStreamer.getPapersByCategory(key).length;
                this.addOutput(`  ${label}: ${count}`, 'info');
            }
        });
        
        this.addOutput('', 'info');
        
        // Top papers by relevance
        const topPapers = this.researchStreamer.getTopPapersByRelevance(5);
        this.addOutput('Top 5 Most Relevant Papers:', 'feature-highlight');
        topPapers.forEach((paper, index) => {
            this.addOutput(`  ${index + 1}. ${paper.title} (${paper.relevanceScore}%)`, 'ai-highlight');
        });
        
        this.addOutput('', 'info');
    }

    // Fuzzy matching utility
    fuzzyMatch(pattern, text) {
        const p = pattern.toLowerCase();
        const t = text.toLowerCase();
        let tIndex = 0;
        for (let i = 0; i < p.length; i++) {
            const char = p[i];
            const found = t.indexOf(char, tIndex);
            if (found === -1) {
                return false;
            }
            tIndex = found + 1;
        }
        return true;
    }

    // Enhanced Tab completion with subcommand support
    handleTabCompletion(input) {
        const currentValue = input.value;
        const words = currentValue.split(' ');
        const command = words[0];
        const lastWord = words[words.length - 1];
        
        let matches = [];
        
        // Command completion (first word)
        if (words.length === 1) {
            matches = this.availableCommands.filter(cmd => 
                this.fuzzyMatch(lastWord, cmd)
            ).sort();
        } 
        // Subcommand and argument completion
        else {
            matches = this.getSubcommandCompletions(command, words, lastWord);
        }
        
        if (matches.length === 0) return;
        
        if (matches.length === 1) {
            // Single match - complete it
            const completedValue = this.buildCompletedCommand(currentValue, words, matches[0]);
            input.value = completedValue;
            this.resetCompletion();
        } else {
            // Multiple matches - cycle through them
            if (currentValue !== this.lastInput) {
                // New completion - start from beginning
                this.completionIndex = 0;
                this.lastInput = currentValue;
            } else {
                // Cycle to next completion
                this.completionIndex = (this.completionIndex + 1) % matches.length;
            }
            
            const completedValue = this.buildCompletedCommand(currentValue, words, matches[this.completionIndex]);
            input.value = completedValue;
            
            // Show available completions
            if (this.completionIndex === 0) {
                this.showCompletions(matches);
            }
        }
    }

    // Get subcommand completions based on command context
    getSubcommandCompletions(command, words, lastWord) {
        const completions = [];
        
        switch (command.toLowerCase()) {
            case 'theme':
                if (words.length === 2) {
                    // Theme names and commands
                    const themeOptions = [...this.availableThemes, 'list', 'refresh'];
                    return themeOptions.filter(option => 
                        this.fuzzyMatch(lastWord, option)
                    ).sort();
                }
                break;
                
            case 'grep':
                if (words.length === 2) {
                    // Common grep patterns
                    const grepPatterns = [
                        'function', 'class', 'const', 'let', 'var', 'import', 'export',
                        'TODO', 'FIXME', 'console.log', 'error', 'warning'
                    ];
                    return grepPatterns.filter(pattern => 
                        this.fuzzyMatch(lastWord, pattern)
                    );
                } else if (words.length === 3) {
                    // File paths and extensions
                    const fileTypes = [
                        '*.js', '*.css', '*.html', '*.md', '*.json', '*.yml',
                        'assets/', 'tests/', 'research/', '.github/'
                    ];
                    return fileTypes.filter(path => 
                        this.fuzzyMatch(lastWord, path)
                    );
                }
                break;
                
            case 'tail':
                if (words.length >= 2) {
                    // Available files for tail command
                    const tailFiles = [
                        'README.md', 'CLAUDE.md', 'CHANGELOG.md',
                        'assets/terminal.js', 'assets/ai-service.js',
                        'tests/README.md', 'research/'
                    ];
                    return tailFiles.filter(file => 
                        this.fuzzyMatch(lastWord, file)
                    );
                }
                break;
                
            case 'cat':
                if (words.length >= 2) {
                    // Available content files
                    const contentFiles = [
                        'about', 'projects', 'skills', 'contact', 'home'
                    ];
                    return contentFiles.filter(file => 
                        this.fuzzyMatch(lastWord, file)
                    );
                }
                break;
                
            case 'research':
                if (words.length === 2) {
                    // Research stream options
                    const researchOptions = ['personal', 'global', 'categories', 'stats'];
                    return researchOptions.filter(option => 
                        this.fuzzyMatch(lastWord, option)
                    );
                } else if (words.length === 3 && words[1] === 'search') {
                    // Research categories if we have research streamer
                    if (window.researchStreamer) {
                        const categories = window.researchStreamer.getAllCategories();
                        return categories.filter(cat => 
                            this.fuzzyMatch(lastWord, cat)
                        );
                    }
                }
                break;
                
            case 'effects':
            case 'particles':
                if (words.length === 2) {
                    const effectOptions = [
                        'matrix', 'snow', 'rain', 'stars', 'neural', 'code',
                        'stop', 'clear', 'list'
                    ];
                    return effectOptions.filter(effect => 
                        this.fuzzyMatch(lastWord, effect)
                    );
                }
                break;
                
            case 'music':
                if (words.length === 2) {
                    const musicOptions = ['start', 'stop', 'volume', 'frequency', 'waveform'];
                    return musicOptions.filter(option => 
                        this.fuzzyMatch(lastWord, option)
                    );
                }
                break;
                
            case 'voice':
                if (words.length === 2) {
                    const voiceOptions = ['enable', 'disable', 'status', 'wake'];
                    return voiceOptions.filter(option => 
                        this.fuzzyMatch(lastWord, option)
                    );
                }
                break;
        }
        
        return completions;
    }

    // Build the completed command string
    buildCompletedCommand(currentValue, words, completion) {
        const wordsCopy = [...words];
        wordsCopy[wordsCopy.length - 1] = completion;
        return wordsCopy.join(' ');
    }

    resetCompletion() {
        this.completionIndex = -1;
        this.lastInput = '';
    }

    showCompletions(matches) {
        if (matches.length > 1) {
            this.addOutput(`Tab completions: ${matches.join(', ')}`, 'info');
        }
    }

    handleThemeCommand(args) {
        if (args.length === 0) {
            this.addOutput('🎨 TERMINAL THEMES', 'success');
            this.addOutput('', 'info');
            this.addOutput('Available themes:', 'feature-highlight');
            this.addOutput('   • default', 'info');
            this.addOutput('   • dark-mode', 'info');
            this.addOutput('   • light-mode', 'info');
            this.addOutput('   • cyberpunk', 'info');
            this.addOutput('   • matrix', 'info');
            this.addOutput('', 'info');
            this.addOutput('Usage: theme <theme-name>', 'feature-highlight');
            return;
        }

        const themeName = args[0].toLowerCase();
        const availableThemes = ['default', 'dark-mode', 'light-mode', 'cyberpunk', 'matrix'];

        if (availableThemes.includes(themeName)) {
            this.applyTheme(themeName);
            this.addOutput(`🎨 Theme set to: ${themeName}`, 'success');
        } else {
            this.addOutput(`❌ Unknown theme: ${themeName}`, 'error');
            this.addOutput(`Available themes: ${availableThemes.join(', ')}`, 'info');
        }
    }

    // Theme System Methods
    handleThemeCommand(args) {
        if (args.length === 0) {
            this.showThemeStatus();
            return;
        }

        const command = args[0].toLowerCase();
        
        if (command === 'list') {
            this.showAvailableThemes();
            return;
        }
        
        if (command === 'refresh') {
            this.applyTheme(this.currentTheme);
            this.addOutput(`🔄 Theme refreshed: ${this.currentTheme}`, 'success');
            return;
        }

        if (this.availableThemes.includes(command)) {
            this.setTheme(command);
        } else {
            this.addOutput(`❌ Unknown theme: ${command}`, 'error');
            this.addOutput(`Available themes: ${this.availableThemes.join(', ')}`, 'info');
        }
    }

    showThemeStatus() {
        this.addOutput('', 'info');
        this.addOutput('🎨 TERMINAL THEME SYSTEM', 'success');
        this.addOutput('', 'info');
        this.addOutput(`Current Theme: ${this.currentTheme}`, 'feature-highlight');
        this.addOutput('', 'info');
        this.addOutput('Available Themes:', 'section-header');
        
        this.availableThemes.forEach(theme => {
            const status = theme === this.currentTheme ? '● active' : '○ inactive';
            const description = this.getThemeDescription(theme);
            this.addOutput(`   ${theme.padEnd(12)} ${status} - ${description}`, 'info');
        });
        
        this.addOutput('', 'info');
        this.addOutput('Usage:', 'feature-highlight');
        this.addOutput('   theme <name>     Switch to specified theme', 'info');
        this.addOutput('   theme list       Show all available themes', 'info');
        this.addOutput('', 'info');
        this.addOutput('Examples:', 'feature-highlight');
        this.addOutput('   theme cyberpunk  Switch to cyberpunk theme', 'ai-highlight');
        this.addOutput('   theme matrix     Switch to matrix theme', 'ai-highlight');
    }

    getThemeDescription(theme) {
        const descriptions = {
            'matrix': 'Classic green-on-black Matrix aesthetic',
            'cyberpunk': 'Pink and cyan neon cyberpunk vibes',
            'amber': 'Warm amber monochrome retro terminal',
            'synthwave': 'Purple and magenta synthwave colors'
        };
        return descriptions[theme] || 'Custom theme';
    }

    setTheme(themeName) {
        if (!this.availableThemes.includes(themeName)) {
            this.addOutput(`❌ Invalid theme: ${themeName}`, 'error');
            this.addOutput(`Available themes: ${this.availableThemes.join(', ')}`, 'info');
            return;
        }

        this.currentTheme = themeName;
        localStorage.setItem('terminal-theme', themeName);
        
        // Apply theme to document
        this.applyTheme(themeName);
        
        this.addOutput(`🎨 Theme changed to: ${themeName}`, 'success');
        this.addOutput(`Theme will persist across sessions`, 'info');
    }

    applyTheme(themeName) {
        const body = document.body;
        
        // Remove existing theme attribute
        body.removeAttribute('data-theme');
        
        // Apply new theme (matrix is default, no data attribute needed)
        if (themeName !== 'matrix') {
            body.setAttribute('data-theme', themeName);
        }
        
        // Trigger CSS transitions
        body.style.transition = 'var(--theme-transition)';
        
        // Debug: Log the current theme attribute
        console.log('Applied theme:', themeName, 'data-theme:', body.getAttribute('data-theme'));
    }

    showAvailableThemes() {
        this.addOutput('', 'info');
        this.addOutput('🎨 AVAILABLE THEMES', 'success');
        this.addOutput('', 'info');
        
        this.availableThemes.forEach(theme => {
            const current = theme === this.currentTheme ? ' (current)' : '';
            const description = this.getThemeDescription(theme);
            this.addOutput(`${theme}${current}`, 'feature-highlight');
            this.addOutput(`   ${description}`, 'info');
            this.addOutput('', 'info');
        });
    }

    // File System Commands
    handleGrepCommand(args) {
        if (args.length === 0) {
            this.addOutput('Usage: grep <pattern> [file/command]', 'error');
            this.addOutput('Examples:', 'feature-highlight');
            this.addOutput('  grep "error" history    # Search command history', 'info');
            this.addOutput('  grep "token" research   # Search research papers', 'info');
            this.addOutput('  grep "ai" help         # Search help output', 'info');
            return;
        }

        const pattern = args[0];
        const target = args[1] || 'history';

        switch (target.toLowerCase()) {
            case 'history':
                this.grepHistory(pattern);
                break;
            case 'research':
                this.grepResearch(pattern);
                break;
            case 'help':
                this.grepHelp(pattern);
                break;
            default:
                this.addOutput(`grep: ${target}: No such file or command output`, 'error');
                this.addOutput('Available targets: history, research, help', 'info');
        }
    }

    grepHistory(pattern) {
        const regex = new RegExp(pattern, 'i');
        const matches = this.commandHistory.filter(cmd => regex.test(cmd));
        
        this.addOutput('', 'info');
        this.addOutput(`🔍 GREP RESULTS: "${pattern}" in command history`, 'success');
        this.addOutput('', 'info');
        
        if (matches.length === 0) {
            this.addOutput('No matches found', 'info');
        } else {
            matches.forEach((match, index) => {
                const highlighted = match.replace(regex, `\x1b[43m\x1b[30m$&\x1b[0m`);
                this.addOutput(`${index + 1}: ${highlighted}`, 'info');
            });
            this.addOutput('', 'info');
            this.addOutput(`Found ${matches.length} matches`, 'feature-highlight');
        }
    }

    grepResearch(pattern) {
        if (!this.researchStreamer) {
            this.addOutput('Research system not available', 'error');
            return;
        }

        const papers = this.researchStreamer.searchPapers(pattern);
        this.addOutput('', 'info');
        this.addOutput(`🔍 GREP RESULTS: "${pattern}" in research papers`, 'success');
        this.addOutput('', 'info');
        
        if (papers.length === 0) {
            this.addOutput('No matches found', 'info');
        } else {
            papers.slice(0, 10).forEach(paper => {
                this.addOutput(`📄 ${paper.title}`, 'ai-highlight');
                if (paper.abstract) {
                    const abstract = paper.abstract.substring(0, 150) + '...';
                    this.addOutput(`   ${abstract}`, 'info');
                }
                this.addOutput('', 'info');
            });
            if (papers.length > 10) {
                this.addOutput(`... and ${papers.length - 10} more results`, 'feature-highlight');
            }
        }
    }

    grepHelp(pattern) {
        const helpOutput = [
            'BASIC COMMANDS', 'help', 'about', 'projects', 'skills', 'home', 'veritas', 'whoami', 'pwd', 'ls',
            'INTERACTIVE FEATURES', 'chat', 'matrix', 'clear', 'history', 'neofetch', 'uptime', 'magic', 'particles',
            'SYSTEM MONITORING', 'monitor', 'weather', 'actions', 'runs', 'trigger', 'ps', 'tokens', 'cache',
            'VOICE & MUSIC', 'voice', 'speak', 'music', 'volume', 'stop',
            'ADVANCED FEATURES', 'research', 'theme', 'effects'
        ];
        
        const regex = new RegExp(pattern, 'i');
        const matches = helpOutput.filter(item => regex.test(item));
        
        this.addOutput('', 'info');
        this.addOutput(`🔍 GREP RESULTS: "${pattern}" in help system`, 'success');
        this.addOutput('', 'info');
        
        if (matches.length === 0) {
            this.addOutput('No matches found', 'info');
        } else {
            matches.forEach(match => {
                const highlighted = match.replace(regex, `\x1b[43m\x1b[30m$&\x1b[0m`);
                this.addOutput(`• ${highlighted}`, 'info');
            });
            this.addOutput('', 'info');
            this.addOutput(`Found ${matches.length} matches`, 'feature-highlight');
        }
    }

    handleTailCommand(args) {
        if (args.length === 0) {
            this.addOutput('Usage: tail [-n lines] <file/log>', 'error');
            this.addOutput('Examples:', 'feature-highlight');
            this.addOutput('  tail history           # Show last 10 commands', 'info');
            this.addOutput('  tail -n 20 history     # Show last 20 commands', 'info');
            this.addOutput('  tail research          # Show recent research papers', 'info');
            this.addOutput('  tail system            # Show system logs', 'info');
            return;
        }

        let lines = 10;
        let target = args[0];
        
        // Parse -n option
        if (args[0] === '-n' && args.length >= 3) {
            lines = parseInt(args[1]) || 10;
            target = args[2];
        }

        switch (target.toLowerCase()) {
            case 'history':
                this.tailHistory(lines);
                break;
            case 'research':
                this.tailResearch(lines);
                break;
            case 'system':
                this.tailSystem(lines);
                break;
            default:
                this.addOutput(`tail: ${target}: No such file or log`, 'error');
                this.addOutput('Available targets: history, research, system', 'info');
        }
    }

    tailHistory(lines) {
        const recent = this.commandHistory.slice(-lines);
        
        this.addOutput('', 'info');
        this.addOutput(`📜 TAIL: Last ${lines} commands`, 'success');
        this.addOutput('', 'info');
        
        if (recent.length === 0) {
            this.addOutput('No command history available', 'info');
        } else {
            recent.forEach((cmd, index) => {
                const lineNum = this.commandHistory.length - recent.length + index + 1;
                this.addOutput(`${lineNum.toString().padStart(3)}: ${cmd}`, 'info');
            });
        }
    }

    tailResearch(lines) {
        if (!this.researchStreamer) {
            this.addOutput('Research system not available', 'error');
            return;
        }

        const papers = this.researchStreamer.getPapers().slice(-lines);
        
        this.addOutput('', 'info');
        this.addOutput(`📜 TAIL: Last ${lines} research papers`, 'success');
        this.addOutput('', 'info');
        
        papers.forEach(paper => {
            this.addOutput(`📄 ${paper.title}`, 'ai-highlight');
            this.addOutput(`   ${paper.venue} (${paper.year})`, 'info');
            this.addOutput('', 'info');
        });
    }

    tailSystem(lines) {
        const systemLogs = [
            `${new Date().toISOString()} [INFO] Terminal session active`,
            `${new Date(Date.now() - 30000).toISOString()} [INFO] AI service initialized`,
            `${new Date(Date.now() - 60000).toISOString()} [INFO] Weather data updated`,
            `${new Date(Date.now() - 90000).toISOString()} [INFO] Research streamer loaded`,
            `${new Date(Date.now() - 120000).toISOString()} [INFO] Theme system initialized`,
            `${new Date(Date.now() - 150000).toISOString()} [INFO] Voice interface ready`,
            `${new Date(Date.now() - 180000).toISOString()} [INFO] Music system loaded`,
            `${new Date(Date.now() - 210000).toISOString()} [INFO] Particle effects initialized`
        ];
        
        const recent = systemLogs.slice(-lines);
        
        this.addOutput('', 'info');
        this.addOutput(`📜 TAIL: Last ${lines} system log entries`, 'success');
        this.addOutput('', 'info');
        
        recent.forEach(log => {
            this.addOutput(log, 'info');
        });
    }

    handleCatCommand(args) {
        if (args.length === 0) {
            this.addOutput('Usage: cat <file>', 'error');
            this.addOutput('Available files:', 'feature-highlight');
            this.addOutput('  about.md          # Personal information', 'info');
            this.addOutput('  projects.md       # Technical projects', 'info');
            this.addOutput('  skills.md         # Technical skills', 'info');
            this.addOutput('  home.md           # Off-grid home info', 'info');
            this.addOutput('  veritas.md        # AI safety research', 'info');
            return;
        }

        const filename = args[0];
        let contentFile = filename;
        
        // Handle .md extension
        if (!filename.endsWith('.md')) {
            contentFile = filename + '.md';
        }
        
        // Remove .md for the actual command
        const command = filename.replace('.md', '');
        
        // Check if it's a valid content file
        const validFiles = ['about', 'projects', 'skills', 'home', 'veritas'];
        if (validFiles.includes(command)) {
            this.addOutput(`📄 Contents of ${contentFile}:`, 'feature-highlight');
            this.addOutput('', 'info');
            this.showMarkdownContent(command);
        } else {
            this.addOutput(`cat: ${filename}: No such file`, 'error');
            this.addOutput('Available files: ' + validFiles.map(f => f + '.md').join(', '), 'info');
        }
    }

    showGeminiLogo() {
        const geminiAscii = `
> ███            █████████  ██████████ ██████   ██████ █████ ██████   █████ █████
>░░░███         ███░░░░░███░░███░░░░░█░░██████ ██████ ░░███ ░░██████ ░░███ ░░███
>  ░░░███      ███     ░░░  ░███  █ ░  ░███░█████░███  ░███  ░███░███ ░███  ░███
>    ░░░███   ░███          ░██████    ░███░░███ ░███  ░███  ░███░░███░███  ░███
>     ███░    ░███    █████ ░███░░█    ░███ ░░░  ░███  ░███  ░███ ░░██████  ░███
>   ███░      ░░███  ░░███  ░███ ░   █ ░███      ░███  ░███  ░███  ░░█████  ░███
> ███░         ░░█████████  ██████████ █████     █████ █████ █████  ░░█████ █████
>░░░            ░░░░░░░░░  ░░░░░░░░░░ ░░░░░     ░░░░░ ░░░░░ ░░░░░    ░░░░░ ░░░░░`;

        this.addOutput('', 'info');
        geminiAscii.split('\n').forEach(line => {
            if (line.trim()) {
                this.addOutput(line, 'success');
            }
        });
        this.addOutput('', 'info');
        this.addOutput('🌟 GEMINI - Google\'s Advanced AI Model', 'feature-highlight');
        this.addOutput('   Multimodal AI capabilities with reasoning and creativity', 'info');
        this.addOutput('', 'info');
    }

    showAdrianLogo() {
        const adrianAscii = `
____/\\\\\\\\\\\\\\\\______________/\\\\\\\\\\\\\\\\\\\\\\\\______/\\\\\\\\\\\\\\\\\\\\\\\\______/\\\\\\\\\\\\\\\\___/\\\\\\\\\\\\\\\\\\\\\\\\___/\\\\\\\\\\\\\\\\___/\\\\\\\\\\\\\\\\\_____
 __/\\\\\\////////////__________/\\\\\\//////////\\\\\\___/\\\\\\//////////\\\\\\__/\\\\\\////\\\\\\_\/\\\\\\//////////\\\\\\\_/\\\\\\////\\\\\\\_\/\\\\\\////\\\\\\____
  _\////\\\\\\____________/\\\\\\/_____________\////\\\\\\__/\\\\\\____________\////\\\\\\__/\\\\\\\_\//\\\\\\\_\/\\\\\\____________\////\\\\\\__/\\\\\\/_\//\\\\\\\_\/\\\\\\__\//\\\\\\___
   ____\////\\\\\\______/\\\\\\__________________\////\\\\\\___/\\\\\\___________________/\\\\\\/__/\\\\\\\\\\\\\\\\\\\_\/\\\\\\___________________/\\\\\\/__/\\\\\\\\\\\\\\\\\\\_\/\\\\\\\\\\\\\\\\\\___
    _______\////\\\\\\___\//\\\\\\____________/\\\\\\/_\//\\\\\\__\//\\\\\\_______________/\\\\\\/__\/\\\\\\////\\\\\\\_\/\\\\\\_______________/\\\\\\/__\/\\\\\\////\\\\\\\_\/\\\\\\////\\\\\\___
     ___________\////\\\\\\_\///\\\\\\_____/\\\\\\//____\////\\\\\\__\///\\\\\\_____/\\\\\\//____\/\\\\\\_\//\\\\\\\_\/\\\\\\_____/\\\\\\//____\/\\\\\\_\//\\\\\\\_\/\\\\\\_\//\\\\\\__
      ___/\\\\\\\\\\\\\\\\\\____\////\\\\\\\\\\\\\\//________/\\\\\\\\\_\\////\\\\\\\\\\\\\\//______\/\\\\\\__\//\\\\\\\_\/\\\\\\\\\\\\\\\\\\//______\/\\\\\\__\//\\\\\\\_\/\\\\\\__\//\\\\\\_
       _\//////////////________\/////////__________\/////__\\////////__________\///____\///__\////////////__________\///____\///__\///____\///__
        `;

        this.addOutput('', 'info');
        adrianAscii.split('\n').forEach(line => {
            if (line.trim()) {
                this.addOutput(line, 'success');
            }
        });
        this.addOutput('', 'info');
        this.addOutput('🚀 >ADRIAN - Recursive Systems Architect & Off-Grid Permanaut', 'feature-highlight');
        this.addOutput('   Building intelligent systems from Tasmania\'s wilderness', 'info');
        this.addOutput('', 'info');
    }
}

function closeChat() { // eslint-disable-line no-unused-vars
    document.getElementById('chatInterface').style.display = 'none';
    document.getElementById('commandInput').focus();
}

function sendMessage() { // eslint-disable-line no-unused-vars
    if (window.terminal) {
        window.terminal.sendMessage();
    }
}

// Initialize terminal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing terminal...');
    try {
        const terminal = new Terminal();
        // Make terminal globally available for debugging
        window.terminal = terminal;
        console.log('Terminal initialized successfully');
    } catch (error) {
        console.error('Terminal initialization failed:', error);
    }
});

// Handle window resize for matrix rain
window.addEventListener('resize', () => {
    const canvas = document.querySelector('.matrix-rain canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});