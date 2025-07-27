# Terminal Interface Test Suite

This directory contains comprehensive Playwright tests for Adrian Wedd's interactive terminal interface.

## 🧪 Test Coverage

### Core Functionality Tests
- ✅ Terminal interface loading and initialization
- ✅ Boot sequence completion
- ✅ Command input and execution
- ✅ Command history navigation (↑/↓ arrows)
- ✅ Error handling for invalid commands

### Command Tests
- ✅ `help` - Properly formatted help display
- ✅ `about` - Personal information display
- ✅ `projects` - Technical projects showcase
- ✅ `skills` - Technical skills and tools
- ✅ `homestead` - Off-grid lifestyle information
- ✅ `veritas` - AI safety research details
- ✅ `neofetch` - System information with ASCII art
- ✅ `chat` - AI persona chat interface
- ✅ `matrix` - Matrix rain effect toggle
- ✅ `clear` - Terminal clearing functionality

### Interactive Features Tests
- ✅ Chat interface opening and functionality
- ✅ Matrix rain effect enable/disable
- ✅ Responsive design across different viewports
- ✅ Mobile and tablet compatibility

### Visual Regression Tests
- 📸 Screenshots captured for all major commands
- 📸 Mobile and tablet viewport screenshots
- 📸 Interactive features screenshots

## 🚀 Running Tests

### Quick Start
```bash
./run-tests.sh
```

### Manual Commands
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run tests with browser UI
npm run test:headed

# Debug tests
npm run test:debug

# View test report
npm run test:report

# Update screenshots
npm run screenshots
```

### Browser Coverage
- ✅ Chromium (Chrome)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## 📸 Screenshots

Test screenshots are automatically captured and saved to `tests/screenshots/`:

- `terminal-loaded.png` - Initial terminal interface
- `help-command.png` - Formatted help display
- `about-command.png` - About information
- `projects-command.png` - Projects showcase
- `skills-command.png` - Technical skills
- `homestead-command.png` - Off-grid lifestyle
- `veritas-command.png` - AI safety research
- `neofetch-command.png` - System information
- `chat-interface.png` - AI persona chat
- `matrix-rain-enabled.png` - Matrix effect
- `mobile-view.png` - Mobile responsive design
- `tablet-view.png` - Tablet responsive design

## 🔄 Continuous Integration

Tests run automatically on:
- ✅ Every push to main branch
- ✅ Every pull request
- ✅ Daily scheduled runs at 2 AM UTC
- ✅ Manual workflow dispatch

Results are uploaded as GitHub Actions artifacts and available for 30 days.

## 🐛 Debugging

### Test Failures
1. Check the HTML report: `npx playwright show-report`
2. Review screenshots in `tests/screenshots/`
3. Use debug mode: `npm run test:debug`
4. Check browser console logs in test output

### Local Development
```bash
# Run specific test file
npx playwright test terminal.spec.js

# Run specific test by name
npx playwright test --grep "should display properly formatted help"

# Run in headed mode to see browser
npx playwright test --headed

# Generate new screenshots
npx playwright test --update-snapshots
```

## 📋 Test Architecture

### Page Object Model
Tests use direct page interactions for simplicity while maintaining readability.

### Test Data
- Terminal commands are tested with realistic user interactions
- Screenshots provide visual regression testing
- Multiple browser engines ensure cross-platform compatibility

### Assertions
- Content visibility checks
- Text content validation
- Interactive element testing
- Responsive design verification

## 🔮 Future Enhancements

- [ ] LLM chat response testing (when API is configured)
- [ ] Performance metrics testing
- [ ] A11y (accessibility) testing
- [ ] Visual diff testing with screenshot comparison
- [ ] Load testing for concurrent users
- [ ] API endpoint testing for chat functionality