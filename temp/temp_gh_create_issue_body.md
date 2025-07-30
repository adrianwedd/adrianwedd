The `gh-create` command is present in `availableCommands` and the `executeCommand` switch statement, but its functionality to create GitHub issues is not fully implemented. This issue tracks its proper implementation.

**Current State:**
`gh-create` is recognized by the terminal, but its `handleGhCreateCommand` likely contains placeholder or incomplete logic.

**Affected Code (example context from `assets/terminal.js`):**
```javascript
            case 'gemini':
                this.addDebugLog('Showing Gemini logo', 'info', 'command');
                this.showGeminiLogo();
                break;
            case 'gh-create':
                this.addDebugLog(`Handling gh-create command with args: ${args.join(' ')}`, 'info', 'command');
                this.handleGhCreateCommand(args);
                break;
            case 'gh-list':
                this.addDebugLog(`Handling gh-list command with args: ${args.join(' ')}`, 'info', 'command');
                this.handleGhListCommand(args);
                break;
```

**Proposed Resolution:**
Implement `handleGhCreateCommand` to:
1.  Parse arguments for issue title, body, labels, and assignees.
2.  Utilize the GitHub API (likely via `githubTaskManager` or `githubActionsManager`) to create a new issue.
3.  Provide appropriate feedback to the user (success/failure messages).
4.  Explore potential subcommands for `gh-create`, such as `gh-create bug`, `gh-create feature`, etc., to pre-populate issue templates or labels.

**Labels:** `enhancement`, `priority: medium`, `type: enhancement`, `codex`