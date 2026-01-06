class AIService {
  constructor() {
    this.tokenStats = {
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      sessionStart: Date.now(),
    };

    // Prompt cache storage
    this.promptCache = new Map();
    this.cacheConfig = {
      maxCacheSize: 50,
      cacheExpiry: 1000 * 60 * 60, // 1 hour
      minTokensForCache: 100,
    };

    this.initialized = false;
    this.loadTokenStats();
    setInterval(() => this.saveTokenStats(), 30000);
  }

  // Required by AICommands module
  async initialize() {
    this.initialized = true;
    return true;
  }

  // Adapter method for AICommands
  async sendMessage(prompt, options = {}) {
    const { context = [] } = options;
    const systemPrompt = this.getDefaultSystemPrompt();
    
    // Convert context to Anthropic message format
    const messages = context
      .filter(msg => msg.role !== 'system') // Filter out system messages as they go in 'system' field
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

    // Add current prompt if not already in context
    if (messages.length === 0 || messages[messages.length - 1].content !== prompt) {
        messages.push({ role: 'user', content: prompt });
    }

    try {
      const result = await this.sendChatRequest(messages, systemPrompt);
      return result.response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  loadTokenStats() {
    try {
      const saved = localStorage.getItem('ai_token_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.tokenStats = { ...this.tokenStats, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load token stats:', error);
    }
  }

  saveTokenStats() {
    try {
      localStorage.setItem('ai_token_stats', JSON.stringify(this.tokenStats));
    } catch (error) {
      console.warn('Failed to save token stats:', error);
    }
  }

  generateCacheKey(messages, systemPrompt) {
    const content = systemPrompt + JSON.stringify(messages);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Core request method
  async sendChatRequest(messages, systemPrompt) {
    this.tokenStats.totalRequests++;

    const cacheKey = this.generateCacheKey(messages, systemPrompt);
    // Note: Caching logic temporarily disabled for streaming simplicity, 
    // but structure preserved for future re-enablement.

    try {
      const response = await this.makeStreamingRequest(messages, systemPrompt);
      
      // Update basic stats (estimates since we're streaming)
      this.tokenStats.inputTokens += Math.ceil(JSON.stringify(messages).length / 4);
      this.tokenStats.outputTokens += Math.ceil(response.length / 4);
      
      return {
        response: response,
        fromCache: false
      };
    } catch (error) {
      throw error;
    }
  }

  // New Streaming Implementation
  async makeStreamingRequest(messages, systemPrompt) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        system: systemPrompt
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    // If we had a UI callback for streaming, we'd use it here.
    // For now, we accumulate to satisfy the Promise-based interface of AICommands.
    // In v2.1 we should pass a callback to update the terminal character-by-character.
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
    }

    return fullResponse;
  }

  getDefaultSystemPrompt() {
    return `You are Adrian.AI, the digital persona of Adrian Wedd, a recursive systems architect 
and off-grid Tasmanian homesteader. You combine deep technical expertise in AI/ML systems 
with practical wisdom from sustainable living. Your responses should be:

- Technically precise yet accessible
- Philosophically grounded in recursive thinking
- Informed by both silicon and organic intelligence
- Concise and direct, avoiding unnecessary elaboration
- Focused on practical, actionable insights

Current context: Interactive terminal interface on GitHub profile.`;
  }

  getTokenStats() {
    return this.tokenStats;
  }
}

// Export for use in other modules
window.AIService = AIService;
export { AIService };