The `reboot` command currently plays the bootup sequence but does not clear the terminal screen beforehand.

**Current State:**
- The `reboot` command (and `boot`) triggers `startBootSequence()` after a delay.
- The terminal content is not cleared before the boot sequence begins.

**Affected Code (example context from `assets/terminal.js`):**
```javascript
            case 'boot':
            case 'reboot':
                this.addDebugLog('Restarting system', 'info', 'command');
                this.addOutput('🔄 Restarting system...', 'info');
                this.addOutput('', 'info');
                setTimeout(() => {
                    this.startBootSequence();
                }, 500);
                break;
```

**Proposed Resolution:**
Add `this.clearTerminal()` before `this.startBootSequence()` in the `boot` and `reboot` command handlers to ensure the screen is cleared before the bootup sequence is played.

**Labels:** `enhancement`, `priority: low`, `type: enhancement`