The `grep` command is present in `availableCommands` and the `executeCommand` switch statement, but its functionality is entirely missing. This issue tracks its full implementation.

**Current State:**
`grep` is recognized by the terminal, but the `handleGrepCommand` function is not defined, resulting in no action when invoked.

**Affected Code (example context from `assets/terminal.js`):**
```javascript
            case 'exec':
                this.addDebugLog(`Handling exec command with args: ${args.join(' ')}`, 'info', 'command');
                this.handleExecCommand(args);
                break;
            case 'grep':
                this.addDebugLog(`Handling grep command with args: ${args.join(' ')}`, 'info', 'command');
                this.handleGrepCommand(args);
                break;
            case 'tail':
                this.addDebugLog(`Handling tail command with args: ${args.join(' ')}`, 'info', 'command');
                this.handleTailCommand(args);
                break;
```

**Proposed Resolution:**
Implement `handleGrepCommand` to:
1.  Parse arguments for the search pattern and optional file paths/glob patterns.
2.  Read file contents (or command output if piping is implemented).
3.  Perform regular expression matching.
4.  Display matching lines with file paths and line numbers.
5.  Consider subcommands for common `grep` options (e.g., `-i` for case-insensitive, `-r` for recursive, `-v` for invert match).

**Labels:** `enhancement`, `priority: high`, `type: enhancement`