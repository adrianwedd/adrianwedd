The `runs` command is intended to be a subcommand of `actions` (i.e., `actions runs`). Its direct invocation as a top-level command is deprecated and should be removed from `availableCommands`.

**Current State:**
`runs` is listed in `availableCommands` and has a `handleRunsCommand` handler. However, the `help` output explicitly states to use `actions runs`.

**Affected Code (example context from `assets/terminal.js`):**
```javascript
            case 'actions':
                this.addDebugLog(`Handling actions command with args: ${parts.slice(1).join(' ')}`, 'info', 'command');
                this.handleActionsCommand(parts.slice(1));
                break;
            case 'trigger':
                this.addDebugLog(`Handling trigger command with args: ${parts.slice(1).join(' ')}`, 'info', 'command');
                this.handleTriggerCommand(parts.slice(1));
                break;
            case 'runs':
                this.addDebugLog(`Handling runs command with args: ${parts.slice(1).join(' ')}`, 'info', 'command');
                this.handleRunsCommand(parts.slice(1));
                break;
```

**Proposed Resolution:**
1.  Remove `runs` from the `availableCommands` array.
2.  Remove the `case 'runs':` block from the `executeCommand` switch statement.
3.  Ensure `handleRunsCommand` is only called via `handleActionsCommand` when `actions runs` is invoked.

**Labels:** `bug`, `semantic-drift`, `priority: medium`, `type: bug`