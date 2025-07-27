// Basic unit tests for VoiceInterface utility methods

// Setup minimal browser-like environment
beforeEach(() => {
  global.window = {
    SpeechRecognition: function () {},
    speechSynthesis: { getVoices: () => [], speak: jest.fn(), cancel: jest.fn() },
    matchMedia: () => ({ matches: false }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  global.speechSynthesis = global.window.speechSynthesis;
  global.navigator = { userAgent: '' };

  // Load module after globals are defined
  require('../../assets/voice-interface.js');
});

describe('VoiceInterface helpers', () => {
  let voice;

  beforeEach(() => {
    voice = new window.VoiceInterface();
  });

  test('containsWakeWord detects known wake words', () => {
    expect(voice.containsWakeWord('Hey Adrian, are you there?')).toBe(true);
    expect(voice.containsWakeWord('Random phrase')).toBe(false);
  });

  test('isChatQuery identifies question phrases', () => {
    expect(voice.isChatQuery('What is your name?')).toBe(true);
    expect(voice.isChatQuery('Tell me about projects')).toBe(true);
    expect(voice.isChatQuery('clear')).toBe(false);
  });

  test('isTerminalCommand recognizes terminal keywords', () => {
    expect(voice.isTerminalCommand('please show help')).toBe(true);
    expect(voice.isTerminalCommand('stop music')).toBe(true);
    expect(voice.isTerminalCommand('nothing important')).toBe(false);
  });

  test('cleanTextForSpeech normalizes output', () => {
    const text = '🎤 hello adrian@home:~$ 192.168.0.1 ABC';
    const cleaned = voice.cleanTextForSpeech(text);
    expect(cleaned).toBe('hello adrian@home:~dollar sign 192 dot 168 dot 0 dot 1 A B C');
  });

  test('shouldSkipSpeaking filters undesirable text', () => {
    expect(voice.shouldSkipSpeaking('', 'output')).toBe(true);
    expect(voice.shouldSkipSpeaking('!!!!!!!!', 'output')).toBe(true);
    expect(voice.shouldSkipSpeaking('Debug: info', 'output')).toBe(true);
    expect(voice.shouldSkipSpeaking('Normal text here', 'output')).toBe(false);
  });
});

describe('VoiceInterface core functionality', () => {
  let voice;

  beforeEach(() => {
    // provide basic browser compatibility fallbacks
    window.webkitSpeechRecognition = window.SpeechRecognition;
    voice = new window.VoiceInterface();
    voice.recognition = {
      start: jest.fn(),
      stop: jest.fn(),
    };
  });

  test('wake word activates and executes mapped command', () => {
    voice.executeTerminalCommand = jest.fn();

    voice.processSpeechInput('Hey Adrian');
    expect(voice.wakeWordActive).toBe(true);

    voice.processSpeechInput('show help');
    expect(voice.executeTerminalCommand).toHaveBeenCalledWith('help');
    expect(voice.wakeWordActive).toBe(false);
  });

  test('speech recognition start/stop updates state', () => {
    voice.startListening();
    expect(voice.isActive).toBe(true);
    expect(voice.recognition.start).toHaveBeenCalled();

    voice.stopListening();
    expect(voice.isActive).toBe(false);
    expect(voice.recognition.stop).toHaveBeenCalled();
  });

  test('TTS parameter setters clamp values', () => {
    voice.setVoiceRate(5);
    voice.setVoicePitch(-1);
    voice.setVoiceVolume(2);

    expect(voice.voiceSettings.rate).toBeLessThanOrEqual(3);
    expect(voice.voiceSettings.pitch).toBeGreaterThanOrEqual(0);
    expect(voice.voiceSettings.volume).toBeLessThanOrEqual(1);
  });

  test('browser fallback uses webkitSpeechRecognition', () => {
    delete window.SpeechRecognition;
    window.webkitSpeechRecognition = jest.fn(function () {
      this.start = jest.fn();
    });

    const instance = new window.VoiceInterface();
    expect(instance.recognition).toBeInstanceOf(window.webkitSpeechRecognition);
  });

  test('voice command mappings trigger terminal commands', () => {
    voice.executeTerminalCommand = jest.fn();

    Object.entries(voice.voiceCommands).forEach(([phrase, command]) => {
      voice.executeVoiceCommand(phrase);
      expect(voice.executeTerminalCommand).toHaveBeenLastCalledWith(command);
    });
  });
});
