class MarkdownLoader {
    constructor() {
        this.contentCache = new Map();
        this.cacheExpiry = 1000 * 60 * 60; // 1 hour cache expiry
        
        // Content mapping - maps commands to markdown files
        this.contentMap = {
            'about': 'content/about.md',
            'projects': 'content/projects.md', 
            'skills': 'content/skills.md',
            'homestead': 'content/homestead.md',
            'veritas': 'content/veritas.md'
        };
        
        this.init();
    }

    init() {
        // Load cached content from localStorage
        this.loadCachedContent();
        
        // Preload critical content
        this.preloadContent(['about', 'projects']);
    }

    loadCachedContent() {
        try {
            const cached = localStorage.getItem('markdown_content_cache');
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < this.cacheExpiry) {
                    this.contentCache = new Map(data.content);
                    console.log(`Loaded ${this.contentCache.size} cached markdown files`);
                }
            }
        } catch (error) {
            console.warn('Failed to load cached markdown content:', error);
        }
    }

    saveContentToCache() {
        try {
            const cacheData = {
                content: Array.from(this.contentCache.entries()),
                timestamp: Date.now()
            };
            localStorage.setItem('markdown_content_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache markdown content:', error);
        }
    }

    async preloadContent(keys) {
        const promises = keys.map(key => this.loadContent(key));
        await Promise.allSettled(promises);
    }

    async loadContent(key) {
        // Check cache first
        const cached = this.contentCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.content;
        }

        const filePath = this.contentMap[key];
        if (!filePath) {
            throw new Error(`No content mapping found for key: ${key}`);
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status}`);
            }
            
            const markdown = await response.text();
            const html = this.markdownToHtml(markdown);
            
            // Cache the content
            this.contentCache.set(key, {
                content: html,
                markdown: markdown,
                timestamp: Date.now()
            });
            
            this.saveContentToCache();
            return html;
            
        } catch (error) {
            console.warn(`Failed to load markdown content for ${key}:`, error);
            // Return fallback content
            return this.getFallbackContent(key);
        }
    }

    // Simple markdown to HTML conversion
    markdownToHtml(markdown) {
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Code blocks
        html = html.replace(/```(.*?)\n([\s\S]*?)\n```/g, '<pre class="code-block"><code>$2</code></pre>');
        
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" class="markdown-link">$1</a>');
        
        // Lists
        html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre.*<\/pre>)<\/p>/g, '$1');
        
        return html;
    }

    getFallbackContent(key) {
        const fallbacks = {
            'about': `
                <h2>Adrian Wedd - Systems Architect</h2>
                <p>Neurodivergent (ADHD/Autism) systems thinker building the future of human-AI collaboration.</p>
                <p>Currently architecting LLM-powered agent systems and conducting AI safety research.</p>
            `,
            'projects': `
                <h2>Active Projects</h2>
                <ul>
                    <li><strong>TicketSmith</strong> - LLM-powered Jira/Confluence automation</li>
                    <li><strong>Personal Intelligence Node</strong> - This interactive terminal interface</li>
                    <li><strong>VERITAS</strong> - AI safety research & jailbreak simulation</li>
                </ul>
            `,
            'skills': `
                <h2>Technical Arsenal</h2>
                <p><strong>AI/ML:</strong> GPT-x, LangChain, Vector DBs</p>
                <p><strong>Languages:</strong> Python, JavaScript, Rust, Go</p>
                <p><strong>Infrastructure:</strong> Docker, Kubernetes, AWS</p>
            `,
            'homestead': `
                <h2>Tasmania Off-Grid Homestead</h2>
                <p><strong>Location:</strong> 170 acres of Tasmanian bushland</p>
                <p><strong>Power:</strong> Solar + Battery + Backup generator</p>
                <p><strong>Philosophy:</strong> Technology should enhance, not dominate, natural systems</p>
            `,
            'veritas': `
                <h2>VERITAS - AI Safety Research</h2>
                <p><strong>Mission:</strong> Understanding LLM vulnerabilities through systematic testing</p>
                <p><strong>Approach:</strong> Recursive jailbreak simulation & safety analysis</p>
                <p><em>"Truth emerges through systematic probing of boundaries."</em></p>
            `
        };
        
        return fallbacks[key] || '<p>Content not available</p>';
    }

    // Convert HTML back to terminal-friendly format
    htmlToTerminal(html) {
        let text = html;
        
        // Remove HTML tags and convert to terminal formatting
        text = text.replace(/<h1>(.*?)<\/h1>/g, '\n🏛️  $1\n');
        text = text.replace(/<h2>(.*?)<\/h2>/g, '\n📋 $1\n');
        text = text.replace(/<h3>(.*?)<\/h3>/g, '\n▶️  $1\n');
        
        text = text.replace(/<strong>(.*?)<\/strong>/g, '$1');
        text = text.replace(/<em>(.*?)<\/em>/g, '$1');
        
        text = text.replace(/<code class="inline-code">(.*?)<\/code>/g, '`$1`');
        text = text.replace(/<pre class="code-block"><code>(.*?)<\/code><\/pre>/gs, '\n```\n$1\n```\n');
        
        text = text.replace(/<li>(.*?)<\/li>/g, '• $1');
        text = text.replace(/<ul>(.*?)<\/ul>/gs, '$1');
        
        text = text.replace(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/g, '$2 ($1)');
        
        text = text.replace(/<p>(.*?)<\/p>/g, '$1\n');
        text = text.replace(/<br\s*\/?>/g, '\n');
        
        // Clean up extra newlines
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.trim();
        
        return text;
    }

    async renderContentToTerminal(key, terminal) {
        try {
            const html = await this.loadContent(key);
            const terminalText = this.htmlToTerminal(html);
            
            // Split into lines and add with appropriate classes
            const lines = terminalText.split('\n');
            lines.forEach(line => {
                if (line.startsWith('🏛️') || line.startsWith('📋') || line.startsWith('▶️')) {
                    terminal.addOutput(line, 'success');
                } else if (line.startsWith('•')) {
                    terminal.addOutput(line, 'info');
                } else if (line.startsWith('```')) {
                    terminal.addOutput(line, 'command');
                } else if (line.trim()) {
                    terminal.addOutput(line, 'info');
                } else {
                    terminal.addOutput('', 'info');
                }
            });
        } catch (error) {
            terminal.addOutput(`❌ Failed to load content: ${error.message}`, 'error');
        }
    }

    // Check if content exists
    hasContent(key) {
        return this.contentMap.hasOwnProperty(key);
    }

    // Get available content keys
    getAvailableContent() {
        return Object.keys(this.contentMap);
    }

    // Refresh content (clear cache and reload)
    async refreshContent(key) {
        this.contentCache.delete(key);
        return await this.loadContent(key);
    }

    // Batch refresh all content
    async refreshAllContent() {
        this.contentCache.clear();
        const keys = Object.keys(this.contentMap);
        const promises = keys.map(key => this.loadContent(key));
        await Promise.allSettled(promises);
    }
}

// Export for use in other modules
window.MarkdownLoader = MarkdownLoader;