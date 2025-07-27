class TextStreamer {
    constructor() {
        this.isStreaming = false;
        this.currentStream = null;
    }

    async streamText(element, text, options = {}) {
        const {
            speed = 30,           // characters per second
            variableSpeed = true, // vary speed for natural typing
            minSpeed = 20,
            maxSpeed = 50,
            pauseOnPunctuation = true,
            punctuationDelay = 150,
            cursorBlink = false
        } = options;

        if (this.isStreaming) {
            this.stopStreaming();
        }

        this.isStreaming = true;
        element.textContent = '';

        // Add cursor if enabled
        if (cursorBlink) {
            element.innerHTML = '<span class="typing-cursor">█</span>';
        }

        return new Promise((resolve) => {
            let charIndex = 0;
            const chars = text.split('');
            
            const typeChar = () => {
                if (!this.isStreaming || charIndex >= chars.length) {
                    if (cursorBlink) {
                        // Remove cursor when done
                        element.innerHTML = element.innerHTML.replace('<span class="typing-cursor">█</span>', '');
                    }
                    this.isStreaming = false;
                    resolve();
                    return;
                }

                const char = chars[charIndex];
                
                // Insert character before cursor or just append
                if (cursorBlink) {
                    const content = element.innerHTML.replace('<span class="typing-cursor">█</span>', '');
                    element.innerHTML = content + char + '<span class="typing-cursor">█</span>';
                } else {
                    element.textContent += char;
                }

                charIndex++;

                // Calculate delay for next character
                let delay = 1000 / speed;
                
                if (variableSpeed) {
                    const randomSpeed = minSpeed + Math.random() * (maxSpeed - minSpeed);
                    delay = 1000 / randomSpeed;
                }

                // Add extra pause for punctuation
                if (pauseOnPunctuation && /[.!?,:;]/.test(char)) {
                    delay += punctuationDelay;
                }

                // Add small random variation for human-like typing
                delay += (Math.random() - 0.5) * 50;

                this.currentStream = setTimeout(typeChar, delay);
            };

            typeChar();
        });
    }

    async streamToTerminal(terminal, text, className = 'info', options = {}) {
        // Create a temporary element for streaming
        const tempElement = document.createElement('div');
        tempElement.className = `output-line ${className}`;
        
        // Insert before prompt line
        const promptLine = document.querySelector('.prompt-line');
        terminal.insertBefore(tempElement, promptLine);
        
        // Stream the text
        await this.streamText(tempElement, text, options);
        
        // Scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
    }

    stopStreaming() {
        this.isStreaming = false;
        if (this.currentStream) {
            clearTimeout(this.currentStream);
            this.currentStream = null;
        }
    }

    // Simulate realistic typing patterns for different content types
    getTypingProfile(contentType) {
        const profiles = {
            chat: {
                speed: 35,
                variableSpeed: true,
                minSpeed: 25,
                maxSpeed: 45,
                pauseOnPunctuation: true,
                punctuationDelay: 200
            },
            code: {
                speed: 40,
                variableSpeed: true,
                minSpeed: 35,
                maxSpeed: 60,
                pauseOnPunctuation: false
            },
            thinking: {
                speed: 25,
                variableSpeed: true,
                minSpeed: 15,
                maxSpeed: 35,
                pauseOnPunctuation: true,
                punctuationDelay: 300
            },
            fast: {
                speed: 60,
                variableSpeed: false,
                pauseOnPunctuation: false
            }
        };

        return profiles[contentType] || profiles.chat;
    }
}

// Export for use in terminal
window.TextStreamer = TextStreamer;