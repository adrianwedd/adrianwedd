/**
 * Terminal Scripting and Automation Framework
 * Provides built-in scripting capabilities for complex workflows and custom commands
 */

class ScriptEngine {
    constructor(terminal) {
        this.terminal = terminal;
        this.scripts = new Map();
        this.runningScripts = new Map();
        this.scriptLibrary = [];
        this.debugMode = false;
        this.variables = new Map();
        this.functions = new Map();
        this.loadScriptsFromStorage();
        this.initializeBuiltinFunctions();
    }

    // Load scripts from localStorage
    loadScriptsFromStorage() {
        try {
            const savedScripts = localStorage.getItem('terminal-scripts');
            if (savedScripts) {
                const scriptsData = JSON.parse(savedScripts);
                scriptsData.forEach(script => {
                    this.scripts.set(script.name, script);
                });
            }
        } catch (error) {
            console.error('Error loading scripts:', error);
        }
    }

    // Save scripts to localStorage
    saveScriptsToStorage() {
        try {
            const scriptsArray = Array.from(this.scripts.values());
            localStorage.setItem('terminal-scripts', JSON.stringify(scriptsArray));
        } catch (error) {
            console.error('Error saving scripts:', error);
        }
    }

    // Initialize built-in functions
    initializeBuiltinFunctions() {
        this.functions.set('echo', (args) => {
            return args.join(' ');
        });

        this.functions.set('wait', async (args) => {
            const duration = parseInt(args[0]) || 1000;
            await new Promise(resolve => setTimeout(resolve, duration));
            return `Waited ${duration}ms`;
        });

        this.functions.set('repeat', async (args) => {
            const count = parseInt(args[0]) || 1;
            const command = args.slice(1).join(' ');
            const results = [];
            
            for (let i = 0; i < count; i++) {
                const result = await this.executeCommand(command);
                results.push(result);
            }
            
            return results.join('\n');
        });

        this.functions.set('if', (args) => {
            // Simple conditional logic
            const condition = args[0];
            const thenCommand = args[1];
            const elseCommand = args[2] || '';
            
            if (this.evaluateCondition(condition)) {
                return this.executeCommand(thenCommand);
            } else if (elseCommand) {
                return this.executeCommand(elseCommand);
            }
            
            return '';
        });

        this.functions.set('set', (args) => {
            const varName = args[0];
            const value = args.slice(1).join(' ');
            this.variables.set(varName, value);
            return `Variable ${varName} set to: ${value}`;
        });

        this.functions.set('get', (args) => {
            const varName = args[0];
            return this.variables.get(varName) || '';
        });
    }

    // Create a new script
    createScript(name, content, description = '') {
        const script = {
            name,
            content,
            description,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            executions: 0,
            public: false
        };

        this.scripts.set(name, script);
        this.saveScriptsToStorage();
        return script;
    }

    // Edit an existing script
    editScript(name, content) {
        const script = this.scripts.get(name);
        if (!script) {
            throw new Error(`Script '${name}' not found`);
        }

        script.content = content;
        script.modified = new Date().toISOString();
        this.scripts.set(name, script);
        this.saveScriptsToStorage();
        return script;
    }

    // Delete a script
    deleteScript(name) {
        if (!this.scripts.has(name)) {
            throw new Error(`Script '${name}' not found`);
        }

        this.scripts.delete(name);
        this.saveScriptsToStorage();
        return true;
    }

    // List all scripts
    listScripts() {
        return Array.from(this.scripts.values());
    }

    // Get script content
    getScript(name) {
        return this.scripts.get(name);
    }

    // Execute a script
    async executeScript(name, args = []) {
        const script = this.scripts.get(name);
        if (!script) {
            throw new Error(`Script '${name}' not found`);
        }

        script.executions++;
        this.saveScriptsToStorage();

        const scriptId = Math.random().toString(36).substr(2, 9);
        this.runningScripts.set(scriptId, { name, startTime: Date.now() });

        try {
            const result = await this.parseAndExecute(script.content, args);
            this.runningScripts.delete(scriptId);
            return result;
        } catch (error) {
            this.runningScripts.delete(scriptId);
            throw error;
        }
    }

    // Parse and execute script content
    async parseAndExecute(content, args = []) {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
        const results = [];

        // Set script arguments as variables
        args.forEach((arg, index) => {
            this.variables.set(`arg${index}`, arg);
            this.variables.set(`$${index}`, arg);
        });
        this.variables.set('$@', args.join(' '));
        this.variables.set('$#', args.length.toString());

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (this.debugMode) {
                this.terminal.addOutput(`[DEBUG] Executing: ${line}`, 'debug');
            }

            try {
                const result = await this.executeLine(line);
                if (result !== null && result !== undefined && result !== '') {
                    results.push(result);
                }
            } catch (error) {
                const errorMsg = `Script error at line ${i + 1}: ${error.message}`;
                this.terminal.addOutput(errorMsg, 'error');
                if (this.debugMode) {
                    throw error;
                }
                results.push(errorMsg);
            }
        }

        return results.join('\n');
    }

    // Execute a single line of script
    async executeLine(line) {
        // Variable substitution
        line = this.substituteVariables(line);

        // Handle control structures
        if (line.startsWith('function ')) {
            return this.defineFunction(line);
        }

        if (line.startsWith('for ')) {
            return this.executeFor(line);
        }

        if (line.startsWith('while ')) {
            return this.executeWhile(line);
        }

        // Handle built-in functions
        const parts = line.split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        if (this.functions.has(command)) {
            return await this.functions.get(command)(args);
        }

        // Execute terminal command
        return await this.executeCommand(line);
    }

    // Variable substitution
    substituteVariables(line) {
        return line.replace(/\$\{([^}]+)\}/g, (match, varName) => {
            return this.variables.get(varName) || '';
        }).replace(/\$([a-zA-Z0-9_@#]+)/g, (match, varName) => {
            return this.variables.get(varName) || '';
        });
    }

    // Define a custom function
    defineFunction(line) {
        // function name(args) { ... }
        const match = line.match(/function\s+(\w+)\s*\((.*?)\)\s*\{(.*?)\}/);
        if (!match) {
            throw new Error('Invalid function syntax');
        }

        const [, name, params, body] = match;
        const paramList = params.split(',').map(p => p.trim()).filter(p => p);

        this.functions.set(name, async (args) => {
            // Set function parameters as variables
            paramList.forEach((param, index) => {
                this.variables.set(param, args[index] || '');
            });

            return await this.parseAndExecute(body, args);
        });

        return `Function ${name} defined`;
    }

    // Execute for loop
    async executeFor(line) {
        // for var in list; do commands; done
        const match = line.match(/for\s+(\w+)\s+in\s+(.+?);\s*do\s+(.+?);\s*done/);
        if (!match) {
            throw new Error('Invalid for loop syntax');
        }

        const [, varName, listExpr, commands] = match;
        const list = this.evaluateExpression(listExpr);
        const results = [];

        for (const item of list) {
            this.variables.set(varName, item);
            const result = await this.parseAndExecute(commands);
            if (result) results.push(result);
        }

        return results.join('\n');
    }

    // Execute while loop
    async executeWhile(line) {
        // while condition; do commands; done
        const match = line.match(/while\s+(.+?);\s*do\s+(.+?);\s*done/);
        if (!match) {
            throw new Error('Invalid while loop syntax');
        }

        const [, condition, commands] = match;
        const results = [];
        let iterations = 0;
        const maxIterations = 1000; // Prevent infinite loops

        while (this.evaluateCondition(condition) && iterations < maxIterations) {
            const result = await this.parseAndExecute(commands);
            if (result) results.push(result);
            iterations++;
        }

        return results.join('\n');
    }

    // Evaluate expression for lists
    evaluateExpression(expr) {
        expr = this.substituteVariables(expr);
        
        // Handle range: 1..10
        if (expr.match(/^\d+\.\.\d+$/)) {
            const [start, end] = expr.split('..').map(Number);
            return Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
        }

        // Handle space-separated list
        return expr.split(/\s+/);
    }

    // Evaluate condition
    evaluateCondition(condition) {
        condition = this.substituteVariables(condition);
        
        // Simple string comparisons
        if (condition.includes('==')) {
            const [left, right] = condition.split('==').map(s => s.trim());
            return left === right;
        }
        
        if (condition.includes('!=')) {
            const [left, right] = condition.split('!=').map(s => s.trim());
            return left !== right;
        }
        
        // Check if variable is set
        if (condition.startsWith('-z ')) {
            const varName = condition.slice(3).trim();
            return !this.variables.has(varName) || this.variables.get(varName) === '';
        }
        
        if (condition.startsWith('-n ')) {
            const varName = condition.slice(3).trim();
            return this.variables.has(varName) && this.variables.get(varName) !== '';
        }
        
        // Default: check if non-empty
        return condition !== '' && condition !== '0' && condition !== 'false';
    }

    // Execute terminal command
    async executeCommand(command) {
        return new Promise((resolve) => {
            // Capture current output
            const originalAddOutput = this.terminal.addOutput;
            const outputs = [];
            
            this.terminal.addOutput = function(text, type) {
                outputs.push({ text, type });
                originalAddOutput.call(this, text, type);
            };

            // Execute command
            this.terminal.executeCommand(command);
            
            // Restore original method
            this.terminal.addOutput = originalAddOutput;
            
            // Return captured output
            resolve(outputs.map(o => o.text).join('\n'));
        });
    }

    // Get running scripts
    getRunningScripts() {
        return Array.from(this.runningScripts.entries()).map(([id, info]) => ({
            id,
            ...info,
            duration: Date.now() - info.startTime
        }));
    }

    // Kill a running script
    killScript(scriptId) {
        if (this.runningScripts.has(scriptId)) {
            this.runningScripts.delete(scriptId);
            return true;
        }
        return false;
    }

    // Toggle debug mode
    setDebugMode(enabled) {
        this.debugMode = enabled;
        return `Debug mode ${enabled ? 'enabled' : 'disabled'}`;
    }

    // Import script from text
    importScript(name, scriptText) {
        try {
            const script = {
                name,
                content: scriptText,
                description: 'Imported script',
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                executions: 0,
                public: false
            };

            this.scripts.set(name, script);
            this.saveScriptsToStorage();
            return script;
        } catch (error) {
            throw new Error(`Failed to import script: ${error.message}`);
        }
    }

    // Export script to text
    exportScript(name) {
        const script = this.scripts.get(name);
        if (!script) {
            throw new Error(`Script '${name}' not found`);
        }

        return {
            name: script.name,
            content: script.content,
            description: script.description,
            created: script.created,
            modified: script.modified
        };
    }

    // Get script statistics
    getScriptStats() {
        const scripts = Array.from(this.scripts.values());
        return {
            totalScripts: scripts.length,
            totalExecutions: scripts.reduce((sum, s) => sum + s.executions, 0),
            mostUsed: scripts.sort((a, b) => b.executions - a.executions)[0]?.name || 'None',
            averageLength: Math.round(scripts.reduce((sum, s) => sum + s.content.length, 0) / scripts.length) || 0
        };
    }
}

// Export for use by other modules
window.ScriptEngine = ScriptEngine;