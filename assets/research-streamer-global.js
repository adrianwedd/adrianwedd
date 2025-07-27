class ResearchStreamer {
  constructor() {
    this.papers = [];
    this.currentStream = null;
    this.isStreaming = false;

    // Research sources configuration
    this.sources = {
      arxiv: {
        baseUrl: 'https://export.arxiv.org/api/query',
        categories: [
          'cs.AI', // Artificial Intelligence
          'cs.CL', // Computation and Language
          'cs.LG', // Machine Learning
          'cs.NE', // Neural and Evolutionary Computing
          'cs.RO', // Robotics
          'cs.HC', // Human-Computer Interaction
          'cs.SY', // Systems and Control
        ],
        maxResults: 20,
      },
      semanticScholar: {
        baseUrl: 'https://api.semanticscholar.org/graph/v1',
        fields: 'paperId,title,abstract,authors,venue,year,citationCount,url',
        maxResults: 15,
      },
    };

    // Adrian's research interests and keywords
    this.researchKeywords = [
      'recursive systems',
      'ai safety',
      'prompt engineering',
      'llm security',
      'agent architecture',
      'human-ai collaboration',
      'adversarial prompting',
      'neural architecture search',
      'federated learning',
      'edge computing',
      'sustainable ai',
      'neuromorphic computing',
      'quantum machine learning',
      'explainable ai',
      'multi-agent systems',
    ];

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
        this.fetchLatestPapers();
      },
      1000 * 60 * 60 * 4
    );

    // Initial fetch if cache is empty
    if (this.papers.length === 0) {
      this.fetchLatestPapers();
    }
  }

  async fetchLatestPapers() {
    console.log('Fetching latest research papers...');

    try {
      const [arxivPapers, semanticPapers] = await Promise.allSettled([
        this.fetchArxivPapers(),
        this.fetchSemanticScholarPapers(),
      ]);

      let newPapers = [];

      if (arxivPapers.status === 'fulfilled') {
        newPapers = newPapers.concat(arxivPapers.value);
      }

      if (semanticPapers.status === 'fulfilled') {
        newPapers = newPapers.concat(semanticPapers.value);
      }

      // Deduplicate and sort by relevance/date
      this.papers = this.deduplicateAndRank(newPapers);
      this.savePapersToCache();

      console.log(`Fetched ${this.papers.length} research papers`);
    } catch (error) {
      console.error('Failed to fetch research papers:', error);
    }
  }

  async fetchArxivPapers() {
    const keywords = this.researchKeywords.slice(0, 8); // Use top keywords
    const query = keywords.map((k) => `all:"${k}"`).join(' OR ');

    const url = `${this.sources.arxiv.baseUrl}?search_query=${encodeURIComponent(query)}&start=0&max_results=${this.sources.arxiv.maxResults}&sortBy=submittedDate&sortOrder=descending`;

    try {
      // Note: This will need a CORS proxy in production
      const response = await fetch(url);
      const xmlText = await response.text();

      return this.parseArxivXML(xmlText);
    } catch (error) {
      console.warn('ArXiv fetch failed, using mock data:', error);
      return this.generateMockArxivPapers();
    }
  }

  parseArxivXML(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const entries = doc.querySelectorAll('entry');

    return Array.from(entries).map((entry) => {
      const id = entry.querySelector('id')?.textContent || '';
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const summary = entry.querySelector('summary')?.textContent?.trim() || '';
      const published = entry.querySelector('published')?.textContent || '';
      const authors = Array.from(entry.querySelectorAll('author name')).map(
        (name) => name.textContent
      );
      const categories = Array.from(entry.querySelectorAll('category')).map((cat) =>
        cat.getAttribute('term')
      );

      return {
        id: id.split('/').pop(),
        title,
        abstract: summary,
        authors,
        venue: 'arXiv',
        year: new Date(published).getFullYear(),
        date: published,
        categories,
        url: id,
        source: 'arxiv',
        relevanceScore: this.calculateRelevanceScore(title + ' ' + summary),
      };
    });
  }

  async fetchSemanticScholarPapers() {
    const query = this.researchKeywords.slice(0, 5).join(' OR ');
    const url = `${this.sources.semanticScholar.baseUrl}/paper/search?query=${encodeURIComponent(query)}&limit=${this.sources.semanticScholar.maxResults}&fields=${this.sources.semanticScholar.fields}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.data.map((paper) => ({
        id: paper.paperId,
        title: paper.title,
        abstract: paper.abstract || '',
        authors: paper.authors?.map((a) => a.name) || [],
        venue: paper.venue || 'Unknown',
        year: paper.year,
        citationCount: paper.citationCount || 0,
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        source: 'semantic_scholar',
        relevanceScore: this.calculateRelevanceScore(paper.title + ' ' + (paper.abstract || '')),
      }));
    } catch (error) {
      console.warn('Semantic Scholar fetch failed, using mock data:', error);
      return this.generateMockSemanticPapers();
    }
  }

  calculateRelevanceScore(text) {
    const lowerText = text.toLowerCase();
    let score = 0;

    // Score based on keyword matches
    this.researchKeywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const matches = (lowerText.match(new RegExp(keywordLower, 'g')) || []).length;
      score += matches * 10;
    });

    // Bonus for recent papers (within last year)
    const currentYear = new Date().getFullYear();
    if (text.includes(currentYear.toString()) || text.includes((currentYear - 1).toString())) {
      score += 5;
    }

    // Bonus for AI safety and recursive systems (Adrian's specialties)
    if (lowerText.includes('ai safety') || lowerText.includes('recursive')) {
      score += 20;
    }

    return score;
  }

  deduplicateAndRank(papers) {
    const seen = new Set();
    const unique = papers.filter((paper) => {
      const key = paper.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 25); // Keep top 25 most relevant
  }

  startStreaming(targetElement) {
    if (this.isStreaming) return;

    this.isStreaming = true;
    this.currentStream = targetElement;

    if (this.papers.length === 0) {
      this.displayStreamingMessage('Fetching latest research papers...');
      this.fetchLatestPapers().then(() => {
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
