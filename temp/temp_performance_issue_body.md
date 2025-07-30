The project currently lacks dedicated performance metrics testing. While Playwright is used for e2e tests, it is not configured for performance assertions.

**Current State:**
- No performance metrics are collected or asserted during test runs.
- Existing Playwright tests focus on functional correctness.

**Affected Files:**
- `playwright.config.cjs`
- `tests/e2e/*.spec.js` (or new performance test files)

**Proposed Resolution:**
Implement performance metrics testing using Playwright, potentially integrating with Lighthouse or other performance tools:
1.  **Choose Performance Metrics:** Identify key performance indicators (KPIs) relevant to the terminal interface (e.g., page load time, script execution time, rendering performance, responsiveness).
2.  **Integrate Performance APIs:** Utilize Playwright's `page.metrics()` or `page.evaluate()` with browser performance APIs (e.g., `performance.timing`, `performance.getEntriesByType('paint')`) to collect metrics.
3.  **Set Performance Budgets:** Define acceptable thresholds for each KPI.
4.  **Add Performance Assertions:** Incorporate assertions into Playwright tests to fail if performance budgets are exceeded.
5.  **Generate Performance Reports:** Configure reporters to output performance data in a readable format (e.g., JSON, custom HTML report).
6.  **Integrate with CI/CD:** Run performance tests as part of the CI/CD pipeline to monitor performance regressions.
7.  **Consider Lighthouse Integration:** For more comprehensive performance audits, explore integrating Lighthouse CLI into the CI/CD pipeline to generate detailed reports.

**Labels:** `test`, `priority: medium`, `type: enhancement`