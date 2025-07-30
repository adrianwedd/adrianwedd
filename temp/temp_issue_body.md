The UAT report indicates that the real-time AI is sometimes unavailable, leading to a fallback to local responses. This issue aims to investigate the root causes of this unavailability and implement measures to improve the reliability and uptime of the real-time AI integration.

**Investigation & Affected Code:**

- **AI Service Unavailability:** The `sendMessage` and `pollForResponse` functions in `assets/terminal.js` are responsible for interacting with the AI API endpoints (`api/chat.js`, `api/chat-status.js`). When these endpoints are unavailable or return errors, the system falls back to local responses.

**Affected Code:**
- `assets/terminal.js`: Specifically, the `sendMessage` and `pollForResponse` methods.
- `api/chat.js`: The backend API endpoint for sending chat messages to the AI.
- `api/chat-status.js`: The backend API endpoint for polling the status of AI responses.

**Suggested Approaches:**
1.  **Robust Error Handling & Retries:** Implement more sophisticated error handling within `sendMessage` and `pollForResponse` to distinguish between transient network issues and persistent service failures. Introduce retry mechanisms with exponential backoff for transient errors.
2.  **Circuit Breaker Pattern:** Consider implementing a circuit breaker pattern to prevent continuous requests to a failing AI service, allowing it time to recover and preventing resource exhaustion.
3.  **Improved Fallback Experience:** Enhance the user experience during fallback to local responses. Provide clear, concise messages indicating that real-time AI is temporarily unavailable and when it is expected to be restored.
4.  **Proactive Monitoring & Alerts:** Ensure comprehensive monitoring of the AI API endpoints (`api/chat.js`, `api/chat-status.js`) to enable rapid detection and response to service outages.
5.  **Redundancy with Alternative Providers:** Investigate the feasibility and cost-effectiveness of integrating with multiple AI providers to offer a layer of redundancy and improve overall uptime.

**Status:**
- Title: Clear
- Labels: Normalized
- Linked Tasks: N/A
- Staleness: New Issue