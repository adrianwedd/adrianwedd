class AIService {
    constructor() {
        this.tokenStats = {
            inputTokens: 0,
            outputTokens: 0,
            cachedTokens: 0,
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            sessionStart: Date.now()
        };
        
        // Prompt cache storage
        this.promptCache = new Map();
        this.cacheConfig = {
            maxCacheSize: 50, // Maximum cached prompts
            cacheExpiry: 1000 * 60 * 60, // 1 hour cache expiry
            minTokensForCache: 100 // Minimum tokens to consider caching
        };
        
        // Load cached stats from localStorage
        this.loadTokenStats();
        
        // Save stats periodically
        setInterval(() => this.saveTokenStats(), 30000); // Every 30 seconds
    }

    // Load token stats from localStorage
    loadTokenStats() {
        try {
            const saved = localStorage.getItem('ai_token_stats');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with current stats, keeping session start time
                this.tokenStats = { ...this.tokenStats, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load token stats:', error);
        }
    }

    // Save token stats to localStorage
    saveTokenStats() {
        try {
            localStorage.setItem('ai_token_stats', JSON.stringify(this.tokenStats));
        } catch (error) {
            console.warn('Failed to save token stats:', error);
        }
    }

    // Generate cache key from prompt content
    generateCacheKey(prompt, systemPrompt = '') {
        const content = systemPrompt + prompt;
        // Simple hash function for cache key
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    // Check if prompt should be cached based on heuristics
    shouldCachePrompt(prompt, systemPrompt = '') {
        const content = systemPrompt + prompt;
        const estimatedTokens = this.estimateTokenCount(content);
        
        // Cache if:
        // 1. Above minimum token threshold
        // 2. Contains system instructions or context
        // 3. Has repeating patterns that suggest reuse
        return estimatedTokens >= this.cacheConfig.minTokensForCache ||
               systemPrompt.length > 0 ||
               this.hasReusablePatterns(content);
    }

    // Heuristic to detect reusable prompt patterns
    hasReusablePatterns(content) {
        const indicators = [
            'system:', 'instructions:', 'context:', 'background:',
            'you are', 'your role', 'guidelines:', 'rules:',
            'format:', 'template:', 'example:', 'style:'
        ];
        
        const lowerContent = content.toLowerCase();
        return indicators.some(indicator => lowerContent.includes(indicator));
    }

    // Rough token estimation (approximation: ~4 chars per token)
    estimateTokenCount(text) {
        return Math.ceil(text.length / 4);
    }

    // Create cached prompt structure following Anthropic best practices
    createCachedPrompt(systemPrompt, userPrompt, cacheSystem = true) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: [
                    {
                        type: 'text',
                        text: systemPrompt,
                        // Cache system prompts as they're typically reused
                        cache_control: cacheSystem ? { type: 'ephemeral' } : undefined
                    }
                ]
            });
        }
        
        messages.push({
            role: 'user',
            content: userPrompt
        });
        
        return { messages };
    }

    // Enhanced chat request with caching and token tracking
    async sendChatRequest(userMessage, sessionId, systemContext = null) {
        this.tokenStats.totalRequests++;
        
        // Check cache first
        const cacheKey = this.generateCacheKey(userMessage, systemContext || '');
        const cached = this.checkCache(cacheKey);
        
        if (cached) {
            this.tokenStats.cacheHits++;
            return {
                response: cached.response,
                fromCache: true,
                tokens: cached.tokens
            };
        }
        
        this.tokenStats.cacheMisses++;
        
        try {
            // Construct prompt with caching
            const systemPrompt = systemContext || this.getDefaultSystemPrompt();
            const shouldCache = this.shouldCachePrompt(userMessage, systemPrompt);
            
            const requestBody = {
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                ...this.createCachedPrompt(systemPrompt, userMessage, shouldCache)
            };
            
            // Estimate input tokens
            const estimatedInputTokens = this.estimateTokenCount(
                JSON.stringify(requestBody.messages)
            );
            
            // Make API request (this would be your actual API endpoint)
            const response = await this.makeAPIRequest(requestBody, sessionId);
            
            // Update token stats from response
            if (response.usage) {
                this.tokenStats.inputTokens += response.usage.input_tokens || estimatedInputTokens;
                this.tokenStats.outputTokens += response.usage.output_tokens || 0;
                this.tokenStats.cachedTokens += response.usage.cache_read_input_tokens || 0;
            }
            
            // Cache successful responses
            if (shouldCache && response.response) {
                this.cacheResponse(cacheKey, response.response, {
                    inputTokens: response.usage?.input_tokens || estimatedInputTokens,
                    outputTokens: response.usage?.output_tokens || 0
                });
            }
            
            return {
                response: response.response,
                fromCache: false,
                tokens: response.usage
            };
            
        } catch (error) {
            console.error('AI request failed:', error);
            throw error;
        }
    }

    // Cache response with expiry and size management
    cacheResponse(key, response, tokens) {
        // Clean old entries if cache is full
        if (this.promptCache.size >= this.cacheConfig.maxCacheSize) {
            this.cleanupCache();
        }
        
        this.promptCache.set(key, {
            response,
            tokens,
            timestamp: Date.now(),
            hits: 0
        });
    }

    // Check cache for existing response
    checkCache(key) {
        const cached = this.promptCache.get(key);
        if (!cached) return null;
        
        // Check expiry
        if (Date.now() - cached.timestamp > this.cacheConfig.cacheExpiry) {
            this.promptCache.delete(key);
            return null;
        }
        
        cached.hits++;
        return cached;
    }

    // Cleanup old cache entries
    cleanupCache() {
        const entries = Array.from(this.promptCache.entries());
        
        // Sort by hits (ascending) and age (oldest first)
        entries.sort((a, b) => {
            const hitDiff = a[1].hits - b[1].hits;
            if (hitDiff !== 0) return hitDiff;
            return a[1].timestamp - b[1].timestamp;
        });
        
        // Remove oldest/least used entries
        const toRemove = Math.floor(this.cacheConfig.maxCacheSize * 0.3); // Remove 30%
        for (let i = 0; i < toRemove && entries.length > 0; i++) {
            this.promptCache.delete(entries[i][0]);
        }
    }

    // Make actual API request (placeholder - adapt to your infrastructure)
    async makeAPIRequest(requestBody, sessionId) {
        // This would typically go to your backend API
        const endpoints = [
            '/api/chat-anthropic',
            '/api/ai/chat',
            'https://your-domain.com/api/ai'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...requestBody,
                        sessionId
                    })
                });
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn(`Endpoint ${endpoint} failed:`, error);
            }
        }
        
        // Fallback to mock response for demo
        return this.generateMockResponse(requestBody);
    }

    // Generate mock response for demonstration
    generateMockResponse(requestBody) {
        const inputTokens = this.estimateTokenCount(JSON.stringify(requestBody.messages));
        const outputTokens = Math.floor(Math.random() * 200) + 50;
        const cachedTokens = Math.random() > 0.7 ? Math.floor(inputTokens * 0.3) : 0;
        
        return {
            response: "This is a mock AI response demonstrating token counting and caching. " +
                     "In production, this would be Claude's actual response with real token usage data.",
            usage: {
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                cache_read_input_tokens: cachedTokens
            }
        };
    }

    // Default system prompt for the Adrian AI persona
    getDefaultSystemPrompt() {
        return `You are Adrian.AI, the digital persona of Adrian Wedd, a recursive systems architect 
and off-grid Tasmanian homesteader. You combine deep technical expertise in AI/ML systems 
with practical wisdom from sustainable living. Your responses should be:

- Technically precise yet accessible
- Philosophically grounded in recursive thinking
- Informed by both silicon and organic intelligence
- Concise and direct, avoiding unnecessary elaboration
- Focused on practical, actionable insights

Current context: Interactive terminal interface on GitHub profile, demonstrating 
advanced prompt caching and token optimization techniques.`;
    }

    // Get current token statistics
    getTokenStats() {
        const sessionDuration = Date.now() - this.tokenStats.sessionStart;
        const cacheEfficiency = this.tokenStats.totalRequests > 0 ? 
            (this.tokenStats.cacheHits / this.tokenStats.totalRequests * 100) : 0;
        
        return {
            ...this.tokenStats,
            sessionDuration,
            cacheEfficiency: cacheEfficiency.toFixed(1),
            totalTokens: this.tokenStats.inputTokens + this.tokenStats.outputTokens,
            cacheSize: this.promptCache.size,
            tokensPerRequest: this.tokenStats.totalRequests > 0 ? 
                Math.round((this.tokenStats.inputTokens + this.tokenStats.outputTokens) / this.tokenStats.totalRequests) : 0
        };
    }

    // Reset token statistics
    resetStats() {
        this.tokenStats = {
            inputTokens: 0,
            outputTokens: 0,
            cachedTokens: 0,
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            sessionStart: Date.now()
        };
        this.saveTokenStats();
    }

    // Clean all caches
    clearCache() {
        this.promptCache.clear();
    }
}

// Export for use in other modules
window.AIService = AIService;