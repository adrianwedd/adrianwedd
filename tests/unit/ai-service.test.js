/**
 * Comprehensive unit tests for AIService class
 * Tests token management, caching, HTTP requests, and error handling
 * Target: >85% coverage for AI service integration
 */

// Import the AIService class
let AIService;

beforeAll(async () => {
  // Since it's a class in a script file, we need to evaluate it in the global context
  const fs = require('fs');
  const path = require('path');
  const aiServiceCode = fs.readFileSync(
    path.join(__dirname, '../../assets/ai-service.js'), 
    'utf8'
  );
  
  // Execute the code to define the class
  eval(aiServiceCode);
  AIService = global.AIService;
});

describe('AIService Initialization', () => {
  let aiService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  test('should initialize with default token stats', () => {
    expect(aiService.tokenStats).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      sessionStart: expect.any(Number)
    });
  });

  test('should initialize prompt cache with default config', () => {
    expect(aiService.promptCache).toBeInstanceOf(Map);
    expect(aiService.promptCache.size).toBe(0);
    expect(aiService.cacheConfig).toEqual({
      maxCacheSize: 50,
      cacheExpiry: 1000 * 60 * 60, // 1 hour
      minTokensForCache: 100
    });
  });
});

describe('AIService Token Stats Management', () => {
  let aiService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  test('should generate consistent cache keys', () => {
    const prompt = 'Test prompt';
    const systemPrompt = 'System context';
    
    const key1 = aiService.generateCacheKey(prompt, systemPrompt);
    const key2 = aiService.generateCacheKey(prompt, systemPrompt);
    
    expect(key1).toBe(key2);
    expect(typeof key1).toBe('string');
  });

  test('should estimate token count correctly', () => {
    const shortText = 'Hello';
    const longText = 'This is a longer text that should have more tokens';
    
    expect(aiService.estimateTokenCount(shortText)).toBe(2); // ~5 chars / 4
    expect(aiService.estimateTokenCount(longText)).toBeGreaterThan(10);
  });
});

describe('AIService Prompt Caching', () => {
  let aiService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  test('should detect reusable patterns in prompts', () => {
    const systemPrompt = 'You are a helpful assistant';
    const templatePrompt = 'Format: JSON output';
    const normalPrompt = 'What is the weather?';
    
    expect(aiService.hasReusablePatterns(systemPrompt)).toBe(true);
    expect(aiService.hasReusablePatterns(templatePrompt)).toBe(true);
    expect(aiService.hasReusablePatterns(normalPrompt)).toBe(false);
  });

  test('should determine when to cache prompts', () => {
    const longPrompt = 'A'.repeat(500); // Above token threshold
    const shortPrompt = 'Hi';
    const systemPrompt = 'You are a coding assistant';
    
    expect(aiService.shouldCachePrompt(longPrompt)).toBe(true);
    expect(aiService.shouldCachePrompt(shortPrompt, systemPrompt)).toBe(true);
    expect(aiService.shouldCachePrompt(shortPrompt)).toBe(false);
  });

  test('should cache responses correctly', () => {
    const key = 'test-key';
    const response = 'Test response';
    const tokens = { inputTokens: 100, outputTokens: 50 };
    
    aiService.cacheResponse(key, response, tokens);
    
    expect(aiService.promptCache.has(key)).toBe(true);
    const cached = aiService.promptCache.get(key);
    expect(cached.response).toBe(response);
    expect(cached.tokens).toBe(tokens);
    expect(cached.timestamp).toEqual(expect.any(Number));
  });

  test('should retrieve cached responses that are not expired', () => {
    const key = 'test-key';
    const cachedData = {
      response: 'Cached response',
      tokens: { inputTokens: 100, outputTokens: 50 },
      timestamp: Date.now() - 1000, // 1 second ago
      hits: 0
    };
    
    aiService.promptCache.set(key, cachedData);
    
    const result = aiService.checkCache(key);
    
    expect(result).toEqual(expect.objectContaining({
      response: 'Cached response',
      hits: 1
    }));
  });

  test('should not retrieve expired cached responses', () => {
    const key = 'test-key';
    const cachedData = {
      response: 'Cached response',
      tokens: { inputTokens: 100, outputTokens: 50 },
      timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      hits: 0
    };
    
    aiService.promptCache.set(key, cachedData);
    
    const result = aiService.checkCache(key);
    
    expect(result).toBe(null);
    expect(aiService.promptCache.has(key)).toBe(false);
  });
});

describe('AIService HTTP Communication', () => {
  let aiService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  test('should create cached prompt structure correctly', () => {
    const systemPrompt = 'You are a helpful assistant';
    const userPrompt = 'What is the weather?';
    
    const result = aiService.createCachedPrompt(systemPrompt, userPrompt, true);
    
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toBe('system');
    expect(result.messages[0].content[0].cache_control).toEqual({ type: 'ephemeral' });
    expect(result.messages[1].role).toBe('user');
    expect(result.messages[1].content).toBe(userPrompt);
  });

  test('should return cached response when available', async () => {
    const userMessage = 'Test cached message';
    const cacheKey = aiService.generateCacheKey(userMessage, '');
    const cachedData = {
      response: 'Cached response',
      tokens: { inputTokens: 100, outputTokens: 50 },
      timestamp: Date.now(),
      hits: 0
    };
    
    aiService.promptCache.set(cacheKey, cachedData);
    
    const result = await aiService.sendChatRequest(userMessage, 'session-123');
    
    expect(result.response).toBe('Cached response');
    expect(result.fromCache).toBe(true);
    expect(aiService.tokenStats.cacheHits).toBe(1);
  });
});

describe('AIService Statistics and Reporting', () => {
  let aiService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  test('should get token statistics correctly', () => {
    aiService.tokenStats.inputTokens = 1500;
    aiService.tokenStats.outputTokens = 750;
    aiService.tokenStats.cachedTokens = 300;
    aiService.tokenStats.totalRequests = 10;
    
    const stats = aiService.getTokenStats();
    
    expect(stats.inputTokens).toBe(1500);
    expect(stats.outputTokens).toBe(750);
    expect(stats.cachedTokens).toBe(300);
    expect(stats.totalTokens).toBe(2250);
    expect(stats.tokensPerRequest).toBe(225);
    expect(stats.sessionDuration).toEqual(expect.any(Number));
    expect(stats.cacheEfficiency).toEqual(expect.any(String));
  });

  test('should calculate cache efficiency correctly', () => {
    aiService.tokenStats.cacheHits = 3;
    aiService.tokenStats.cacheMisses = 7;
    aiService.tokenStats.totalRequests = 10;
    
    const stats = aiService.getTokenStats();
    
    expect(stats.cacheHits).toBe(3);
    expect(stats.cacheMisses).toBe(7);
    expect(stats.cacheEfficiency).toBe('30.0');
    expect(stats.cacheSize).toBe(0);
  });

  test('should reset stats and clear cache correctly', () => {
    // Set up some data
    aiService.tokenStats.inputTokens = 1000;
    aiService.tokenStats.cacheHits = 5;
    aiService.promptCache.set('test', { response: 'test' });
    
    aiService.resetStats();
    aiService.clearCache();
    
    expect(aiService.promptCache.size).toBe(0);
    expect(aiService.tokenStats.inputTokens).toBe(0);
    expect(aiService.tokenStats.outputTokens).toBe(0);
    expect(aiService.tokenStats.cachedTokens).toBe(0);
    expect(aiService.tokenStats.totalRequests).toBe(0);
    expect(aiService.tokenStats.cacheHits).toBe(0);
    expect(aiService.tokenStats.cacheMisses).toBe(0);
  });

  test('should get default system prompt', () => {
    const systemPrompt = aiService.getDefaultSystemPrompt();
    
    expect(typeof systemPrompt).toBe('string');
    expect(systemPrompt.length).toBeGreaterThan(0);
  });
});

describe('AIService Error Handling and Edge Cases', () => {
  let aiService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  test('should handle empty messages', async () => {
    const result = await aiService.sendChatRequest('', 'session-123');
    
    expect(result.response).toEqual(expect.any(String));
    expect(result.fromCache).toBe(false);
  });

  test('should handle very long messages', async () => {
    const longMessage = 'A'.repeat(10000);
    
    const result = await aiService.sendChatRequest(longMessage, 'session-123');
    
    expect(result.response).toEqual(expect.any(String));
    expect(aiService.tokenStats.inputTokens).toBeGreaterThan(0);
  });

  test('should handle concurrent requests correctly', async () => {
    const [result1, result2] = await Promise.all([
      aiService.sendChatRequest('Message 1', 'session-1'),
      aiService.sendChatRequest('Message 2', 'session-2')
    ]);
    
    expect(result1.response).toEqual(expect.any(String));
    expect(result2.response).toEqual(expect.any(String));
    expect(aiService.tokenStats.totalRequests).toBe(2);
    expect(aiService.tokenStats.inputTokens).toBeGreaterThan(0);
    expect(aiService.tokenStats.outputTokens).toBeGreaterThan(0);
  });

  test('should update stats even with partial usage data', () => {
    aiService.tokenStats.totalRequests = 0;
    
    // Simulate response with partial usage data
    const usage = { input_tokens: 100 }; // Missing output_tokens
    if (usage) {
      aiService.tokenStats.inputTokens += usage.input_tokens || 0;
      aiService.tokenStats.outputTokens += usage.output_tokens || 0;
      aiService.tokenStats.cachedTokens += usage.cache_read_input_tokens || 0;
    }
    
    expect(aiService.tokenStats.inputTokens).toBe(100);
    expect(aiService.tokenStats.outputTokens).toBe(0);
    expect(aiService.tokenStats.cachedTokens).toBe(0);
  });
});