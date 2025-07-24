class RetroMusicPlayer {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentTrack = null;
        this.volume = 0.3;
        this.tracks = {
            'cyberpunk': this.createCyberpunkTrack.bind(this),
            'ambient': this.createAmbientTrack.bind(this),
            'synthwave': this.createSynthwaveTrack.bind(this),
            'matrix': this.createMatrixTrack.bind(this),
            'mathematical': this.createMathematicalTrack.bind(this)
        };
        this.oscillators = [];
        this.gainNodes = [];
        this.visualizer = null;
        this.masterGainNode = null;
        this.time = 0;
        this.bpm = 120;
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            this.masterGainNode.connect(this.audioContext.destination);
            
            // Initialize visualizer
            if (window.AudioVisualizer) {
                this.visualizer = new AudioVisualizer();
                await this.visualizer.init(this.audioContext);
            }
            
            return true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            return false;
        }
    }

    async playTrack(trackName) {
        if (!this.audioContext) {
            const initialized = await this.init();
            if (!initialized) return false;
        }

        // Resume context if suspended (required for user interaction)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.stopTrack();
        
        if (this.tracks[trackName]) {
            this.currentTrack = trackName;
            this.time = 0;
            this.tracks[trackName]();
            this.isPlaying = true;
            
            // Start visualizer with appropriate shader
            if (this.visualizer) {
                const shaderMap = {
                    'cyberpunk': 'cyberpunk',
                    'matrix': 'cyberpunk',
                    'synthwave': 'spectrum',
                    'ambient': 'minimal',
                    'mathematical': 'waveform'
                };
                this.visualizer.switchShader(shaderMap[trackName] || 'spectrum');
                this.visualizer.start();
            }
            
            return true;
        }
        return false;
    }

    stopTrack() {
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) { /* oscillator already stopped */ }
        });
        this.gainNodes.forEach(gain => {
            try {
                gain.disconnect();
            } catch (e) { /* already disconnected */ }
        });
        this.oscillators = [];
        this.gainNodes = [];
        this.isPlaying = false;
        this.currentTrack = null;
        
        // Stop visualizer
        if (this.visualizer) {
            this.visualizer.stop();
        }
    }

    createOscillator(frequency, type = 'sine', duration = null) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        
        // Connect to visualizer if available
        if (this.visualizer && this.visualizer.analyser) {
            gainNode.connect(this.visualizer.analyser);
        }
        
        if (duration) {
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            oscillator.stop(this.audioContext.currentTime + duration);
        }
        
        this.oscillators.push(oscillator);
        this.gainNodes.push(gainNode);
        
        return { oscillator, gainNode };
    }

    createCyberpunkTrack() {
        const startTime = this.audioContext.currentTime;
        
        // Bass line
        const bassFreqs = [65.41, 73.42, 82.41, 87.31]; // C2, D2, E2, F2
        bassFreqs.forEach((freq, i) => {
            setTimeout(() => {
                if (this.isPlaying) {
                    const { oscillator } = this.createOscillator(freq, 'sawtooth', 0.8);
                    oscillator.start();
                }
            }, i * 1000);
        });

        // Atmospheric pad
        setTimeout(() => {
            if (this.isPlaying) {
                const { oscillator, gainNode } = this.createOscillator(220, 'sine');
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                oscillator.start();
                
                // Slow filter sweep
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
                filter.frequency.linearRampToValueAtTime(1200, this.audioContext.currentTime + 4);
                
                oscillator.disconnect();
                oscillator.connect(filter);
                filter.connect(gainNode);
            }
        }, 500);

        // Schedule next loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'cyberpunk') {
                this.createCyberpunkTrack();
            }
        }, 4000);
    }

    createAmbientTrack() {
        // Soft ambient drones
        const freqs = [110, 165, 220, 330]; // A2, E3, A3, E4
        
        freqs.forEach((freq, i) => {
            setTimeout(() => {
                if (this.isPlaying) {
                    const { oscillator, gainNode } = this.createOscillator(freq, 'sine');
                    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 2);
                    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 6);
                    oscillator.start();
                }
            }, i * 1500);
        });

        // Schedule next loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'ambient') {
                this.createAmbientTrack();
            }
        }, 8000);
    }

    createSynthwaveTrack() {
        const melody = [261.63, 293.66, 329.63, 392.00, 329.63, 293.66]; // C4, D4, E4, G4, E4, D4
        
        melody.forEach((freq, i) => {
            setTimeout(() => {
                if (this.isPlaying) {
                    const { oscillator, gainNode } = this.createOscillator(freq, 'square', 0.5);
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    oscillator.start();
                    
                    // Add some delay/echo effect
                    setTimeout(() => {
                        if (this.isPlaying) {
                            const { oscillator: echo } = this.createOscillator(freq * 0.5, 'triangle', 0.3);
                            echo.start();
                        }
                    }, 150);
                }
            }, i * 600);
        });

        // Schedule next loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'synthwave') {
                this.createSynthwaveTrack();
            }
        }, 4000);
    }

    createMatrixTrack() {
        // Digital rain sounds
        const digitalFreqs = [800, 1000, 1200, 1500, 1800];
        
        const playDroplet = () => {
            if (this.isPlaying) {
                const freq = digitalFreqs[Math.floor(Math.random() * digitalFreqs.length)];
                const { oscillator, gainNode } = this.createOscillator(freq, 'sine', 0.1);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                oscillator.start();
                
                setTimeout(playDroplet, Math.random() * 300 + 100);
            }
        };

        playDroplet();

        // Base drone
        if (this.isPlaying) {
            const { oscillator, gainNode } = this.createOscillator(55, 'sawtooth');
            gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
            oscillator.start();
        }

        // Schedule restart
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'matrix') {
                this.createMatrixTrack();
            }
        }, 10000);
    }

    createMathematicalTrack() {
        // Mathematical/algorithmic composition with drums and syncopation
        const beat = 60 / this.bpm; // Beat duration in seconds
        
        // Generate sequence based on mathematical patterns
        const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21];
        const primes = [2, 3, 5, 7, 11, 13, 17, 19];
        
        // Create drums with syncopation
        this.createDrumPattern(beat);
        
        // Mathematical melody using golden ratio
        const goldenRatio = 1.618;
        const baseFreq = 220; // A3
        
        fibonacci.forEach((num, i) => {
            setTimeout(() => {
                if (this.isPlaying) {
                    const freq = baseFreq * Math.pow(goldenRatio, (num % 7) / 7);
                    const { oscillator, gainNode } = this.createOscillator(freq, 'triangle', beat * 0.8);
                    
                    // Add some modulation
                    const lfo = this.audioContext.createOscillator();
                    const lfoGain = this.audioContext.createGain();
                    lfo.frequency.setValueAtTime(3 + Math.sin(i) * 2, this.audioContext.currentTime);
                    lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);
                    
                    lfo.connect(lfoGain);
                    lfoGain.connect(oscillator.frequency);
                    lfo.start();
                    lfo.stop(this.audioContext.currentTime + beat);
                    
                    oscillator.start();
                }
            }, i * beat * 1000);
        });
        
        // Prime number bass line
        primes.forEach((prime, i) => {
            setTimeout(() => {
                if (this.isPlaying) {
                    const freq = 55 * (prime % 8); // Bass frequencies
                    const { oscillator } = this.createOscillator(freq, 'sawtooth', beat * 1.5);
                    oscillator.start();
                }
            }, i * beat * 2000); // Every other beat
        });
        
        // Recursive call
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'mathematical') {
                this.createMathematicalTrack();
            }
        }, fibonacci.length * beat * 1000);
    }

    createDrumPattern(beat) {
        // Kick drum pattern
        const kickPattern = [1, 0, 0, 0, 1, 0, 1, 0]; // Syncopated kick
        kickPattern.forEach((hit, i) => {
            if (hit) {
                setTimeout(() => {
                    if (this.isPlaying) {
                        this.createKick();
                    }
                }, i * beat * 250); // 16th notes
            }
        });
        
        // Hi-hat pattern
        const hatPattern = [0, 1, 0, 1, 0, 1, 1, 0]; // Off-beat hats
        hatPattern.forEach((hit, i) => {
            if (hit) {
                setTimeout(() => {
                    if (this.isPlaying) {
                        this.createHiHat();
                    }
                }, i * beat * 250);
            }
        });
    }

    createKick() {
        // Synthesized kick drum
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.frequency.setValueAtTime(60, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterGainNode);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    createHiHat() {
        // Synthesized hi-hat using noise
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Generate noise
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        
        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGainNode);
        
        noise.start();
        noise.stop(this.audioContext.currentTime + 0.1);
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.gainNodes.forEach(gainNode => {
            gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        });
    }

    getStatus() {
        return {
            isPlaying: this.isPlaying,
            currentTrack: this.currentTrack,
            volume: this.volume,
            availableTracks: Object.keys(this.tracks)
        };
    }
}

// Export for use in terminal
window.RetroMusicPlayer = RetroMusicPlayer;