/**
 * Comprehensive unit tests for AIService class
 * Updated for Streaming Architecture
 */

import { AIService } from '../../assets/ai-service.js';

// Mock fetch and localStorage
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.TextDecoder = class {
  decode(chunk) { return Buffer.from(chunk).toString('utf-8'); }
};

describe('AIService', () => {
  let aiService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  describe('Initialization', () => {
    test('should initialize correctly', async () => {
      expect(aiService.initialized).toBe(false);
      const result = await aiService.initialize();
      expect(result).toBe(true);
      expect(aiService.initialized).toBe(true);
    });

    test('should load stats from localStorage', () => {
      global.localStorage.getItem.mockReturnValue(JSON.stringify({
        inputTokens: 100,
        outputTokens: 50
      }));
      const service = new AIService();
      expect(service.tokenStats.inputTokens).toBe(100);
    });
  });

  describe('Message Handling', () => {
    test('sendMessage should format context and call sendChatRequest', async () => {
      const mockResponse = "AI Response";
      aiService.sendChatRequest = jest.fn().mockResolvedValue({ response: mockResponse });

      const context = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' }
      ];

      const response = await aiService.sendMessage('How are you?', { context });

      expect(response).toBe(mockResponse);
      expect(aiService.sendChatRequest).toHaveBeenCalledWith(
        [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello' },
          { role: 'user', content: 'How are you?' }
        ],
        expect.any(String)
      );
    });
  });

  describe('Streaming Request', () => {
    test('makeStreamingRequest should handle successful stream', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Hello '));
          controller.enqueue(new TextEncoder().encode('World'));
          controller.close();
        }
      });

      global.fetch.mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const response = await aiService.makeStreamingRequest([], 'sys');
      expect(response).toBe('Hello World');
    });

    test('makeStreamingRequest should handle API errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      });

      await expect(aiService.makeStreamingRequest([], 'sys'))
        .rejects.toThrow('API Error: 500 - Internal Server Error');
    });
  });

  describe('Stats', () => {
    test('getTokenStats should calculate metrics', () => {
      aiService.tokenStats.totalRequests = 10;
      aiService.tokenStats.cacheHits = 5;
      
      const stats = aiService.getTokenStats();
      expect(stats.cacheEfficiency).toBe('50.0');
    });
  });
});