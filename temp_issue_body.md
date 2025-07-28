During UAT, several commands were not recognized or did not function as expected:
- `runs`: This command was unrecognised; `actions runs` should be used instead.
- `home`: This command produced an error indicating unavailable content.
- `gh-*` commands: Specifically, `gh-create`, `gh-list`, and `gh-sync` were not recognized.
- `grep` and `exec`: These commands produced error messages indicating unsupported targets or unavailable content.
- `tail research`: This command failed because the research streamer is unavailable.

This issue aims to clarify command names, implement missing commands, or remove them from the `help` output to prevent confusion.

**Affected Code:**
- `assets/terminal.js`: The `executeCommand` function and the `availableCommands` array.
- `assets/research-streamer.js`: For `tail research` command.

**Suggested Approaches:**
1.  **For `runs`:** Update the `help` output to explicitly state that `actions runs` should be used.
2.  **For `home`:** Investigate why `home` content is unavailable and either implement it or remove the command.
3.  **For `gh-*`, `grep`, `exec`:**
    *   If these commands are intended to be implemented, add their functionality.
    *   If not, remove them from the `availableCommands` list and `help` output.
4.  **For `tail research`:** Implement the research streamer or provide a clear fallback message.

**Status:**
- Title: Clear
- Labels: Normalized
- Linked Tasks: N/A
- Staleness: New Issue