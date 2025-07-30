The `task show` command is intended to display detailed information about a specific GitHub issue. While the command is recognized, its functionality is currently incomplete.

**Current State:**
The `task show` command in `assets/terminal.js` outputs a placeholder message indicating it's not yet fully implemented.

**Affected Code (example context from `assets/terminal.js`):**
```javascript
                case 'show':
                    this.addDebugLog('Showing GitHub issue details', 'info', 'task');
                    // Current implementation for 'show' is missing or incomplete
                    this.addOutput('Task show command is not yet fully implemented.', 'warning');
                    break;
```

**Proposed Resolution:**
Implement the `task show <issue_number>` command to:
1.  Parse the `issue_number` argument.
2.  Utilize the `githubTaskManager` to fetch details of the specified GitHub issue.
3.  Display the issue details (title, body, state, labels, assignees, comments, etc.) in a clear and formatted manner within the terminal.
4.  Handle cases where the issue number is invalid or the issue does not exist.

**Labels:** `enhancement`, `priority: high`, `type: enhancement`