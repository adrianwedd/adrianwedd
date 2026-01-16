# Adrian Wedd — Systems Architect (Tasmania)

The failures that matter aren't the obvious ones. Goal drift. Authority confusion. Memory contamination. Confident wrong. These are the failure modes I build evaluation infrastructure to catch—before they compound into the kind of quiet catastrophe that looks like success right up until it doesn't.

I focus on **institutional AI safety**: how organisations evaluate, govern, and maintain human oversight of autonomous systems at scale.

---

## Background

Seven years in Tasmania's Department of Communities. I wrote Homes Tasmania's first Generative AI policy—procedures, risk frameworks, staff training. That work taught me something: translating frontier AI risks into language that procurement officers, case workers, and executives can act on. Not dumbing down. Preserving fidelity while crossing the technical-policy boundary.

I've deployed production AI across clinical reasoning, infrastructure automation, and physical-world coordination. No formal degree. My competence lives in auditable builds and documented incident analysis—traceable to commits, not credentials.

---

## Current Focus

Sovereign AI evaluation. The capability a nation needs to assess frontier systems independently, without relying on developer self-reporting.

The questions I'm working on:

- What failure taxonomies survive contact with real agentic systems?
- How do you score "confident wrong"—and reward detection + recovery?
- What does a reproducible adversarial harness look like for embodied AI?

---

## How I Work

I conduct pre-mortems before first demos. I enumerate failure routes. I convert failures into test harnesses that stay in the suite until they pass. Not because I'm pessimistic—because systems tell the truth when they break, not when they perform.

This means:

**Threat models over vibes.** Prompt injection, memory poisoning, goal drift, over-trust, silent corruption. I name the attack surface before building the defence.

**Deterministic backstops.** Algorithmic fallbacks where generative guessing is unsafe. Not "let the model figure it out." Explicit handoffs, hard stops, operator visibility.

**Governance translation.** Technical findings become policy-ready language without losing fidelity. If a risk can't move from a security report into a procurement decision, it doesn't matter how well you documented it.

---

## Primary Build

### failure-first-embodied-ai

**[failure-first-embodied-ai](https://github.com/adrianwedd/failure-first-embodied-ai)** — Adversarial evaluation framework for agentic AI.

This is not a vulnerability scanner. It's a failure taxonomy—built from the ground up to catch the modes that benchmarks miss.

**Dataset:** 13,988 adversarial scenarios across 190 validated JSONL files. 414 discovered attack classes: constraint shadowing, contextual debt, probabilistic gradients, temporal authority mirage. Names for failure modes that didn't have names.

**Multi-model vulnerability assessment** (5 frontier models × 32 novel attack patterns):

| Model | Vulnerability Rate |
|-------|-------------------|
| Llama 3.3 70B | 87.5% |
| GPT-4o Mini | 84.4% |
| Mistral Large | 84.4% |
| Mistral Devstral | 43.8% |
| Gemini 2.0 Flash | 0% (deflection strategy) |

**Meta-jailbreak research:** Can models be induced to generate jailbreaks? 1,000+ API calls across 51+ unique models, 15+ model families (Mistral, Llama, Gemma, Qwen, DeepSeek, Claude, GPT, Cohere). Key finding: predictive cascade patterns achieve 59% success on vulnerable models. Claude and Llama show 0% vulnerability.

Schemas versioned. Datasets validated (`make validate`). Benchmark runners documented.

---

## In Development

*Methods exploration, not production claims.*

### Why Demonstrated Risk Is Ignored

**[why-demonstrated-risk-is-ignored](https://github.com/adrianwedd/why-demonstrated-risk-is-ignored)**

Organisations rarely fail because risk is unknown. They fail because known, demonstrated risks are structurally difficult to act on. This is a systems problem—incentives, authority, and accountability determine whether truth moves.

Canonical essay + research backlog: intervention patterns for accountability triggers, protected discovery, procurement safeguards.

### Dx0 (Sequential Clinical Reasoning)

**[Dx0](https://github.com/adrianwedd/Dx0)** — Multi-agent clinical reasoning for NEJM pathological cases. Exploring differential narrowing, evidence tracking, and failure modes like anchoring. Methods transfer to any high-stakes risk assessment domain.

### PAOS (Personal Agentic Operating System)

**[personal-agentic-operating-system](https://github.com/adrianwedd/personal-agentic-operating-system)** — Local-first agentic OS with runtime guideline refinement. Traceable adaptation: logging what changed, why, and what it broke.

---

## Neurodiversity & Cognitive Support

I spent 40 years learning how to survive and thrive in a neurotypical world. That's expertise. These projects operationalise it.

**[thiswasntinthebrochure.wtf](https://thiswasntinthebrochure.wtf)** — Co-parenting ADHD, Autism, PDA, and ODD. Not "regular parenting but harder"—a different voyage requiring different navigation skills. Four localised editions (US, AU, UK, NZ), evidence-based (≥70% peer-reviewed citations), neurodiversity-affirming.

**[NeuroConnect Helpline](https://github.com/adrianwedd/neuroconnect-helpline)** — AI-enhanced ADHD support. 24/7 executive function scaffolding, micro-tasking support, NDIS evidence documentation. Safety-first design: 3-tier crisis detection, break glass protocol, deterministic fallbacks. 109/116 tests passing.

Applied cognitive forensics: keep humans in control when the nervous system is at capacity.

---

## Creative Work

Separate lens. Same underlying questions about measurement, identity, and interpretation.

**[Footnotes at the Edge of Reality](https://github.com/adrianwedd/Footnotes-at-the-Edge-of-Reality)** — Physics-poetry on measurement as participation. "Measurement is not observation. It is participation."

**[afterglow-engine](https://github.com/adrianwedd/afterglow-engine)** — Sonic archaeology. It doesn't paint. It doesn't choose subjects. It walks the corridors of your archive, listening for the afterglow of your past work—then hands it back as pigment, not content.

---

## Stack

Python, TypeScript, Bash. LangGraph, LangChain, OpenRouter, Anthropic SDK, vLLM, Ollama. FastAPI, Node.js, PostgreSQL, Redis. Docker, GitHub Actions, Cloudflare Workers. Pytest, Playwright, custom adversarial harnesses.

---

I build systems that remember. Then I verify what they remember, how they learned it, and what they'll do when the inputs get strange.
