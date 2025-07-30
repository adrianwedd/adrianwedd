The `gh-list` command is present in `availableCommands` and the `executeCommand` switch statement, but its functionality to list GitHub issues is not fully implemented. This issue tracks its proper implementation.

**Current State:**
`gh-list` is recognized by the terminal, but its `handleGhListCommand` likely contains placeholder or incomplete logic.

**Affected Code (example context from `assets/terminal.js`):**
```javascript
            case 'gh-create':
                this.addDebugLog(`Handling gh-create command with args: ${args.join(' ')}`, 'info', 'command');
                this.handleGhCreateCommand(args);
                break;
            case 'gh-list':
                this.addDebugLog(`Handling gh-list command with args: ${args.join(' ')}`, 'info', 'command');
                this.handleGhListCommand(args);
                break;
            case 'gh-sync':
                this.addDebugLog(`Handling gh-sync command with args: ${args.join(' ')}`, 'info', 'command');
                this.handleGhSyncCommand(args);
                break;
```

**Proposed Resolution:**
Implement `handleGhListCommand` to:
1.  Parse arguments for filtering issues (e.g., by state, labels, assignee).
2.  Utilize the GitHub API to fetch a list of issues.
3.  Display the issues in a clear, formatted manner within the terminal.
4.  Explore potential subcommands for `gh-list`, such as `gh-list open`, `gh-list closed`, `gh-list assigned me`, etc.

**Labels:** `enhancement`, `priority: medium`, `type: enhancement`, `codex`