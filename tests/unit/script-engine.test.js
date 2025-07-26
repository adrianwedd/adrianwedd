/**
 * Unit tests for ScriptEngine
 * Tests scripting and automation framework functionality
 */

// Mock browser environment for ScriptEngine
global.window = {};

// Create proper jest mocks for localStorage
const localStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

global.localStorage = localStorageMock;

// Load ScriptEngine
require('../../assets/script-engine.js');
const ScriptEngine = global.window.ScriptEngine;

describe('ScriptEngine Tests', () => {
    let mockTerminal;
    let scriptEngine;

    beforeEach(() => {
        // Mock terminal interface
        mockTerminal = {
            addOutput: jest.fn(),
            executeCommand: jest.fn()
        };

        // Reset localStorage mocks
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);

        scriptEngine = new ScriptEngine(mockTerminal);
        // Clear any existing scripts
        scriptEngine.scripts.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Script Management', () => {
        test('should create new script', () => {
            const script = scriptEngine.createScript('test-script', 'echo "Hello World"', 'Test script');
            
            expect(script.name).toBe('test-script');
            expect(script.content).toBe('echo "Hello World"');
            expect(script.description).toBe('Test script');
            expect(script.executions).toBe(0);
            expect(script.created).toBeDefined();
            expect(script.modified).toBeDefined();
        });

        test('should list all scripts', () => {
            scriptEngine.createScript('script1', 'echo "1"');
            scriptEngine.createScript('script2', 'echo "2"');
            
            const scripts = scriptEngine.listScripts();
            expect(scripts).toHaveLength(2);
            expect(scripts[0].name).toBe('script1');
            expect(scripts[1].name).toBe('script2');
        });

        test('should get script by name', () => {
            scriptEngine.createScript('my-script', 'echo "test"');
            
            const script = scriptEngine.getScript('my-script');
            expect(script).toBeDefined();
            expect(script.name).toBe('my-script');
            expect(script.content).toBe('echo "test"');
        });

        test('should edit existing script', (done) => {
            scriptEngine.createScript('editable', 'echo "original"');
            
            // Wait a bit to ensure different timestamps
            const originalScript = scriptEngine.getScript('editable');
            const originalModified = originalScript.modified;
            
            // Wait to ensure different timestamp
            setTimeout(() => {
                const updated = scriptEngine.editScript('editable', 'echo "updated"');
                expect(updated.content).toBe('echo "updated"');
                expect(updated.modified).not.toBe(originalModified);
                done();
            }, 5);
        });

        test('should delete script', () => {
            scriptEngine.createScript('deletable', 'echo "delete me"');
            expect(scriptEngine.getScript('deletable')).toBeDefined();
            
            const result = scriptEngine.deleteScript('deletable');
            expect(result).toBe(true);
            expect(scriptEngine.getScript('deletable')).toBeUndefined();
        });

        test('should throw error when editing non-existent script', () => {
            expect(() => {
                scriptEngine.editScript('non-existent', 'new content');
            }).toThrow('Script \'non-existent\' not found');
        });

        test('should throw error when deleting non-existent script', () => {
            expect(() => {
                scriptEngine.deleteScript('non-existent');
            }).toThrow('Script \'non-existent\' not found');
        });
    });

    describe('Built-in Functions', () => {
        test('should have echo function', async () => {
            const echoFunc = scriptEngine.functions.get('echo');
            expect(echoFunc).toBeDefined();
            
            const result = await echoFunc(['Hello', 'World']);
            expect(result).toBe('Hello World');
        });

        test('should have wait function', async () => {
            const waitFunc = scriptEngine.functions.get('wait');
            expect(waitFunc).toBeDefined();
            
            const start = Date.now();
            await waitFunc(['100']);
            const elapsed = Date.now() - start;
            
            expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some tolerance
        });

        test('should have set and get functions', async () => {
            const setFunc = scriptEngine.functions.get('set');
            const getFunc = scriptEngine.functions.get('get');
            
            expect(setFunc).toBeDefined();
            expect(getFunc).toBeDefined();
            
            await setFunc(['myvar', 'test', 'value']);
            const result = await getFunc(['myvar']);
            
            expect(result).toBe('test value');
        });

        test('should have repeat function', async () => {
            const repeatFunc = scriptEngine.functions.get('repeat');
            expect(repeatFunc).toBeDefined();
            
            // Mock executeCommand to return predictable results
            scriptEngine.executeCommand = jest.fn().mockResolvedValue('executed');
            
            const result = await repeatFunc(['3', 'echo', 'test']);
            expect(result).toBe('executed\nexecuted\nexecuted');
        });
    });

    describe('Variable Handling', () => {
        test('should set and get variables', () => {
            scriptEngine.variables.set('testVar', 'testValue');
            expect(scriptEngine.variables.get('testVar')).toBe('testValue');
        });

        test('should substitute variables in strings', () => {
            scriptEngine.variables.set('name', 'Adrian');
            scriptEngine.variables.set('location', 'Tasmania');
            
            const result1 = scriptEngine.substituteVariables('Hello $name from $location');
            expect(result1).toBe('Hello Adrian from Tasmania');
            
            const result2 = scriptEngine.substituteVariables('Hello ${name} from ${location}');
            expect(result2).toBe('Hello Adrian from Tasmania');
        });

        test('should handle missing variables gracefully', () => {
            const result = scriptEngine.substituteVariables('Hello $missing variable');
            expect(result).toBe('Hello  variable');
        });
    });

    describe('Condition Evaluation', () => {
        test('should evaluate equality conditions', () => {
            scriptEngine.variables.set('var1', 'value1');
            scriptEngine.variables.set('var2', 'value1');
            
            expect(scriptEngine.evaluateCondition('$var1 == $var2')).toBe(true);
            expect(scriptEngine.evaluateCondition('$var1 == different')).toBe(false);
        });

        test('should evaluate inequality conditions', () => {
            scriptEngine.variables.set('var1', 'value1');
            
            expect(scriptEngine.evaluateCondition('$var1 != different')).toBe(true);
            expect(scriptEngine.evaluateCondition('$var1 != value1')).toBe(false);
        });

        test('should evaluate variable existence', () => {
            scriptEngine.variables.set('exists', 'value');
            
            expect(scriptEngine.evaluateCondition('-n exists')).toBe(true);
            expect(scriptEngine.evaluateCondition('-z missing')).toBe(true);
            expect(scriptEngine.evaluateCondition('-n missing')).toBe(false);
        });
    });

    describe('Expression Evaluation', () => {
        test('should evaluate numeric ranges', () => {
            const result = scriptEngine.evaluateExpression('1..5');
            expect(result).toEqual(['1', '2', '3', '4', '5']);
        });

        test('should evaluate space-separated lists', () => {
            const result = scriptEngine.evaluateExpression('apple banana cherry');
            expect(result).toEqual(['apple', 'banana', 'cherry']);
        });

        test('should substitute variables in expressions', () => {
            scriptEngine.variables.set('items', 'one two three');
            const result = scriptEngine.evaluateExpression('$items');
            expect(result).toEqual(['one', 'two', 'three']);
        });
    });

    describe('Script Execution', () => {
        test('should execute simple script', async () => {
            scriptEngine.createScript('simple', 'echo "Hello World"');
            
            // Mock parseAndExecute to avoid complex execution
            scriptEngine.parseAndExecute = jest.fn().mockResolvedValue('Hello World');
            
            const result = await scriptEngine.executeScript('simple');
            expect(result).toBe('Hello World');
            
            const script = scriptEngine.getScript('simple');
            expect(script.executions).toBe(1);
        });

        test('should handle script arguments', async () => {
            scriptEngine.createScript('with-args', 'echo $0 $1');
            
            // Mock parseAndExecute
            scriptEngine.parseAndExecute = jest.fn((content, args) => {
                // Simulate argument processing
                scriptEngine.variables.set('arg0', args[0]);
                scriptEngine.variables.set('$0', args[0]);
                return `${args[0]} ${args[1]}`;
            });
            
            const result = await scriptEngine.executeScript('with-args', ['first', 'second']);
            expect(result).toBe('first second');
        });

        test('should throw error for non-existent script', async () => {
            await expect(scriptEngine.executeScript('non-existent')).rejects.toThrow('Script \'non-existent\' not found');
        });

        test('should track running scripts', async () => {
            scriptEngine.createScript('long-running', 'wait 1000');
            
            // Start execution without waiting
            const promise = scriptEngine.executeScript('long-running');
            
            // Check that script is tracked as running
            const runningScripts = scriptEngine.getRunningScripts();
            expect(runningScripts.length).toBeGreaterThan(0);
            
            // Wait for completion and verify it's no longer running
            await promise;
            const runningAfter = scriptEngine.getRunningScripts();
            expect(runningAfter.length).toBe(0);
        });
    });

    describe('Debug Mode', () => {
        test('should toggle debug mode', () => {
            expect(scriptEngine.debugMode).toBe(false);
            
            scriptEngine.setDebugMode(true);
            expect(scriptEngine.debugMode).toBe(true);
            
            scriptEngine.setDebugMode(false);
            expect(scriptEngine.debugMode).toBe(false);
        });
    });

    describe('Script Statistics', () => {
        test('should calculate script statistics', () => {
            // Create fresh script engine for this test
            const freshEngine = new ScriptEngine(mockTerminal);
            
            freshEngine.createScript('script1', 'echo "test1"');
            freshEngine.createScript('script2', 'echo "test2"');
            
            // Simulate executions
            const script1 = freshEngine.getScript('script1');
            script1.executions = 5;
            const script2 = freshEngine.getScript('script2');
            script2.executions = 3;
            
            const stats = freshEngine.getScriptStats();
            expect(stats.totalScripts).toBe(2);
            expect(stats.totalExecutions).toBe(8);
            expect(stats.mostUsed).toBe('script1');
        });
    });

    describe('Import/Export', () => {
        test('should export script', () => {
            const script = scriptEngine.createScript('exportable', 'echo "export me"', 'Test export');
            
            const exported = scriptEngine.exportScript('exportable');
            expect(exported.name).toBe('exportable');
            expect(exported.content).toBe('echo "export me"');
            expect(exported.description).toBe('Test export');
            expect(exported.created).toBeDefined();
            expect(exported.modified).toBeDefined();
        });

        test('should import script', () => {
            const scriptText = 'echo "imported script"';
            const imported = scriptEngine.importScript('imported', scriptText);
            
            expect(imported.name).toBe('imported');
            expect(imported.content).toBe(scriptText);
            expect(imported.description).toBe('Imported script');
            
            const retrieved = scriptEngine.getScript('imported');
            expect(retrieved).toBeDefined();
            expect(retrieved.content).toBe(scriptText);
        });

        test('should throw error when exporting non-existent script', () => {
            expect(() => {
                scriptEngine.exportScript('non-existent');
            }).toThrow('Script \'non-existent\' not found');
        });
    });

    describe('Storage Integration', () => {
        test('should save scripts to localStorage', () => {
            scriptEngine.createScript('persistent', 'echo "save me"');
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'terminal-scripts',
                expect.stringContaining('persistent')
            );
        });

        test('should load scripts from localStorage', () => {
            const savedScripts = JSON.stringify([
                {
                    name: 'loaded-script',
                    content: 'echo "loaded"',
                    description: 'Loaded from storage',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    executions: 0,
                    public: false
                }
            ]);
            
            localStorageMock.getItem.mockReturnValue(savedScripts);
            
            const newEngine = new ScriptEngine(mockTerminal);
            const script = newEngine.getScript('loaded-script');
            
            expect(script).toBeDefined();
            expect(script.content).toBe('echo "loaded"');
        });

        test('should handle corrupted localStorage gracefully', () => {
            localStorageMock.getItem.mockReturnValue('invalid json');
            console.error = jest.fn(); // Mock console.error
            
            expect(() => {
                new ScriptEngine(mockTerminal);
            }).not.toThrow();
            
            expect(console.error).toHaveBeenCalled();
        });
    });
});