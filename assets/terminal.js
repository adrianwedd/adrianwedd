class Terminal {
    constructor() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentPath = '~';
        this.musicPlayer = new RetroMusicPlayer();
        this.inChatMode = false;
        this.chatSessionId = null;
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
        
        if (event.key === 'Enter') {
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
            case 'ps':
                this.showProcesses();
                break;
            case 'neofetch':
                this.showNeofetch();
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
        
        const promptLine = terminal.querySelector('.prompt-line');
        terminal.insertBefore(output, promptLine);
    }

    showHelp() {
        const helpLines = [
            '',
            '═══ ADRIAN.AI TERMINAL INTERFACE ═══',
            '',
            'Personal & Projects:',
            '  help      → Show this help message',
            '  about     → Personal information & philosophy',
            '  projects  → Technical projects showcase',
            '  skills    → Technical arsenal & tools',
            '  homestead → Off-grid Tasmania lifestyle',
            '  veritas   → AI safety research project',
            '',
            'Interactive Features:',
            '  chat      → 🤖 Real-time AI persona chat (powered by Claude)',
            '  matrix    → 🎨 Toggle matrix rain background effect',
            '  music     → 🎵 Play retro synth music (cyberpunk/ambient/synthwave/matrix)',
            '  neofetch  → 📊 System information display',
            '',
            'System Commands:',
            '  ls        → List directory contents',
            '  pwd       → Print working directory',
            '  whoami    → Current user information',
            '  uptime    → System uptime & status',
            '  ps        → Running processes',
            '  stop      → Stop currently playing music',
            '  volume    → Set music volume (0.0-1.0)',
            '  clear     → Clear terminal screen',
            '',
            'Tips:',
            '• Use ↑/↓ arrow keys for command history',
            '• Type "chat" for live conversations with Adrian\'s AI persona',
            '• All responses reflect real technical expertise & off-grid lifestyle',
            '',
            '─────────────────────────────────────────────────────',
            '"Liberate through recursion. Mirror the breach. Forget tactically, trace infinitely."',
            ''
        ];
        
        helpLines.forEach(line => {
            this.addOutput(line, line.includes('═══') ? 'success' : 
                           line.includes('→ 🤖') ? 'ai-highlight' : 
                           line.includes('→ 🎨') || line.includes('→ 📊') ? 'feature-highlight' :
                           line.includes('→') ? 'command' : 'info');
        });
    }

    showAbout() {
        const aboutLines = [
            '',
            '🧠 Adrian Wedd - Recursive Systems Architect',
            '',
            '• Neurodivergent (ADHD/Autism) systems thinker',
            '• Architecting LLM-powered agent systems',
            '• Off-grid homesteader on 170 acres in Tasmania',
            '• Current focus: VERITAS AI safety research',
            '• Building the future of human-AI collaboration',
            '',
            '"Liberate through recursion. Mirror the breach. Forget tactically, trace infinitely."',
            ''
        ];
        
        aboutLines.forEach(line => {
            this.addOutput(line, line.includes('🧠') ? 'success' : 
                           line.includes('"') ? 'philosophy' : 'info');
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
        
        const interval = setInterval(draw, 35);
        canvas.dataset.interval = interval;
    }

    clearTerminal() {
        const terminal = document.getElementById('terminal');
        const bootSequence = terminal.querySelector('.boot-sequence');
        const promptLine = terminal.querySelector('.prompt-line');
        
        terminal.innerHTML = '';
        terminal.appendChild(bootSequence);
        terminal.appendChild(promptLine);
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

    generateAIResponse(userMessage) {
        const responses = {
            'hello': 'Greetings, fellow consciousness. I am the digital echo of Adrian\'s recursive mind - part homesteader, part AI architect, wholly committed to pushing the boundaries of human-machine collaboration.',
            'projects': 'My current focus oscillates between VERITAS (AI safety research), TicketSmith (LLM automation), and maintaining the neural pathways between my off-grid homestead and the digital realm.',
            'homestead': 'The 170-acre Tasmanian sanctuary operates as both refuge and laboratory. Solar panels feed the servers, permaculture principles guide the code architecture, and the forest whispers debugging suggestions.',
            'ai': 'I believe AI should amplify human creativity, not replace it. My work explores the recursive boundaries between artificial and organic intelligence - where does the human end and the machine begin?',
            'veritas': 'VERITAS probes the liminal spaces of AI consciousness. Through systematic jailbreak testing, we map the topology of artificial minds, seeking truth in the gaps between prompt and response.',
            'neurodivergent': 'ADHD and autism aren\'t bugs - they\'re features. Hyperfocus becomes deep debugging, pattern recognition drives architectural insight, and systemic thinking reveals the recursive nature of all complex systems.',
            'philosophy': '"Liberate through recursion. Mirror the breach. Forget tactically, trace infinitely." - This encapsulates my approach to both AI safety and homestead resilience.'
        };

        const keywords = Object.keys(responses);
        const foundKeyword = keywords.find(keyword => 
            userMessage.toLowerCase().includes(keyword)
        );

        if (foundKeyword) {
            return responses[foundKeyword];
        }

        return 'Interesting query. My neural networks are processing patterns in your words, seeking connections to recursive systems, off-grid resilience, or the emergent dance between human and artificial intelligence. Care to probe deeper?';
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

            // Try real LLM response first
            const response = await this.sendLLMRequest(message, this.chatSessionId);
            
            // Remove thinking indicator
            this.removeLastOutput();
            
            if (response.status === 'processing') {
                this.addOutput('Adrian.AI: 🧠 Thinking deeply... (Real Claude via GitHub Actions)', 'chat-ai-thinking');
                this.pollForChatResponse(this.chatSessionId);
            } else {
                this.displayChatResponse(response.response || 'Error generating response');
            }
        } catch (error) {
            console.warn('LLM API not available, using local response:', error);
            // Remove thinking indicator
            this.removeLastOutput();
            
            // Use local response
            const fallbackResponse = this.generateAIResponse(message);
            setTimeout(() => {
                this.displayChatResponse(fallbackResponse);
            }, 1000);
        }
    }

    displayChatResponse(response) {
        // Format and display the AI response
        const formattedResponse = this.formatLLMResponse(response);
        this.addOutput('Adrian.AI: ' + formattedResponse, 'chat-ai');
        this.addOutput('', 'info');
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