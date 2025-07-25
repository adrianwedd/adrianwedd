class VoiceInterface {
    constructor() {
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        this.isActive = false;
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
            } else {
                console.warn('Speech Synthesis not supported');
            }

            return true;
        } catch (error) {
            console.error('Voice interface initialization failed:', error);
            return false;
        }
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
        if (!this.synthesis || !this.currentVoice) {
            console.warn('Text-to-speech not available');
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.currentVoice;
        utterance.rate = options.rate || this.voiceSettings.rate;
        utterance.pitch = options.pitch || this.voiceSettings.pitch;
        utterance.volume = options.volume || this.voiceSettings.volume;

        utterance.onstart = () => {
            this.updateVoiceIndicator('speaking', text);
        };

        utterance.onend = () => {
            this.updateVoiceIndicator('listening');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.updateVoiceIndicator('error');
        };

        this.synthesis.speak(utterance);
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