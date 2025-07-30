The chat functionality relies on two API endpoints (`/api/chat` and `/api/chat-status`) and a GitHub Actions workflow for LLM processing. Testing these endpoints requires verifying their interaction with GitHub and the handling of request/response flows.

**Current State:**
- `/api/chat` triggers a GitHub Actions workflow via `repository_dispatch`.
- `/api/chat-status` polls GitHub for response files (`response-${sessionId}.json` and `execution-${sessionId}.json`).
- No dedicated API endpoint tests are in place.

**Affected Files:**
- `api/chat.js`
- `api/chat-status.js`
- `.github/workflows/claude-autonomous.yml` (or similar workflow for LLM processing)

**Proposed Resolution:**
Implement API endpoint tests for chat functionality, focusing on:
1.  **Unit Tests for API Handlers:**
    *   Test `api/chat.js` to ensure it correctly parses incoming messages and constructs the `repository_dispatch` payload.
    *   Mock the `fetch` call to GitHub API to verify the correct request is sent.
    *   Test `api/chat-status.js` to ensure it correctly parses `sessionId` and constructs GitHub raw content URLs.
    *   Mock `fetch` calls to GitHub raw content to simulate different response scenarios (e.g., file not found, processing, completed with response).
2.  **Integration Tests (Optional, More Complex):**
    *   Set up a test environment that can simulate GitHub Actions workflow execution and file creation.
    *   This would involve more advanced mocking or a dedicated test runner that can interact with a local GitHub instance or a test webhook server.
3.  **Focus on Edge Cases:** Test for invalid `sessionId`, missing messages, and error responses from GitHub.

**Labels:** `test`, `priority: medium`, `type: task`