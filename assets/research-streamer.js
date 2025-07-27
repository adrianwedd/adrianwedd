class ResearchStreamer {
  constructor() {
    this.papers = [];
    this.currentStream = null;
    this.isStreaming = false;
    // Cache for recent papers
    this.paperCache = new Map();
    this.cacheExpiry = 1000 * 60 * 60 * 6; // 6 hours
    this.init();
  }

  init() {
    // Load cached papers from localStorage
    this.loadCachedPapers();

    // Set up periodic refresh
    this.setupPeriodicRefresh();
  }

  loadCachedPapers() {
    try {
      const cached = localStorage.getItem('research_papers_cache');
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < this.cacheExpiry) {
          this.papers = data.papers;
          console.log(`Loaded ${this.papers.length} cached papers`);
        }
      }
    } catch (error) {
      console.warn('Failed to load cached papers:', error);
    }
  }

  savePapersToCache() {
    try {
      const cacheData = {
        papers: this.papers,
        timestamp: Date.now(),
      };
      localStorage.setItem('research_papers_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache papers:', error);
    }
  }

  setupPeriodicRefresh() {
    // Refresh papers every 4 hours
    setInterval(
      () => {
        this.loadLocalMarkdownPapers();
      },
      1000 * 60 * 60 * 4
    );
    // Initial fetch if cache is empty
    if (this.papers.length === 0) {
      this.loadLocalMarkdownPapers();
    }
  }

  // Loads local markdown documents from /research/index.json
  async loadLocalMarkdownPapers() {
    console.log('Loading local markdown research papers...');
    try {
      const response = await fetch('/research/index.json');
      if (!response.ok) throw new Error('Could not load research/index.json');
      const filenames = await response.json(); // Should be array of filenames
      // Fetch all markdown files in parallel
      const paperPromises = filenames.map(async (filename) => {
        const fileResp = await fetch(`/research/${filename}`);
        if (!fileResp.ok) throw new Error(`Could not load ${filename}`);
        const content = await fileResp.text();
        // Dummy values for metadata
        const title = filename
          .replace(/\.md$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return {
          id: filename,
          title: title,
          abstract: content,
          authors: ['Unknown Author'],
          venue: 'Local Markdown',
          year: '', // Optionally parse from filename if desired
          date: '',
          categories: [],
          citationCount: 0,
          url: `/research/${filename}`,
          source: 'local_markdown',
          relevanceScore: 0, // Default value
        };
      });
      const papers = await Promise.all(paperPromises);
      this.papers = this.deduplicateAndRank(papers);
      this.savePapersToCache();
      console.log(`Loaded ${this.papers.length} local research markdown papers`);
    } catch (error) {
      console.error('Failed to load local markdown papers:', error);
    }
  }

  // No-op for local markdown: assign default value
  calculateRelevanceScore() {
    return 0;
  }

  deduplicateAndRank(papers) {
    const seen = new Set();
    const unique = papers.filter((paper) => {
      const key = paper.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Sort alphabetically by title, or by date if available
    return unique.sort((a, b) => {
      if (a.date && b.date) {
        return (b.date || '').localeCompare(a.date || '');
      }
      return (a.title || '').localeCompare(b.title || '');
    });
  }

  startStreaming(targetElement) {
    if (this.isStreaming) return;
    this.isStreaming = true;
    this.currentStream = targetElement;
    if (this.papers.length === 0) {
      this.displayStreamingMessage('Loading local research markdown papers...');
      this.loadLocalMarkdownPapers().then(() => {
        this.renderPaperStream();
      });
    } else {
      this.renderPaperStream();
    }
  }

  stopStreaming() {
    this.isStreaming = false;
    this.currentStream = null;
  }

  renderPaperStream() {
    if (!this.currentStream || !this.isStreaming) return;

    const html = this.papers
      .map((paper, index) => {
        const relevanceClass =
          paper.relevanceScore > 30
            ? 'high-relevance'
            : paper.relevanceScore > 15
              ? 'medium-relevance'
              : 'low-relevance';

        const authorsList =
          paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ' et al.' : '');

        return `
                <div class="research-paper ${relevanceClass}" data-index="${index}">
                    <div class="paper-header">
                        <div class="paper-title">${this.truncateText(paper.title, 80)}</div>
                        <div class="paper-meta">
                            <span class="paper-venue">${paper.venue}</span>
                            <span class="paper-year">${paper.year}</span>
                            ${paper.citationCount ? `<span class="paper-citations">${paper.citationCount} cites</span>` : ''}
                        </div>
                    </div>
                    <div class="paper-authors">${authorsList}</div>
                    <div class="paper-abstract">${this.truncateText(paper.abstract, 200)}</div>
                    <div class="paper-footer">
                        <span class="paper-source">${paper.source}</span>
                        <span class="paper-relevance">Relevance: ${paper.relevanceScore}</span>
                        <a href="${paper.url}" target="_blank" class="paper-link">Read →</a>
                    </div>
                </div>
            `;
      })
      .join('');

    this.currentStream.innerHTML = html;

    // Add click handlers for paper interaction
    this.setupPaperInteraction();
  }

  setupPaperInteraction() {
    if (!this.currentStream) return;

    this.currentStream.querySelectorAll('.research-paper').forEach((paperEl) => {
      paperEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('paper-link')) return;

        const index = parseInt(paperEl.dataset.index);
        const paper = this.papers[index];
        this.displayPaperDetails(paper);
      });
    });
  }

  displayPaperDetails(paper) {
    if (window.terminal) {
      window.terminal.addOutput('', 'info');
      window.terminal.addOutput('📄 RESEARCH PAPER DETAILS', 'success');
      window.terminal.addOutput('', 'info');
      window.terminal.addOutput(`Title: ${paper.title}`, 'info');
      window.terminal.addOutput(`Authors: ${paper.authors.join(', ')}`, 'info');
      window.terminal.addOutput(`Venue: ${paper.venue} (${paper.year})`, 'info');
      if (paper.citationCount) {
        window.terminal.addOutput(`Citations: ${paper.citationCount}`, 'info');
      }
      window.terminal.addOutput('', 'info');
      window.terminal.addOutput('Abstract:', 'command');
      window.terminal.addOutput(paper.abstract, 'info');
      window.terminal.addOutput('', 'info');
      window.terminal.addOutput(`URL: ${paper.url}`, 'info');
      window.terminal.addOutput(`Relevance Score: ${paper.relevanceScore}`, 'success');
      window.terminal.addOutput('', 'info');
    }
  }

  displayStreamingMessage(message) {
    if (this.currentStream) {
      this.currentStream.innerHTML = `
                <div class="streaming-message">
                    <div class="loading-spinner">⟳</div>
                    <div class="message-text">${message}</div>
                </div>
            `;
    }
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
  }

  // Mock data generators for development/fallback
  generateMockArxivPapers() {
    return [
      {
        id: 'mock-arxiv-1',
        title: 'Recursive Neural Architecture Search for Adversarial Robustness',
        abstract:
          'We propose a recursive approach to neural architecture search that optimizes for both performance and adversarial robustness through iterative self-improvement cycles.',
        authors: ['A. Smith', 'B. Johnson', 'C. Davis'],
        venue: 'arXiv',
        year: 2024,
        url: 'https://arxiv.org/abs/mock-1',
        source: 'arxiv',
        relevanceScore: 45,
      },
      {
        id: 'mock-arxiv-2',
        title: 'LLM Safety Through Recursive Prompt Verification',
        abstract:
          'A novel framework for ensuring large language model safety by implementing recursive verification of prompt intentions and output alignment.',
        authors: ['D. Wilson', 'E. Brown'],
        venue: 'arXiv',
        year: 2024,
        url: 'https://arxiv.org/abs/mock-2',
        source: 'arxiv',
        relevanceScore: 50,
      },
    ];
  }

  generateMockSemanticPapers() {
    return [
      {
        id: 'mock-semantic-1',
        title: 'Human-AI Collaboration in Recursive System Design',
        abstract:
          'Exploring how humans and AI systems can collaboratively design recursive architectures that improve through self-modification and learning.',
        authors: ['F. Taylor', 'G. Anderson'],
        venue: 'ICML',
        year: 2024,
        citationCount: 23,
        url: 'https://example.com/paper1',
        source: 'semantic_scholar',
        relevanceScore: 40,
      },
    ];
  }

  // Public API methods
  getPapers() {
    return this.papers;
  }

  getTopPapersByRelevance(count = 10) {
    return this.papers.slice(0, count);
  }

  searchPapers(query) {
    const lowerQuery = query.toLowerCase();
    return this.papers.filter(
      (paper) =>
        paper.title.toLowerCase().includes(lowerQuery) ||
        paper.abstract.toLowerCase().includes(lowerQuery) ||
        paper.authors.some((author) => author.toLowerCase().includes(lowerQuery))
    );
  }
}

// Export for use in other modules
window.ResearchStreamer = ResearchStreamer;
