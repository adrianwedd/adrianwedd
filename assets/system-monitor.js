class SystemMonitor {
    constructor() {
        this.isActive = false;
        this.updateInterval = null;
        this.ciData = [];
        this.homesteadData = {};
        this.systemStats = {
            load: 0.42,
            memory: { used: 1.2, total: 16 },
            network: { down: 2.1, up: 0.8 }
        };
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
        await this.updateAllData();
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
        this.pulseRefreshIndicator('homesteadRefresh');

        try {
            await Promise.all([
                this.updateCIData(),
                this.updateHomesteadData()
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
                        <br>Event: ${run.event} • Commit: ${run.head_sha?.substring(0, 7) || 'a1b2c3d'}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }

    async updateHomesteadData() {
        // Generate realistic homestead telemetry data
        this.homesteadData = {
            solar: {
                production: 2.3 + Math.random() * 1.2,
                battery: 78 + Math.random() * 15,
                consumption: 1.8 + Math.random() * 0.8
            },
            weather: {
                temperature: 18 + Math.random() * 8,
                humidity: 65 + Math.random() * 20,
                windSpeed: 5 + Math.random() * 10,
                rainfall: Math.random() * 5
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
        
        this.renderHomesteadData();
    }

    renderHomesteadData() {
        const container = document.getElementById('homesteadContent');
        const data = this.homesteadData;
        
        const html = `
            <div class="metric-section">
                <div class="homestead-metric">
                    <span class="metric-name">Solar Production</span>
                    <span class="metric-value">${data.solar.production.toFixed(1)} kW</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(data.solar.production * 20, 100)}%"></div>
                </div>
                
                <div class="homestead-metric">
                    <span class="metric-name">Battery Level</span>
                    <span class="metric-value ${data.solar.battery < 30 ? 'metric-critical' : data.solar.battery < 60 ? 'metric-warning' : ''}">${data.solar.battery.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${data.solar.battery < 30 ? 'critical' : data.solar.battery < 60 ? 'warning' : ''}" style="width: ${data.solar.battery}%"></div>
                </div>
                
                <div class="homestead-metric">
                    <span class="metric-name">Power Consumption</span>
                    <span class="metric-value">${data.solar.consumption.toFixed(1)} kW</span>
                </div>
            </div>
            
            <div class="metric-section" style="margin-top: 16px;">
                <div class="homestead-metric">
                    <span class="metric-name">Temperature</span>
                    <span class="metric-value">${data.weather.temperature.toFixed(1)}°C</span>
                </div>
                
                <div class="homestead-metric">
                    <span class="metric-name">Humidity</span>
                    <span class="metric-value">${data.weather.humidity.toFixed(0)}%</span>
                </div>
                
                <div class="homestead-metric">
                    <span class="metric-name">Wind Speed</span>
                    <span class="metric-value">${data.weather.windSpeed.toFixed(1)} km/h</span>
                </div>
                
                <div class="homestead-metric">
                    <span class="metric-name">Starlink Signal</span>
                    <span class="metric-value ${data.network.starlink < 85 ? 'metric-warning' : ''}">${data.network.starlink.toFixed(0)}%</span>
                </div>
            </div>
            
            <div class="metric-section" style="margin-top: 16px;">
                <div class="homestead-metric">
                    <span class="metric-name">Water Tank</span>
                    <span class="metric-value">${data.systems.waterTank.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${data.systems.waterTank < 20 ? 'critical' : data.systems.waterTank < 40 ? 'warning' : ''}" style="width: ${data.systems.waterTank}%"></div>
                </div>
                
                <div class="homestead-metric">
                    <span class="metric-name">Greenhouse Temp</span>
                    <span class="metric-value">${data.systems.greenhouse.toFixed(1)}°C</span>
                </div>
                
                <div class="homestead-metric">
                    <span class="metric-name">Backup Generator</span>
                    <span class="metric-value ${data.systems.backup === 'ACTIVE' ? 'metric-warning' : ''}">${data.systems.backup}</span>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
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
}

// Export for use in terminal
window.SystemMonitor = SystemMonitor;