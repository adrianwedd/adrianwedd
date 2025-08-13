/**
 * Music & Audio Commands Module
 * Handles music player, synthesizer, and audio visualization
 */

export class MusicCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.musicPlayer = null;
    this.audioContext = null;
    this.isPlaying = false;
    this.currentMode = 'ambient';
  }

  /**
   * Initialize music player
   */
  async initializeMusic() {
    if (!this.musicPlayer) {
      try {
        const { MusicPlayer } = await import('../../music-player.js');
        this.musicPlayer = new MusicPlayer();
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return true;
      } catch (error) {
        console.error('Failed to initialize music player:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Get command definitions
   */
  getCommands() {
    return {
      music: {
        handler: this.handleMusic.bind(this),
        description: 'Start music player',
        usage: 'music [play|stop|mode|visualizer]',
        aliases: ['audio', 'sound'],
      },

      synth: {
        handler: this.handleSynth.bind(this),
        description: 'Audio synthesizer',
        usage: 'synth [note] [duration]',
      },

      visualizer: {
        handler: this.handleVisualizer.bind(this),
        description: 'Audio visualizer',
        usage: 'visualizer [on|off|mode]',
        aliases: ['viz'],
      },

      play: {
        handler: () => this.handleMusic(['play']),
        description: 'Play music',
      },

      stop: {
        handler: () => this.handleMusic(['stop']),
        description: 'Stop music',
      },

      volume: {
        handler: this.handleVolume.bind(this),
        description: 'Adjust volume',
        usage: 'volume [0-100]',
        aliases: ['vol'],
      },
    };
  }

  /**
   * Handle music command
   */
  async handleMusic(args) {
    const initialized = await this.initializeMusic();
    if (!initialized) {
      return '❌ Music player unavailable. Please check your browser supports Web Audio API.';
    }

    const subcommand = args[0] || 'play';

    switch (subcommand) {
      case 'play':
        return await this.startMusic();

      case 'stop':
        return this.stopMusic();

      case 'mode':
        return await this.changeMode(args[1]);

      case 'visualizer':
        return await this.toggleVisualizer();

      case 'status':
        return this.getMusicStatus();

      default:
        return `
╔══════════════════════════════════════════════════════════╗
║                    MUSIC PLAYER                          ║
╠══════════════════════════════════════════════════════════╣
║  Commands:                                               ║
║    music play     - Start playback                       ║
║    music stop     - Stop playback                        ║
║    music mode     - Change music mode                    ║
║    music viz      - Toggle visualizer                    ║
║                                                          ║
║  Modes: ambient, techno, classical, experimental        ║
║                                                          ║
║  Status: ${this.isPlaying ? '▶️ Playing' : '⏸️ Stopped'}                                     ║
║  Mode: ${this.currentMode.padEnd(48)}║
╚══════════════════════════════════════════════════════════╝`;
    }
  }

  /**
   * Start music playback
   */
  async startMusic() {
    if (this.isPlaying) {
      return '🎵 Music is already playing';
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isPlaying = true;
      this.terminal.state.updateState('features', 'musicEnabled', true);

      // Start the music player
      if (this.musicPlayer && this.musicPlayer.start) {
        this.musicPlayer.start(this.currentMode);
      }

      return `
🎵 Music Player Started
Mode: ${this.currentMode}
Volume: 70%
Visualizer: ${this.musicPlayer?.visualizerActive ? 'ON' : 'OFF'}

Type 'music stop' to stop playback`;
    } catch (error) {
      this.isPlaying = false;
      return `❌ Failed to start music: ${error.message}`;
    }
  }

  /**
   * Stop music playback
   */
  stopMusic() {
    if (!this.isPlaying) {
      return '⏸️ Music is not playing';
    }

    this.isPlaying = false;
    this.terminal.state.updateState('features', 'musicEnabled', false);

    if (this.musicPlayer && this.musicPlayer.stop) {
      this.musicPlayer.stop();
    }

    return '⏹️ Music stopped';
  }

  /**
   * Change music mode
   */
  async changeMode(mode) {
    const modes = ['ambient', 'techno', 'classical', 'experimental', 'jazz', 'lofi'];

    if (!mode) {
      return `Available modes: ${modes.join(', ')}\nCurrent mode: ${this.currentMode}`;
    }

    if (!modes.includes(mode)) {
      return `❌ Invalid mode. Choose from: ${modes.join(', ')}`;
    }

    this.currentMode = mode;

    if (this.isPlaying && this.musicPlayer) {
      this.musicPlayer.changeMode(mode);
      return `🎵 Switched to ${mode} mode`;
    }

    return `✅ Mode set to ${mode}. Start music to hear the change.`;
  }

  /**
   * Handle synthesizer command
   */
  async handleSynth(args) {
    const initialized = await this.initializeMusic();
    if (!initialized) {
      return '❌ Synthesizer unavailable';
    }

    if (args.length === 0) {
      return `
╔══════════════════════════════════════════════════════════╗
║                    SYNTHESIZER                           ║
╠══════════════════════════════════════════════════════════╣
║  Usage: synth <note> [duration]                         ║
║                                                          ║
║  Notes: C, D, E, F, G, A, B                            ║
║  Octaves: C3, C4, C5, etc.                             ║
║  Duration: milliseconds (default: 500)                  ║
║                                                          ║
║  Examples:                                               ║
║    synth C4        - Play middle C                      ║
║    synth A4 1000   - Play A4 for 1 second              ║
║    synth random    - Play random note                   ║
╚══════════════════════════════════════════════════════════╝`;
    }

    const note = args[0];
    const duration = parseInt(args[1]) || 500;

    return this.playNote(note, duration);
  }

  /**
   * Play a synthesized note
   */
  playNote(note, duration) {
    try {
      const frequencies = {
        C3: 130.81,
        D3: 146.83,
        E3: 164.81,
        F3: 174.61,
        G3: 196.0,
        A3: 220.0,
        B3: 246.94,
        C4: 261.63,
        D4: 293.66,
        E4: 329.63,
        F4: 349.23,
        G4: 392.0,
        A4: 440.0,
        B4: 493.88,
        C5: 523.25,
        D5: 587.33,
        E5: 659.25,
        F5: 698.46,
        G5: 783.99,
        A5: 880.0,
        B5: 987.77,
      };

      let frequency;
      if (note === 'random') {
        const notes = Object.keys(frequencies);
        note = notes[Math.floor(Math.random() * notes.length)];
        frequency = frequencies[note];
      } else {
        frequency = frequencies[note.toUpperCase()] || 440;
      }

      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // ADSR envelope
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1); // Decay/Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000); // Release

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + duration / 1000);

      return `🎹 Playing ${note} (${frequency.toFixed(2)}Hz) for ${duration}ms`;
    } catch (error) {
      return `❌ Failed to play note: ${error.message}`;
    }
  }

  /**
   * Handle visualizer command
   */
  async handleVisualizer(args) {
    const action = args[0] || 'toggle';

    if (!this.musicPlayer) {
      return '❌ Start music first to use visualizer';
    }

    switch (action) {
      case 'on':
        if (this.musicPlayer.enableVisualizer) {
          this.musicPlayer.enableVisualizer();
          return '🎨 Visualizer enabled';
        }
        break;

      case 'off':
        if (this.musicPlayer.disableVisualizer) {
          this.musicPlayer.disableVisualizer();
          return '🎨 Visualizer disabled';
        }
        break;

      case 'mode': {
        const mode = args[1] || 'bars';
        if (this.musicPlayer.setVisualizerMode) {
          this.musicPlayer.setVisualizerMode(mode);
          return `🎨 Visualizer mode: ${mode}`;
        }
        break;
      }

      default:
        return 'Usage: visualizer [on|off|mode <type>]';
    }

    return '✅ Visualizer updated';
  }

  /**
   * Handle volume command
   */
  async handleVolume(args) {
    if (args.length === 0) {
      const currentVolume = this.musicPlayer?.volume || 70;
      return `🔊 Current volume: ${currentVolume}%`;
    }

    const volume = parseInt(args[0]);
    if (isNaN(volume) || volume < 0 || volume > 100) {
      return '❌ Volume must be between 0 and 100';
    }

    if (this.musicPlayer && this.musicPlayer.setVolume) {
      this.musicPlayer.setVolume(volume / 100);
    }

    return `🔊 Volume set to ${volume}%`;
  }

  /**
   * Get music player status
   */
  getMusicStatus() {
    return {
      playing: this.isPlaying,
      mode: this.currentMode,
      volume: this.musicPlayer?.volume || 70,
      visualizer: this.musicPlayer?.visualizerActive || false,
    };
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    if (this.isPlaying) {
      this.stopMusic();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

/**
 * Register music commands with terminal
 */
export function registerMusicCommands(terminal) {
  const musicCommands = new MusicCommands(terminal);
  const commands = musicCommands.getCommands();

  Object.entries(commands).forEach(([name, config]) => {
    terminal.commandRouter.register(name, config.handler, {
      description: config.description,
      usage: config.usage,
      aliases: config.aliases,
      module: 'music',
    });
  });

  // Store music commands instance
  terminal.musicCommands = musicCommands;

  return musicCommands;
}

export default { MusicCommands, registerMusicCommands };
