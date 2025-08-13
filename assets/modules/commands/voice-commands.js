/**
 * Voice Commands Module
 * Handles voice interface integration with modular terminal
 */

export class VoiceCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.voiceInterface = null;
    this.initialized = false;
  }

  /**
   * Get command definitions
   */
  getCommands() {
    return {
      voice: {
        handler: this.handleVoice.bind(this),
        description: 'Control voice interface',
        usage: 'voice [on|off|status|settings]',
        aliases: ['speech'],
      },

      'voice-on': {
        handler: this.handleVoiceOn.bind(this),
        description: 'Enable voice recognition',
        aliases: ['enable-voice', 'start-listening'],
      },

      'voice-off': {
        handler: this.handleVoiceOff.bind(this),
        description: 'Disable voice recognition',
        aliases: ['disable-voice', 'stop-listening'],
      },

      'speech-on': {
        handler: this.handleSpeechOn.bind(this),
        description: 'Enable text-to-speech output',
        aliases: ['enable-speech', 'speech-output-on'],
      },

      'speech-off': {
        handler: this.handleSpeechOff.bind(this),
        description: 'Disable text-to-speech output',
        aliases: ['disable-speech', 'speech-output-off'],
      },

      'voice-settings': {
        handler: this.handleVoiceSettings.bind(this),
        description: 'Show voice interface settings',
        aliases: ['voice-config'],
      },
    };
  }

  /**
   * Initialize voice interface integration
   */
  async initializeVoiceInterface() {
    if (this.initialized) {
      return this.voiceInterface;
    }

    try {
      // Check if voice interface is available globally
      if (window.VoiceInterface) {
        this.voiceInterface = new window.VoiceInterface();
        
        // Set up voice interface with terminal integration
        this.setupVoiceIntegration();
        
        // Initialize the voice interface
        const success = await this.voiceInterface.init();
        
        if (success) {
          this.initialized = true;
          this.updateVoiceStatus('READY');
          this.setupVoiceControls();
          return this.voiceInterface;
        } else {
          this.updateVoiceStatus('ERROR');
          return null;
        }
      } else {
        this.updateVoiceStatus('NOT_AVAILABLE');
        return null;
      }
    } catch (error) {
      console.error('Voice interface initialization failed:', error);
      this.updateVoiceStatus('ERROR');
      return null;
    }
  }

  /**
   * Set up voice interface integration with terminal
   */
  setupVoiceIntegration() {
    if (!this.voiceInterface) return;

    // Override voice interface command execution to use new terminal
    this.voiceInterface.executeTerminalCommand = (command) => {
      this.terminal.ui.addCommandLine(command);
      this.terminal.commandRouter.execute(command);
    };

    // Set up voice feedback integration
    this.voiceInterface.showTerminalFeedback = (message, type = 'info') => {
      switch (type) {
        case 'error':
          this.terminal.ui.showError(message);
          break;
        case 'success':
          this.terminal.ui.showSuccess(message);
          break;
        default:
          this.terminal.ui.showInfo(message);
      }
    };
  }

  /**
   * Set up voice control buttons
   */
  setupVoiceControls() {
    const voiceToggle = document.getElementById('voice-toggle');
    const speechToggle = document.getElementById('speech-toggle');
    const voiceIndicator = document.getElementById('voice-indicator');

    if (voiceToggle) {
      voiceToggle.addEventListener('click', () => {
        this.toggleVoiceRecognition();
      });
    }

    if (speechToggle) {
      speechToggle.addEventListener('click', () => {
        this.toggleSpeechOutput();
      });
    }

    // Update UI based on voice interface state
    this.updateVoiceUI();
  }

  /**
   * Update voice status indicator
   */
  updateVoiceStatus(status) {
    const statusElement = document.getElementById('voice-status');
    if (statusElement) {
      statusElement.textContent = status;
    }

    // Update terminal state
    this.terminal.state.setState('voice', { status, initialized: this.initialized });
  }

  /**
   * Update voice UI controls
   */
  updateVoiceUI() {
    const voiceToggle = document.getElementById('voice-toggle');
    const speechToggle = document.getElementById('speech-toggle');
    const voiceIndicator = document.getElementById('voice-indicator');

    if (!this.voiceInterface) return;

    if (voiceToggle) {
      voiceToggle.textContent = this.voiceInterface.isListening ? 'Stop' : 'Voice';
      voiceToggle.classList.toggle('active', this.voiceInterface.isListening);
    }

    if (speechToggle) {
      speechToggle.classList.toggle('active', this.voiceInterface.speechOutputEnabled);
    }

    if (voiceIndicator) {
      voiceIndicator.textContent = this.voiceInterface.isListening ? '🎤' : '🔇';
    }
  }

  /**
   * Toggle voice recognition
   */
  async toggleVoiceRecognition() {
    if (!this.voiceInterface) {
      await this.initializeVoiceInterface();
    }

    if (this.voiceInterface) {
      if (this.voiceInterface.isListening) {
        this.voiceInterface.stopListening();
      } else {
        this.voiceInterface.startListening();
      }
      this.updateVoiceUI();
    }
  }

  /**
   * Toggle speech output
   */
  toggleSpeechOutput() {
    if (this.voiceInterface) {
      this.voiceInterface.toggleSpeechOutput();
      this.updateVoiceUI();
    }
  }

  /**
   * Handle voice command
   */
  async handleVoice(args) {
    const action = args[0] || 'status';

    switch (action) {
      case 'on':
      case 'enable':
        return await this.handleVoiceOn();

      case 'off':
      case 'disable':
        return await this.handleVoiceOff();

      case 'status':
        return this.getVoiceStatus();

      case 'settings':
        return await this.handleVoiceSettings();

      default:
        return 'Usage: voice [on|off|status|settings]';
    }
  }

  /**
   * Handle voice-on command
   */
  async handleVoiceOn() {
    if (!this.voiceInterface) {
      await this.initializeVoiceInterface();
    }

    if (this.voiceInterface) {
      this.voiceInterface.startListening();
      this.updateVoiceUI();
      return '🎤 Voice recognition enabled';
    } else {
      return '❌ Voice interface not available';
    }
  }

  /**
   * Handle voice-off command
   */
  async handleVoiceOff() {
    if (this.voiceInterface) {
      this.voiceInterface.stopListening();
      this.updateVoiceUI();
      return '🔇 Voice recognition disabled';
    } else {
      return 'Voice interface not initialized';
    }
  }

  /**
   * Handle speech-on command
   */
  handleSpeechOn() {
    if (this.voiceInterface) {
      this.voiceInterface.enableSpeechOutput();
      this.updateVoiceUI();
      return '🔊 Speech output enabled';
    } else {
      return '❌ Voice interface not available';
    }
  }

  /**
   * Handle speech-off command
   */
  handleSpeechOff() {
    if (this.voiceInterface) {
      this.voiceInterface.speechOutputEnabled = false;
      this.updateVoiceUI();
      return '🔇 Speech output disabled';
    } else {
      return 'Voice interface not initialized';
    }
  }

  /**
   * Handle voice settings command
   */
  async handleVoiceSettings() {
    if (!this.voiceInterface) {
      return '❌ Voice interface not initialized';
    }

    const settings = this.voiceInterface.voiceSettings;
    const browserSupport = this.getBrowserSupportInfo();

    return `
╔══════════════════════════════════════════════════════╗
║                  Voice Settings                      ║
╠══════════════════════════════════════════════════════╣
║ Status: ${this.voiceInterface.isActive ? 'Active' : 'Inactive'}                               ║
║ Listening: ${this.voiceInterface.isListening ? 'Yes' : 'No'}                            ║
║ Speech Output: ${this.voiceInterface.speechOutputEnabled ? 'Enabled' : 'Disabled'}          ║
║                                                      ║
║ Voice Settings:                                      ║
║   Rate: ${settings.rate}                                    ║
║   Pitch: ${settings.pitch}                                   ║
║   Volume: ${settings.volume}                                ║
║                                                      ║
║ Browser Support:                                     ║
║   Speech Recognition: ${browserSupport.recognition ? 'Yes' : 'No'}              ║
║   Speech Synthesis: ${browserSupport.synthesis ? 'Yes' : 'No'}                ║
║                                                      ║
║ Wake Words: ${this.voiceInterface.wakeWords.join(', ')}     ║
╚══════════════════════════════════════════════════════╝`;
  }

  /**
   * Get voice status
   */
  getVoiceStatus() {
    if (!this.voiceInterface) {
      return 'Voice interface not initialized. Use "voice on" to enable.';
    }

    const status = this.voiceInterface.isActive ? 'Active' : 'Inactive';
    const listening = this.voiceInterface.isListening ? 'Listening' : 'Not listening';
    const speech = this.voiceInterface.speechOutputEnabled ? 'Enabled' : 'Disabled';

    return `Voice Status: ${status} | ${listening} | Speech: ${speech}`;
  }

  /**
   * Get browser support information
   */
  getBrowserSupportInfo() {
    return {
      recognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      synthesis: 'speechSynthesis' in window,
    };
  }
}

/**
 * Register voice commands with terminal
 */
export function registerVoiceCommands(terminal) {
  const voiceCommands = new VoiceCommands(terminal);
  const commands = voiceCommands.getCommands();

  Object.entries(commands).forEach(([name, config]) => {
    terminal.commandRouter.register(name, config.handler, {
      description: config.description,
      usage: config.usage,
      aliases: config.aliases,
      module: 'voice',
    });
  });

  // Initialize voice interface
  voiceCommands.initializeVoiceInterface();

  // Store voice commands instance for terminal access
  terminal.voiceCommands = voiceCommands;

  return voiceCommands;
}

export default { VoiceCommands, registerVoiceCommands };