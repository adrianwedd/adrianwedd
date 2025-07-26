/**
 * Script Editor with Syntax Highlighting
 * Provides an in-terminal code editor for writing and managing scripts
 */

class ScriptEditor {
    constructor(terminal, scriptEngine) {
        this.terminal = terminal;
        this.scriptEngine = scriptEngine;
        this.isEditorOpen = false;
        this.currentScript = null;
        this.editorElement = null;
        this.textArea = null;
        this.statusBar = null;
        this.lineNumbers = null;
        this.initializeEditor();
    }

    // Initialize the editor interface
    initializeEditor() {
        this.createEditorElement();
        this.setupKeyboardShortcuts();
    }

    // Create the editor DOM structure
    createEditorElement() {
        this.editorElement = document.createElement('div');
        this.editorElement.id = 'scriptEditor';
        this.editorElement.className = 'script-editor';
        this.editorElement.style.display = 'none';
        
        this.editorElement.innerHTML = `
            <div class="editor-header">
                <div class="editor-title">
                    <span class="title-text">📝 Script Editor</span>
                    <span class="script-name" id="currentScriptName">New Script</span>
                </div>
                <div class="editor-controls">
                    <button class="editor-btn" id="saveScript">💾 Save</button>
                    <button class="editor-btn" id="runScript">▶️ Run</button>
                    <button class="editor-btn" id="newScript">📄 New</button>
                    <button class="editor-btn" id="loadScript">📂 Load</button>
                    <button class="editor-btn" id="closeEditor">✕ Close</button>
                </div>
            </div>
            
            <div class="editor-content">
                <div class="editor-sidebar">
                    <div class="line-numbers" id="lineNumbers"></div>
                </div>
                <div class="editor-main">
                    <textarea id="scriptTextArea" class="script-textarea" placeholder="# Write your script here...
# Available commands:
# - All terminal commands
# - Built-in functions: echo, wait, repeat, if, set, get
# - Variables: $varname or \${varname}
# - Control structures: for, while, function
# - Comments start with #

echo 'Hello from script!'
set message 'This is a variable'
echo \${message}"></textarea>
                </div>
            </div>
            
            <div class="editor-status-bar" id="editorStatusBar">
                <span class="status-item">Line: <span id="currentLine">1</span></span>
                <span class="status-item">Col: <span id="currentCol">1</span></span>
                <span class="status-item">Lines: <span id="totalLines">1</span></span>
                <span class="status-item">Length: <span id="scriptLength">0</span></span>
                <span class="status-help">Ctrl+S: Save | Ctrl+R: Run | Ctrl+N: New | Ctrl+O: Load | Esc: Close</span>
            </div>
        `;

        document.body.appendChild(this.editorElement);

        // Get references to elements
        this.textArea = document.getElementById('scriptTextArea');
        this.statusBar = document.getElementById('editorStatusBar');
        this.lineNumbers = document.getElementById('lineNumbers');

        this.setupEditorEvents();
        this.updateLineNumbers();
    }

    // Setup editor event listeners
    setupEditorEvents() {
        // Text area events
        this.textArea.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateStatusBar();
            this.applySyntaxHighlighting();
        });

        this.textArea.addEventListener('keydown', (e) => {
            this.handleEditorKeydown(e);
        });

        this.textArea.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.textArea.scrollTop;
        });

        // Button events
        document.getElementById('saveScript').addEventListener('click', () => this.saveCurrentScript());
        document.getElementById('runScript').addEventListener('click', () => this.runCurrentScript());
        document.getElementById('newScript').addEventListener('click', () => this.newScript());
        document.getElementById('loadScript').addEventListener('click', () => this.showLoadDialog());
        document.getElementById('closeEditor').addEventListener('click', () => this.closeEditor());

        // Update status bar on cursor movement
        this.textArea.addEventListener('selectionchange', () => this.updateStatusBar());
        this.textArea.addEventListener('click', () => this.updateStatusBar());
        this.textArea.addEventListener('keyup', () => this.updateStatusBar());
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEditorOpen) return;

            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentScript();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.runCurrentScript();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newScript();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.showLoadDialog();
                        break;
                }
            } else if (e.key === 'Escape') {
                this.closeEditor();
            }
        });
    }

    // Handle editor-specific keydown events
    handleEditorKeydown(e) {
        // Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.textArea.selectionStart;
            const end = this.textArea.selectionEnd;
            const value = this.textArea.value;
            
            if (e.shiftKey) {
                // Remove indentation
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                const lineText = value.substring(lineStart, end);
                if (lineText.startsWith('    ')) {
                    this.textArea.value = value.substring(0, lineStart) + 
                                         lineText.substring(4) + 
                                         value.substring(end);
                    this.textArea.selectionStart = start - 4;
                    this.textArea.selectionEnd = end - 4;
                }
            } else {
                // Add indentation
                this.textArea.value = value.substring(0, start) + '    ' + value.substring(end);
                this.textArea.selectionStart = this.textArea.selectionEnd = start + 4;
            }
            
            this.updateLineNumbers();
            this.updateStatusBar();
        }

        // Auto-completion for common patterns
        if (e.key === 'Enter') {
            const start = this.textArea.selectionStart;
            const value = this.textArea.value;
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const lineText = value.substring(lineStart, start);
            
            // Auto-indent based on previous line
            const indentMatch = lineText.match(/^(\s*)/);
            if (indentMatch) {
                setTimeout(() => {
                    const currentStart = this.textArea.selectionStart;
                    const currentValue = this.textArea.value;
                    this.textArea.value = currentValue.substring(0, currentStart) + 
                                         indentMatch[1] + 
                                         currentValue.substring(currentStart);
                    this.textArea.selectionStart = this.textArea.selectionEnd = currentStart + indentMatch[1].length;
                    this.updateLineNumbers();
                    this.updateStatusBar();
                }, 0);
            }
        }
    }

    // Update line numbers
    updateLineNumbers() {
        const lines = this.textArea.value.split('\n');
        const lineNumbersHtml = lines.map((_, index) => 
            `<div class="line-number">${index + 1}</div>`
        ).join('');
        
        this.lineNumbers.innerHTML = lineNumbersHtml;
        
        // Update total lines in status bar
        const totalLinesElement = document.getElementById('totalLines');
        if (totalLinesElement) {
            totalLinesElement.textContent = lines.length;
        }
    }

    // Update status bar
    updateStatusBar() {
        const start = this.textArea.selectionStart;
        const value = this.textArea.value;
        
        // Calculate line and column
        const beforeCursor = value.substring(0, start);
        const line = beforeCursor.split('\n').length;
        const lastNewline = beforeCursor.lastIndexOf('\n');
        const col = start - lastNewline;

        // Update status bar elements
        const currentLineElement = document.getElementById('currentLine');
        const currentColElement = document.getElementById('currentCol');
        const scriptLengthElement = document.getElementById('scriptLength');

        if (currentLineElement) currentLineElement.textContent = line;
        if (currentColElement) currentColElement.textContent = col;
        if (scriptLengthElement) scriptLengthElement.textContent = value.length;
    }

    // Basic syntax highlighting
    applySyntaxHighlighting() {
        // This is a simple implementation - in a real scenario you'd want a proper syntax highlighter
        const content = this.textArea.value;
        
        // Add CSS classes for different syntax elements
        this.textArea.style.background = this.generateHighlightedBackground(content);
    }

    // Generate highlighted background (simplified)
    generateHighlightedBackground(_content) {
        // For now, just return default - proper syntax highlighting would require overlay elements
        return '';
    }

    // Open the editor
    openEditor(scriptName = null) {
        this.isEditorOpen = true;
        this.editorElement.style.display = 'block';
        
        if (scriptName) {
            this.loadScript(scriptName);
        } else {
            this.newScript();
        }
        
        this.textArea.focus();
        this.terminal.addOutput('📝 Script editor opened. Use Ctrl+S to save, Ctrl+R to run, Esc to close.', 'info');
    }

    // Close the editor
    closeEditor() {
        this.isEditorOpen = false;
        this.editorElement.style.display = 'none';
        this.currentScript = null;
        
        // Focus back to terminal
        const commandInput = document.getElementById('commandInput');
        if (commandInput) {
            commandInput.focus();
        }
        
        this.terminal.addOutput('📝 Script editor closed.', 'info');
    }

    // Create new script
    newScript() {
        this.currentScript = null;
        this.textArea.value = '';
        document.getElementById('currentScriptName').textContent = 'New Script';
        this.updateLineNumbers();
        this.updateStatusBar();
    }

    // Load existing script
    loadScript(name) {
        const script = this.scriptEngine.getScript(name);
        if (!script) {
            this.terminal.addOutput(`❌ Script '${name}' not found`, 'error');
            return;
        }

        this.currentScript = script;
        this.textArea.value = script.content;
        document.getElementById('currentScriptName').textContent = script.name;
        this.updateLineNumbers();
        this.updateStatusBar();
        this.terminal.addOutput(`📂 Loaded script: ${name}`, 'success');
    }

    // Save current script
    saveCurrentScript() {
        const content = this.textArea.value.trim();
        if (!content) {
            this.terminal.addOutput('❌ Cannot save empty script', 'error');
            return;
        }

        let scriptName;
        if (this.currentScript) {
            scriptName = this.currentScript.name;
            this.scriptEngine.editScript(scriptName, content);
            this.terminal.addOutput(`💾 Script '${scriptName}' saved`, 'success');
        } else {
            // Prompt for name
            scriptName = window.prompt('Enter script name:');
            if (!scriptName) return;
            
            if (this.scriptEngine.getScript(scriptName)) {
                if (!window.confirm(`Script '${scriptName}' already exists. Overwrite?`)) {
                    return;
                }
            }
            
            this.currentScript = this.scriptEngine.createScript(scriptName, content, 'User created script');
            document.getElementById('currentScriptName').textContent = scriptName;
            this.terminal.addOutput(`💾 Script '${scriptName}' created and saved`, 'success');
        }
    }

    // Run current script
    async runCurrentScript() {
        const content = this.textArea.value.trim();
        if (!content) {
            this.terminal.addOutput('❌ Cannot run empty script', 'error');
            return;
        }

        this.terminal.addOutput('▶️ Running script...', 'info');
        
        try {
            if (this.currentScript) {
                await this.scriptEngine.executeScript(this.currentScript.name);
            } else {
                // Create temporary script
                const tempName = `temp_${Date.now()}`;
                this.scriptEngine.createScript(tempName, content, 'Temporary script');
                await this.scriptEngine.executeScript(tempName);
                this.scriptEngine.deleteScript(tempName);
            }
            
            this.terminal.addOutput('✅ Script execution completed', 'success');
        } catch (error) {
            this.terminal.addOutput(`❌ Script execution failed: ${error.message}`, 'error');
        }
    }

    // Show load dialog
    showLoadDialog() {
        const scripts = this.scriptEngine.listScripts();
        if (scripts.length === 0) {
            this.terminal.addOutput('📂 No scripts available', 'info');
            return;
        }

        this.terminal.addOutput('📂 Available scripts:', 'info');
        scripts.forEach((script, index) => {
            this.terminal.addOutput(`  ${index + 1}. ${script.name} - ${script.description}`, 'info');
        });

        const choice = window.prompt(`Enter script name or number (1-${scripts.length}):`);
        if (!choice) return;

        let scriptName;
        if (/^\d+$/.test(choice)) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < scripts.length) {
                scriptName = scripts[index].name;
            }
        } else {
            scriptName = choice;
        }

        if (scriptName) {
            this.loadScript(scriptName);
        }
    }

    // Get editor statistics
    getEditorStats() {
        return {
            isOpen: this.isEditorOpen,
            currentScript: this.currentScript?.name || null,
            contentLength: this.textArea?.value.length || 0,
            lineCount: this.textArea?.value.split('\n').length || 0
        };
    }
}

// Export for use by other modules
window.ScriptEditor = ScriptEditor;