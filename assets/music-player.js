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
            'matrix': this.createMatrixTrack.bind(this)
        };
        this.oscillators = [];
        this.gainNodes = [];
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
            this.tracks[trackName]();
            this.isPlaying = true;
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
    }

    createOscillator(frequency, type = 'sine', duration = null) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
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