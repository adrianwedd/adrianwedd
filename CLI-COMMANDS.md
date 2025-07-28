# 🖥️ CLI Commands Reference

Complete reference for all available terminal commands in the Adrian Wedd interactive terminal.

## 📋 Quick Start

Run the audit tools:
```bash
# Simple browser-based test
./run-cli-audit.sh

# Advanced Node.js test (requires puppeteer)
npm install puppeteer
node cli-test-audit.js
```

**⚠️ Boot Sequence:** The terminal requires 3-5 seconds to complete its boot sequence before commands can be executed. The test scripts automatically wait for `terminal.isBooting = false` before starting tests.

### 🆕 Enhanced Testing Features (v2.0)
- **Larger Terminal Frame**: 600px height for better command visibility
- **Persistent Reports**: Auto-saves results to localStorage and downloads JSON
- **GitHub Issue Creation**: Automatically generates issue URLs for failed commands
- **Better Command Sequencing**: 1.5s delays prevent command overlap
- **Enhanced Error Detection**: More comprehensive failure pattern matching

### 🔧 Recent Fixes (v2.1)
- **Restored Missing Commands**: Identified and restored `gh-create`, `gh-list`, `gh-sync` commands that were removed
- **Graceful Deprecation**: Deprecated GitHub commands now provide migration guidance and auto-redirect to modern `task` commands
- **Command Consistency**: All commands in `availableCommands` array now have proper switch case implementations

## 🎯 Command Categories

### 🔧 Basic System Commands

| Command | Description | Status | Notes |
|---------|-------------|--------|-------|
| `help` | Show available commands | ✅ Working | Core functionality |
| `about` | Display about information | ✅ Working | Loads markdown content |
| `whoami` | Show current user info | ✅ Working | Returns adrian info |
| `pwd` | Show current directory | ✅ Working | Virtual filesystem |
| `uptime` | Display system uptime | ✅ Working | Shows session time |
| `clear` | Clear terminal screen | ✅ Working | Resets display |
| `neofetch` | System information display | ✅ Working | ASCII art + stats |
| `ps` | Show running processes | ✅ Working | Mock process list |

### 📄 Content & Navigation

| Command | Description | Status | Notes |
|---------|-------------|--------|-------|
| `projects` | Show projects page | ✅ Working | Markdown content |
| `skills` | Display skills information | ✅ Working | Markdown content |
| `home` | Return to home page | ✅ Working | Markdown content |
| `veritas` | Show VERITAS project | ✅ Working | Markdown content |
| `adrian` | Display Adrian logo | ✅ Working | ASCII art |
| `ls` | List directory contents | ✅ Working | Virtual file listing |

### 🎮 Interactive Commands

| Command | Description | Status | Notes |
|---------|-------------|--------|-------|
| `chat` | Enter AI chat mode | ✅ Working | Opens chat interface |
| `monitor` | System monitoring interface | ✅ Working | Real-time dashboard |
| `split` | Split screen mode | ✅ Working | Desktop only |
| `boot` | Restart system | ✅ Working | Clears and reboots |
| `reboot` | System reboot | ✅ Working | Same as boot |
| `history` | Command history | ✅ Working | See subcommands below |

### 🎨 Media & Effects

| Command | Description | Status | Notes |
|---------|-------------|--------|-------|
| `music` | Music player controls | ✅ Working | WebAudio synthesis |
| `play` | Start music playback | ✅ Working | Alias for music |
| `stop` | Stop music/effects | ✅ Working | Stops all audio |
| `volume <0-1>` | Set audio volume | ✅ Working | 0.0 to 1.0 range |
| `matrix` | Toggle matrix rain | ✅ Working | Visual effect |
| `effects <type>` | Particle effects | ✅ Working | See effects below |
| `particles <type>` | Particle system | ✅ Working | Alias for effects |
| `theme <name>` | Change terminal theme | ✅ Working | See themes below |

### 🤖 AI & Voice Commands

| Command | Description | Status | Notes |
|---------|-------------|--------|-------|
| `voice <action>` | Voice interface control | ✅ Working | See voice commands |
| `speak <text>` | Text-to-speech | ✅ Working | Speaks provided text |
| `tokens` | Show AI token usage | ✅ Working | Usage statistics |
| `cache <action>` | Cache management | ✅ Working | See cache commands |
| `magic` | Daily magic content | ✅ Working | Random inspiration |
| `research <type>` | Research tools | ✅ Working | See research commands |

### 💻 Development Commands

| Command | Description | Status | Notes |
|---------|-------------|--------|-------|
| `script <action>` | Script management | ✅ Working | Built-in scripting |
| `edit <name>` | Script editor | ✅ Working | In-terminal editor |
| `exec <script>` | Execute script | ✅ Working | Run saved scripts |
| `grep <pattern>` | Search content | ✅ Working | Pattern matching |
| `tail <target>` | Show recent entries | ✅ Working | Last N lines |
| `cat <file>` | Display file content | ✅ Working | Show content |
| `debug <on/off>` | Debug panel toggle | ✅ Working | System debugging |

### 🐙 GitHub & CI Commands

| Command | Description | Status | Notes |
|---------|-------------|--------|-------|
| `actions` | GitHub Actions status | ✅ Working | Workflow information |
| `trigger <workflow>` | Trigger workflows | ✅ Working | Manual triggers |
| `runs` | Show workflow runs | ✅ Working | Recent executions |
| `ci <action>` | CI/CD management | ✅ Working | Pipeline control |
| `task <action>` | Enhanced GitHub issue management | ✅ Working | Modern replacement for gh-* |
| `gh-create` | Create GitHub issues | ⚠️ Deprecated | Auto-migrates to `task create` |
| `gh-list` | List GitHub issues | ⚠️ Deprecated | Auto-migrates to `task list` |
| `gh-sync` | Sync GitHub data | ⚠️ Deprecated | Auto-migrates to `task sync` |

### 🌤️ External Data Commands

| Command | Description | Status | Notes |
|---------|-------------|--------|-------|
| `weather` | Tasmania weather data | ✅ Working | BOM API integration |
| `gemini` | Show Gemini logo | ✅ Working | ASCII art display |

## 🔄 Command Subcommands

### Theme Commands
```bash
theme list          # Show available themes
theme matrix        # Matrix green theme
theme cyberpunk     # Cyberpunk purple theme
theme amber         # Amber retro theme
theme synthwave     # Synthwave pink theme
```

### Effects/Particles Commands
```bash
effects matrix      # Matrix rain effect
effects snow        # Snow particles
effects rain        # Rain drops
effects fireflies   # Floating lights
effects neural      # Neural network
```

### History Commands
```bash
history             # Show command history
history clear       # Clear history
history search <term> # Search history
```

### Cache Commands
```bash
cache stats         # Show cache statistics
cache clear         # Clear AI response cache
```

### Voice Commands
```bash
voice on           # Enable voice listening
voice off          # Disable voice listening
voice status       # Show voice status
voice rate <0-2>   # Set speech rate
voice pitch <0-2>  # Set speech pitch
voice volume <0-1> # Set speech volume
```

### Research Commands
```bash
research stream    # Start research stream
research search    # Search research papers
research list      # List available papers
research categories # Show categories
research stats     # Research statistics
research local     # Local papers only
research global    # Global papers only
research hybrid    # Mixed content
```

### Script Commands
```bash
script list        # List saved scripts
script create <name> # Create new script
script run <name>   # Execute script
script edit <name>  # Edit script
script delete <name> # Delete script
script show <name>  # Display script
script debug       # Toggle debug mode
script status      # Show script status
```

### CI Commands
```bash
ci status          # Show CI/CD status
ci logs           # View build logs
ci refresh        # Refresh CI status
ci workflows      # List workflows
```

## ⚠️ Known Issues

### Commands That May Appear to "Fail" in Tests

1. **Interactive Commands**: `chat`, `monitor`, `split`
   - These open new interfaces that automated tests can't easily detect
   - They work correctly but may show as "no output" in test results

2. **Async Commands**: `weather`, `research stream`
   - May take time to load external data
   - Could timeout in fast automated tests

3. **Permission-Required Commands**: Voice commands
   - Require browser permissions for microphone access
   - May fail in headless or restricted environments

4. **State-Dependent Commands**: `stop`, `reboot`
   - Depend on current system state
   - May not produce visible output if nothing is running

## 🧪 Testing Strategy

### Automated Testing
- Use `./run-cli-audit.sh` for quick browser-based testing
- Use `node cli-test-audit.js` for comprehensive Puppeteer testing
- Tests check for command output and error indicators
- Reports auto-save with timestamps and can generate GitHub issues
- Browser tests: Check "Show Terminal Frame" to watch command execution

### Manual Testing
- Interactive commands require manual verification
- Voice commands need microphone permissions
- Visual effects need human observation

### Expected Results
- **✅ Passed**: Command executes and produces expected output
- **❌ Failed**: Command produces error messages or indicators
- **💥 Error**: JavaScript errors or exceptions during execution
- **⚠️ No Output**: Command runs but produces no visible terminal output

## 📊 Performance Notes

- **Boot sequence**: 3-5 seconds initial startup time
- Most commands execute in < 100ms
- Content loading commands (markdown) may take 200-500ms
- External API calls (weather) can take 1-3 seconds
- Interactive mode transitions may take 500ms-1s

### Boot Sequence Detection
Test scripts use `terminal.isBooting` property to detect when commands can be executed:
```javascript
// Wait for boot completion
await page.waitForFunction(() => {
  return window.terminal && !window.terminal.isBooting;
});
```

## 🔧 Troubleshooting

### Common Issues
1. **Terminal not responding**: Refresh page and wait for boot sequence to complete
2. **Commands not working**: Ensure JavaScript is enabled and boot is complete
3. **Boot sequence stuck**: Press ESC to skip or refresh the page
4. **Voice not working**: Check microphone permissions
5. **Effects not showing**: Verify WebGL support

### Debug Mode
Enable debug mode with `debug on` to see:
- Internal command processing
- API calls and responses
- System state changes
- Error details

---

*Last updated: 2025-07-28*  
*For issues or feature requests, see the GitHub repository*