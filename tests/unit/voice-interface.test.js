// Basic unit tests for VoiceInterface utility methods

// Setup minimal browser-like environment
beforeEach(() => {
  global.window = {
    SpeechRecognition: function(){},
    speechSynthesis: { getVoices: () => [], speak: jest.fn(), cancel: jest.fn() },
    matchMedia: () => ({ matches: false }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
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
