The project currently uses Playwright for end-to-end testing and is configured to take screenshots on failure. However, explicit visual diff testing with screenshot comparison is not yet implemented.

**Current State:**
- Playwright is configured in `playwright.config.cjs` to capture screenshots on test failures.
- Existing e2e tests (`temp-terminal-test.spec.js`, `terminal-core.spec.js`) do not appear to contain visual assertions.

**Affected Files:**
- `playwright.config.cjs`
- `tests/e2e/*.spec.js`

**Proposed Resolution:**
Implement visual diff testing with screenshot comparison using Playwright's built-in capabilities:
1.  **Configure Playwright for Visual Regression:**
    *   Ensure `playwright.config.cjs` is set up to manage screenshots for comparison (e.g., `testDir` for snapshots).
2.  **Add Visual Assertions to Tests:**
    *   For critical UI components or full pages, add `await expect(page).toHaveScreenshot()` assertions to e2e tests.
    *   This will capture a screenshot during the test run and compare it against a baseline image. If there are differences, the test will fail, and a diff image will be generated.
3.  **Manage Baseline Images:**
    *   Establish a process for managing baseline screenshots (e.g., committing them to version control, updating them when UI changes are intentional).
4.  **Integrate into CI/CD:**
    *   Ensure visual regression tests run as part of the CI/CD pipeline to catch unintended UI changes early.

**Labels:** `test`, `priority: medium`, `type: enhancement`