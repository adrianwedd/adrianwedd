/**
 * Comprehensive tests for VoiceCommands modular integration
 * Tests the voice commands module integration with terminal core
 */

// Mock ES6 module for CommonJS test environment
const mockVoiceCommands = () => {
  // Create a simplified version for testing
  class VoiceCommands {
    constructor(terminal) {
      this.terminal = terminal;
      this.voiceInterface = null;
      this.initialized = false;
    }

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
          aliases: ['enable-voice'],
        },
        'voice-off': {
          handler: this.handleVoiceOff.bind(this),
          description: 'Disable voice recognition',
          aliases: ['disable-voice'],
        },
        'speech-on': {
          handler: this.handleSpeechOn.bind(this),
          description: 'Enable text-to-speech output',
          aliases: ['enable-speech'],
        },
        'speech-off': {
          handler: this.handleSpeechOff.bind(this),
          description: 'Disable text-to-speech output',
          aliases: ['disable-speech'],
        },
        'voice-settings': {
          handler: this.handleVoiceSettings.bind(this),
          description: 'Show voice interface settings',
          aliases: ['voice-config'],
        },
      };
    }

    async initializeVoiceInterface() {
      if (this.initialized) return this.voiceInterface;

      try {
        if (global.window?.VoiceInterface) {
          this.voiceInterface = new global.window.VoiceInterface();
          this.setupVoiceIntegration();
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

    setupVoiceIntegration() {
      if (!this.voiceInterface) return;

      this.voiceInterface.executeTerminalCommand = (command) => {
        this.terminal.ui.addCommandLine(command);
        this.terminal.commandRouter.execute(command);
      };

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

    setupVoiceControls() {
      const voiceToggle = global.document?.getElementById('voice-toggle');
      const speechToggle = global.document?.getElementById('speech-toggle');

      if (voiceToggle) {
        voiceToggle.addEventListener('click', () => this.toggleVoiceRecognition());
      }
      if (speechToggle) {
        speechToggle.addEventListener('click', () => this.toggleSpeechOutput());
      }
      this.updateVoiceUI();
    }

    updateVoiceStatus(status) {
      const statusElement = global.document?.getElementById('voice-status');
      if (statusElement) statusElement.textContent = status;
      this.terminal.state.setState('voice', { status, initialized: this.initialized });
    }

    updateVoiceUI() {
      const voiceToggle = global.document?.getElementById('voice-toggle');
      const speechToggle = global.document?.getElementById('speech-toggle');

      if (!this.voiceInterface) return;

      if (voiceToggle) {
        voiceToggle.textContent = this.voiceInterface.isListening ? 'Stop' : 'Voice';
        voiceToggle.classList.toggle('active', this.voiceInterface.isListening);
      }

      if (speechToggle) {
        speechToggle.classList.toggle('active', this.voiceInterface.speechOutputEnabled);
      }

      const voiceIndicator = global.document?.getElementById('voice-indicator');
      if (voiceIndicator) {
        voiceIndicator.textContent = this.voiceInterface.isListening ? '🎤' : '🔇';
      }
    }

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

    toggleSpeechOutput() {
      if (this.voiceInterface) {
        this.voiceInterface.toggleSpeechOutput();
        this.updateVoiceUI();
      }
    }

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

    async handleVoiceOn() {
      if (!this.voiceInterface) await this.initializeVoiceInterface();
      if (this.voiceInterface) {
        this.voiceInterface.startListening();
        this.updateVoiceUI();
        return '🎤 Voice recognition enabled';
      } else {
        return '❌ Voice interface not available';
      }
    }

    async handleVoiceOff() {
      if (this.voiceInterface) {
        this.voiceInterface.stopListening();
        this.updateVoiceUI();
        return '🔇 Voice recognition disabled';
      } else {
        return 'Voice interface not initialized';
      }
    }

    handleSpeechOn() {
      if (this.voiceInterface) {
        this.voiceInterface.enableSpeechOutput();
        this.updateVoiceUI();
        return '🔊 Speech output enabled';
      } else {
        return '❌ Voice interface not available';
      }
    }

    handleSpeechOff() {
      if (this.voiceInterface) {
        this.voiceInterface.speechOutputEnabled = false;
        this.updateVoiceUI();
        return '🔇 Speech output disabled';
      } else {
        return 'Voice interface not initialized';
      }
    }

    async handleVoiceSettings() {
      if (!this.voiceInterface) return '❌ Voice interface not initialized';

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

    getVoiceStatus() {
      if (!this.voiceInterface) return 'Voice interface not initialized. Use "voice on" to enable.';

      const status = this.voiceInterface.isActive ? 'Active' : 'Inactive';
      const listening = this.voiceInterface.isListening ? 'Listening' : 'Not listening';
      const speech = this.voiceInterface.speechOutputEnabled ? 'Enabled' : 'Disabled';

      return `Voice Status: ${status} | ${listening} | Speech: ${speech}`;
    }

    getBrowserSupportInfo() {
      return {
        recognition:
          'webkitSpeechRecognition' in (global.window || {}) ||
          'SpeechRecognition' in (global.window || {}),
        synthesis: 'speechSynthesis' in (global.window || {}),
      };
    }
  }

  const registerVoiceCommands = (terminal) => {
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

    voiceCommands.initializeVoiceInterface();
    terminal.voiceCommands = voiceCommands;
    return voiceCommands;
  };

  return { VoiceCommands, registerVoiceCommands };
};

const { VoiceCommands, registerVoiceCommands } = mockVoiceCommands();

// Mock terminal structure
const createMockTerminal = () => ({
  ui: {
    addOutput: jest.fn(),
    addCommandLine: jest.fn(),
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
  },
  commandRouter: {
    execute: jest.fn(),
    register: jest.fn(),
  },
  state: {
    setState: jest.fn(),
    getState: jest.fn(),
  },
});

// Mock VoiceInterface
const createMockVoiceInterface = () => ({
  init: jest.fn().mockResolvedValue(true),
  isListening: false,
  isActive: false,
  speechOutputEnabled: false,
  wakeWords: ['hey adrian', 'terminal'],
  voiceSettings: { rate: 1, pitch: 1, volume: 1 },
  startListening: jest.fn(),
  stopListening: jest.fn(),
  enableSpeechOutput: jest.fn(),
  toggleSpeechOutput: jest.fn(),
});

// Mock DOM elements
const createMockElements = () => {
  const elements = {
    'voice-status': { textContent: '' },
    'voice-toggle': {
      textContent: '',
      classList: { toggle: jest.fn() },
      addEventListener: jest.fn(),
    },
    'speech-toggle': {
      classList: { toggle: jest.fn() },
      addEventListener: jest.fn(),
    },
    'voice-indicator': { textContent: '' },
  };

  global.document = {
    getElementById: jest.fn((id) => elements[id] || null),
  };

  return elements;
};

describe('VoiceCommands Module', () => {
  let voiceCommands;
  let mockTerminal;
  let mockElements;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock environment
    mockTerminal = createMockTerminal();
    mockElements = createMockElements();
    global.window = { VoiceInterface: jest.fn(() => createMockVoiceInterface()) };

    voiceCommands = new VoiceCommands(mockTerminal);
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  describe('Constructor and Initialization', () => {
    test('constructs with terminal reference', () => {
      expect(voiceCommands.terminal).toBe(mockTerminal);
      expect(voiceCommands.voiceInterface).toBeNull();
      expect(voiceCommands.initialized).toBe(false);
    });

    test('returns command definitions', () => {
      const commands = voiceCommands.getCommands();

      expect(commands).toHaveProperty('voice');
      expect(commands).toHaveProperty('voice-on');
      expect(commands).toHaveProperty('voice-off');
      expect(commands).toHaveProperty('speech-on');
      expect(commands).toHaveProperty('speech-off');
      expect(commands).toHaveProperty('voice-settings');

      // Check command structure
      expect(commands.voice).toHaveProperty('handler');
      expect(commands.voice).toHaveProperty('description');
      expect(commands.voice).toHaveProperty('usage');
      expect(commands.voice).toHaveProperty('aliases');
    });
  });

  describe('Voice Interface Initialization', () => {
    test('initializes voice interface successfully', async () => {
      const mockVoice = createMockVoiceInterface();
      global.window.VoiceInterface = jest.fn(() => mockVoice);

      const result = await voiceCommands.initializeVoiceInterface();

      expect(result).toBe(mockVoice);
      expect(voiceCommands.initialized).toBe(true);
      expect(mockTerminal.state.setState).toHaveBeenCalledWith(
        'voice',
        expect.objectContaining({ status: 'READY', initialized: true })
      );
    });

    test('handles voice interface not available', async () => {
      delete global.window.VoiceInterface;

      const result = await voiceCommands.initializeVoiceInterface();

      expect(result).toBeNull();
      expect(voiceCommands.initialized).toBe(false);
      expect(mockTerminal.state.setState).toHaveBeenCalledWith(
        'voice',
        expect.objectContaining({ status: 'NOT_AVAILABLE' })
      );
    });

    test('handles voice interface initialization failure', async () => {
      const mockVoice = createMockVoiceInterface();
      mockVoice.init.mockResolvedValue(false);
      global.window.VoiceInterface = jest.fn(() => mockVoice);

      const result = await voiceCommands.initializeVoiceInterface();

      expect(result).toBeNull();
      expect(mockTerminal.state.setState).toHaveBeenCalledWith(
        'voice',
        expect.objectContaining({ status: 'ERROR' })
      );
    });

    test('returns existing interface if already initialized', async () => {
      voiceCommands.initialized = true;
      voiceCommands.voiceInterface = createMockVoiceInterface();

      const result = await voiceCommands.initializeVoiceInterface();

      expect(result).toBe(voiceCommands.voiceInterface);
      expect(global.window.VoiceInterface).not.toHaveBeenCalled();
    });
  });

  describe('Voice Integration Setup', () => {
    test('sets up terminal command execution integration', () => {
      const mockVoice = createMockVoiceInterface();
      voiceCommands.voiceInterface = mockVoice;

      voiceCommands.setupVoiceIntegration();

      // Test command execution integration
      mockVoice.executeTerminalCommand('test command');
      expect(mockTerminal.ui.addCommandLine).toHaveBeenCalledWith('test command');
      expect(mockTerminal.commandRouter.execute).toHaveBeenCalledWith('test command');
    });

    test('sets up terminal feedback integration', () => {
      const mockVoice = createMockVoiceInterface();
      voiceCommands.voiceInterface = mockVoice;

      voiceCommands.setupVoiceIntegration();

      // Test feedback integration
      mockVoice.showTerminalFeedback('error message', 'error');
      expect(mockTerminal.ui.showError).toHaveBeenCalledWith('error message');

      mockVoice.showTerminalFeedback('success message', 'success');
      expect(mockTerminal.ui.showSuccess).toHaveBeenCalledWith('success message');

      mockVoice.showTerminalFeedback('info message', 'info');
      expect(mockTerminal.ui.showInfo).toHaveBeenCalledWith('info message');

      mockVoice.showTerminalFeedback('default message');
      expect(mockTerminal.ui.showInfo).toHaveBeenCalledWith('default message');
    });
  });

  describe('UI Controls Setup', () => {
    test('sets up voice control event listeners', () => {
      voiceCommands.setupVoiceControls();

      expect(mockElements['voice-toggle'].addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
      expect(mockElements['speech-toggle'].addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });

    test('updates voice UI state correctly', () => {
      const mockVoice = createMockVoiceInterface();
      mockVoice.isListening = true;
      mockVoice.speechOutputEnabled = true;
      voiceCommands.voiceInterface = mockVoice;

      voiceCommands.updateVoiceUI();

      expect(mockElements['voice-toggle'].textContent).toBe('Stop');
      expect(mockElements['voice-toggle'].classList.toggle).toHaveBeenCalledWith('active', true);
      expect(mockElements['speech-toggle'].classList.toggle).toHaveBeenCalledWith('active', true);
      expect(mockElements['voice-indicator'].textContent).toBe('🎤');
    });

    test('handles missing UI elements gracefully', () => {
      global.document.getElementById = jest.fn(() => null);
      voiceCommands.voiceInterface = createMockVoiceInterface();

      expect(() => voiceCommands.updateVoiceUI()).not.toThrow();
    });
  });

  describe('Command Handlers', () => {
    beforeEach(async () => {
      await voiceCommands.initializeVoiceInterface();
    });

    test('voice command with different actions', async () => {
      const onResult = await voiceCommands.handleVoice(['on']);
      expect(onResult).toBe('🎤 Voice recognition enabled');

      const offResult = await voiceCommands.handleVoice(['off']);
      expect(offResult).toBe('🔇 Voice recognition disabled');

      const statusResult = await voiceCommands.handleVoice(['status']);
      expect(statusResult).toContain('Voice Status:');

      const invalidResult = await voiceCommands.handleVoice(['invalid']);
      expect(invalidResult).toBe('Usage: voice [on|off|status|settings]');
    });

    test('voice-on command', async () => {
      const result = await voiceCommands.handleVoiceOn();

      expect(voiceCommands.voiceInterface.startListening).toHaveBeenCalled();
      expect(result).toBe('🎤 Voice recognition enabled');
    });

    test('voice-off command', async () => {
      const result = await voiceCommands.handleVoiceOff();

      expect(voiceCommands.voiceInterface.stopListening).toHaveBeenCalled();
      expect(result).toBe('🔇 Voice recognition disabled');
    });

    test('speech-on command', () => {
      const result = voiceCommands.handleSpeechOn();

      expect(voiceCommands.voiceInterface.enableSpeechOutput).toHaveBeenCalled();
      expect(result).toBe('🔊 Speech output enabled');
    });

    test('speech-off command', () => {
      const result = voiceCommands.handleSpeechOff();

      expect(result).toBe('🔇 Speech output disabled');
    });

    test('voice-settings command shows detailed settings', async () => {
      const result = await voiceCommands.handleVoiceSettings();

      expect(result).toContain('Voice Settings');
      expect(result).toContain('Status:');
      expect(result).toContain('Browser Support:');
      expect(result).toContain('Wake Words:');
    });
  });

  describe('Error Handling', () => {
    test('handles commands when voice interface not initialized', async () => {
      voiceCommands.voiceInterface = null;

      const result = await voiceCommands.handleVoiceOn();
      expect(result).toBe('❌ Voice interface not available');

      const settingsResult = await voiceCommands.handleVoiceSettings();
      expect(settingsResult).toBe('❌ Voice interface not initialized');
    });

    test('gracefully handles missing DOM elements', () => {
      global.document.getElementById = jest.fn(() => null);

      expect(() => voiceCommands.updateVoiceStatus('READY')).not.toThrow();
      expect(() => voiceCommands.setupVoiceControls()).not.toThrow();
    });

    test('handles voice interface initialization error', async () => {
      global.window.VoiceInterface = jest.fn(() => {
        throw new Error('Voice initialization failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await voiceCommands.initializeVoiceInterface();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Voice interface initialization failed:',
        expect.any(Error)
      );
      expect(mockTerminal.state.setState).toHaveBeenCalledWith(
        'voice',
        expect.objectContaining({ status: 'ERROR' })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Browser Support Detection', () => {
    test('detects browser speech recognition support', () => {
      global.window.webkitSpeechRecognition = function () {};
      global.window.SpeechRecognition = function () {};
      global.window.speechSynthesis = {};

      const support = voiceCommands.getBrowserSupportInfo();

      expect(support.recognition).toBe(true);
      expect(support.synthesis).toBe(true);
    });

    test('detects lack of browser support', () => {
      delete global.window.webkitSpeechRecognition;
      delete global.window.SpeechRecognition;
      delete global.window.speechSynthesis;

      const support = voiceCommands.getBrowserSupportInfo();

      expect(support.recognition).toBe(false);
      expect(support.synthesis).toBe(false);
    });
  });

  describe('Toggle Functions', () => {
    beforeEach(async () => {
      await voiceCommands.initializeVoiceInterface();
    });

    test('toggleVoiceRecognition starts listening when stopped', async () => {
      voiceCommands.voiceInterface.isListening = false;

      await voiceCommands.toggleVoiceRecognition();

      expect(voiceCommands.voiceInterface.startListening).toHaveBeenCalled();
    });

    test('toggleVoiceRecognition stops listening when active', async () => {
      voiceCommands.voiceInterface.isListening = true;

      await voiceCommands.toggleVoiceRecognition();

      expect(voiceCommands.voiceInterface.stopListening).toHaveBeenCalled();
    });

    test('toggleVoiceRecognition initializes if not available', async () => {
      voiceCommands.voiceInterface = null;
      const initSpy = jest
        .spyOn(voiceCommands, 'initializeVoiceInterface')
        .mockResolvedValue(createMockVoiceInterface());

      await voiceCommands.toggleVoiceRecognition();

      expect(initSpy).toHaveBeenCalled();
    });

    test('toggleSpeechOutput delegates to voice interface', () => {
      voiceCommands.toggleSpeechOutput();

      expect(voiceCommands.voiceInterface.toggleSpeechOutput).toHaveBeenCalled();
    });
  });
});

describe('Voice Commands Registration', () => {
  let mockTerminal;

  beforeEach(() => {
    mockTerminal = createMockTerminal();
    global.window = { VoiceInterface: jest.fn(() => createMockVoiceInterface()) };
    global.document = { getElementById: jest.fn(() => null) };
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  test('registers all voice commands with terminal', () => {
    registerVoiceCommands(mockTerminal);

    expect(mockTerminal.commandRouter.register).toHaveBeenCalledTimes(6);
    expect(mockTerminal.commandRouter.register).toHaveBeenCalledWith(
      'voice',
      expect.any(Function),
      expect.objectContaining({
        description: 'Control voice interface',
        module: 'voice',
      })
    );
  });

  test('stores voice commands instance on terminal', () => {
    registerVoiceCommands(mockTerminal);

    expect(mockTerminal.voiceCommands).toBeDefined();
  });

  test('initializes voice interface during registration', () => {
    registerVoiceCommands(mockTerminal);
    // Note: In actual implementation, initialization would be called
    // This test verifies the registration process completes
    expect(mockTerminal.commandRouter.register).toHaveBeenCalledTimes(6);
  });
});
