The terminal currently detects user preferences for reduced motion and high contrast, but the implementation for contrast sensitivity is incomplete in terms of CSS styling, and there are no user-facing controls for these accessibility options.

**Current State:**
- `assets/accessibility.js` detects `prefers-reduced-motion` and `prefers-contrast` media queries.
- The `reduced-motion` class is applied to `body` and corresponding CSS in `assets/terminal.css` disables animations.
- The `high-contrast` class is applied to `body` but lacks specific CSS rules in `assets/terminal.css` to enforce WCAG-compliant high contrast ratios.
- There are no explicit UI controls for users to manually enable/disable these accessibility options.

**Affected Files:**
- `assets/accessibility.js`
- `assets/terminal.css`
- `index.html` (for UI controls)

**Proposed Resolution:**
1.  **High Contrast Styling:**
    *   Add comprehensive CSS rules for the `.high-contrast` class in `assets/terminal.css` to ensure WCAG 2.1 AA compliant contrast ratios for all text and interactive elements.
    *   This may involve adjusting `color`, `background-color`, `border`, and `box-shadow` properties for various elements.
2.  **User-Facing Controls:**
    *   Implement new commands (e.g., `accessibility motion [on|off]`, `accessibility contrast [on|off]`) to allow users to manually toggle these settings.
    *   Consider adding a dedicated accessibility settings section in the `help` command output.
    *   Optionally, add a small UI element (e.g., a button or toggle) in `index.html` for quick access to these settings.
3.  **Accessibility Announcements:** Ensure that when these settings are toggled (either by system preference or user command), appropriate ARIA live region announcements are made to inform screen reader users.

**Labels:** `enhancement`, `priority: high`, `accessibility`, `type: enhancement`