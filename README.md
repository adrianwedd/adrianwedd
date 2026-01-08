# 🛡️ Forensic Sentinel — Systems Architect (Tasmania)

I build agentic and embodied systems that operate under constraint: local-first when possible, audit-first always. I’m interested in the failure that looks like success—quiet drift, misplaced authority, tool misuse, memory contamination—because that’s where autonomy becomes unsafe.

The work spans clinical reasoning systems, infrastructure automation on sovereign compute (`vLLM`), and physical-world coordination (a 170‑acre 3D‑printed eco‑village in Tasmania). The throughline is the same: instrument the system, stress it, keep a human override that still works when the lights flicker.

---

## Operating Posture

- **Failure-first safety**: treat breakdowns as primary data; build recovery loops, not “perfect runs”.
- **Threat models over vibes**: prompt/tool injection, memory poisoning, silent corruption, over-trust, goal drift, embodied hazard propagation.
- **Sovereign compute**: local-first, open-weight inference where feasible; the cloud is a dependency to be justified, not assumed.
- **Auditability**: event logs, reproducible runs, deterministic fallbacks where they reduce blast radius.
- **Human sovereignty**: explicit handoffs, hard stops, and operator visibility; autonomy is earned by evidence.

---

## Instrumentation (What I Mean By “Forensic”)

- **Trace**: capture decisions, tool calls, and memory writes; prefer append-only logs over “final answers”.
- **Constrain**: least-privilege tools, explicit scopes, and reversible operations by default.
- **Degrade**: partial failure should reduce capability, not create unpredictable behavior.
- **Reproduce**: convert incidents into harnesses; keep them failing until the system learns how to recover.

---

## Flagships (Systems Under Test)

### 🛡️ failure-first-embodied-ai
**[failure-first-embodied-ai](https://github.com/adrianwedd/failure-first-embodied-ai)** — Red-teaming and benchmarking for embodied and agentic systems where **recursive failure** is the object of study.

What I care about here:
- **Failure taxonomies** that survive contact with reality (not just academic categories).
- **Adversarial scenarios** that stress tool use, memory, and feedback loops.
- **Scoring that punishes “confident wrong”** and rewards detection + recovery, not just completion.

### ⚙️ PAOS (Personal Agentic Operating System)
**[personal-agentic-operating-system](https://github.com/adrianwedd/personal-agentic-operating-system)** — A local-first agentic OS with a **meta-agent loop** that refines system guidelines from reflection logs at runtime.

The point is not “self-improvement”. The point is **traceable adaptation**: what changed, why, and what it broke.

### ❤️‍🔥 Dx0 (Sequential Clinical Reasoning)
**[Dx0](https://github.com/adrianwedd/Dx0)** — A multi-agent clinical suite for sequential diagnosis, simulating physician panels to solve NEJM pathological cases.

I treat this as an interface problem under uncertainty: differential narrowing, evidence tracking, disagreement capture, and failure modes like anchoring and narrative overfit. (Not medical advice; not a medical device.)

### 🧠 Neurodiversity & Field Support
**[ADHDo](https://github.com/adrianwedd/ADHDo)** — A neurodiversity-affirming support system built by ADHD brains for ADHD brains: detects overwhelm patterns and offers de-escalation prompts and structure.

**[thiswasntinthebrochure.wtf](https://thiswasntinthebrochure.wtf)** — A practical field guide to co-parenting neurodivergent children (ADHD, Autism, PDA, ODD).

These are not “content projects” to me; they’re applied cognitive forensics: reduce shame, increase signal, and keep humans in control when the nervous system is already at capacity.

### 🏗️ Cygnet (Physical World Coordination)
**[cygnet](https://github.com/adrianwedd/cygnet)** — AI coordination of a **170-acre 3D-printed eco-village** in Tasmania: construction, land, and print ops across 28+ agents.

Current state (because reality matters):
- We have the **170 acres**.
- There is currently a **~$1.5M gap** for purchasing the 3D printer, so the build program is staged accordingly.

Physical systems are unforgiving: you don’t get to “retry” a safety incident. The design bias is toward operator visibility, conservative actuation, and graceful degradation.

---

## Methods (What Actually Happens When I “Redteam”)

- **Pre-mortems**: enumerate plausible failure routes before the first demo.
- **Adversarial prompts + tool misuse**: test boundary break attempts, escalation paths, and “helpful” overreach.
- **Memory forensics**: probe contamination, leakage, and persistence of incorrect beliefs.
- **Authority tests**: verify that the system can say “no”, ask for confirmation, and stop when uncertainty is high.
- **Deterministic backstops**: where an algorithmic fallback (e.g., `grid2_repo` beam search) is safer than a generative guess, I use it.
- **Regression pressure**: turn interesting failures into repeatable harnesses and keep them failing until they stop.
- **Post-incident writing**: document what happened in plain language, what the system inferred, and where the operator lost visibility.

---

## Creative Instruments (The Same Work, Different Sensors)

- **[Footnotes at the Edge of Reality](https://github.com/adrianwedd/Footnotes-at-the-Edge-of-Reality)**: physics‑poetry about measurement as participation; an interpretability notebook in verse form.
- **[Before the Words Existed](https://github.com/adrianwedd/before-the-words-existed)**: a forensic reading of *Neuromancer*—cognitive mismatch before we had clinical language for it.
- **[afterglow-engine](https://github.com/adrianwedd/afterglow-engine)**: sonic archaeology—mining audio archives for texture, stable pads, and granular clouds.

---

## Selected Builds (Index)

### Agents & Cognition
- **[agentic-research-engine](https://github.com/adrianwedd/agentic-research-engine)**: Multi-agent system with long-term memory (LTM) and a critique-and-refinement loop.
- **[TEL3SIS](https://github.com/adrianwedd/TEL3SIS)**: Real-time, voice-first agentic telephony (`vocode-python`), tri-layer memory, tool orchestration.
- **[AI-SWA](https://github.com/adrianwedd/AI-SWA)**: A software architect agent that reasons about its own design and spawns modular components.
- **[ModelAtlas](https://github.com/adrianwedd/ModelAtlas)**: Foundational model metadata enrichment: lineage and trust scoring.
- **[Agentic-Index](https://github.com/adrianwedd/Agentic-Index)**: Curated, scored catalog of agent frameworks.

### Infrastructure & Sovereign Automation
- **[ticketsmith](https://github.com/adrianwedd/ticketsmith)**: Jira/Confluence automation on sovereign compute (self-hosted `vLLM` inference).
- **[project-terrawatt](https://github.com/adrianwedd/project-terrawatt)**: Sustainability/infrastructure optimization experiments using `LangGraph`.
- **[grid2_repo](https://github.com/adrianwedd/grid2_repo)**: Deterministic site builder using **beam search** to avoid hallucinated assembly.

### Health & Accessibility
- **[ADHDo](https://github.com/adrianwedd/ADHDo)**: Neurodiversity-affirming coach; detects overwhelm and offers de-escalation.
- **[emdr-agent](https://github.com/adrianwedd/emdr-agent)**: EMDR protocol implementation with distress monitoring and grounding triggers.
- **[thiswasntinthebrochure.wtf](https://thiswasntinthebrochure.wtf)**: Practical field guide for co-parenting neurodivergent children (ADHD, Autism, PDA, ODD).

### Identity, Signal, and Installation
- **[latent-self](https://github.com/adrianwedd/latent-self)**: Face-morphing mirror installation probing identity boundaries with generative GANs.
- **[lunar_tools_prototypes](https://github.com/adrianwedd/lunar_tools_prototypes)**: Audiovisual installations (Dream Interpreters, Bio-Acoustic Fingerprint Painters).
- **[orbitr](https://github.com/adrianwedd/orbitr)**: Circular step sequencer with **MusicGen** for real-time sample generation.

### Tooling & Automation
- **[homelab-scripts](https://github.com/adrianwedd/homelab-scripts)**: Bash automation for disk cleanup, network discovery, and secure backups.
- **[lemonsqueezy-claude-skills](https://github.com/adrianwedd/lemonsqueezy-claude-skills)**: Claude Code skills for payment platform operations and analytics.
- **[cv](https://github.com/adrianwedd/cv)**: Browser-automated resume pipeline with AI-assisted maintenance.
- **[squishmallowdex](https://github.com/adrianwedd/squishmallowdex)**: Offline-first static collection tracker (architecture with a sense of play).

### Cosmic
- **[space-weather](https://github.com/adrianwedd/space-weather)**: Monitoring and visualizing geomagnetic conditions via NASA/BOM APIs.

---

## Stack
`Python` `TypeScript` `LangGraph` `FastAPI` `Astro` `Vector DBs` `Docker` `Home Assistant` `vLLM`

---

I build systems that remember. Then I verify what they remember, how they learned it, and what they’ll do with it when the inputs get strange.
