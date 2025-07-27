// API endpoint for system monitor data
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { type } = req.query;
        
        if (type === 'ci') {
            return await handleCIData(req, res);
        } else if (type === 'homestead') {
            return await handleHomesteadData(req, res);
        } else if (type === 'system') {
            return await handleSystemData(req, res);
        } else {
            return res.status(400).json({ error: 'Invalid data type' });
        }
        
    } catch (error) {
        console.error('Monitor data API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}

async function handleCIData(req, res) {
    try {
        // Fetch GitHub Actions data
        const response = await fetch('https://api.github.com/repos/adrianwedd/adrianwedd/actions/runs?per_page=10', {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Adrian-Terminal-Monitor/1.0'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Enhance data with additional metrics
            const enhancedRuns = data.workflow_runs.map(run => ({
                ...run,
                duration: run.updated_at && run.created_at ? 
                    Math.floor((new Date(run.updated_at) - new Date(run.created_at)) / 1000) : null,
                age: Math.floor((Date.now() - new Date(run.created_at)) / 1000)
            }));
            
            return res.status(200).json({
                type: 'ci',
                timestamp: new Date().toISOString(),
                data: enhancedRuns
            });
        } else {
            throw new Error(`GitHub API returned ${response.status}`);
        }
        
    } catch {
        // Return mock data as fallback
        const mockData = generateMockCIData();
        return res.status(200).json({
            type: 'ci',
            timestamp: new Date().toISOString(),
            data: mockData,
            source: 'mock'
        });
    }
}

async function handleHomesteadData(req, res) {
    // Generate realistic homestead telemetry
    const data = {
        solar: {
            production: 2.3 + Math.random() * 1.2,
            battery: 78 + Math.random() * 15,
            consumption: 1.8 + Math.random() * 0.8,
            efficiency: 85 + Math.random() * 10
        },
        weather: {
            temperature: 18 + Math.random() * 8,
            humidity: 65 + Math.random() * 20,
            windSpeed: 5 + Math.random() * 10,
            rainfall: Math.random() * 5,
            pressure: 1013 + Math.random() * 20 - 10
        },
        network: {
            starlink: 98 + Math.random() * 2,
            latency: 25 + Math.random() * 15,
            bandwidth: 85 + Math.random() * 30,
            uptime: 99.8 + Math.random() * 0.2
        },
        systems: {
            waterTank: 85 + Math.random() * 10,
            greenhouse: 22 + Math.random() * 3,
            backup: Math.random() > 0.9 ? 'ACTIVE' : 'STANDBY',
            compost: 45 + Math.random() * 10,
            irrigation: Math.random() > 0.7 ? 'ACTIVE' : 'IDLE'
        },
        location: {
            coordinates: [-42.8821, 147.3272], // Tasmania
            elevation: 450,
            timezone: 'Australia/Hobart'
        }
    };
    
    return res.status(200).json({
        type: 'homestead',
        timestamp: new Date().toISOString(),
        data: data,
        location: 'Tasmania Off-Grid Homestead'
    });
}

async function handleSystemData(req, res) {
    // Generate system performance metrics
    const data = {
        cpu: {
            usage: Math.random() * 30 + 10,
            temperature: Math.random() * 20 + 45,
            cores: 8,
            architecture: 'arm64'
        },
        memory: {
            used: 1.2 + Math.random() * 2,
            total: 16,
            swap: 0.1 + Math.random() * 0.5,
            buffers: 0.3 + Math.random() * 0.2
        },
        network: {
            interfaces: {
                starlink: {
                    rx: Math.random() * 5 + 1,
                    tx: Math.random() * 2 + 0.5,
                    quality: 95 + Math.random() * 5
                },
                ethernet: {
                    rx: Math.random() * 0.5,
                    tx: Math.random() * 0.3,
                    status: 'up'
                }
            }
        },
        storage: {
            root: {
                used: 45 + Math.random() * 20,
                total: 512,
                type: 'SSD'
            },
            data: {
                used: 2.1 + Math.random() * 0.5,
                total: 8,
                type: 'HDD'
            }
        },
        processes: [
            { name: 'veritas-daemon', cpu: 2.1, memory: 156, status: 'running' },
            { name: 'homestead-monitor', cpu: 0.8, memory: 84, status: 'running' },
            { name: 'ai-persona-server', cpu: 1.2, memory: 234, status: 'running' },
            { name: 'recursive-optimizer', cpu: 99.0, memory: 512, status: 'running' },
            { name: 'starlink-bridge', cpu: 0.3, memory: 45, status: 'running' }
        ]
    };
    
    return res.status(200).json({
        type: 'system',
        timestamp: new Date().toISOString(),
        data: data,
        hostname: 'adrian@tasmania-homestead'
    });
}

function generateMockCIData() {
    const workflows = [
        'Deploy Terminal Interface',
        'Playwright Tests', 
        'Update GitHub Activity',
        'LLM Chat Response',
        'System Monitor',
        'Music Player Tests'
    ];
    
    return workflows.map((name, i) => {
        const isRunning = i === 1;
        const isFailed = Math.random() > 0.8 && !isRunning;
        
        return {
            id: 1000 + i,
            name: name,
            status: isRunning ? 'in_progress' : 'completed',
            conclusion: isRunning ? null : (isFailed ? 'failure' : 'success'),
            created_at: new Date(Date.now() - Math.random() * 7200000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            head_branch: 'main',
            event: 'push',
            run_number: 42 + i,
            head_sha: Math.random().toString(36).substring(2, 9),
            duration: isRunning ? null : Math.floor(Math.random() * 180 + 30),
            age: Math.floor(Math.random() * 7200)
        };
    });
}