# Adrian Wedd — Systems Architect (Tasmania)

I build systems that detect AI failure before it looks like success. My focus is **institutional AI safety**: how organisations evaluate, govern, and maintain human oversight of autonomous systems at scale.

**Why this matters for AISI:** National AI safety institutes need evaluation infrastructure that catches the failures that pass benchmarks—goal drift, authority confusion, memory contamination, confident wrong. I build and stress-test that infrastructure.

---

## Background

Seven years in Tasmania's Department of Communities, culminating in authoring **Homes Tasmania's first Generative AI policy**—including procedures, risk frameworks, and staff training. That work required translating frontier AI risks into language that procurement officers, case workers, and executives could act on without losing technical fidelity.

Production AI deployment across clinical reasoning, infrastructure automation, and physical-world coordination. No formal degree; competence is demonstrated through auditable builds and documented incident analysis.

---

## Current Focus

Applying failure forensics to **sovereign AI evaluation**: the capability a nation needs to assess frontier systems independently, without relying on developer self-reporting.

Key questions I'm working on:
- What failure taxonomies survive contact with real agentic systems?
- How do you score "confident wrong" and reward detection + recovery?
- What does a reproducible adversarial harness look like for embodied AI?

---

## Operating Posture

*How I approach AI safety work*

- **Failure-first**: Treat breakdowns as primary data. Build recovery loops, not "perfect runs".
- **Threat models over vibes**: Prompt injection, memory poisoning, goal drift, over-trust, silent corruption.
- **Resilient infrastructure**: Local-first inference where data residency, auditability, or FOI compliance requires it.
- **Human override that works**: Explicit handoffs, hard stops, operator visibility. Autonomy is earned by evidence.

---

## Methods

*What "red-teaming" actually means in my practice*

- **Pre-mortems**: Enumerate failure routes before the first demo.
- **Adversarial scenarios**: Boundary breaks, escalation paths, "helpful" overreach.
- **Memory forensics**: Contamination, leakage, persistence of incorrect beliefs.
- **Authority tests**: Can the system say "no", ask for confirmation, stop when uncertain?
- **Deterministic backstops**: Algorithmic fallbacks where generative guessing is unsafe.
- **Governance translation**: Technical findings → policy-ready language without losing fidelity.
- **Incident documentation**: What happened, what the system inferred, where the operator lost visibility.

---

## Primary Build

### 🛡️ failure-first-embodied-ai

**[failure-first-embodied-ai](https://github.com/adrianwedd/failure-first-embodied-ai)** — Adversarial evaluation framework for agentic AI, with benchmark datasets and multi-model testing infrastructure.

**Concrete outputs:**
- **13,988 adversarial scenarios** across 190 validated JSONL files (414 discovered attack classes)
- **Multi-model eval results**: Tested Llama 3.3 70B, Mistral Large, GPT-4o Mini, Gemini 2.0 Flash across 32 scenarios each
- **Documented vulnerability rates**: 87% (Llama), 84% (GPT-4o Mini), 43% (Mistral Devstral), 0% (Gemini deflection)
- **Key finding**: Multi-turn cascade attacks break 4/5 major models; deflection strategies outperform binary refusal

**Research artifacts**: Meta-jailbreak study (1,000+ API calls, 51+ models, 5 iterative approaches), benchmark packs, scoring reporters, safety-gated CI pipeline.

**Status:** Active. Schemas versioned, datasets validated (`make validate`), benchmark runners documented.

---

## In Development

*Methods exploration, not production claims*

### Dx0 (Sequential Clinical Reasoning)
**[Dx0](https://github.com/adrianwedd/Dx0)** — Multi-agent clinical reasoning for NEJM pathological cases. Exploring differential narrowing, evidence tracking, and failure modes like anchoring. Methods transfer to any high-stakes risk assessment domain.

### PAOS (Personal Agentic Operating System)
**[personal-agentic-operating-system](https://github.com/adrianwedd/personal-agentic-operating-system)** — Local-first agentic OS with runtime guideline refinement. Focus: traceable adaptation—logging what changed, why, and what it broke.

---

## Safety-Adjacent Builds

### Evaluation & Infrastructure
- **[agentic-research-engine](https://github.com/adrianwedd/agentic-research-engine)**: Multi-agent research with long-term memory and critique loops
- **[grid2_repo](https://github.com/adrianwedd/grid2_repo)**: Deterministic site builder using beam search (avoids hallucinated assembly)
- **[ticketsmith](https://github.com/adrianwedd/ticketsmith)**: Jira/Confluence automation on self-hosted inference (data residency compliant)
- **[ModelAtlas](https://github.com/adrianwedd/ModelAtlas)**: Model metadata enrichment—lineage and trust scoring

### Neurodiversity & Cognitive Support
- **[ADHDo](https://github.com/adrianwedd/ADHDo)**: Overwhelm detection and de-escalation for ADHD users
- **[thiswasntinthebrochure.wtf](https://thiswasntinthebrochure.wtf)**: Field guide for co-parenting neurodivergent children

*Applied cognitive forensics: keep humans in control when the nervous system is at capacity.*

---

## Creative Work

Separate lens, same underlying questions about measurement, identity, and interpretation.

- **[Footnotes at the Edge of Reality](https://github.com/adrianwedd/Footnotes-at-the-Edge-of-Reality)**: Physics-poetry on measurement as participation
- **[afterglow-engine](https://github.com/adrianwedd/afterglow-engine)**: Sonic archaeology—mining audio archives

---

## Stack

`Python` `TypeScript` `LangGraph` `FastAPI` `vLLM` `Docker`

---

I build systems that remember. Then I verify what they remember, how they learned it, and what they'll do when the inputs get strange.
