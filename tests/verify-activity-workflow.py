"""Offline YAML/wiring verification. Never execute workflow bodies or contact GitHub."""
from pathlib import Path
import hashlib
import subprocess

import yaml

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ".github/workflows/update-activity.yml"
BASE = "cf2203b8db7e880726369a8c16450a93f580ce6b"


def baseline(path):
    return subprocess.run(
        ["git", "show", f"{BASE}:{path}"], cwd=ROOT, check=True, capture_output=True
    ).stdout


current = yaml.safe_load((ROOT / WORKFLOW).read_text())
original = yaml.safe_load(baseline(WORKFLOW))
# PyYAML's YAML 1.1 loader treats 'on' as True; comparing both parses preserves it.
assert {k: v for k, v in current.items() if k != "jobs"} == {
    k: v for k, v in original.items() if k != "jobs"
}
assert current["jobs"].keys() == original["jobs"].keys()
changed_steps = {
    "📊 Activity Metrics Pre-Analysis",
    "📊 Enhanced GitHub Activity Processing",
    "🧠 Advanced Terminal Statistics Generation",
}
for job_name, job in current["jobs"].items():
    old_job = original["jobs"][job_name]
    assert {k: v for k, v in job.items() if k != "steps"} == {
        k: v for k, v in old_job.items() if k != "steps"
    }
    old_steps = {step["name"]: step for step in old_job["steps"]}
    for step in job["steps"]:
        if step["name"] == "🔎 Validate Optional README Activity Section":
            continue
        if step["name"] not in changed_steps:
            assert step == old_steps[step["name"]], step["name"]
        else:
            # Token references, env, action configuration, and names stay unchanged.
            assert {k: v for k, v in step.items() if k not in ("run", "if")} == {
                k: v for k, v in old_steps[step["name"]].items() if k not in ("run", "if")
            }
        if "run" in step:
            # Syntax-only: bash never runs the API, filesystem, or Git commands.
            subprocess.run(["bash", "-n"], input=step["run"], text=True, check=True, capture_output=True)

steps = current["jobs"]["github-activity-intelligence"]["steps"]
guard = next(s for s in steps if s.get("id") == "activity-section")
feed = next(s for s in steps if s.get("uses", "").startswith("jamesgeorge007/"))
stats = next(s for s in steps if s["name"] == "🧠 Advanced Terminal Statistics Generation")
assert steps.index(guard) < steps.index(feed) < steps.index(stats)
assert guard["run"] == "node scripts/activity-precheck.mjs markers README.md"
assert "if" not in guard
assert feed["if"] == "needs.pre-activity-analysis.outputs.update-strategy != 'stats-only' && steps.activity-section.outputs.render == 'true'"
assert "if" not in stats  # A successful optional-feed skip does not gate statistics.
assert "|| echo '{}'" not in stats["run"]
assert "|| echo '[]'" not in stats["run"]
assert stats["run"].count("--fail --show-error") == 2
assert stats["run"].index("activity-precheck.mjs profile") < stats["run"].index("cat > terminal-stats.json")
assert stats["run"].index("activity-precheck.mjs repos") < stats["run"].index("cat > terminal-stats.json")
metrics = next(s for s in current["jobs"]["pre-activity-analysis"]["steps"] if s.get("id") == "metrics")
assert "// 0" not in metrics["run"]
assert "activity-precheck.mjs profile" in metrics["run"]
assert "--fail --show-error" in metrics["run"]
assert (ROOT / "README.md").read_bytes() == baseline("README.md")
assert (ROOT / ".github/workflows/update-weather.yml").read_bytes() == baseline(".github/workflows/update-weather.yml")
assert hashlib.sha256((ROOT / "README.md").read_bytes()).hexdigest() == "98dcb4c00785516116792bcf132f21fd155c3e2c37738bb52abf0680349033b1"
print("PASS: YAML parse; all workflow shell syntax; marker/feed/stats wiring; unchanged schedules, permissions, secrets/config, unrelated steps, weather, and README bytes")
