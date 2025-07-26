class RetroMusicPlayer {
    constructor() {
        // Audio context will be initialized on-demand (lazy init)
        this.audioContext = null;
        // Indicates if a track is currently playing
        this.isPlaying = false;
        // The name of the currently playing track
        this.currentTrack = null;
        // Default volume (0.0 to 1.0)
        this.volume = 0.3;
        // Map of available track names to their generator functions
        this.tracks = {
            'ambient': this.createAmbientTrack.bind(this),
            'cyberpunk': this.createCyberpunkTrack.bind(this),
            'synthwave': this.createSynthwaveTrack.bind(this),
            'matrix': this.createMatrixTrack.bind(this),
            'mathematical': this.createMathematicalTrack.bind(this),
            'procedural': this.createProceduralTrack.bind(this),
            'basicchannel': this.createBasicChannelTrack.bind(this),
            'purposemaker': this.createPurposeMakerTrack.bind(this),
            'model500': this.createModel500Track.bind(this),
            'kraftwerk': this.createKraftwerkTrack.bind(this),
            'experimental': this.createExperimentalTrack.bind(this)
        };
        // Arrays to keep track of active oscillators and gain nodes for cleanup
        this.oscillators = [];
        this.gainNodes = [];
        // Visualizer instance if available
        this.visualizer = null;
        // Master output gain node
        this.masterGainNode = null;
        // Internal time counter (used for sequencing)
        this.time = 0;
        // Default BPM for tracks
        this.bpm = 120;
        // List of available tracks (library)
        this.library = [];
        // Playlists mapping playlist names to arrays of track names
        this.playlists = {};
        // Track metadata for tags and categorization
        this.trackMetadata = {
            'ambient': { tags: ['drone', 'harmonic', 'bell', 'slow'] },
            'cyberpunk': { tags: ['industrial', 'bassline', 'distorted', 'berlin'] },
            'synthwave': { tags: ['retro', 'melody', 'arpeggio'] },
            'matrix': { tags: ['glitch', 'atonal', 'digital', 'detroit'] },
            'mathematical': { tags: ['syncopated', 'modular', 'algorithmic', 'percussion'] },
            'procedural': { tags: ['minimal', 'melodic', 'evolving'] },
            'basicchannel': { tags: ['dub', 'minimal', 'delay', 'berlin'] },
            'purposemaker': { tags: ['detroit', 'mills', 'techno', 'loop', 'rhythmic'] },
            'model500': { tags: ['detroit', 'electro', 'syncopation', 'bleeps', 'FM'] },
            'kraftwerk': { tags: ['minimal', 'melodic', 'robotic', 'synthetic', 'voice'] },
            'experimental': { tags: ['glitch', 'noise', 'granular', 'vinyl', 'avant-garde'] }
        };
        // --- Playlist initialization and dev message ---
        // Show developer tip in console
        console.log("You can now call `player.generateDiversePlaylist()` to explore randomized synth textures.");
        // Console tip for generative DJ
        console.log("Try `player.generativeDJTrackSwitcher()` for continuous generative performance.");
        // Populate library with all available tracks
        this.library = Object.keys(this.tracks);
        // Create an autoplay playlist containing all tracks
        this.createPlaylist("autoplay", this.library);
        // Start playing the autoplay playlist
        this.playPlaylist("autoplay");
    }
    createPurposeMakerTrack() {
        const beat = 60 / this.bpm;

        // Pulsing kick
        for (let i = 0; i < 16; i++) {
            setTimeout(() => {
                if (this.isPlaying) this.createKick();
            }, i * beat * 1000);
        }

        // Hypnotic mono synth loop
        const loopFreqs = [440, 466.16, 493.88, 523.25]; // A4 to C5

        loopFreqs.forEach((freq, i) => {
            setTimeout(() => {
                if (!this.isPlaying) return;
                const { oscillator, gainNode } = this.createOscillator(freq, 'sawtooth', 0.2, {
                    gain: 0.12,
                    stereoPan: 0
                });

                // Auto filter modulation
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
                filter.frequency.exponentialRampToValueAtTime(1800, this.audioContext.currentTime + 1.5);

                oscillator.connect(filter);
                filter.connect(gainNode);
            }, i * beat * 800 + 100);
        });

        // Clattering hats
        const hatTimes = [1, 2.5, 3.5, 5.5, 6.5];
        hatTimes.forEach(t => {
            setTimeout(() => {
                if (this.isPlaying) this.createHiHat();
            }, t * beat * 1000);
        });

        // Dense stabs with distortion
        setTimeout(() => {
            if (!this.isPlaying) return;

            const stabFreq = 987.77; // B5
            const { oscillator, gainNode } = this.createOscillator(stabFreq, 'square', 0.2, {
                gain: 0.25,
                stereoPan: -0.5
            });

            const waveshaper = this.audioContext.createWaveShaper();
            const curve = new Float32Array(2048);
            for (let i = 0; i < 2048; i++) {
                const x = (i * 2) / 2048 - 1;
                curve[i] = x < 0 ? -Math.pow(-x, 0.5) : Math.pow(x, 0.5);
            }
            waveshaper.curve = curve;
            waveshaper.oversample = '4x';

            oscillator.disconnect();
            oscillator.connect(waveshaper);
            waveshaper.connect(gainNode);
            oscillator.start();
        }, 2000);

        // Recursive loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'purposemaker') {
                this.createPurposeMakerTrack();
            }
        }, 6000);
    }
        // (Optional, visible to devs)
        console.log("You can now call `player.generateDiversePlaylist()` to explore randomized synth textures.");
        // Populate library and autoplay playlist
        this.library = Object.keys(this.tracks);
        this.createPlaylist("autoplay", this.library);
        this.playPlaylist("autoplay");
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            this.masterGainNode.connect(this.audioContext.destination);

            // --- Reverb bus setup ---
            this.reverbBus = this.audioContext.createConvolver();
            const length = this.audioContext.sampleRate * 2;
            const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * (1 - i / length); // exponential decay
                }
            }
            this.reverbBus.buffer = impulse;
            this.reverbBus.connect(this.masterGainNode);

            // Initialize visualizer
            if (window.AudioVisualizer) {
                this.visualizer = new AudioVisualizer();
                await this.visualizer.init(this.audioContext);
            }

            // Preload other assets here if needed (e.g., samples)

            return true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            return false;
        }
    }

    async playTrack(trackName) {
        console.log(`Attempting to play track: ${trackName}`);
        
        if (!this.audioContext) {
            console.log('No audio context, initializing...');
            const initialized = await this.init();
            if (!initialized) {
                console.error('Failed to initialize audio context');
                return false;
            }
        }

        // Resume context if suspended (required for user interaction)
        if (this.audioContext.state === 'suspended') {
            console.log('Resuming suspended audio context...');
            await this.audioContext.resume();
        }

        console.log(`Audio context state: ${this.audioContext.state}`);
        this.stopTrack();
        
        console.log(`Available tracks:`, Object.keys(this.tracks));
        console.log(`Looking for track: ${trackName}`);
        
        if (this.tracks[trackName]) {
            this.currentTrack = trackName;
            this.time = 0;
            try {
                this.isPlaying = true; // Set this only after ready to start
                console.log(`Calling track method for: ${trackName}`);
                this.tracks[trackName]();
                console.log(`Track ${trackName} started successfully`);
            } catch (error) {
                console.error(`Error playing track "${trackName}":`, error);
                this.isPlaying = false;
                this.currentTrack = null;
                return false;
            }
            
            // Start visualizer with appropriate shader
            if (this.visualizer) {
                // Updated shader map for all 10 tracks + fallback
                const shaderMap = {
                    'ambient': 'minimal',
                    'cyberpunk': 'cyberpunk',
                    'synthwave': 'spectrum',
                    'matrix': 'cyberpunk',
                    'mathematical': 'waveform',
                    'procedural': 'particles',
                    'basicchannel': 'dub',
                    'purposemaker': 'strobe',
                    'model500': 'grid',
                    'kraftwerk': 'robotic',
                    'experimental': 'glitch'
                };
                // Fallback to 'spectrum' if not mapped
                this.visualizer.switchShader(shaderMap[trackName] || 'spectrum');
                this.visualizer.start();
            }
            
            return true;
        } else {
            console.error(`Track "${trackName}" not found in available tracks:`, Object.keys(this.tracks));
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

    createOscillator(frequency, type = 'sine', duration = null, options = {}) {
        try {
            const {
                detune = 0,
                stereoPan = 0,
                gain = this.volume,
                modulation = null,
                customWave = null
            } = options;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const panNode = this.audioContext.createStereoPanner();

            if (customWave) {
                oscillator.setPeriodicWave(customWave);
            } else {
                oscillator.type = type;
            }

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.detune.setValueAtTime(detune, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
            panNode.pan.setValueAtTime(stereoPan, this.audioContext.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(panNode);
            panNode.connect(this.masterGainNode);

            if (this.visualizer && this.visualizer.analyser) {
                gainNode.connect(this.visualizer.analyser);
            }

            if (modulation && modulation.type === 'lfo') {
                const lfo = this.audioContext.createOscillator();
                const lfoGain = this.audioContext.createGain();
                lfo.frequency.setValueAtTime(modulation.frequency || 1, this.audioContext.currentTime);
                lfoGain.gain.setValueAtTime(modulation.depth || 10, this.audioContext.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                lfo.start();
                if (duration) lfo.stop(this.audioContext.currentTime + duration);
            }

            if (duration) {
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration);
            } else {
                oscillator.start();
            }

            this.oscillators.push(oscillator);
            this.gainNodes.push(gainNode);

            return { oscillator, gainNode };
        } catch (error) {
            console.error('Enhanced oscillator creation failed:', error);
            throw error;
        }
    }

    createCyberpunkTrack() {
        console.log('Creating cyberpunk track...');
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

    createProceduralTrack() {
        // Simple procedural track with evolving patterns, uses Karplus-Strong plucks
        const baseFreq = 110; // A2
        const scale = [0, 2, 4, 5, 7, 9, 11, 12]; // Major scale intervals

        let currentNoteIndex = 0;
        let direction = 1;

        const playNote = () => {
            if (!this.isPlaying) return;

            const interval = scale[currentNoteIndex];
            const freq = baseFreq * Math.pow(2, interval / 12);

            // Use Karplus-Strong pluck instead of simple sine
            this.createKarplusStrongPluck(freq, 0.7, 0.98);

            currentNoteIndex += direction;
            if (currentNoteIndex >= scale.length - 1 || currentNoteIndex <= 0) {
                direction *= -1; // Reverse direction at ends of scale
            }

            setTimeout(playNote, 500); // Play a note every 500ms
        };

        playNote();

        // Add a simple evolving drone
        const droneFreq = 55; // A1
        const { oscillator: droneOsc, gainNode: droneGain } = this.createOscillator(droneFreq, 'sawtooth');
        droneGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        droneOsc.start();

        // Modulate drone frequency slowly
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.setValueAtTime(0.05, this.audioContext.currentTime); // Very slow LFO
        lfoGain.gain.setValueAtTime(5, this.audioContext.currentTime); // Small frequency shift

        lfo.connect(lfoGain);
        lfoGain.connect(droneOsc.frequency);
        lfo.start();

        // Schedule next loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'procedural') {
                this.createProceduralTrack();
            }
        }, 10000);
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

    addToLibrary(track) {
        this.library.push(track);
    }

    createPlaylist(name, trackNames = []) {
        this.playlists[name] = trackNames.filter(t => this.library.includes(t));
    }

    addToPlaylist(name, trackName) {
        if (!this.playlists[name]) this.playlists[name] = [];
        if (this.library.includes(trackName)) this.playlists[name].push(trackName);
    }

    removeFromPlaylist(name, trackName) {
        if (!this.playlists[name]) return;
        this.playlists[name] = this.playlists[name].filter(t => t !== trackName);
    }

    getPlaylists() {
        return this.playlists;
    }

    getLibrary() {
        return this.library;
    }

    playPlaylist(name) {
        const playlist = this.playlists[name];
        if (!playlist || playlist.length === 0) {
            console.warn(`Playlist "${name}" is empty or does not exist.`);
            return;
        }

        console.log(`Autoplaying playlist "${name}":`, playlist);

        let index = 0;
        const playNext = async () => {
            if (index >= playlist.length) {
                console.log(`Finished playlist: "${name}"`);
                this.isPlaying = false;
                return;
            }
            if (!this.isPlaying) return;

            const success = await this.playTrack(playlist[index]);
            if (success) {
                setTimeout(() => {
                    index++;
                    playNext();
                }, 5000); // average track duration
            }
        };

        this.isPlaying = true;
        playNext();
    }
}

// Export for use in terminal
window.RetroMusicPlayer = RetroMusicPlayer;
    createDubDelay(delayTime = 0.375, feedbackGain = 0.4, tone = 1200) {
        const delay = this.audioContext.createDelay();
        delay.delayTime.setValueAtTime(delayTime, this.audioContext.currentTime);

        const feedback = this.audioContext.createGain();
        feedback.gain.setValueAtTime(feedbackGain, this.audioContext.currentTime);

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(tone, this.audioContext.currentTime);

        delay.connect(feedback);
        feedback.connect(filter);
        filter.connect(delay);

        return { delay, input: delay, output: delay, feedback };
    }

    createBasicChannelTrack() {
        const beat = 60 / this.bpm;

        // Kick drum
        for (let i = 0; i < 16; i++) {
            setTimeout(() => {
                if (this.isPlaying) this.createKick();
            }, i * beat * 1000);
        }

        // Dub chord stabs with delay
        const chordFreqs = [261.63, 329.63, 392.00]; // C4, E4, G4
        const root = chordFreqs[0];

        for (let step = 0; step < 8; step++) {
            setTimeout(() => {
                if (!this.isPlaying) return;

                const now = this.audioContext.currentTime;
                chordFreqs.forEach((freq, i) => {
                    const { oscillator, gainNode } = this.createOscillator(freq, 'square', 0.25, {
                        gain: 0.15 / (i + 1),
                        stereoPan: (i - 1) * 0.5
                    });

                    // Add dub delay chain
                    const { delay, output } = this.createDubDelay(0.4 + Math.random() * 0.05, 0.45, 1000 - i * 300);
                    gainNode.connect(delay);
                    output.connect(this.masterGainNode);
                });
            }, step * beat * 2000 + 500);
        }

        // Ambient drone pad
        setTimeout(() => {
            if (!this.isPlaying) return;

            const droneFreq = root / 2;
            const { oscillator, gainNode } = this.createOscillator(droneFreq, 'sawtooth', null, {
                gain: 0.03
            });

            // Slow filter sweep
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
            filter.frequency.linearRampToValueAtTime(3000, this.audioContext.currentTime + 16);

            oscillator.connect(filter);
            filter.connect(gainNode);
        }, 1000);

        // Loop track
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'basicchannel') {
                this.createBasicChannelTrack();
            }
        }, 8000);
    }
    /**
     * Karplus-Strong pluck generator
     * @param {number} frequency - Fundamental frequency of the pluck
     * @param {number} duration - Duration in seconds (default 1.5)
     * @param {number} decay - Decay factor (default 0.99)
     */
    createKarplusStrongPluck(frequency, duration = 1.5, decay = 0.99) {
        const length = Math.floor(this.audioContext.sampleRate / frequency);
        const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with noise
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        // Apply simple decay filter (Karplus-Strong)
        for (let i = 1; i < length; i++) {
            data[i] = (data[i] + data[i - 1]) * 0.5 * decay;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        source.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        source.start();
    }

    /**
     * Play a sample-based accent (placeholder)
     * @param {string} name - Name of the sample
     */
    playSample(name) {
        console.warn(`Sample "${name}" not implemented. Use AudioBufferSourceNode to load and play samples.`);
    }
    // --- NEW TRACK GENERATORS ---
    createModel500Track() {
        // Detroit electro: tight syncopated beats, FM bleeps
        const beat = 60 / (this.bpm + 10); // Slightly faster
        // Syncopated electro kick/snare
        const kickPattern = [1, 0, 0, 1, 0, 1, 0, 0];
        const snarePattern = [0, 0, 1, 0, 1, 0, 0, 1];
        kickPattern.forEach((hit, i) => {
            if (hit) {
                setTimeout(() => { if (this.isPlaying) this.createKick(); }, i * beat * 500);
            }
        });
        snarePattern.forEach((hit, i) => {
            if (hit) {
                setTimeout(() => {
                    if (!this.isPlaying) return;
                    // Snare = filtered noise burst
                    const bufferSize = this.audioContext.sampleRate * 0.08;
                    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                    const output = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
                    const noise = this.audioContext.createBufferSource();
                    noise.buffer = buffer;
                    const filter = this.audioContext.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(1800, this.audioContext.currentTime);
                    const gain = this.audioContext.createGain();
                    gain.gain.setValueAtTime(0.18, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.masterGainNode);
                    noise.start();
                    noise.stop(this.audioContext.currentTime + 0.08);
                }, i * beat * 500);
            }
        });
        // Electro hats (short metallic)
        for (let i = 0; i < 8; i++) {
            setTimeout(() => { if (this.isPlaying) this.createHiHat(); }, i * beat * 250 + 80);
        }
        // FM-style bleepy synth
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                if (!this.isPlaying) return;
                // FM: modulate sine freq by another sine
                const carrierFreq = 440 + i * 37;
                const modFreq = 80 + i * 23;
                const modIndex = 60 + 20 * Math.sin(i);
                const carrier = this.audioContext.createOscillator();
                carrier.type = 'sine';
                carrier.frequency.setValueAtTime(carrierFreq, this.audioContext.currentTime);
                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0.09, this.audioContext.currentTime);
                // Modulation
                const modulator = this.audioContext.createOscillator();
                modulator.type = 'sine';
                modulator.frequency.setValueAtTime(modFreq, this.audioContext.currentTime);
                const modGain = this.audioContext.createGain();
                modGain.gain.setValueAtTime(modIndex, this.audioContext.currentTime);
                modulator.connect(modGain);
                modGain.connect(carrier.frequency);
                carrier.connect(gain);
                gain.connect(this.masterGainNode);
                carrier.start();
                modulator.start();
                carrier.stop(this.audioContext.currentTime + 0.25);
                modulator.stop(this.audioContext.currentTime + 0.25);
            }, i * beat * 400 + 120);
        }
        // Recursive loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'model500') {
                this.createModel500Track();
            }
        }, 4000);
    }

    createKraftwerkTrack() {
        // Minimal melodic sequence, robotic rhythm, synthetic voices
        const beat = 60 / (this.bpm - 8);
        // Simple melodic sequence (pentatonic)
        const melody = [392, 440, 523.25, 392, 659.25, 392, 392];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                if (!this.isPlaying) return;
                // Minimal square wave with short envelope
                const { oscillator, gainNode } = this.createOscillator(freq, 'square', 0.22, {
                    gain: 0.11,
                    stereoPan: (i % 2 === 0) ? -0.3 : 0.3
                });
                gainNode.gain.setValueAtTime(0.11, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.22);
                oscillator.start();
            }, i * beat * 700);
        });
        // Robotic rhythm: kick on 1, 3, clap on 2, 4
        [0, 2].forEach(i => setTimeout(() => { if (this.isPlaying) this.createKick(); }, i * beat * 1000));
        [1, 3].forEach(i => setTimeout(() => {
            if (!this.isPlaying) return;
            // Clap = filtered noise burst, wider
            const bufferSize = this.audioContext.sampleRate * 0.13;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1800, this.audioContext.currentTime);
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.13, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.13);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGainNode);
            noise.start();
            noise.stop(this.audioContext.currentTime + 0.13);
        }, i * beat * 1000));
        // Synthetic "robot voice" (simple formant/vowel filter on saw)
        setTimeout(() => {
            if (!this.isPlaying) return;
            const freq = 220;
            const { oscillator, gainNode } = this.createOscillator(freq, 'sawtooth', 0.5, { gain: 0.09 });
            // Formant filter (bandpass)
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
            filter.Q.setValueAtTime(12, this.audioContext.currentTime);
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.gain.setValueAtTime(0.09, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            oscillator.start();
        }, 2000);
        // Recursive loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'kraftwerk') {
                this.createKraftwerkTrack();
            }
        }, 4200);
    }

    createExperimentalTrack() {
        // Glitch bursts, vinyl noise, granular textures (placeholder structure)
        // Vinyl noise layer
        this.createVinylNoiseLayer(6.0);
        // Random glitch bursts
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                if (this.isPlaying) this.createGlitchBurst();
            }, i * 700 + Math.random() * 250);
        }
        // Granular: randomized short plucks
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                if (!this.isPlaying) return;
                const freq = 220 + Math.random() * 800;
                this.createKarplusStrongPluck(freq, 0.2 + Math.random() * 0.25, 0.96 + Math.random() * 0.03);
            }, i * 900 + Math.random() * 200);
        }
        // Recursive loop
        setTimeout(() => {
            if (this.isPlaying && this.currentTrack === 'experimental') {
                this.createExperimentalTrack();
            }
        }, 6500);
    }

    // --- SUPPORT LAYERS FOR EXPERIMENTAL ---
    createVinylNoiseLayer(duration = 5.0) {
        // Add vinyl crackle/noise for duration seconds
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Random noise with occasional pops
            let pop = (Math.random() > 0.9995) ? (Math.random() * 2 - 1) * 0.7 : 0;
            output[i] = (Math.random() * 0.22 - 0.11) + pop;
        }
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        noise.connect(gain);
        gain.connect(this.masterGainNode);
        noise.start();
        noise.stop(this.audioContext.currentTime + duration);
    }

    createGlitchBurst() {
        // Short burst of random noise, optionally bitcrushed
        const burstLen = 0.07 + Math.random() * 0.07;
        const bufferSize = Math.floor(this.audioContext.sampleRate * burstLen);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Quantize to simulate bitcrush
            let val = Math.round((Math.random() * 2 - 1) * 8) / 8;
            output[i] = val * (1 - i / bufferSize); // fade out
        }
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.16, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + burstLen);
        noise.connect(gain);
        gain.connect(this.masterGainNode);
        noise.start();
        noise.stop(this.audioContext.currentTime + burstLen);
    }
    // --- Generative DJ Track Switcher ---
    generativeDJTrackSwitcher(delay = 8000) {
        const tracks = Object.keys(this.tracks);
        let index = 0;
        const playNext = async () => {
            if (!this.isPlaying) return;
            const nextTrack = tracks[index % tracks.length];
            await this.playTrack(nextTrack);
            index++;
            setTimeout(playNext, delay + Math.random() * 2000);
        };
        this.isPlaying = true;
        playNext();
    }