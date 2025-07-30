The terminal currently lacks a comprehensive search and content indexing system. The existing `history search` is limited to command history, and there's no way to search the content of Markdown files or other dynamic content.

**Current State:**
- Only command history can be searched.
- Markdown content (`about.md`, `homestead.md`, `projects.md`, `skills.md`, `veritas.md`) is displayed but not indexed for search.

**Affected Files:**
- `assets/terminal.js` (for new search command and integration)
- `assets/markdown-loader.js` (potential indexing during load)
- `content/*.md` (content to be indexed)

**Proposed Resolution:**
Implement advanced search and content indexing by:
1.  **Content Indexing:**
    *   Develop a mechanism to index the content of Markdown files and potentially other dynamic content (e.g., AI responses, research papers).
    *   This could involve: 
        *   **Client-side indexing:** Using a library like Fuse.js or Lunr.js to create a searchable index in the browser. This would require loading all content into memory, which might be an issue for very large content sets.
        *   **Pre-built index:** Generating a search index during the build process (e.g., using a Node.js script) and serving it as a static file.
2.  **Advanced Search Command:**
    *   Introduce a new command (e.g., `search <query> [options]`) that allows users to search across all indexed content.
    *   Support advanced search options like: 
        *   Regular expressions.
        *   Filtering by content type (e.g., `search --type markdown`).
        *   Case-sensitive/insensitive search.
3.  **Search Result Display:**
    *   Display search results in a clear and concise manner, showing snippets of matching content and links to the source.
4.  **Integration with Existing Commands:**
    *   Consider integrating search capabilities into existing commands where relevant (e.g., `research search <query>`).

**Labels:** `enhancement`, `priority: high`, `type: enhancement`