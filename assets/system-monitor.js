class SystemMonitor {
    constructor() {
        this.isActive = false;
        this.updateInterval = null;
        this.ciData = [];
        this.homeData = {};
        this.systemStats = {
            load: 0.42,
            memory: { used: 1.2, total: 16 },
            network: { down: 2.1, up: 0.8 }
        };
        
        // Initialize AI service for token tracking
        try {
            this.aiService = new AIService();
        } catch (error) {
            console.warn('Failed to initialize AI service for system monitor:', error);
            this.aiService = { getTokenStats: () => ({
                totalTokens: 0,
                cachedTokens: 0,
                totalRequests: 0,
                tokensPerRequest: 0,
                cacheSize: 0,
                sessionDuration: 0
            })};
        }
    }

    async enterMonitorMode() {
        this.isActive = true;
        
        // Hide terminal, show monitor
        document.getElementById('terminal').style.display = 'none';
        document.getElementById('monitorInterface').style.display = 'flex';
        
        // Set up keyboard handler for 'q' to quit
        document.addEventListener('keydown', this.handleMonitorKeydown.bind(this));
        
        // Start data updates
        this.startDataStreams();
        this.updateTime();
        
        // Initial data load
        console.log('System monitor entering mode, loading initial data...');
        await this.updateAllData();
        console.log('System monitor initial data load complete');
    }

    handleMonitorKeydown(event) {
        if (this.isActive && event.key.toLowerCase() === 'q') {
            this.exitMonitorMode();
        }
    }

    exitMonitorMode() {
        this.isActive = false;
        
        // Clear intervals
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Remove keyboard handler
        document.removeEventListener('keydown', this.handleMonitorKeydown.bind(this));
        
        // Show terminal, hide monitor
        document.getElementById('monitorInterface').style.display = 'none';
        document.getElementById('terminal').style.display = 'block';
        
        // Focus back to terminal input
        document.getElementById('commandInput').focus();
    }

    startDataStreams() {
        // Update time every second
        this.timeInterval = setInterval(() => {
            this.updateTime();
        }, 1000);

        // Update data every 10 seconds
        this.updateInterval = setInterval(async () => {
            if (this.isActive) {
                await this.updateAllData();
            }
        }, 10000);

        // Update system stats every 2 seconds (for smooth animations)
        this.statsInterval = setInterval(() => {
            if (this.isActive) {
                this.updateSystemStats();
            }
        }, 2000);
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
        const dateString = now.toDateString();
        document.getElementById('monitorTime').textContent = `${dateString} ${timeString}`;
    }

    async updateAllData() {
        // Update refresh indicators
        this.pulseRefreshIndicator('ciRefresh');
        this.pulseRefreshIndicator('homeRefresh');
        this.pulseRefreshIndicator('aiRefresh');

        try {
            await Promise.all([
                this.updateCIData(),
                this.updateHomeData(),
                this.updateAIData()
            ]);
        } catch (error) {
            console.warn('Monitor data update failed:', error);
        }
    }

    pulseRefreshIndicator(elementId) {
        const element = document.getElementById(elementId);
        element.style.color = '#ffaa00';
        setTimeout(() => {
            element.style.color = '#00ff00';
        }, 500);
    }

    async updateCIData() {
        try {
            // Fetch GitHub Actions workflows
            const response = await fetch('https://api.github.com/repos/adrianwedd/adrianwedd/actions/runs?per_page=10', {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.ciData = data.workflow_runs;
                this.renderCIData();
            }
        } catch (error) {
            // Fallback to mock data if API fails
            this.generateMockCIData();
            this.renderCIData();
        }
    }

    generateMockCIData() {
        const workflows = [
            'Deploy Terminal Interface',
            'Playwright Tests', 
            'Update GitHub Activity',
            'LLM Chat Response'
        ];
        
        const statuses = ['completed', 'in_progress', 'failed'];
        const conclusions = ['success', 'failure', null];
        
        this.ciData = workflows.map((name, i) => {
            const status = i === 1 ? 'in_progress' : statuses[Math.floor(Math.random() * 2)];
            const conclusion = status === 'completed' ? 
                (Math.random() > 0.8 ? 'failure' : 'success') : null;
                
            return {
                id: 1000 + i,
                name: name,
                status: status,
                conclusion: conclusion,
                created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                head_branch: 'main',
                event: 'push',
                run_number: 42 + i
            };
        });
    }

    renderCIData() {
        const container = document.getElementById('ciContent');
        if (!container) {
            console.warn('CI content container not found');
            return;
        }
        
        const html = this.ciData.map(run => {
            let statusClass = 'success';
            let statusText = '✓ SUCCESS';
            
            if (run.status === 'in_progress') {
                statusClass = 'running';
                statusText = '● RUNNING';
            } else if (run.conclusion === 'failure') {
                statusClass = 'failure';
                statusText = '✗ FAILED';
            }
            
            const duration = run.status === 'completed' ? 
                `${Math.floor(Math.random() * 120 + 30)}s` : 
                `${Math.floor((Date.now() - new Date(run.created_at)) / 1000)}s`;
                
            return `
                <div class="ci-workflow ${statusClass}">
                    <div class="ci-header">
                        <span class="ci-name">${run.name}</span>
                        <span class="ci-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="ci-details">
                        Run #${run.run_number} • ${run.head_branch} • ${duration} ago
                        <br>Event: ${run.event} • Commit: ${run.head_sha ? run.head_sha.substring(0, 7) : 'a1b2c3d'}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        
        // Store CI data for external access (e.g., graphs, console)
        window.ciData = this.ciData;
        
        // Emit event for charts/graphs to update
        window.dispatchEvent(new CustomEvent('ciDataUpdated', { 
            detail: { 
                workflows: this.ciData,
                summary: this.getCISummary()
            } 
        }));
    }

    async updateHomeData() {
        // Get real weather data for Tasmania
        try {
            const response = await fetch('http://reg.bom.gov.au/fwo/IDT60901/IDT60901.94967.json');
            if (response.ok) {
                const bomData = await response.json();
                const latest = bomData.observations?.data?.[0];
                
                this.homeData = {
                    weather: {
                        temperature: latest?.air_temp || 18,
                        humidity: latest?.rel_hum || 65,
                        windSpeed: latest?.wind_spd_kmh || 5,
                        rainfall: latest?.rain_trace || 0,
                        condition: latest?.weather || 'Clear'
                    },
                    solar: {
                        production: 2.3 + Math.random() * 1.2,
                        battery: 78 + Math.random() * 15,
                        consumption: 1.8 + Math.random() * 0.8
                    },
                    network: {
                        starlink: 98 + Math.random() * 2,
                        latency: 25 + Math.random() * 15,
                        bandwidth: 85 + Math.random() * 30
                    },
                    systems: {
                        waterTank: 85 + Math.random() * 10,
                        greenhouse: 22 + Math.random() * 3,
                        backup: Math.random() > 0.9 ? 'ACTIVE' : 'STANDBY'
                    }
                };
            } else {
                throw new Error('BOM API failed');
            }
        } catch (error) {
            console.warn('Failed to fetch real weather data, using simulated data:', error);
            this.homeData = {
                weather: {
                    temperature: 18 + Math.random() * 8,
                    humidity: 65 + Math.random() * 20,
                    windSpeed: 5 + Math.random() * 10,
                    rainfall: Math.random() * 5,
                    condition: 'Partly Cloudy'
                },
                solar: {
                    production: 2.3 + Math.random() * 1.2,
                    battery: 78 + Math.random() * 15,
                    consumption: 1.8 + Math.random() * 0.8
                },
                network: {
                    starlink: 98 + Math.random() * 2,
                    latency: 25 + Math.random() * 15,
                    bandwidth: 85 + Math.random() * 30
                },
                systems: {
                    waterTank: 85 + Math.random() * 10,
                    greenhouse: 22 + Math.random() * 3,
                    backup: Math.random() > 0.9 ? 'ACTIVE' : 'STANDBY'
                }
            };
        }
        
        this.renderHomeData();
    }

    renderHomeData() {
        const container = document.getElementById('homeContent');
        if (!container) {
            console.warn('Home content container not found');
            return;
        }
        const data = this.homeData;
        
        const html = `
            <div class="metric-section">
                <div class="home-metric">
                    <span class="metric-name">Solar Production</span>
                    <span class="metric-value">${data.solar.production.toFixed(1)} kW</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(data.solar.production * 20, 100)}%"></div>
                </div>
                
                <div class="home-metric">
                    <span class="metric-name">Battery Level</span>
                    <span class="metric-value ${data.solar.battery < 30 ? 'metric-critical' : data.solar.battery < 60 ? 'metric-warning' : ''}">${data.solar.battery.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${data.solar.battery < 30 ? 'critical' : data.solar.battery < 60 ? 'warning' : ''}" style="width: ${data.solar.battery}%"></div>
                </div>
                
                <div class="home-metric">
                    <span class="metric-name">Power Consumption</span>
                    <span class="metric-value">${data.solar.consumption.toFixed(1)} kW</span>
                </div>
            </div>
            
            <div class="metric-section" style="margin-top: 16px;">
                <div class="home-metric">
                    <span class="metric-name">Temperature</span>
                    <span class="metric-value">${data.weather.temperature.toFixed(1)}°C</span>
                </div>
                
                <div class="home-metric">
                    <span class="metric-name">Humidity</span>
                    <span class="metric-value">${data.weather.humidity.toFixed(0)}%</span>
                </div>
                
                <div class="home-metric">
                    <span class="metric-name">Wind Speed</span>
                    <span class="metric-value">${data.weather.windSpeed.toFixed(1)} km/h</span>
                </div>
                
                <div class="home-metric">
                    <span class="metric-name">Starlink Signal</span>
                    <span class="metric-value ${data.network.starlink < 85 ? 'metric-warning' : ''}">${data.network.starlink.toFixed(0)}%</span>
                </div>
            </div>
            
            <div class="metric-section" style="margin-top: 16px;">
                <div class="home-metric">
                    <span class="metric-name">Water Tank</span>
                    <span class="metric-value">${data.systems.waterTank.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${data.systems.waterTank < 20 ? 'critical' : data.systems.waterTank < 40 ? 'warning' : ''}" style="width: ${data.systems.waterTank}%"></div>
                </div>
                
                <div class="home-metric">
                    <span class="metric-name">Greenhouse Temp</span>
                    <span class="metric-value">${data.systems.greenhouse.toFixed(1)}°C</span>
                </div>
                
                <div class="home-metric">
                    <span class="metric-name">Backup Generator</span>
                    <span class="metric-value ${data.systems.backup === 'ACTIVE' ? 'metric-warning' : ''}">${data.systems.backup}</span>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    async updateAIData() {
        // Get current token statistics from AI service
        const stats = this.aiService.getTokenStats();
        this.renderAIData(stats);
        await this.updateTokenDisplay();
    }

    renderAIData(stats) {
        const container = document.getElementById('aiContent');
        if (!container) {
            console.warn('AI content container not found');
            return;
        }
        
        // Calculate efficiency metrics
        const tokenSavings = stats.cachedTokens > 0 ? 
            ((stats.cachedTokens / (stats.totalTokens + stats.cachedTokens)) * 100).toFixed(1) : '0.0';
        
        const avgLatency = stats.avgLatency || '0';
        
        const sessionTime = this.formatDuration(stats.sessionDuration);
        
        const html = `
            <div class="metric-section">
                <div class="ai-metric">
                    <span class="metric-name">Total Requests</span>
                    <span class="metric-value">${stats.totalRequests}</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Cache Efficiency</span>
                    <span class="metric-value ${parseFloat(stats.cacheEfficiency) > 20 ? 'metric-success' : 'metric-warning'}">${stats.cacheEfficiency}%</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Cache Hits/Misses</span>
                    <span class="metric-value">${stats.cacheHits}/${stats.cacheMisses}</span>
                </div>
            </div>
            
            <div class="metric-section" style="margin-top: 16px;">
                <div class="ai-metric">
                    <span class="metric-name">Input Tokens</span>
                    <span class="metric-value">${stats.inputTokens.toLocaleString()}</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Output Tokens</span>
                    <span class="metric-value">${stats.outputTokens.toLocaleString()}</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Cached Tokens</span>
                    <span class="metric-value metric-success">${stats.cachedTokens.toLocaleString()}</span>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(tokenSavings, 100)}%" title="Token savings from caching"></div>
                </div>
            </div>
            
            <div class="metric-section" style="margin-top: 16px;">
                <div class="ai-metric">
                    <span class="metric-name">Total Tokens</span>
                    <span class="metric-value">${stats.totalTokens.toLocaleString()}</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Avg per Request</span>
                    <span class="metric-value">${stats.tokensPerRequest}</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Cache Size</span>
                    <span class="metric-value">${stats.cacheSize}/50</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Avg Latency</span>
                    <span class="metric-value ${parseFloat(avgLatency) > 150 ? 'metric-warning' : ''}">${avgLatency}ms</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Session Time</span>
                    <span class="metric-value">${sessionTime}</span>
                </div>
            </div>
            
            <div class="metric-section" style="margin-top: 16px; padding-top: 8px; border-top: 1px solid #333;">
                <div class="cache-status">
                    <div class="cache-indicator ${stats.cacheSize > 40 ? 'cache-full' : stats.cacheSize > 20 ? 'cache-medium' : 'cache-low'}">
                        ● Prompt Cache: ${stats.cacheSize > 40 ? 'FULL' : stats.cacheSize > 20 ? 'ACTIVE' : 'BUILDING'}
                    </div>
                    <div class="optimization-tip">
                        ${this.getOptimizationTip(stats)}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    // Fetch and display token analytics from GitHub data
    async getTokenAnalytics() {
        try {
            const response = await fetch('/.github/data/token-usage.json');
            if (response.ok) {
                const tokenData = await response.json();
                return this.processTokenAnalytics(tokenData);
            }
        } catch (error) {
            console.warn('Token analytics not available:', error);
        }
        
        // Return simulated token data if real data unavailable
        return {
            dailyUsage: 45000,
            dailyLimit: 100000,
            sessionsToday: 3,
            cacheHitRatio: 0.68,
            tokensSaved: 12500,
            efficiency: 73.2,
            lastSession: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            remainingBudget: 55000
        };
    }
    
    processTokenAnalytics(data) {
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = data.session_usage.filter(s => 
            s.utc_timestamp && s.utc_timestamp.startsWith(today)
        );
        
        const dailyUsage = todaySessions.reduce((sum, s) => sum + (s.total_tokens || 0), 0);
        const tokensSaved = todaySessions.reduce((sum, s) => sum + (s.token_savings || 0), 0);
        const avgCacheRatio = todaySessions.length > 0 ? 
            todaySessions.reduce((sum, s) => sum + (s.cache_hit_ratio || 0), 0) / todaySessions.length : 0;
        
        return {
            dailyUsage,
            dailyLimit: data.metadata?.daily_limit || 100000,
            sessionsToday: todaySessions.length,
            cacheHitRatio: avgCacheRatio,
            tokensSaved,
            efficiency: dailyUsage > 0 ? (tokensSaved / (dailyUsage + tokensSaved)) * 100 : 0,
            lastSession: todaySessions.length > 0 ? todaySessions[todaySessions.length - 1].utc_timestamp : null,
            remainingBudget: (data.metadata?.daily_limit || 100000) - dailyUsage
        };
    }
    
    // Add token analytics to AI panel
    async updateTokenDisplay() {
        const tokenData = await this.getTokenAnalytics();
        const container = document.getElementById('aiContent');
        if (!container) return;
        
        // Add token section to existing AI display
        const tokenSection = `
            <div class="token-analytics" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #333;">
                <div class="ai-metric">
                    <span class="metric-name">Daily Budget</span>
                    <span class="metric-value">${tokenData.remainingBudget.toLocaleString()}/${tokenData.dailyLimit.toLocaleString()}</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Sessions Today</span>
                    <span class="metric-value">${tokenData.sessionsToday}/6</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Cache Efficiency</span>
                    <span class="metric-value metric-${tokenData.cacheHitRatio > 0.6 ? 'success' : tokenData.cacheHitRatio > 0.3 ? 'warning' : 'error'}">${(tokenData.cacheHitRatio * 100).toFixed(1)}%</span>
                </div>
                
                <div class="ai-metric">
                    <span class="metric-name">Tokens Saved</span>
                    <span class="metric-value metric-success">${tokenData.tokensSaved.toLocaleString()}</span>
                </div>
                
                <div class="progress-bar" style="margin-top: 8px;">
                    <div class="progress-fill" style="width: ${Math.min((tokenData.dailyUsage / tokenData.dailyLimit) * 100, 100)}%" title="Daily usage: ${tokenData.dailyUsage.toLocaleString()} tokens"></div>
                </div>
                
                <div class="cache-status" style="margin-top: 8px; font-size: 0.9em; color: #888;">
                    💰 Cost Efficiency: ${tokenData.efficiency.toFixed(1)}% savings
                </div>
            </div>
        `;
        
        // Append token analytics to AI panel if not already present
        if (!container.innerHTML.includes('token-analytics')) {
            container.innerHTML += tokenSection;
        }
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    getOptimizationTip(stats) {
        if (stats.cacheEfficiency < 10 && stats.totalRequests > 5) {
            return "💡 Consider using more system context for better caching";
        } else if (stats.totalTokens > 10000) {
            return "🚀 Excellent token optimization with prompt caching!";
        } else if (stats.cacheHits > stats.cacheMisses) {
            return "✨ Cache performing well - reducing API costs";
        } else {
            return "📊 Building cache patterns for efficiency";
        }
    }

    updateSystemStats() {
        // Simulate realistic system stats changes
        this.systemStats.load = Math.max(0.1, this.systemStats.load + (Math.random() - 0.5) * 0.1);
        this.systemStats.memory.used = Math.max(0.8, Math.min(15, this.systemStats.memory.used + (Math.random() - 0.5) * 0.2));
        this.systemStats.network.down = Math.max(0.1, this.systemStats.network.down + (Math.random() - 0.5) * 0.5);
        this.systemStats.network.up = Math.max(0.05, this.systemStats.network.up + (Math.random() - 0.5) * 0.2);
        
        // Update footer stats
        document.getElementById('systemLoad').textContent = this.systemStats.load.toFixed(2);
        document.getElementById('memUsage').textContent = `${this.systemStats.memory.used.toFixed(1)}GB/${this.systemStats.memory.total}GB`;
        document.getElementById('netActivity').textContent = `▼${this.systemStats.network.down.toFixed(1)}MB ▲${this.systemStats.network.up.toFixed(1)}MB`;
    }
    
    // Expose CI data for console/graphs
    getCIData() {
        return {
            workflows: this.ciData,
            summary: this.getCISummary(),
            lastUpdate: new Date().toISOString()
        };
    }
    
    getCISummary() {
        const total = this.ciData.length;
        const successful = this.ciData.filter(run => run.conclusion === 'success').length;
        const failed = this.ciData.filter(run => run.conclusion === 'failure').length;
        const running = this.ciData.filter(run => run.status === 'in_progress').length;
        
        return {
            total,
            successful,
            failed,
            running,
            successRate: total > 0 ? Math.round((successful / total) * 100) : 0
        };
    }
    
    // Method for external access to all monitor data
    getAllMonitorData() {
        return {
            ci: this.getCIData(),
            home: this.homeData,
            ai: window.aiService ? window.aiService.getUsageStats() : null,
            system: this.systemStats,
            lastUpdate: new Date().toISOString()
        };
    }
}

// Export for use in terminal
window.SystemMonitor = SystemMonitor;