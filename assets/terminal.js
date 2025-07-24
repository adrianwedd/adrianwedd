class Terminal {
    constructor() {
        this.commandHistory = [];
        this.historyIndex = -1;
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
        
        // Initialize voice interface
        this.voiceInterface = null;
        this.voiceEnabled = false;
        
        // Initialize markdown loader for content
        this.markdownLoader = new MarkdownLoader();
        
        // Initialize GitHub task manager
        this.githubTaskManager = new GitHubTaskManager();
        
        // Initialize GitHub Actions manager
        this.githubActionsManager = new GitHubActionsManager();
        
        // Matrix rain state
        this.matrixInterval = null;
        
        // Command completion state
        this.availableCommands = [
            'about', 'actions', 'cache', 'chat', 'clear', 'gh-create', 'gh-list', 'gh-sync', 'help', 'homestead', 'ls', 'magic', 'matrix',
            'monitor', 'music', 'neofetch', 'projects', 'ps', 'pwd', 'research', 'runs',
            'skills', 'speak', 'stop', 'tokens', 'trigger', 'uptime', 'veritas', 'voice',
            'volume', 'weather', 'whoami'
        ];
        this.completionIndex = -1;
        this.lastInput = '';
        
        this.init();
    }

    init() {
        const input = document.getElementById('commandInput');
        input.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Initialize chat
        const chatInput = document.getElementById('chatInput');
        chatInput.addEventListener('keydown', this.handleChatKeydown.bind(this));
        
        // Matrix rain effect
        this.createMatrixRain();
        
        // Focus input
        input.focus();

        // Load AI responses from GitHub
        this.loadAIResponses();
        
        // Initialize voice interface
        this.initVoiceInterface();
        
        // Set up terminal-style input focus
        this.setupTerminalFocus();
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
            case 'homestead':
                this.showMarkdownContent('homestead');
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
                this.addOutput(`/home/adrian/tasmania/homestead${this.currentPath}`, 'info');
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
            case 'sudo':
                this.addOutput('adrian is not in the sudoers file. This incident will be reported.', 'error');
                break;
            default:
                this.addOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }

        this.scrollToBottom();
    }

    addOutput(text, className = '') {
        const terminal = document.getElementById('terminal');
        const output = document.createElement('div');
        output.className = `output-line ${className}`;
        
        if (typeof text === 'string') {
            output.textContent = text;
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
        
        const promptLine = terminal.querySelector('.prompt-line');
        terminal.insertBefore(output, promptLine);
        
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
            'NAME',
            '    adrian-terminal - interactive command line interface',
            '',
            'COMMANDS',
            '    about        show personal information',
            '    actions      list GitHub Actions workflows',
            '    cache        manage prompt cache [clear|stats]',
            '    chat         enter interactive chat mode',
            '    clear        clear terminal screen',
            '    help         display this help message',
            '    ls           list directory contents',
            '    magic        display daily Claude creativity',
            '    matrix       toggle matrix rain effect',
            '    monitor      system monitor (htop style)',
            '    music        play background music [track]',
            '    neofetch     display system information',
            '    projects     show technical projects',
            '    ps           show running processes',
            '    pwd          print working directory',
            '    research     stream research papers [personal|global]',
            '    runs         show recent workflow runs',
            '    skills       display technical skills',
            '    speak        text-to-speech [text]',
            '    stop         stop currently playing music',
            '    tokens       show AI token statistics',
            '    trigger      trigger GitHub Actions workflow',
            '    uptime       show system uptime',
            '    voice        voice controls [on|off|status]',
            '    volume       set music volume [0.0-1.0]',
            '    weather      show Tasmania weather data',
            '    whoami       show current user',
            '',
            'MUSIC TRACKS',
            '    ambient      peaceful ambient drones',
            '    cyberpunk    dark synthwave beats',
            '    mathematical algorithmic patterns with drums',
            '    matrix       digital rain sounds',
            '    synthwave    retro 80s synthesizer',
            '',
            'NAVIGATION',
            '    ↑/↓          command history',
            '    Ctrl+C       exit chat/monitor mode',
            '    q            quit monitor mode',
            ''
        ];
        
        helpLines.forEach(line => {
            if (line === 'NAME' || line === 'COMMANDS' || line === 'MUSIC TRACKS' || line === 'NAVIGATION') {
                this.addOutput(line, 'section-header');
            } else if (line.startsWith('    ') && line.includes(' ')) {
                // Format command lines with proper spacing
                const parts = line.trim().split(/\s+/);
                const command = parts[0];
                const description = parts.slice(1).join(' ');
                const formatted = `    ${command.padEnd(12)} ${description}`;
                this.addOutput(formatted, 'command-line');
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

    showHomestead() {
        const homestead = `
🏔️ Tasmania Off-Grid Homestead:

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
        this.addOutput(homestead, 'success');
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
                } catch (e) {
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            this.addOutput('❌ Could not fetch workflow runs', 'error');
            this.addOutput('GitHub Actions integration may not be available', 'info');
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
                this.addOutput('   • Homestead impact assessment', 'info');
                this.addOutput('   • ASCII visualizations', 'info');
                this.addOutput('', 'info');
                this.addOutput('🔄 Trigger a manual update using GitHub Actions!', 'philosophy');
            }
        } catch (error) {
            this.addOutput('❌ Could not load weather data', 'error');
            this.addOutput('The weather system may not be initialized yet.', 'info');
        }
    }

    showProcesses() {
        const processes = `
  PID  COMMAND                    CPU  MEM
  1337 veritas-research-daemon   2.1%  15%
  2048 homestead-monitoring      0.8%  8%
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
            '    ║         🌱 Off-Grid Tasmanian Homestead           ║',
            '    ║         🤖 AI Safety Research • VERITAS           ║',
            '    ╚═══════════════════════════════════════════════════╝',
            '',
            '    adrian@tasmania-homestead',
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
drwxr-xr-x  adrian adrian  4096 Jul 24 12:00 homestead/
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
        const retro = terminal.querySelector('.retro-header');
        const bootSequence = terminal.querySelector('.boot-sequence');
        const promptLine = terminal.querySelector('.prompt-line');
        
        // Clear terminal lines array
        this.terminalLines = [];
        
        // Remove all output lines
        const outputs = terminal.querySelectorAll('.output-line');
        outputs.forEach(output => output.remove());
        
        // Keep header, boot sequence, and prompt
        terminal.innerHTML = '';
        if (retro) terminal.appendChild(retro);
        if (bootSequence) terminal.appendChild(bootSequence);
        if (promptLine) terminal.appendChild(promptLine);
    }

    scrollToBottom() {
        const terminal = document.getElementById('terminal');
        terminal.scrollTop = terminal.scrollHeight;
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

    // System Monitor Methods
    async enterMonitorMode() {
        this.addOutput('', 'info');
        this.addOutput('🖥️  Entering system monitor mode...', 'success');
        this.addOutput('Press \'q\' to return to terminal', 'info');
        await this.systemMonitor.enterMonitorMode();
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
        
        const promptLine = terminal.querySelector('.prompt-line');
        terminal.insertBefore(outputElement, promptLine);
        
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
            promptElement.textContent = 'adrian@homestead:~$';
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
            
            if (initialized) {
                this.addOutput('🎤 Voice interface initialized', 'success');
                this.addOutput('Say "Adrian" or "Computer" to activate voice commands', 'info');
            } else {
                this.addOutput('⚠️ Voice interface not available', 'error');
            }
        } catch (error) {
            console.error('Voice interface initialization failed:', error);
            this.addOutput('❌ Voice interface failed to initialize', 'error');
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
            button.textContent = 'Enable Voice';
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
            case 'homestead':
                this.showHomestead();
                break;
            case 'veritas':
                this.showVeritas();
                break;
        }
    }

    // Terminal-style focus management
    setupTerminalFocus() {
        const input = document.getElementById('commandInput');
        
        // Focus input when clicking anywhere on the page (except links/buttons)
        document.addEventListener('click', (e) => {
            // Don't interfere with interactive elements
            if (e.target.tagName === 'A' || 
                e.target.tagName === 'BUTTON' || 
                e.target.type === 'text' ||
                e.target.classList.contains('voice-toggle') ||
                e.target.classList.contains('paper-link') ||
                e.target.closest('.voice-controls')) {
                return;
            }
            
            // Focus the command input
            input.focus();
        });
        
        // Keep focus on input unless explicitly focusing elsewhere
        document.addEventListener('focusin', (e) => {
            // Allow focus on interactive elements, but return to input afterward
            if (e.target !== input && 
                e.target.tagName !== 'A' && 
                e.target.tagName !== 'BUTTON' &&
                !e.target.classList.contains('voice-toggle')) {
                setTimeout(() => input.focus(), 100);
            }
        });
        
        // Ensure input stays focused when terminal gains focus
        window.addEventListener('focus', () => {
            setTimeout(() => input.focus(), 100);
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
        
        // Handle escape key to always return focus to input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                input.focus();
                e.preventDefault();
            }
        });
        
        // Initial focus
        setTimeout(() => input.focus(), 100);
    }

    // Research command handler
    handleResearchCommand(args) {
        if (args.length === 0) {
            this.addOutput('Usage: research [personal|global]', 'error');
            this.addOutput('  personal - Load local markdown research papers', 'info');
            this.addOutput('  global   - Fetch from arXiv and academic sources', 'info');
            return;
        }

        const mode = args[0].toLowerCase();
        
        switch (mode) {
            case 'personal':
                this.addOutput('📚 Loading personal research papers...', 'info');
                this.addOutput('This would load papers from /research/ directory', 'info');
                this.addOutput('Feature coming soon - local markdown research streaming', 'success');
                break;
                
            case 'global':
                this.addOutput('🌍 Global research streaming not yet implemented', 'info');
                this.addOutput('Would fetch from arXiv, Semantic Scholar, and other sources', 'info');
                this.addOutput('Use research-streamer-remote.js for this functionality', 'success');
                break;
                
            default:
                this.addOutput(`Unknown research mode: ${mode}`, 'error');
                this.addOutput('Available modes: personal, global', 'info');
        }
    }

    // Tab completion methods
    handleTabCompletion(input) {
        const currentValue = input.value;
        const words = currentValue.split(' ');
        const lastWord = words[words.length - 1];
        
        // Only complete the first word (command)
        if (words.length === 1) {
            const matches = this.availableCommands.filter(cmd => 
                cmd.startsWith(lastWord.toLowerCase())
            );
            
            if (matches.length === 0) return;
            
            if (matches.length === 1) {
                // Single match - complete it
                input.value = matches[0];
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
                
                input.value = matches[this.completionIndex];
                
                // Show available completions
                if (this.completionIndex === 0) {
                    this.showCompletions(matches);
                }
            }
        }
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
}

function closeChat() {
    document.getElementById('chatInterface').style.display = 'none';
    document.getElementById('commandInput').focus();
}

function sendMessage() {
    terminal.sendMessage();
}

// Initialize terminal
const terminal = new Terminal();

// Handle window resize for matrix rain
window.addEventListener('resize', () => {
    const canvas = document.querySelector('.matrix-rain canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});