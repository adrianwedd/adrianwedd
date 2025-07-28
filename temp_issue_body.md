The UAT report and recent linting runs highlight several Playwright-related warnings in the test suite. These warnings indicate the use of less robust or non-idiomatic waiting strategies, which can lead to flaky tests and reduced maintainability.

**Specific Warnings Identified:**
- `Unexpected use of page.waitForTimeout()`: Direct use of fixed timeouts is generally discouraged as it makes tests brittle and slow.
- `Unexpected use of page.waitForSelector()`: While useful, its usage should be reviewed to ensure it's the most appropriate waiting strategy for the given scenario.
- `Unexpected use of networkidle`: Relying on network idle can be unreliable, especially in complex applications with continuous network activity.
- `Avoid calling expect conditionally` and `Avoid having conditionals in tests`: These indicate potential issues with test structure and clarity, making tests harder to understand and debug.
- `Test has no assertions` and `Unexpected use of the .skip() annotation`: Tests should have clear assertions, and skipped tests should either be implemented or removed if no longer relevant.

**Affected Code:**
- `tests/archived-broken-e2e/cross-browser.spec.js`
- `tests/archived-broken-e2e/system-monitor.spec.js`
- `tests/e2e/temp-terminal-test.spec.js`
- `tests/terminal.spec.js`
- `tests/unit/accessibility.test.js`
- `tests/unit/ai-service.test.js`
- `tests/unit/script-engine.test.js`

**Suggested Approaches:**
1.  **Replace `page.waitForTimeout()`:** Substitute fixed timeouts with more explicit and robust waiting conditions such as:
    *   `page.waitForSelector(selector, { state: 'visible' })` or `{ state: 'hidden' }`
    *   `page.waitForLoadState('networkidle')` (if absolutely necessary, but prefer more specific conditions)
    *   `page.waitForFunction(function)` to wait for a specific condition in the browser context.
2.  **Refine `page.waitForSelector()` usage:** Ensure it's used appropriately, perhaps combined with `expect(locator).toBeVisible()`.
3.  **Address `networkidle`:** Where possible, replace `networkidle` with more precise waiting for specific elements or API responses.
4.  **Refactor Conditional Expectations:** Restructure tests to avoid `expect` calls inside `if` statements or loops. Each test should ideally assert a single, clear outcome.
5.  **Remove Conditionals in Tests:** Simplify test logic to reduce conditional branching, making tests more deterministic.
6.  **Add Assertions:** For tests flagged with `Test has no assertions`, add clear and meaningful `expect` statements.
7.  **Review Skipped Tests:** Either implement the functionality for skipped tests or remove them if they are no longer relevant to the project.

**Status:**
- Title: Clear
- Labels: Normalized
- Linked Tasks: N/A
- Staleness: New Issue
