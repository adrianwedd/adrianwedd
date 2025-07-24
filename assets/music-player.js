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
        
        // Dark bass line with distortion
        const bassFreqs = [65.41, 61.74, 73.42, 82.41]; // C2, B♭1, D2, E2
        bassFreqs.forEach((freq, i) => {
            setTimeout(() => {
                if (this.isPlaying) {
                    const { oscillator, gainNode } = this.createOscillator(freq, 'sawtooth', 1.2);
                    
                    // Add distortion effect
                    const waveshaper = this.audioContext.createWaveShaper();
                    const samples = 44100;
                    const curve = new Float32Array(samples);
                    const deg = Math.PI / 180;
                    
                    for (let i = 0; i < samples; i++) {
                        const x = (i * 2) / samples - 1;
                        curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
                    }
                    waveshaper.curve = curve;
                    waveshaper.oversample = '4x';
                    
                    oscillator.disconnect();
                    oscillator.connect(waveshaper);
                    waveshaper.connect(gainNode);
                    oscillator.start();
                }
            }, i * 800);
        });

        // Aggressive lead synth
        setTimeout(() => {
            if (this.isPlaying) {
                this.createCyberpunkLead();
            }
        }, 1600);

        // Atmospheric pad with modulation
        setTimeout(() => {
            if (this.isPlaying) {
                const { oscillator, gainNode } = this.createOscillator(440, 'triangle');
                gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
                
                // Complex filter sweep with resonance
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(600, this.audioContext.currentTime);
                filter.frequency.exponentialRampToValueAtTime(1800, this.audioContext.currentTime + 3);
                filter.Q.setValueAtTime(8, this.audioContext.currentTime);
                
                // Add tremolo
                const tremolo = this.audioContext.createOscillator();
                const tremoloGain = this.audioContext.createGain();
                tremolo.frequency.setValueAtTime(4, this.audioContext.currentTime);
                tremoloGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                tremolo.connect(tremoloGain);
                tremoloGain.connect(gainNode.gain);
                
                oscillator.start();
                tremolo.start();
                tremolo.stop(this.audioContext.currentTime + 4);
            }
        }, 400);

        // Add industrial percussion
        setTimeout(() => {
            if (this.isPlaying) {
                this.createIndustrialHit();
            }
        }, 2000);

        // Schedule next loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'cyberpunk') {
                this.createCyberpunkTrack();
            }
        }, 5000);
    }

    createCyberpunkLead() {
        const leadFreqs = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
        const freq = leadFreqs[Math.floor(Math.random() * leadFreqs.length)];
        
        const { oscillator, gainNode } = this.createOscillator(freq, 'square', 0.3);
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        // Add aggressive filter sweep
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        oscillator.start();
    }

    createIndustrialHit() {
        // Create metallic industrial percussion
        const hitFreqs = [150, 200, 300, 800, 1200];
        
        hitFreqs.forEach((freq, i) => {
            const { oscillator, gainNode } = this.createOscillator(freq, 'square', 0.1);
            gainNode.gain.setValueAtTime(0.2 / (i + 1), this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            oscillator.start();
        });
    }

    createAmbientTrack() {
        // Soft ambient drones with evolving harmonics
        const baseFreqs = [110, 165, 220, 330]; // A2, E3, A3, E4
        const harmonicRatios = [1, 1.5, 2, 2.5, 3]; // Natural harmonics
        
        baseFreqs.forEach((baseFreq, i) => {
            // Create multiple harmonic layers for richness
            harmonicRatios.forEach((ratio, j) => {
                setTimeout(() => {
                    if (this.isPlaying) {
                        const freq = baseFreq * ratio;
                        const { oscillator, gainNode } = this.createOscillator(freq, 'sine');
                        
                        // Vary volume based on harmonic position
                        const maxGain = 0.1 / (ratio * 2); // Higher harmonics quieter
                        gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(maxGain, this.audioContext.currentTime + 3);
                        gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 10);
                        
                        // Add subtle LFO for organic movement
                        const lfo = this.audioContext.createOscillator();
                        const lfoGain = this.audioContext.createGain();
                        lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, this.audioContext.currentTime);
                        lfoGain.gain.setValueAtTime(freq * 0.01, this.audioContext.currentTime);
                        
                        lfo.connect(lfoGain);
                        lfoGain.connect(oscillator.frequency);
                        lfo.start();
                        lfo.stop(this.audioContext.currentTime + 12);
                        
                        oscillator.start();
                        oscillator.stop(this.audioContext.currentTime + 12);
                    }
                }, (i * 2000) + (j * 400)); // Stagger harmonic entries
            });
        });

        // Add occasional bell-like tones
        setTimeout(() => {
            if (this.isPlaying) {
                this.createAmbientBell();
            }
        }, 4000);

        // Schedule next loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'ambient') {
                this.createAmbientTrack();
            }
        }, 12000);
    }

    createAmbientBell() {
        const bellFreqs = [440, 523.25, 659.25, 783.99]; // A4, C5, E5, G5
        const freq = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];
        
        // Create bell-like sound with multiple oscillators
        [1, 2.1, 3.2, 4.8].forEach((ratio, i) => {
            const { oscillator, gainNode } = this.createOscillator(freq * ratio, 'sine');
            const initialGain = 0.3 / (ratio * ratio); // Exponential decay for harmonics
            
            gainNode.gain.setValueAtTime(initialGain, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 6);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 6);
        });
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