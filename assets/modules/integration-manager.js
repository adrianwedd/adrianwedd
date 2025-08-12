/**
 * Integration Manager Module
 * Manages external service integrations (GitHub, Weather, AI, etc.)
 */

export class IntegrationManager {
  constructor() {
    this.integrations = new Map();
    this.configs = new Map();
    this.activeConnections = new Map();
  }

  /**
   * Register an integration
   */
  register(name, integration) {
    if (typeof integration.init !== 'function') {
      throw new Error(`Integration ${name} must have an init method`);
    }

    this.integrations.set(name, integration);
    this.configs.set(name, integration.config || {});
  }

  /**
   * Initialize an integration
   */
  async initialize(name, config = {}) {
    const integration = this.integrations.get(name);
    if (!integration) {
      throw new Error(`Integration ${name} not found`);
    }

    const mergedConfig = { ...this.configs.get(name), ...config };

    try {
      const connection = await integration.init(mergedConfig);
      this.activeConnections.set(name, connection);
      return connection;
    } catch (error) {
      console.error(`Failed to initialize ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get active integration connection
   */
  get(name) {
    return this.activeConnections.get(name);
  }

  /**
   * Check if integration is active
   */
  isActive(name) {
    return this.activeConnections.has(name);
  }

  /**
   * Disconnect an integration
   */
  async disconnect(name) {
    const connection = this.activeConnections.get(name);
    const integration = this.integrations.get(name);

    if (connection && integration?.disconnect) {
      await integration.disconnect(connection);
    }

    this.activeConnections.delete(name);
  }

  /**
   * GitHub Integration Helper
   */
  async fetchGitHubData(endpoint, options = {}) {
    const baseUrl = 'https://api.github.com';
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  /**
   * Weather Integration Helper
   */
  async fetchWeatherData(_location = 'Tasmania') {
    const weatherEndpoint = '/api/weather'; // Local proxy endpoint

    try {
      const response = await fetch(weatherEndpoint);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error('Weather API error:', error);
      // Return cached data if available
      return this.getCachedWeather();
    }
  }

  /**
   * AI Service Integration Helper
   */
  async sendAIRequest(prompt, options = {}) {
    const aiEndpoint = '/api/chat';

    try {
      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      // Handle streaming response if enabled
      if (options.stream) {
        return this.handleStreamingResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('AI API error:', error);
      throw error;
    }
  }

  /**
   * Handle streaming AI response
   */
  async handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new window.TextDecoder();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      chunks.push(chunk);

      // Emit chunk event for real-time processing
      this.emit('ai-chunk', chunk);
    }

    return chunks.join('');
  }

  /**
   * System Monitor Integration Helper
   */
  async fetchSystemMetrics() {
    try {
      // Fetch from local monitoring endpoint
      const response = await fetch('/api/monitor-data');
      if (!response.ok) {
        throw new Error(`Monitor API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Monitor API error:', error);
      // Return mock data for development
      return this.getMockSystemMetrics();
    }
  }

  /**
   * Format weather data for display
   */
  formatWeatherData(data) {
    if (!data || !data.current) {
      return null;
    }

    return {
      location: data.location || 'Tasmania',
      temperature: data.current.temp_c,
      condition: data.current.condition?.text || 'Unknown',
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      icon: this.getWeatherIcon(data.current.condition?.code),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get weather icon based on condition code
   */
  getWeatherIcon(code) {
    const icons = {
      1000: '☀️', // Sunny
      1003: '⛅', // Partly cloudy
      1006: '☁️', // Cloudy
      1009: '🌫️', // Overcast
      1030: '🌁', // Mist
      1063: '🌦️', // Patchy rain
      1183: '🌧️', // Light rain
      1195: '⛈️', // Heavy rain
      1225: '🌨️', // Snow
      1273: '⛈️', // Thunderstorm
    };

    return icons[code] || '🌡️';
  }

  /**
   * Get cached weather data
   */
  getCachedWeather() {
    try {
      const cached = localStorage.getItem('weather-cache');
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is less than 10 minutes old
        if (Date.now() - data.timestamp < 600000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Cache error:', error);
    }
    return null;
  }

  /**
   * Get mock system metrics for development
   */
  getMockSystemMetrics() {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: {
        upload: Math.random() * 1000,
        download: Math.random() * 1000,
      },
      processes: Math.floor(Math.random() * 200) + 100,
      uptime: Date.now() - Math.random() * 86400000,
    };
  }

  /**
   * Event emitter functionality
   */
  emit(event, data) {
    window.dispatchEvent(new CustomEvent(`integration:${event}`, { detail: data }));
  }

  /**
   * Listen for integration events
   */
  on(event, handler) {
    window.addEventListener(`integration:${event}`, (e) => handler(e.detail));
  }

  /**
   * Cleanup all integrations
   */
  async cleanup() {
    for (const [name] of this.activeConnections) {
      await this.disconnect(name);
    }

    this.integrations.clear();
    this.configs.clear();
    this.activeConnections.clear();
  }
}

export default IntegrationManager;
