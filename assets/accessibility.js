/**
 * Accessibility enhancement utilities for terminal interface
 * WCAG 2.1 AA compliance with keyboard navigation and screen reader support
 */

/* global MutationObserver, Node */

class AccessibilityManager {
    constructor() {
        this.keyboardNavigationVisible = false;
        this.announcements = [];
        this.focusHistory = [];
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupAriaLiveRegions();
        this.setupFocusManagement();
        this.setupColorSchemeDetection();
        this.setupReducedMotion();
        this.setupScreenReaderDetection();
    }

    // Keyboard navigation detection and enhancement
    setupKeyboardNavigation() {
        // Detect when user starts using keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'Space' || e.key.startsWith('Arrow')) {
                this.enableKeyboardNavigation();
            }
        });

        // Detect when user switches to mouse
        document.addEventListener('mousedown', () => {
            this.disableKeyboardNavigation();
        });

        // Handle Escape key for modal/dialog closing
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });

        // Set up arrow key navigation for custom components
        this.setupArrowKeyNavigation();
    }

    enableKeyboardNavigation() {
        if (!this.keyboardNavigationVisible) {
            this.keyboardNavigationVisible = true;
            document.body.classList.add('keyboard-navigation-visible');
        }
    }

    disableKeyboardNavigation() {
        if (this.keyboardNavigationVisible) {
            this.keyboardNavigationVisible = false;
            document.body.classList.remove('keyboard-navigation-visible');
        }
    }

    // Arrow key navigation for terminal history and commands
    setupArrowKeyNavigation() {
        const commandInput = document.getElementById('commandInput');
        const commandInputSplit = document.getElementById('commandInputSplit');
        
        if (commandInput) {
            commandInput.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    this.handleHistoryNavigation(e);
                } else if (e.key === 'Tab' && !e.shiftKey) {
                    this.handleTabCompletion(e);
                }
            });
        }

        if (commandInputSplit) {
            commandInputSplit.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    this.handleHistoryNavigation(e);
                } else if (e.key === 'Tab' && !e.shiftKey) {
                    this.handleTabCompletion(e);
                }
            });
        }

        // Monitor interface navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('monitorInterface')?.style.display !== 'none') {
                this.handleMonitorNavigation(e);
            }
        });
    }

    handleTabCompletion(e) {
        const terminal = window.terminal;
        if (terminal && terminal.handleTabCompletion) {
            // Let terminal handle tab completion, announce result
            setTimeout(() => {
                const input = e.target;
                if (input.value !== input.dataset.previousValue) {
                    this.announce('Command completed', 'polite');
                }
                input.dataset.previousValue = input.value;
            }, 100);
        }
    }

    handleHistoryNavigation(e) {
        // This will be integrated with terminal history
        const terminal = window.terminal;
        
        if (terminal && terminal.commandHistory) {
            e.preventDefault();
            
            if (e.key === 'ArrowUp') {
                terminal.navigateHistory(-1);
                this.announce('Previous command selected', 'polite');
            } else if (e.key === 'ArrowDown') {
                terminal.navigateHistory(1);
                this.announce('Next command selected', 'polite');
            }
        }
    }

    handleMonitorNavigation(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const direction = e.key === 'ArrowRight' ? 1 : -1;
            this.navigateMonitorPanes(direction);
        }
    }

    navigateMonitorPanes(direction) {
        const panes = Array.from(document.querySelectorAll('.monitor-pane'));
        const currentIndex = panes.findIndex(pane => pane.contains(document.activeElement));
        const newIndex = Math.max(0, Math.min(panes.length - 1, currentIndex + direction));
        
        if (panes[newIndex]) {
            const focusable = panes[newIndex].querySelector('button, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                focusable.focus();
                this.announce(`Focused ${panes[newIndex].getAttribute('aria-label')}`, 'polite');
            }
        }
    }

    // ARIA live regions for dynamic content announcements
    setupAriaLiveRegions() {
        // Create announcement regions if they don't exist
        if (!document.getElementById('aria-live-polite')) {
            const politeRegion = document.createElement('div');
            politeRegion.id = 'aria-live-polite';
            politeRegion.setAttribute('aria-live', 'polite');
            politeRegion.className = 'sr-only';
            document.body.appendChild(politeRegion);
        }

        if (!document.getElementById('aria-live-assertive')) {
            const assertiveRegion = document.createElement('div');
            assertiveRegion.id = 'aria-live-assertive';
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.className = 'sr-only';
            document.body.appendChild(assertiveRegion);
        }
    }

    // Announce messages to screen readers
    announce(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
        const region = document.getElementById(regionId);
        
        if (region) {
            // Clear previous announcement
            region.textContent = '';
            
            // Add new announcement with slight delay for reliability
            setTimeout(() => {
                region.textContent = message;
            }, 100);

            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 5000);
        }

        // Track announcements for debugging
        this.announcements.push({
            message,
            priority,
            timestamp: new Date()
        });
    }

    // Focus management and restoration
    setupFocusManagement() {
        // Track focus changes
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push({
                element: e.target,
                timestamp: new Date()
            });

            // Limit history size
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });

        // Handle modal focus trapping
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabTrapping(e);
            }
        });
    }

    handleTabTrapping(e) {
        const modal = document.querySelector('[role="dialog"]:not([style*="display: none"])');
        
        if (modal) {
            const focusableElements = modal.querySelectorAll(
                'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    restoreFocus() {
        if (this.focusHistory.length > 1) {
            // Get previous focus (current is last, previous is second to last)
            const previousFocus = this.focusHistory[this.focusHistory.length - 2];
            if (previousFocus && previousFocus.element && document.contains(previousFocus.element)) {
                previousFocus.element.focus();
            }
        }
    }

    // Handle Escape key press
    handleEscape() {
        // Close modals/dialogs
        const modal = document.querySelector('[role="dialog"]:not([style*="display: none"])');
        if (modal) {
            const closeButton = modal.querySelector('[aria-label*="close"], [data-dismiss]');
            if (closeButton) {
                closeButton.click();
            } else {
                // Hide modal if no close button
                modal.style.display = 'none';
                this.restoreFocus();
            }
            return;
        }

        // Exit monitor mode
        if (document.getElementById('monitorInterface')?.style.display !== 'none') {
            window.terminal?.exitMonitor();
            return;
        }

        // Exit split screen
        if (document.getElementById('splitScreenContainer')?.style.display !== 'none') {
            window.terminal?.exitSplitMode();
            return;
        }
    }

    // Color scheme and theme detection
    setupColorSchemeDetection() {
        // Detect and respond to system color scheme changes
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

        darkModeQuery.addEventListener('change', (e) => {
            this.handleColorSchemeChange(e.matches ? 'dark' : 'light');
        });

        highContrastQuery.addEventListener('change', (e) => {
            this.handleContrastChange(e.matches);
        });

        // Initial setup
        this.handleColorSchemeChange(darkModeQuery.matches ? 'dark' : 'light');
        this.handleContrastChange(highContrastQuery.matches);
    }

    handleColorSchemeChange(scheme) {
        document.body.classList.toggle('force-dark-mode', scheme === 'dark');
        this.announce(`Switched to ${scheme} mode`, 'polite');
    }

    handleContrastChange(highContrast) {
        document.body.classList.toggle('high-contrast', highContrast);
        if (highContrast) {
            this.announce('High contrast mode enabled', 'polite');
        }
    }

    // Reduced motion detection
    setupReducedMotion() {
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        reducedMotionQuery.addEventListener('change', (e) => {
            this.handleReducedMotion(e.matches);
        });

        // Initial setup
        this.handleReducedMotion(reducedMotionQuery.matches);
    }

    handleReducedMotion(reduced) {
        document.body.classList.toggle('reduced-motion', reduced);
        
        if (reduced) {
            // Disable animations and effects
            this.disableAnimations();
            this.announce('Animations reduced for accessibility', 'polite');
        }
    }

    disableAnimations() {
        // Stop matrix rain effect
        if (window.terminal && window.terminal.matrixInterval) {
            clearInterval(window.terminal.matrixInterval);
        }

        // Disable particle effects
        if (window.particleEffects) {
            window.particleEffects.disable();
        }

        // Disable typewriter effects
        const style = document.createElement('style');
        style.textContent = `
            .typewriter-effect { animation: none !important; }
            .matrix-rain { display: none !important; }
            .particle-effect { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    // Screen reader detection and optimization
    setupScreenReaderDetection() {
        // Detect potential screen reader usage
        let isUsingScreenReader = false;

        // Check for screen reader specific navigation patterns
        document.addEventListener('keydown', (e) => {
            // Common screen reader shortcuts
            if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                isUsingScreenReader = true;
            }
            if (e.key === 'Tab' && e.altKey) {
                isUsingScreenReader = true;
            }
        });

        // Optimize for screen readers if detected
        setTimeout(() => {
            if (isUsingScreenReader) {
                this.optimizeForScreenReader();
            }
        }, 5000);
    }

    optimizeForScreenReader() {
        document.body.classList.add('screen-reader-optimized');
        
        // Add more descriptive text to complex elements
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            if (!canvas.getAttribute('aria-label')) {
                canvas.setAttribute('aria-label', 'Data visualization chart');
            }
            // Make charts focusable for keyboard navigation
            if (!canvas.hasAttribute('tabindex')) {
                canvas.setAttribute('tabindex', '0');
            }
        });

        // Enhance form labels
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputs.forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
                input.setAttribute('aria-label', placeholder);
            }
        });

        // Add heading structure where missing
        this.addMissingHeadings();
        
        // Enhance terminal output for screen readers
        this.enhanceTerminalAccessibility();

        this.announce('Screen reader optimizations enabled', 'polite');
    }

    addMissingHeadings() {
        // Convert pane titles to proper headings if not already
        const paneTitles = document.querySelectorAll('.pane-title:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)');
        paneTitles.forEach((title) => {
            if (title.tagName !== 'H2') {
                const h2 = document.createElement('h2');
                h2.className = title.className;
                h2.id = title.id;
                h2.innerHTML = title.innerHTML;
                title.parentNode.replaceChild(h2, title);
            }
        });
    }

    enhanceTerminalAccessibility() {
        // Add terminal output region with live updates
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.setAttribute('role', 'log');
            terminal.setAttribute('aria-label', 'Terminal output');
            
            // Monitor for new terminal output
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE && 
                                (node.classList.contains('output-line') || 
                                 node.classList.contains('command-line'))) {
                                // Announce new terminal output to screen readers
                                const text = node.textContent?.trim();
                                if (text && text.length > 0) {
                                    this.announce(`Terminal: ${text}`, 'polite');
                                }
                            }
                        });
                    }
                });
            });
            
            observer.observe(terminal, { childList: true, subtree: true });
            this.terminalObserver = observer;
        }
    }

    // Utility methods for components
    addAriaLabel(element, label) {
        if (element) {
            element.setAttribute('aria-label', label);
        }
    }

    addAriaDescription(element, description) {
        if (element) {
            const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
            const descElement = document.createElement('div');
            descElement.id = descId;
            descElement.className = 'sr-only';
            descElement.textContent = description;
            document.body.appendChild(descElement);
            element.setAttribute('aria-describedby', descId);
        }
    }

    makeModalAccessible(modal) {
        if (!modal) return;

        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        // Set focus to first focusable element
        const firstFocusable = modal.querySelector('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    // Error handling and validation
    showError(element, message) {
        if (!element) return;

        // Remove existing error
        this.clearError(element);

        // Add error class
        element.classList.add('error');
        element.setAttribute('aria-invalid', 'true');

        // Create error message
        const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;
        const errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        element.parentNode.appendChild(errorElement);
        element.setAttribute('aria-describedby', errorId);

        // Announce error
        this.announce(`Error: ${message}`, 'assertive');
    }

    clearError(element) {
        if (!element) return;

        element.classList.remove('error');
        element.removeAttribute('aria-invalid');
        
        const errorId = element.getAttribute('aria-describedby');
        if (errorId) {
            const errorElement = document.getElementById(errorId);
            if (errorElement && errorElement.classList.contains('field-error')) {
                errorElement.remove();
                element.removeAttribute('aria-describedby');
            }
        }
    }

    // Progress indication
    updateProgress(percentage, label = 'Progress') {
        let progressBar = document.getElementById('global-progress');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'global-progress';
            progressBar.className = 'progress sr-only';
            progressBar.setAttribute('role', 'progressbar');
            progressBar.innerHTML = '<div class="progress-bar"></div>';
            document.body.appendChild(progressBar);
        }

        progressBar.setAttribute('aria-valuenow', percentage);
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        progressBar.setAttribute('aria-label', `${label}: ${percentage}%`);
        
        const bar = progressBar.querySelector('.progress-bar');
        if (bar) {
            bar.style.width = `${percentage}%`;
        }

        // Show progress for screen readers
        if (percentage === 100) {
            this.announce(`${label} completed`, 'polite');
            setTimeout(() => {
                progressBar.classList.add('sr-only');
            }, 1000);
        } else {
            progressBar.classList.remove('sr-only');
        }
    }

    // Dynamic content accessibility enhancement
    enhanceDynamicContent() {
        // Monitor for dynamic content changes and enhance accessibility
        const contentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.enhanceElement(node);
                        }
                    });
                }
            });
        });

        // Observe the entire document for changes
        contentObserver.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
        
        this.contentObserver = contentObserver;
    }

    enhanceElement(element) {
        // Add missing ARIA labels to buttons without them
        const buttons = element.querySelectorAll ? element.querySelectorAll('button:not([aria-label])') : [];
        buttons.forEach(button => {
            const text = button.textContent?.trim() || button.getAttribute('title') || 'Button';
            button.setAttribute('aria-label', text);
        });

        // Add role and labels to charts/canvases
        const canvases = element.querySelectorAll ? element.querySelectorAll('canvas:not([role])') : [];
        canvases.forEach(canvas => {
            canvas.setAttribute('role', 'img');
            if (!canvas.getAttribute('aria-label')) {
                canvas.setAttribute('aria-label', 'Data visualization chart');
            }
            canvas.setAttribute('tabindex', '0');
        });

        // Enhance progress bars
        const progressBars = element.querySelectorAll ? element.querySelectorAll('.progress-bar:not([role])') : [];
        progressBars.forEach(bar => {
            const parent = bar.parentElement;
            if (parent && !parent.getAttribute('role')) {
                parent.setAttribute('role', 'progressbar');
                parent.setAttribute('aria-valuemin', '0');
                parent.setAttribute('aria-valuemax', '100');
            }
        });
    }

    // Cleanup method for observers
    cleanup() {
        if (this.terminalObserver) {
            this.terminalObserver.disconnect();
        }
        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
    }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Enhance dynamic content
accessibilityManager.enhanceDynamicContent();

// Export for use by other components
window.accessibilityManager = accessibilityManager;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    accessibilityManager.cleanup();
});