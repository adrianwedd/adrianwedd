# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing
- `npm test` - Run Playwright end-to-end tests
- `npm run test:e2e` - Run only e2e tests in `/tests/e2e/`
- `npm run test:unit` - Run unit tests in `/tests/unit/`
- `npm run test:headed` - Run tests with browser UI visible
- `npm run test:debug` - Run tests in debug mode with breakpoints
- `npm run test:report` - View HTML test report

### Quality & Linting
- `npm run lint` - ESLint code linting
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format-check` - Check code formatting
- `npm run lint:css` - Lint CSS files with Stylelint

### Build & Deployment
- `npm run build` - Build for production (copies files to dist/)
- `npm run lhci` - Run Lighthouse CI performance audits

## Architecture Overview

This is an interactive terminal interface application built with vanilla JavaScript that simulates a retro computing experience. The architecture follows a modular client-side approach:

### Core Application Structure
- **Main Terminal Class** (`assets/terminal.js`): Central controller managing command execution, UI state, and integrations
- **AI Service** (`assets/ai-service.js`): Advanced LLM integration with prompt caching and token optimization
- **Voice Interface** (`assets/voice-interface.js`): Speech recognition and synthesis with wake word detection
- **Music System** (`assets/music-player.js`, `assets/audio-visualizer.js`): WebGL-powered audio synthesis and visualization
- **System Monitor** (`assets/system-monitor.js`): Real-time monitoring interface with CI/CD integration
- **Script Engine** (`assets/script-engine.js`): Built-in scripting language with automation capabilities
- **Script Editor** (`assets/script-editor.js`): In-terminal code editor with syntax highlighting

### Key Design Patterns
- **Command Pattern**: Terminal commands mapped to handler methods
- **Observer Pattern**: Voice interface, music player, and effects systems communicate via events
- **Caching Strategy**: AI service implements sophisticated prompt caching following Anthropic best practices
- **Modular Effects**: Particle systems, audio visualizers, and themes are separate, configurable modules

### External Integrations
- **GitHub Actions**: Live CI/CD status monitoring and workflow triggering
- **Bureau of Meteorology API**: Real-time Tasmania weather data
- **Claude AI**: Advanced conversational AI with context preservation
- **Web Audio API**: Real-time audio synthesis and FFT analysis
- **Web Speech API**: Voice recognition and text-to-speech

### Data Flow
1. User input ’ Terminal command parser ’ Command handlers
2. AI requests ’ Caching layer ’ External AI service ’ Response streaming
3. Voice commands ’ Wake word detection ’ Command execution
4. System data ’ GitHub/BOM APIs ’ Real-time dashboard updates

### Testing Strategy
- **E2E Tests**: Playwright tests covering full user workflows across browsers and devices
- **Unit Tests**: Focused testing of individual modules (AI service, music player, script engine, etc.)
- **Accessibility**: Automated a11y testing integrated into the pipeline
- **Performance**: Lighthouse CI monitoring with performance budgets

### Development Guidelines
- All JavaScript follows ES6+ modern patterns
- No build tools required - pure vanilla JS architecture
- Progressive enhancement: core functionality works without advanced features
- Mobile-first responsive design with desktop optimizations
- Terminal-authentic UX: no scroll bars, authentic command-line interactions

### Content Management
- Markdown content loaded dynamically from `/content/` directory
- Research papers and documentation in `/research/` 
- AI responses cached in `/ai-responses/responses.json`
- Daily automated content generation via GitHub Actions

## GitHub Issue & PR Guidelines

### Issue and PR Titles
- **Always start with relevant emojis** to categorize and enhance readability
- Examples:
  - = Bug: Fix terminal input focus issue
  - ( Feature: Add advanced command completion
  - <¨ UI: Improve mobile responsiveness
  - =Ý Docs: Update API documentation
  - =' Refactor: Optimize script engine performance
  - >ê Test: Add comprehensive AI service tests

### Closing Issues and PRs
When closing GitHub issues or PRs, **always include comprehensive summaries** with:

#### Required Elements:
-  **Completed features breakdown** - List all implemented functionality
- =€ **New functionality overview** - Highlight key new capabilities
- =¡ **Usage examples** - Provide concrete code examples where applicable
- =Ê **Technical metrics** - Include test coverage, performance data, file counts
- <¯ **Key highlights** - Summarize the most important achievements

#### Template Format:
```markdown
<‰ **[Feature/Fix Name] Successfully Implemented!**

##  Implementation Complete

###  [Acceptance Criteria 1]
- Detailed description of what was built
- Technical implementation notes

###  [Acceptance Criteria 2]
- Another completed item
- Technical details

## =€ New Functionality
- Feature 1: Description
- Feature 2: Description

## =¡ Usage Examples
```bash
# Example command usage
command --option value
```

## =Ê Technical Metrics
- **Coverage**: X% (Y/Z tests passing)
- **Files Added/Modified**: N files
- **Lines of Code**: ~X lines

## <¯ Key Highlights
- Important achievement 1
- Important achievement 2

Implementation completed in commit: [hash]

> Completed with [Claude Code](https://claude.ai/code)
```

### Benefits
- **Documentation**: Creates excellent project history and knowledge base
- **Readability**: Emojis make scanning and categorization much easier
- **Context**: Future developers understand what was built and why
- **Quality**: Demonstrates thoroughness and attention to detail

When working with this codebase, focus on maintaining the authentic terminal aesthetic while ensuring modern web standards and accessibility. Always follow the GitHub guidelines above for consistent, professional documentation.