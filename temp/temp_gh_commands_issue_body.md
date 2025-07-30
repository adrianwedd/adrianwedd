The `gh-create`, `gh-list`, and `gh-sync` commands were removed from `availableCommands` in `assets/terminal.js` but their functionality is desired. This issue tracks their re-implementation.

**Current State:**
These commands are listed in `availableCommands` but their handlers are commented out or removed from the `switch` statement in `executeCommand`.

**Affected Code (example context from `assets/terminal.js`):**
```javascript
      case 'gemini':
        this.addDebugLog('Showing Gemini logo', 'info', 'command');
        this.showGeminiLogo();
        break;
      // case 'gh-create':
      //   this.addDebugLog('Handling gh-create command', 'info', 'command');
      //   this.handleGhCreateCommand(args);
      //   break;
      // case 'gh-list':
      //   this.addDebugLog('Handling gh-list command', 'info', 'command');
      //   this.handleGhListCommand(args);
      //   break;
      // case 'gh-sync':
      //   this.addDebugLog('Handling gh-sync command', 'info', 'command');
      //   this.handleGhSyncCommand(args);
      //   break;
      case 'adrian':
        this.addDebugLog('Showing Adrian logo', 'info', 'command');
        this.showAdrianLogo();
        break;
```

**Proposed Implementation:**
Implement `handleGhCreateCommand`, `handleGhListCommand`, and `handleGhSyncCommand` to provide direct GitHub issue management within the terminal.

**Labels:** `enhancement`, `priority: medium`, `command`, `github`