The terminal interface currently uses CSS media queries for basic mobile responsiveness. However, a truly touch-optimized experience requires more than just layout adjustments.

**Current State:**
- `assets/terminal.css` includes media queries for responsive layout on smaller screens.
- `assets/terminal.js` disables split-screen mode on mobile devices.
- No explicit touch event handling or gesture support is implemented.

**Affected Files:**
- `assets/terminal.css`
- `assets/terminal.js`
- `index.html` (for potential new UI elements)

**Proposed Resolution:**
Enhance the mobile experience with a touch-optimized interface by implementing:
1.  **Touch-Friendly Controls:**
    *   Review all interactive elements (buttons, input fields) and ensure they have sufficient size and spacing for touch targets.
    *   Adjust padding, margins, and font sizes in `assets/terminal.css` for better touch usability.
2.  **Gesture Support (Optional, but Recommended):**
    *   Implement common touch gestures for navigation or interaction (e.g., swipe left/right to navigate history or switch modes, long-press for context menus).
    *   This would involve adding event listeners for `touchstart`, `touchmove`, and `touchend` in `assets/terminal.js`.
3.  **Virtual Keyboard Handling:**
    *   Optimize the layout and scrolling behavior when the virtual keyboard appears and disappears to prevent content from being obscured.
4.  **Reduced Reliance on Hover States:**
    *   Ensure that critical information or functionality is not solely conveyed through hover states, as these are not available on touch devices.
5.  **Performance Optimization for Mobile:**
    *   Further optimize animations and resource loading for mobile devices to ensure a smooth experience.

**Labels:** `enhancement`, `priority: medium`, `type: enhancement`, `mobile`