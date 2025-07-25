class ParticleEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        
        // Effects configuration
        this.effects = {
            matrix: { active: false, particles: [] },
            stars: { active: false, particles: [] },
            rain: { active: false, particles: [] },
            snow: { active: false, particles: [] },
            fireflies: { active: false, particles: [] },
            neural: { active: false, particles: [], connections: [] }
        };
        
        this.colors = {
            matrix: '#00ff41',
            terminal: '#00ffaa', 
            accent: '#ff6600',
            warning: '#ffaa00',
            error: '#ff4444',
            info: '#00cccc'
        };
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupResizeHandler();
        
        // Start with subtle matrix rain effect
        this.startEffect('matrix', { intensity: 0.3 });
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.6';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Insert before terminal content
        const terminal = document.querySelector('.terminal');
        if (terminal && terminal.parentNode) {
            terminal.parentNode.insertBefore(this.canvas, terminal);
        } else {
            document.body.appendChild(this.canvas);
        }
        
        this.resize();
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Matrix rain effect (enhanced version)
    createMatrixParticles(options = {}) {
        const { intensity = 0.5, speed = 1 } = options;
        const particles = [];
        const columns = Math.floor(this.canvas.width / 20);
        
        for (let i = 0; i < columns * intensity; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: (Math.random() * 3 + 1) * speed,
                length: Math.random() * 20 + 10,
                chars: this.generateMatrixChars(),
                opacity: Math.random() * 0.8 + 0.2
            });
        }
        
        return particles;
    }

    generateMatrixChars() {
        const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const result = [];
        for (let i = 0; i < 10; i++) {
            result.push(chars[Math.floor(Math.random() * chars.length)]);
        }
        return result;
    }

    // Starfield effect
    createStarParticles(options = {}) {
        const { count = 100, speed = 0.5 } = options;
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 1000,
                speed: speed,
                size: Math.random() * 2 + 1,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
        
        return particles;
    }

    // Digital rain effect
    createRainParticles(options = {}) {
        const { intensity = 0.3 } = options;
        const particles = [];
        const count = Math.floor(this.canvas.width * intensity / 10);
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: -Math.random() * this.canvas.height,
                speed: Math.random() * 5 + 2,
                length: Math.random() * 15 + 5,
                width: Math.random() * 2 + 1,
                opacity: Math.random() * 0.6 + 0.2
            });
        }
        
        return particles;
    }

    // Firefly effect
    createFireflyParticles(options = {}) {
        const { count = 15 } = options;
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 2,
                glow: Math.random() * Math.PI * 2,
                glowSpeed: Math.random() * 0.03 + 0.01,
                trail: []
            });
        }
        
        return particles;
    }

    // Neural network effect
    createNeuralParticles(options = {}) {
        const { nodeCount = 30, connectionDistance = 150 } = options;
        const particles = [];
        
        for (let i = 0; i < nodeCount; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 4 + 2,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                connectionDistance: connectionDistance
            });
        }
        
        return particles;
    }

    // Start specific effect
    startEffect(effectName, options = {}) {
        if (!this.effects[effectName]) return;
        
        this.effects[effectName].active = true;
        
        switch (effectName) {
            case 'matrix':
                this.effects[effectName].particles = this.createMatrixParticles(options);
                break;
            case 'stars':
                this.effects[effectName].particles = this.createStarParticles(options);
                break;
            case 'rain':
                this.effects[effectName].particles = this.createRainParticles(options);
                break;
            case 'fireflies':
                this.effects[effectName].particles = this.createFireflyParticles(options);
                break;
            case 'neural':
                this.effects[effectName].particles = this.createNeuralParticles(options);
                break;
        }
        
        if (!this.isRunning) {
            this.start();
        }
    }

    // Stop specific effect
    stopEffect(effectName) {
        if (this.effects[effectName]) {
            this.effects[effectName].active = false;
            this.effects[effectName].particles = [];
        }
        
        // Check if any effects are still running
        const hasActiveEffects = Object.values(this.effects).some(effect => effect.active);
        if (!hasActiveEffects) {
            this.stop();
        }
    }

    // Animation loop
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.isRunning = false;
        this.clear();
    }

    animate() {
        if (!this.isRunning) return;
        
        this.clear();
        
        // Update and render each active effect
        Object.entries(this.effects).forEach(([name, effect]) => {
            if (effect.active) {
                this[`update${name.charAt(0).toUpperCase() + name.slice(1)}`](effect);
                this[`render${name.charAt(0).toUpperCase() + name.slice(1)}`](effect);
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Matrix effect update/render
    updateMatrix(effect) {
        effect.particles.forEach(particle => {
            particle.y += particle.speed;
            if (particle.y > this.canvas.height + particle.length * 20) {
                particle.y = -particle.length * 20;
                particle.x = Math.random() * this.canvas.width;
            }
        });
    }

    renderMatrix(effect) {
        this.ctx.font = '14px JetBrains Mono, monospace';
        this.ctx.textAlign = 'center';
        
        effect.particles.forEach(particle => {
            for (let i = 0; i < particle.chars.length; i++) {
                const alpha = particle.opacity * (1 - i / particle.chars.length);
                this.ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
                this.ctx.fillText(
                    particle.chars[i],
                    particle.x,
                    particle.y - i * 20
                );
            }
        });
    }

    // Stars effect update/render
    updateStars(effect) {
        effect.particles.forEach(particle => {
            particle.z -= particle.speed;
            if (particle.z <= 0) {
                particle.z = 1000;
                particle.x = Math.random() * this.canvas.width;
                particle.y = Math.random() * this.canvas.height;
            }
            particle.twinkle += particle.twinkleSpeed;
        });
    }

    renderStars(effect) {
        effect.particles.forEach(particle => {
            const x = (particle.x - this.canvas.width / 2) * (1000 / particle.z) + this.canvas.width / 2;
            const y = (particle.y - this.canvas.height / 2) * (1000 / particle.z) + this.canvas.height / 2;
            const size = particle.size * (1000 / particle.z);
            const alpha = Math.sin(particle.twinkle) * 0.5 + 0.5;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // Rain effect update/render
    updateRain(effect) {
        effect.particles.forEach(particle => {
            particle.y += particle.speed;
            if (particle.y > this.canvas.height) {
                particle.y = -particle.length;
                particle.x = Math.random() * this.canvas.width;
            }
        });
    }

    renderRain(effect) {
        effect.particles.forEach(particle => {
            this.ctx.strokeStyle = `rgba(0, 255, 170, ${particle.opacity})`;
            this.ctx.lineWidth = particle.width;
            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(particle.x, particle.y + particle.length);
            this.ctx.stroke();
        });
    }

    // Fireflies effect update/render
    updateFireflies(effect) {
        effect.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary wrapping
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Random direction changes
            if (Math.random() < 0.02) {
                particle.vx += (Math.random() - 0.5) * 0.1;
                particle.vy += (Math.random() - 0.5) * 0.1;
                particle.vx = Math.max(-1, Math.min(1, particle.vx));
                particle.vy = Math.max(-1, Math.min(1, particle.vy));
            }
            
            particle.glow += particle.glowSpeed;
            
            // Trail effect
            particle.trail.push({ x: particle.x, y: particle.y });
            if (particle.trail.length > 10) {
                particle.trail.shift();
            }
        });
    }

    renderFireflies(effect) {
        effect.particles.forEach(particle => {
            const glowIntensity = Math.sin(particle.glow) * 0.5 + 0.5;
            
            // Render trail
            this.ctx.strokeStyle = `rgba(255, 200, 100, 0.3)`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for (let i = 1; i < particle.trail.length; i++) {
                if (i === 1) {
                    this.ctx.moveTo(particle.trail[i-1].x, particle.trail[i-1].y);
                }
                this.ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
            }
            this.ctx.stroke();
            
            // Render firefly
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            gradient.addColorStop(0, `rgba(255, 200, 100, ${glowIntensity})`);
            gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = `rgba(255, 255, 200, ${glowIntensity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // Neural network effect update/render
    updateNeural(effect) {
        effect.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary bouncing
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            particle.pulse += particle.pulseSpeed;
        });
    }

    renderNeural(effect) {
        // Render connections
        this.ctx.strokeStyle = 'rgba(0, 255, 170, 0.2)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < effect.particles.length; i++) {
            for (let j = i + 1; j < effect.particles.length; j++) {
                const p1 = effect.particles[i];
                const p2 = effect.particles[j];
                const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                
                if (distance < p1.connectionDistance) {
                    const alpha = (1 - distance / p1.connectionDistance) * 0.3;
                    this.ctx.strokeStyle = `rgba(0, 255, 170, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
        
        // Render nodes
        effect.particles.forEach(particle => {
            const pulseIntensity = Math.sin(particle.pulse) * 0.5 + 0.5;
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            gradient.addColorStop(0, `rgba(0, 255, 170, ${pulseIntensity})`);
            gradient.addColorStop(1, 'rgba(0, 255, 170, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${pulseIntensity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // Public API methods
    setOpacity(opacity) {
        this.canvas.style.opacity = opacity.toString();
    }

    toggleEffect(effectName, options = {}) {
        if (this.effects[effectName] && this.effects[effectName].active) {
            this.stopEffect(effectName);
        } else {
            this.startEffect(effectName, options);
        }
    }

    // Get available effects
    getAvailableEffects() {
        return Object.keys(this.effects);
    }

    // Cleanup
    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', this.resize);
    }
}

// Export for global use
window.ParticleEffects = ParticleEffects;