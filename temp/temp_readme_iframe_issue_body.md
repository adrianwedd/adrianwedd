The `iframe` in `README.md` does not render on GitHub.com due to security restrictions in GitHub's Markdown rendering engine. This is not a bug in the application code but a platform limitation.

**Current State:**
The `README.md` contains an `iframe` pointing to `https://github.adrianwedd.com/`.

**Affected Code (from `README.md`):**
```markdown
<div align="center">
  <iframe 
    src="https://github.adrianwedd.com/" 
    width="100%" 
    height="600" 
    frameborder="0" 
    style="border: 2px solid #00ff41; border-radius: 8px; background: #000; max-width: 1200px;"
    title="Adrian Wedd Interactive Terminal">
  </iframe>
  
  <p><em>🖥️ Live terminal interface - Type `help` to get started!</em></p>
</div>
```

**Proposed Resolution:**
1.  **Option 1 (Recommended):** Replace the `iframe` with a static image (screenshot) of the terminal interface, linked to `https://github.adrianwedd.com/`. This provides a visual representation while ensuring compatibility with GitHub's rendering.
2.  **Option 2:** Remove the `iframe` and rely solely on the direct link provided in the `README.md`.

**Labels:** `wontfix`, `documentation`, `type: documentation`