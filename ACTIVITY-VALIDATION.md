# Activity marker regression — local validation

Tracking: https://github.com/adrianwedd/adrianwedd/issues/170

Base: `cf2203b8db7e880726369a8c16450a93f580ce6b` on `main`, initially clean; origin is `https://github.com/adrianwedd/adrianwedd.git`. No `AGENTS.md` exists in this checkout. Ownership preflight recorded no overlapping workflow/README PRs.

## Evidence and change

The saved, read-only log of run `36385606771`, job `108810252253`, reports: `Couldn't find the <!--START_SECTION:activity--> comment. Exiting!` The current curated README contains neither marker. The offline regression test confirms that prerequisite failure against the actual README rather than executing the third-party updater.

`.github/workflows/update-activity.yml` now checks the README before the activity action, including in stats-only mode:

- Exactly one ordered `<!--START_SECTION:activity-->` / `<!--END_SECTION:activity-->` pair enables rendering (unless the strategy is stats-only).
- No markers logs an intentional skip of README rendering. Statistics retain their independent, unconditional step.
- Partial, reversed, or duplicate markers fail before the updater runs; the checker does not modify the README or publish a successful output on failure.

The extracted `scripts/activity-precheck.mjs` also validates profile and repository responses before metrics are used. HTTP failures now fail the existing curl calls; invalid JSON, error objects, missing fields, invalid numeric types, and unsafe totals fail instead of being substituted with zeros. Actual zero values and a valid empty repository list remain allowed. API endpoints, profile fields, aggregate output shape, and the existing distinct-language count (including null) are preserved.

The precheck has no network, subprocess, Git, README-write, commit, or push path. `--dry-run` suppresses GitHub output-file writes as well. It reads fixture files or stdin and prints validation results; it does not execute the workflow or generate production statistics.

## Local proof

Executed successfully using existing Node v26.7.0 and the pre-existing PyYAML environment, with no installs:

```
node --test tests/activity-precheck.test.mjs
node --check scripts/activity-precheck.mjs
node scripts/activity-precheck.mjs markers README.md --dry-run
/Users/adrian/Documents/Codex/2026-10-05/task-8/test-envs/ungovernable-body/bin/python tests/verify-activity-workflow.py
git diff --check
```

Results:

- 43 tests passed, 0 failures: marker fixtures; read-only/dry-run behavior; malformed/upstream-error payloads; valid non-zero and zero metrics; optional feed skip followed by independent fixture statistics processing.
- CLI tests execute with an empty PATH, using the absolute Node executable; no Git/curl subprocess is available to the precheck.
- Workflow YAML parsed successfully. `bash -n` accepted all workflow shell bodies; none were executed.
- Static workflow checks verify guard/feed/statistics ordering and gating, validation before statistics writes, and exact preservation of schedules, permissions, secrets/configuration, unrelated steps, and weather workflow.
- README bytes equal the base commit. SHA256 remains `98dcb4c00785516116792bcf132f21fd155c3e2c37738bb52abf0680349033b1`.
- `git diff --check` passed. Self-review completed in this session.

The Python verifier requires PyYAML; the Node tests and utility require no project dependencies.

## Limits and delivery

This is a tested local implementation, not evidence of a successful hosted run. No workflow shell bodies, live metrics/API calls, hosted CI, inference, commits, pushes, PRs, issue updates, merges, or deployments were performed. Existing workflow Git-write steps are unchanged and were not run. No credentials, weather, schedule, permission, secret, or site/package files were changed.

HTTP/authentication/upstream errors are deliberately surfaced; the existing API credentials and response identity were not exercised or changed. If a future authorised hosted run exposes a credential problem, that requires separate operator action, not a zero-metric fallback.

Delivery/publication and hosted verification remain pending explicit authorisation. Changes are uncommitted in this isolated checkout.
