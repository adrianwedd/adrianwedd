class AudioVisualizer {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.analyser = null;
        this.fftData = new Float32Array(128);
        this.isActive = false;
        this.animationFrame = null;
        
        // Shader uniforms
        this.uniforms = {};
        this.startTime = Date.now();
    }

    async init(audioContext) {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'audio-visualizer';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);

        // Get WebGL context
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return false;
        }

        // Create analyzer for FFT data
        if (audioContext) {
            this.analyser = audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
        }

        // Initialize shaders
        this.initShaders();
        this.initGeometry();
        
        return true;
    }

    initShaders() {
        const vertexShaderSource = `
            attribute vec2 position;
            varying vec2 fragCoord;
            
            void main() {
                fragCoord = (position + 1.0) * 0.5;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        // Multiple shader variants for different visual styles
        const fragmentShaderSources = {
            spectrum: `
                precision mediump float;
                uniform float iTime;
                uniform vec2 iResolution;
                uniform float iFFT[128];
                varying vec2 fragCoord;
                
                void main() {
                    vec2 uv = fragCoord;
                    uv.y = 1.0 - uv.y; // Flip Y coordinate
                    
                    float audio = iFFT[int(uv.x * 128.0)];
                    
                    // Create spectrum bars
                    float bar = step(uv.y, audio * 2.0);
                    
                    // Color based on frequency and amplitude
                    vec3 color = vec3(
                        uv.x * 0.5 + audio * 0.5,
                        audio,
                        1.0 - uv.x * 0.5 + audio * 0.3
                    );
                    
                    // Add glow effect
                    float glow = smoothstep(0.0, 0.1, audio) * (1.0 - abs(uv.y - audio));
                    color += glow * vec3(1.0, 0.5, 0.0);
                    
                    gl_FragColor = vec4(color * bar, bar * 0.8);
                }
            `,
            waveform: `
                precision mediump float;
                uniform float iTime;
                uniform vec2 iResolution;
                uniform float iFFT[128];
                varying vec2 fragCoord;
                
                void main() {
                    vec2 uv = fragCoord;
                    uv.y = 1.0 - uv.y;
                    
                    float audio = iFFT[int(uv.x * 128.0)];
                    
                    // Create waveform
                    float wave = abs(uv.y - 0.5 - audio * 0.3);
                    wave = smoothstep(0.02, 0.0, wave);
                    
                    // Oscilloscope style
                    vec3 color = vec3(0.0, 1.0, 0.0) * wave;
                    
                    // Add grid
                    float grid = 0.0;
                    grid += step(0.98, fract(uv.x * 20.0));
                    grid += step(0.98, fract(uv.y * 10.0));
                    color += grid * vec3(0.0, 0.3, 0.0);
                    
                    gl_FragColor = vec4(color, wave + grid * 0.3);
                }
            `,
            cyberpunk: `
                precision mediump float;
                uniform float iTime;
                uniform vec2 iResolution;
                uniform float iFFT[128];
                varying vec2 fragCoord;
                
                void main() {
                    vec2 uv = fragCoord;
                    uv.y = 1.0 - uv.y;
                    
                    float audio = iFFT[int(uv.x * 128.0)];
                    
                    // Matrix-style falling effect
                    float fall = fract(uv.y * 10.0 + iTime * 2.0 + audio * 5.0);
                    fall = smoothstep(0.8, 1.0, fall);
                    
                    // Frequency bars with digital glitch
                    float bar = step(uv.y, audio * 3.0);
                    
                    // Cyberpunk colors
                    vec3 color = vec3(
                        audio * 2.0,
                        1.0,
                        0.5 + audio * 0.5
                    ) * bar;
                    
                    // Add falling digital rain
                    color += fall * vec3(0.0, 1.0, 0.0) * audio;
                    
                    // Scanlines
                    float scanline = sin(uv.y * 800.0 + iTime * 10.0) * 0.1;
                    color += scanline;
                    
                    gl_FragColor = vec4(color, bar * 0.9 + fall * 0.3);
                }
            `,
            minimal: `
                precision mediump float;
                uniform float iTime;
                uniform vec2 iResolution;
                uniform float iFFT[128];
                varying vec2 fragCoord;
                
                void main() {
                    vec2 uv = fragCoord;
                    uv.y = 1.0 - uv.y;
                    
                    float audio = iFFT[int(uv.x * 128.0)];
                    
                    // Simple circle visualization
                    float dist = distance(uv, vec2(0.5, 0.5));
                    float circle = smoothstep(0.3 + audio * 0.2, 0.3 + audio * 0.2 - 0.02, dist);
                    
                    // Color based on audio amplitude
                    vec3 color = vec3(
                        0.2 + audio * 0.8,
                        0.6,
                        1.0 - audio * 0.5
                    ) * circle;
                    
                    // Add subtle pulse
                    float pulse = sin(iTime * 5.0 + audio * 10.0) * 0.1 + 0.9;
                    color *= pulse;
                    
                    gl_FragColor = vec4(color, circle * 0.7);
                }
            `,
            particles: `
                precision mediump float;
                uniform float iTime;
                uniform vec2 iResolution;
                uniform float iFFT[128];
                varying vec2 fragCoord;

                // Hash function from https://www.shadertoy.com/view/4djSRW
                float hash(float n) { return fract(sin(n) * 43758.5453123); }

                void main() {
                    vec2 uv = fragCoord;
                    vec3 finalColor = vec3(0.0);

                    for (int i = 0; i < 20; ++i) {
                        float seed = float(i) * 0.1 + hash(uv.x + uv.y + float(i));
                        vec2 p = uv + vec2(sin(iTime * 0.5 + seed * 10.0), cos(iTime * 0.7 + seed * 12.0)) * 0.1;
                        p += vec2(hash(seed * 2.0) - 0.5, hash(seed * 3.0) - 0.5) * 0.5;

                        float dist = length(p - uv);
                        float alpha = smoothstep(0.05, 0.0, dist);

                        // Color based on audio and time
                        float audioInfluence = iFFT[int(mod(seed * 100.0, 128.0))] * 0.5;
                        vec3 particleColor = vec3(0.8 + audioInfluence, 0.2, 1.0 - audioInfluence);

                        finalColor += particleColor * alpha;
                    }

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            procedural: `
                precision mediump float;
                uniform float iTime;
                uniform vec2 iResolution;
                uniform float iFFT[128];
                varying vec2 fragCoord;

                void main() {
                    vec2 uv = fragCoord;
                    vec2 p = uv - 0.5;
                    p.x *= iResolution.x / iResolution.y; // Aspect ratio correction

                    float audio = iFFT[int(uv.x * 128.0)];

                    // Simple procedural pattern based on sine waves and audio
                    float color1 = sin(p.x * 20.0 + iTime * 0.5 + audio * 5.0);
                    float color2 = cos(p.y * 20.0 + iTime * 0.7 + audio * 3.0);
                    float color3 = sin(length(p) * 30.0 - iTime * 1.0 + audio * 8.0);

                    vec3 finalColor = vec3(color1, color2, color3) * 0.5 + 0.5;

                    // Add a subtle glow based on audio
                    float glow = audio * 2.0;
                    finalColor += glow * vec3(0.1, 0.5, 0.8);

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        };

        // Compile shaders
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        
        // Store compiled fragment shaders
        this.shaders = {};
        for (const [name, source] of Object.entries(fragmentShaderSources)) {
            const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, source);
            this.shaders[name] = this.createProgram(vertexShader, fragmentShader);
        }

        // Start with spectrum shader
        this.program = this.shaders.spectrum;
        this.setupUniforms();
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }

    initGeometry() {
        // Create fullscreen quad
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);
        
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    }

    setupUniforms() {
        this.gl.useProgram(this.program);
        
        // Get uniform locations
        this.uniforms = {
            iTime: this.gl.getUniformLocation(this.program, 'iTime'),
            iResolution: this.gl.getUniformLocation(this.program, 'iResolution'),
            iFFT: this.gl.getUniformLocation(this.program, 'iFFT')
        };
        
        // Set up position attribute
        const positionAttribute = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(positionAttribute, 2, this.gl.FLOAT, false, 0, 0);
    }

    connectToAudio(audioContext, sourceNode) {
        if (this.analyser && sourceNode) {
            sourceNode.connect(this.analyser);
            // Still pass through to destination
            sourceNode.connect(audioContext.destination);
        }
    }

    switchShader(shaderName) {
        if (this.shaders[shaderName]) {
            this.program = this.shaders[shaderName];
            this.setupUniforms();
        }
    }

    start() {
        this.isActive = true;
        this.canvas.style.display = 'block';
        this.render();
    }

    stop() {
        this.isActive = false;
        this.canvas.style.display = 'none';
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    render() {
        if (!this.isActive) return;

        // Update FFT data
        if (this.analyser) {
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(dataArray);
            
            // Convert to normalized float array
            for (let i = 0; i < 128; i++) {
                this.fftData[i] = i < dataArray.length ? dataArray[i] / 255.0 : 0.0;
            }
        }

        // Set viewport
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Clear
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Enable blending for transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // Set uniforms
        const currentTime = (Date.now() - this.startTime) / 1000.0;
        this.gl.uniform1f(this.uniforms.iTime, currentTime);
        this.gl.uniform2f(this.uniforms.iResolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1fv(this.uniforms.iFFT, this.fftData);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        this.animationFrame = requestAnimationFrame(() => this.render());
    }

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        if (this.gl) {
            this.gl.deleteBuffer(this.vertexBuffer);
            Object.values(this.shaders).forEach(program => {
                this.gl.deleteProgram(program);
            });
        }
    }
}

// Export for use in other modules
window.AudioVisualizer = AudioVisualizer;