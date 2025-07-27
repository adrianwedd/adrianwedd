class VoiceInterface {
    constructor() {
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        this.isActive = false;
        this.speechOutputEnabled = false; // Voice output state
        this.autoSpeechEnabled = false; // Auto-speech for accessibility
        this.currentVoice = null;
        this.voiceSettings = {
            rate: 0.9,
            pitch: 1.0,
            volume: 0.8,
            voiceName: 'en-US' // Preferred voice pattern
        };
        
        // Voice activity detection
        this.silenceTimeout = null;
        this.speechTimeout = null;
        this.lastSpeechTime = 0;
        
        // Wake word detection (simple pattern matching)
        this.wakeWords = ['adrian', 'computer', 'terminal', 'hey adrian'];
        this.wakeWordActive = false;
        
        // Voice commands mapping
        this.voiceCommands = {
            'show help': 'help',
            'clear screen': 'clear',
            'show projects': 'projects',
            'show skills': 'skills',
            'about adrian': 'about',
            'open chat': 'chat',
            'start music': 'music synthwave',
            'stop music': 'stop',
            'show tokens': 'tokens',
            'cache stats': 'cache stats',
            'system monitor': 'monitor',
            'show uptime': 'uptime'
        };
        
        this.init();
    }

    async init() {
        try {
            // Initialize Speech Recognition
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';
                this.recognition.maxAlternatives = 3;
                
                this.setupRecognitionEvents();
            } else {
                console.warn('Speech Recognition not supported');
            }

            // Initialize Speech Synthesis
            if ('speechSynthesis' in window) {
                this.synthesis = window.speechSynthesis;
                this.loadVoices();
                
                // Wait for voices to load
                if (speechSynthesis.onvoiceschanged !== undefined) {
                    speechSynthesis.onvoiceschanged = () => this.loadVoices();
                }
                
                // Enable speech output by default for accessibility
                this.enableSpeechOutput();
                
                // Check for accessibility preferences
                this.detectAccessibilityNeeds();
            } else {
                console.warn('Speech Synthesis not supported');
            }

            return true;
        } catch (error) {
            console.error('Voice interface initialization failed:', error);
            return false;
        }
    }

    // Enable speech output for better accessibility
    enableSpeechOutput() {
        this.speechOutputEnabled = true;
        console.log('Voice output enabled for accessibility');
        
        // Announce that speech is available
        setTimeout(() => {
            this.speak('Voice output enabled. Terminal commands and responses will be spoken aloud.', {
                priority: 'high',
                interrupt: false
            });
        }, 1000);
    }

    // Detect accessibility needs and auto-enable features
    detectAccessibilityNeeds() {
        // Check for screen reader or high contrast mode
        const hasScreenReader = this.isScreenReaderDetected();
        const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (hasScreenReader || hasHighContrast) {
            this.autoSpeechEnabled = true;
            this.voiceSettings.rate = 1.1; // Slightly faster for screen reader users
            console.log('Accessibility needs detected - enhanced voice features enabled');
        }
    }

    // Simple screen reader detection
    isScreenReaderDetected() {
        // Check for common screen reader patterns
        const userAgent = navigator.userAgent.toLowerCase();
        const hasScreenReaderUA = userAgent.includes('nvda') || 
                                  userAgent.includes('jaws') || 
                                  userAgent.includes('voiceover');
        
        // Check for accessibility APIs
        const hasAccessibilityAPI = 'speechSynthesis' in window && 
                                   window.speechSynthesis.getVoices().length > 0;
        
        // Check for reduced motion preference (often indicates accessibility needs)
        const hasAccessibilityPreferences = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                                           window.matchMedia('(prefers-contrast: high)').matches;
        
        return hasScreenReaderUA || (hasAccessibilityAPI && hasAccessibilityPreferences);
    }

    loadVoices() {
        const voices = this.synthesis.getVoices();
        
        // Prefer voices with specific characteristics for Adrian.AI
        const preferredVoices = voices.filter(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Neural') || 
             voice.name.includes('Enhanced') ||
             voice.name.includes('Premium') ||
             voice.localService)
        );
        
        // Select the best voice
        this.currentVoice = preferredVoices.find(voice => 
            voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('alex')
        ) || preferredVoices[0] || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        console.log('Selected voice:', this.currentVoice?.name);
    }

    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceIndicator('listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceIndicator('inactive');
            
            // Auto-restart if still active (for continuous listening)
            if (this.isActive && !this.speechTimeout) {
                setTimeout(() => {
                    if (this.isActive) {
                        this.startListening();
                    }
                }, 100);
            }
        };

        this.recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            this.updateVoiceIndicator('error');
            
            // Handle different error types
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                this.showVoiceError('Microphone access required for voice interface');
            } else if (event.error === 'network') {
                this.showVoiceError('Network error - check internet connection');
            }
        };

        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
    }

    handleSpeechResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update visual feedback
        if (interimTranscript) {
            this.updateVoiceIndicator('processing', interimTranscript);
        }

        if (finalTranscript) {
            this.lastSpeechTime = Date.now();
            this.processSpeechInput(finalTranscript.trim());
        }
    }

    processSpeechInput(transcript) {
        console.log('Speech input:', transcript);
        
        // Check for wake words if not in active conversation
        if (!this.wakeWordActive && this.containsWakeWord(transcript)) {
            this.activateWakeWord();
            this.speak('Yes? How can I help?');
            return;
        }

        // If wake word is active or we're in chat mode, process the command
        if (this.wakeWordActive || this.isInChatMode()) {
            this.executeVoiceCommand(transcript);
            this.wakeWordActive = false; // Reset after processing
        }
    }

    containsWakeWord(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        return this.wakeWords.some(word => lowerTranscript.includes(word));
    }

    activateWakeWord() {
        this.wakeWordActive = true;
        this.updateVoiceIndicator('activated');
        
        // Auto-deactivate after 10 seconds if no command
        setTimeout(() => {
            this.wakeWordActive = false;
            this.updateVoiceIndicator('listening');
        }, 10000);
    }

    executeVoiceCommand(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // Check for direct command mappings
        for (const [voiceCommand, terminalCommand] of Object.entries(this.voiceCommands)) {
            if (lowerTranscript.includes(voiceCommand)) {
                this.executeTerminalCommand(terminalCommand);
                return;
            }
        }

        // Check for chat-like queries
        if (this.isChatQuery(transcript)) {
            this.handleVoiceChat(transcript);
            return;
        }

        // Try to interpret as direct terminal command
        if (this.isTerminalCommand(transcript)) {
            this.executeTerminalCommand(transcript);
            return;
        }

        // Default: insert transcript into terminal input for user to review
        this.insertIntoTerminalInput(transcript);
    }

    isChatQuery(transcript) {
        const chatIndicators = [
            'what', 'how', 'why', 'when', 'where', 'who',
            'tell me', 'explain', 'describe', 'can you',
            'do you', 'are you', 'have you'
        ];
        
        const lower = transcript.toLowerCase();
        return chatIndicators.some(indicator => lower.startsWith(indicator));
    }

    isTerminalCommand(transcript) {
        const commands = ['help', 'clear', 'projects', 'skills', 'about', 'tokens', 'music', 'stop'];
        return commands.some(cmd => transcript.toLowerCase().includes(cmd));
    }

    executeTerminalCommand(command) {
        // Get terminal instance and execute command
        if (window.terminal) {
            this.updateVoiceIndicator('executing', `Executing: ${command}`);
            window.terminal.executeCommand(command);
            this.speak(`Executing ${command}`);
        } else {
            // Fallback: Insert into terminal input field
            this.insertIntoTerminalInput(command);
        }
    }

    insertIntoTerminalInput(text) {
        const input = document.getElementById('commandInput');
        if (input) {
            input.value = text;
            input.focus();
            this.updateVoiceIndicator('ready', `Ready: ${text}`);
            this.speak(`Ready to execute ${text}. Press enter to confirm.`);
        }
    }

    async handleVoiceChat(transcript) {
        this.updateVoiceIndicator('thinking', 'Processing...');
        
        try {
            // Use AI service for chat response
            if (window.terminal && window.terminal.aiService) {
                const contextPrompt = `Voice conversation with Adrian.AI. You are Adrian Wedd's AI persona - a recursive systems architect and off-grid Tasmanian homesteader. Respond naturally and conversationally. Keep responses concise for speech synthesis (under 100 words). Be direct, technical when appropriate, but conversational.`;
                
                const result = await window.terminal.aiService.sendChatRequest(
                    transcript, 
                    'voice-session',
                    contextPrompt
                );
                
                // Display response in terminal
                if (window.terminal.inChatMode) {
                    window.terminal.addOutput(`🎤 You: ${transcript}`, 'chat-user');
                    window.terminal.addOutput(`Adrian.AI: ${result.response}`, 'chat-ai');
                } else {
                    window.terminal.addOutput(`🎤 Voice: ${transcript}`, 'info');
                    window.terminal.addOutput(`🗣️ Adrian.AI: ${result.response}`, 'success');
                }
                
                // Clean response for TTS (remove markdown, etc.)
                const cleanResponse = this.cleanResponseForTTS(result.response);
                this.speak(cleanResponse);
                
            } else {
                console.warn('AI service not available, using fallback');
                const fallbackResponse = this.generateFallbackResponse(transcript);
                window.terminal.addOutput(`🎤 Voice: ${transcript}`, 'info');
                window.terminal.addOutput(`🗣️ Adrian.AI: ${fallbackResponse}`, 'success');
                this.speak(fallbackResponse);
            }
        } catch (error) {
            console.error('Voice chat error:', error);
            const errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
            window.terminal.addOutput(`❌ Voice Error: ${error.message}`, 'error');
            this.speak(errorMessage);
        }
    }

    // Clean response text for better TTS
    cleanResponseForTTS(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
            .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown  
            .replace(/`([^`]+)`/g, '$1')     // Remove inline code
            .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Extract link text
            .replace(/#{1,6}\s+/g, '')       // Remove headers
            .replace(/\n{2,}/g, '. ')        // Replace double newlines with periods
            .replace(/\n/g, ' ')             // Replace single newlines with spaces
            .trim();
    }

    // Fallback responses when AI service unavailable
    generateFallbackResponse(transcript) {
        const responses = {
            'hello': 'Hello! I\'m Adrian\'s AI. How can I help you today?',
            'projects': 'I\'m currently working on TicketSmith, this terminal interface, and VERITAS AI safety research.',
            'skills': 'My expertise includes AI systems, recursive architecture, and sustainable computing on my off-grid homestead.',
            'homestead': 'I operate from a 170-acre off-grid homestead in Tasmania with solar power and satellite internet.',
            'music': 'I can control the music system. Try saying start music or stop music.',
            'help': 'You can ask me about my projects, skills, homestead, or give me commands like show help or start music.'
        };
        
        const lowerTranscript = transcript.toLowerCase();
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerTranscript.includes(keyword)) {
                return response;
            }
        }
        
        return 'That\'s an interesting question. You can ask me about my projects, technical skills, or homestead setup.';
    }

    speak(text, options = {}) {
        // Only speak if speech output is enabled or it's a high priority message
        if (!this.speechOutputEnabled && options.priority !== 'high') {
            return;
        }

        if (!this.synthesis || !this.currentVoice) {
            console.warn('Text-to-speech not available');
            return;
        }

        // Cancel any ongoing speech if this is higher priority
        if (options.interrupt !== false) {
            this.synthesis.cancel();
        }

        // Clean text for better speech synthesis
        const cleanText = this.cleanTextForSpeech(text);
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = this.currentVoice;
        utterance.rate = options.rate || this.voiceSettings.rate;
        utterance.pitch = options.pitch || this.voiceSettings.pitch;
        utterance.volume = options.volume || this.voiceSettings.volume;

        utterance.onstart = () => {
            this.updateVoiceIndicator('speaking', cleanText);
            // Announce to accessibility manager
            if (window.accessibilityManager) {
                window.accessibilityManager.announce(`Speaking: ${cleanText.substring(0, 50)}...`, 'polite');
            }
        };

        utterance.onend = () => {
            this.updateVoiceIndicator(this.isActive ? 'listening' : 'inactive');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.updateVoiceIndicator('error');
        };

        this.synthesis.speak(utterance);
    }

    // Clean text for better speech synthesis
    cleanTextForSpeech(text) {
        return text
            .replace(/🎤|🗣️|📊|🏗️|🌤️|🤖|❌|✅|⚠️/g, '') // Remove emojis
            .replace(/\$\s*/g, 'dollar sign ') // Speak dollar signs
            .replace(/adrian@home:~\$/g, 'Adrian at home prompt') // Terminal prompt
            .replace(/\d+\.\d+\.\d+\.\d+/g, match => match.replace(/\./g, ' dot ')) // IP addresses
            .replace(/([A-Z]{2,})/g, match => match.split('').join(' ')) // Spell out acronyms
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    // Method for terminal to automatically speak output
    speakTerminalOutput(text, type = 'output') {
        if (!this.speechOutputEnabled && !this.autoSpeechEnabled) {
            return;
        }

        // Filter out certain types of output that shouldn't be spoken
        if (this.shouldSkipSpeaking(text, type)) {
            return;
        }

        // Add context for different types of output
        let prefix = '';
        switch (type) {
            case 'command':
                prefix = 'Command: ';
                break;
            case 'error':
                prefix = 'Error: ';
                break;
            case 'success':
                prefix = 'Success: ';
                break;
            case 'info':
                prefix = 'Info: ';
                break;
            default:
                prefix = '';
        }

        this.speak(prefix + text, { 
            priority: type === 'error' ? 'high' : 'normal',
            interrupt: type === 'error'
        });
    }

    shouldSkipSpeaking(text, type) {
        // Don't speak empty or very short text
        if (!text || text.trim().length < 3) return true;
        
        // Don't speak pure ASCII art or repetitive characters
        if (/^[^\w\s]*$/.test(text) || /(.)\1{10,}/.test(text)) return true;
        
        // Don't speak debug information
        if (text.includes('Debug:') || text.includes('Trace:')) return true;
        
        // Don't speak certain command outputs
        if (type === 'output' && (
            text.includes('├─') || // Tree structures
            text.includes('│') ||  // Box drawing
            text.includes('▄') ||  // Block characters
            text.includes('█')     // Full blocks
        )) return true;
        
        return false;
    }

    // Toggle speech output
    toggleSpeechOutput() {
        this.speechOutputEnabled = !this.speechOutputEnabled;
        const status = this.speechOutputEnabled ? 'enabled' : 'disabled';
        
        this.speak(`Voice output ${status}`, { priority: 'high' });
        console.log(`Voice output ${status}`);
        
        // Update UI indicator
        this.updateVoiceOutputIndicator(this.speechOutputEnabled);
        
        return this.speechOutputEnabled;
    }

    startListening() {
        if (!this.recognition) {
            this.showVoiceError('Speech recognition not available');
            return false;
        }

        try {
            this.isActive = true;
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Failed to start listening:', error);
            this.showVoiceError('Failed to start voice recognition');
            return false;
        }
    }

    stopListening() {
        this.isActive = false;
        this.wakeWordActive = false;
        
        if (this.recognition) {
            this.recognition.stop();
        }
        
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        
        this.updateVoiceIndicator('inactive');
    }

    toggle() {
        if (this.isActive) {
            this.stopListening();
            return false;
        } else {
            return this.startListening();
        }
    }

    updateVoiceIndicator(status, text = '') {
        // Update UI elements to show voice status
        const indicator = document.getElementById('voiceIndicator');
        const statusText = document.getElementById('voiceStatus');
        
        if (indicator) {
            indicator.className = `voice-indicator ${status}`;
            
            const symbols = {
                'inactive': '🎤',
                'listening': '🎧',
                'processing': '🔄',
                'thinking': '🤔',
                'speaking': '🗣️',
                'activated': '✨',
                'executing': '⚡',
                'error': '❌'
            };
            
            indicator.textContent = symbols[status] || '🎤';
        }
        
        if (statusText) {
            const statusMessages = {
                'inactive': 'Voice inactive',
                'listening': 'Listening...',
                'processing': 'Processing speech...',
                'thinking': 'Thinking...',
                'speaking': 'Speaking...',
                'activated': 'Wake word detected!',
                'executing': 'Executing command...',
                'error': 'Voice error'
            };
            
            statusText.textContent = text || statusMessages[status] || 'Voice ready';
        }
    }

    updateVoiceOutputIndicator(enabled) {
        const statusText = document.getElementById('voiceStatus');
        if (statusText) {
            const baseText = statusText.textContent.replace(' | Speech: ON', '').replace(' | Speech: OFF', '');
            const speechStatus = enabled ? ' | Speech: ON' : ' | Speech: OFF';
            statusText.textContent = baseText + speechStatus;
        }
        
        // Update button text
        const button = document.getElementById('voiceToggle');
        if (button && this.speechOutputEnabled) {
            button.setAttribute('title', 'Voice input and output enabled. Click to configure.');
        }
    }

    showVoiceError(message) {
        if (window.terminal) {
            window.terminal.addOutput(`🎤 Voice Error: ${message}`, 'error');
        }
    }

    isInChatMode() {
        return window.terminal && window.terminal.inChatMode;
    }

    // Voice settings management
    setVoiceRate(rate) {
        this.voiceSettings.rate = Math.max(0.1, Math.min(3.0, rate));
    }

    setVoicePitch(pitch) {
        this.voiceSettings.pitch = Math.max(0.0, Math.min(2.0, pitch));
    }

    setVoiceVolume(volume) {
        this.voiceSettings.volume = Math.max(0.0, Math.min(1.0, volume));
    }

    getVoiceStatus() {
        return {
            isActive: this.isActive,
            isListening: this.isListening,
            currentVoice: this.currentVoice?.name,
            wakeWordActive: this.wakeWordActive,
            settings: this.voiceSettings
        };
    }
}

// Export for use in other modules
window.VoiceInterface = VoiceInterface;