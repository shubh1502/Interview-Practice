# Interview Prep — AI Engineer (2–4 yrs, GenAI / Agentic Platform)

> Built from my resume + the AI Engineer JD. Everything here maps to work I actually did on **Walnut** and **AI TDM** at Simplify3x. Rehearse out loud — answers are written in first person so they can be spoken as-is.

---

## 1. Self-Introduction (60–90 seconds)

> "I'm Rishi, an AI engineer with about two and a half years of experience building GenAI products end to end at Simplify3x in Bangalore. I've spent my whole career on a multi-tenant AI platform, across two products.
>
> On **AI TDM**, I built a RAG-powered conversational agent that gives enterprises natural-language access to their test data across 5,000+ database tables — with strict per-tenant data isolation and zero PHI exposure. I owned the retrieval pipeline, natural-language-to-SQL conversion, and the latency work — Redis caching and API optimization that cut response times by 40%.
>
> Currently, on **Walnut**, I built the Intelligence Hub — an autonomous, multi-turn agentic system where an LLM plans, calls tools over an MCP layer, asks the user clarifying questions, and turns any uploaded artifact — PDFs, Word docs, Excel, audio/video, Figma designs, even a code repo — into structured, executable test cases. I also designed the distributed cloud execution layer: a Docker orchestrator–runner architecture with Redis-backed queueing, auto-retry, and real-time monitoring.
>
> What excites me about this role is that it's exactly the same class of problem — autonomous agents automating real business workflows on a multi-tenant platform — and I want to go deeper on evaluation and observability at scale."

**Tune the last line to the company** — read their product page first.

---

## 2. Technical Skills — What I Have and Where I Applied It

| Skill | Where I implemented it |
|---|---|
| **Python** | AI TDM backend (FastAPI services); Walnut's MCP agent server (agent loop, tools, streaming) |
| **LLM APIs (OpenAI / LiteLLM)** | All generation flows; LiteLLM as a gateway so the platform can switch providers (OpenAI/Azure/others) per tenant config |
| **RAG** | AI TDM: schema/knowledge embeddings over 5,000+ tables → retrieve relevant context → answer or generate SQL; Walnut: document search tool inside the agent loop |
| **Prompt Engineering** | System prompts for the agent, few-shot examples for NL→SQL, structured JSON outputs for test cases, entity extraction with spaCy + LLM hybrid |
| **Agentic workflows / tool calling** | Walnut Intelligence Hub: multi-turn loop — analyze → ask user → plan structure → parallel detail generation → finish; tools registered on a FastMCP server |
| **Human-in-the-loop** | `ask_user` gate pauses the agent (job → `pending_review`), user answers, job resumes; review/approval before saving results |
| **Vector Databases** | Embedding storage + similarity search for table/schema retrieval and document search |
| **SQL / NoSQL** | NL→SQL generation with validation; MongoDB as primary store; MySQL |
| **FastAPI** | AI TDM APIs; async endpoints, Pydantic validation |
| **Docker** | Orchestrator + runner images, private registry, versioned image tags, container lifecycle from the backend |
| **Redis** | Response caching (40% latency cut), job queues + atomic dispatch (Lua scripts), pub/sub for events |
| **Monitoring** | Heartbeats + stale-job reapers, live SSE/WebSocket progress streaming, HTTP-polling fallback, audit logs, cost/latency awareness per run |
| **Cloud (AWS)** | S3 for uploads/artifacts; provisioned and managed execution VMs; AWS Cloud Foundations certified |

---

## 3. Projects — What I Built, In Detail

### 3.1 Walnut — Intelligence Hub (AI test case generation) — *my flagship story*

**One-liner:** Upload any artifact → an autonomous agent generates complete, executable test cases.

**Inputs supported:** PDF, DOC/DOCX, XLSX/CSV, PPT/PPTX, TXT/MD, images/screenshots, audio/video (transcribed first), Figma frames, linked Git repos.

**How it works (the flow I quote in interviews):**
1. **Upload & resolve** — files go to S3; the agent resolves file IDs server-side into its context (we deliberately killed a base64-through-browser path — 100MB videos blew the heap; important war story about production hardening).
2. **Agent loop (multi-turn)** — the LLM runs a plan-act-observe loop over an **MCP (FastMCP) tool layer**: `search_document`, `generate_structure`, `generate_scenario_details`, `ask_user`, `validate_test_case`, `export_gherkin`, and more.
3. **Human-in-the-loop** — the agent asks targeted clarifying questions (platform? coverage? depth?) before committing to a plan. The job pauses in `pending_review` and resumes on answer.
4. **Parallel fan-out** — scenario outlines are generated first, then full test cases (steps, expected results, parameters, test data) are generated **in parallel**, each landing on the UI the moment it's ready.
5. **Live streaming** — every reasoning step, tool call, and completed test case streams to the browser over SSE as a readable narrative.
6. **Durability** — every run is a persistent job (MongoDB `processing_jobs`) with heartbeats; close the laptop, come back, results are there. Stale-job **reapers** fail/cancel zombie jobs so the UI never shows an eternal spinner.
7. **Refinement & export** — conversational editing (combine/split/delete/undo with a 10-entry undo stack), one-click save to Test Management, Gherkin + traceability-matrix export.

**My contribution:** the agent loop design, the tool layer, HITL gates, SSE streaming + session isolation (events routed to per-session state buckets so concurrent sessions never bleed into each other), the durable-job + reaper system, and the guardrail/validation layer.

### 3.2 Walnut — Distributed Cloud Execution

**One-liner:** Run test suites on auto-provisioned cloud VMs with live progress, retries, and cleanup.

- **Architecture:** backend → Redis queue → **orchestrator container** on each VM → per-browser **runner containers**. Orchestrator and runners ship as versioned Docker images from a private registry.
- **Self-provisioning:** "Add Machine" SSHes into a fresh VM, logs into the registry with encrypted credentials, pulls images, and the runner registers itself online — minutes, no manual setup. Teardown cascades cleanly (including clearing references so nothing points at a deleted runner).
- **Scheduling & reliability:** batch dispatch with atomic Redis **Lua scripts** (no double-dispatch), configurable **auto-retry** of failed test cases, **terminate-on-failure** that drains pending work and marks remaining cases correctly, idempotent bulk saves (a ~20-minute blocking save became an async job with client-key dedup).
- **Observability:** live step streaming over WebSockets with an **HTTP-polling fallback** (restrictive ingress kills sockets in some deployments), refresh-safe + cross-tab-deduped completion notifications, environment/metadata denormalization for accurate reports.
- **Capacity:** I benchmarked concurrency per VM and found the knee at ~8 parallel executions (orchestrator single-thread bound, not RAM) — capacity limits are data-driven, not guessed.

### 3.3 AI TDM — RAG-Powered Enterprise Knowledge & Test Data Platform

**One-liner:** A conversational agent over enterprise test data — 5,000+ tables, multi-tenant, zero PHI exposure.

- **RAG design:** table/schema metadata embedded into a vector DB; a user's natural-language question retrieves the relevant tables/columns; the LLM then answers or generates SQL/NoSQL against them. Raw sensitive data stays out of prompts — retrieval is over schema and metadata, which is how we guaranteed **zero PHI exposure**.
- **NL→SQL/NoSQL:** prompt-engineered generation with few-shot examples per dialect + validation before execution.
- **Performance:** Redis caching of hot queries and embeddings + API optimization → **40% latency reduction**, real-time chat UX.
- **Quality loops:** self-learning feedback loops (user feedback re-ranks/improves retrieval and prompts), context-management tuning for multi-turn accuracy, token-cost reduction, spaCy + prompt-engineered NER for entity recognition.
- **Multi-tenancy:** per-tenant isolation enforced at the data-access layer — every query scoped to the tenant; tenant-specific DBs.

---

## 4. Interview Q&A

### A. Agentic AI (the core of this JD)

**Q1. What is an AI agent? How is it different from a chatbot or a single LLM call?**
> A single LLM call is stateless text-in/text-out. An agent wraps the LLM in a **loop**: it has a goal, it plans, it **calls tools** to act on the world, observes results, and decides the next step — repeating until the goal is done. The LLM is the reasoning engine; the agent is the system around it: tools, state, memory, guardrails, and termination conditions. In Walnut, the same LLM that "chats" also decides *when* to search a document, *when* to ask the user a question, and *when* to fan out parallel generation — that decision-making loop is what makes it an agent.

**Q2. Walk me through the agent loop you built.**
> It's a plan–act–observe loop. Turn one: the agent receives the user's goal plus resolved documents, analyzes them, and usually calls `ask_user` with 2–3 targeted questions — platform, coverage level, depth. That's a deliberate human-in-the-loop gate: the job pauses, persisted as `pending_review`. When the user answers, the loop resumes: the agent calls `generate_structure` to produce scenario outlines, then fans out `generate_scenario_details` calls **in parallel** — one per scenario — each producing a complete test case. Every tool start/result streams to the UI. A `finish` tool call terminates the loop. Max-iteration caps and per-tool timeouts stop runaways.

**Q3. What is tool calling / function calling and how did you implement it?**
> You describe tools to the model as schemas (name, description, typed parameters); the model outputs a structured call instead of prose; your runtime executes it and feeds the result back. I implemented the tool layer on **FastMCP** — each tool is a Python module registered on the MCP server (`search_document`, `generate_structure`, `ask_user`, `validate_test_case`, `export_gherkin`, `web_search`…). A tool-executor sits between the model and the tools: it validates arguments, executes, streams progress events, handles errors so one bad tool call doesn't kill the run, and logs everything for audit.

**Q4. What is MCP?**
> Model Context Protocol — an open standard for exposing tools and context to LLMs through a common protocol, so tools become reusable across different agents and clients instead of being hard-wired into one orchestration framework. Our agent server is built on FastMCP (the Python framework), which gives us tool registration, schemas, and HTTP streaming out of the box.

**Q5. Have you used LangGraph?** *(honest-gap answer)*
> I haven't used LangGraph in production — our agent is a custom loop over an MCP tool layer, which we chose for full control over streaming, durability, and human-in-the-loop pauses. But I know LangGraph's model well: you define the workflow as a **state graph** — nodes are steps (LLM calls, tools), edges are transitions, with conditional edges for branching, and checkpointing for persistence and HITL interrupts. Conceptually it formalizes exactly what I built by hand — my loop's `ask_user` pause/resume is LangGraph's `interrupt`, my durable job state is its checkpointer. I'd be productive with it very quickly, and honestly, having built the primitives manually, I understand *why* each abstraction exists.

**Q6. How do you handle long-running agents reliably?**
> Never trust the HTTP request to survive. Every run is a **durable job** in MongoDB: status, progress, partial results, and a **heartbeat** the worker refreshes. The frontend can disconnect and rehydrate later from the job record. **Reapers** handle failure: on process restart, all `processing` jobs are marked failed (their workers died with the process); a periodic sweep fails jobs with stale heartbeats and auto-cancels jobs stuck waiting on user input past a TTL. Every terminal transition also reconciles the session state, so the UI can never show a permanent "Working…" for a dead job. That last part came from a real bug class — missed terminal events wedging the UI — so we made the backend the single source of truth.

**Q7. How did you implement human-in-the-loop?**
> Three layers. **Clarification gates:** the agent's `ask_user` tool pauses generation until the user answers — the question is persisted on the job, so it survives refreshes and shows up even if the user left. **Review gates:** generated artifacts aren't auto-committed; the user reviews, edits conversationally, selects a subset, then explicitly saves. **Escalation on failure:** in cloud execution, failures trigger bounded auto-retry, and terminate-on-failure hands control back to the user cleanly. The design principle: the agent should be autonomous about *how*, but the human owns *what* and *whether it ships*.

**Q8. How do you prevent or reduce hallucinations?**
> Grounding, constraining, and verifying. **Ground:** generation always starts from retrieved source content (the document, the schema), not the model's memory — the agent must call `search_document` rather than "remember." **Constrain:** outputs are structured JSON against schemas, so a test case has typed steps and expected results — much less room to ramble than free text. **Verify:** post-generation validation checks the output against the source; a concrete example — in a code-to-test pipeline, the LLM kept fabricating plausible-looking element locators, so I built a deterministic registry of *real* locators extracted from the source and a post-generation pass that overwrites anything the LLM invented. The lesson I always share: for facts that exist deterministically, **don't let the LLM generate them — let it select them.**

**Q9. How do you make agent behavior auditable and explainable?**
> Every tool call, decision, and result is an event: streamed live to the user as a readable narrative ("Searching document… Drafting test case 3/20…") and persisted as an audit log. The generated artifact carries traceability — which acceptance criteria each test case covers, which source files it maps to. So for any output you can answer: what did the agent read, what did it decide, what did the user approve. That's also exactly what you need for debugging, not just compliance.

**Q10. Multi-agent systems — have you built one?**
> A coordinator/worker pattern: the main agent plans and delegates — parallel specialized generation calls each own one scenario end-to-end, and there are specialized sub-agents for different source types (documents, Figma, code repos) publishing to the same event stream. I haven't built peer-to-peer negotiating agents; for our workflows a planner with parallel workers was more reliable and much easier to debug — and I'd argue that's the right default for business-process automation.

### B. RAG & Vector Databases

**Q11. Explain RAG. Why RAG instead of fine-tuning?**
> Retrieval-Augmented Generation: at query time, retrieve the most relevant knowledge (vector similarity over embeddings, often + keyword/metadata filters) and put it in the prompt, so the model answers from *your* data. Versus fine-tuning: RAG updates instantly when data changes (critical for enterprise data), keeps data out of model weights (critical for multi-tenant privacy — you can't fine-tune one model per tenant per day), gives citations/traceability, and is far cheaper. Fine-tuning is for teaching *style/format/behavior*, not *facts*. In AI TDM the data is 5,000+ evolving customer tables — RAG is the only sane answer, and I'd say exactly that.

**Q12. How did your RAG over 5,000+ tables actually work?**
> The retrieval corpus is **schema and metadata**, not row data: table names, column names/types, descriptions, relationships — embedded into a vector DB. A question like "find test patients with expired insurance" retrieves the handful of relevant tables, then the LLM either answers or generates SQL against just those. Two wins: retrieval quality (searching 5,000 table descriptions beats stuffing schemas into a prompt) and **privacy** — PHI never enters a prompt because we retrieve *structure*, not *data*.

**Q13. How do you improve retrieval quality when it's bad?**
> Diagnose first: is the right context missing (retrieval problem) or present-but-ignored (prompt problem)? For retrieval: better chunking (semantic units, not fixed windows), enriching chunks with metadata/synonyms (huge for table names like `pt_ins_dtl`), hybrid search (vector + keyword), re-ranking the top-k, and tuning k. We also used **user feedback as a signal** — corrections fed back to improve mappings, which is what "self-learning feedback loops" on my resume means. And measure on a golden set of query→expected-context pairs so you know a change helped.

**Q14. How do you make NL→SQL safe?**
> Never trust generated SQL. Constrain generation to retrieved schema only; validate the output (parse it, whitelist statement types — SELECT only, no DDL/DML unless explicitly intended); execute with a **read-only, tenant-scoped** DB role with row limits and timeouts; and show the SQL to the user for transparency. Defense in depth — prompt-level rules alone are not a security boundary.

### C. Prompt Engineering & LLM Optimization

**Q15. What prompt-engineering techniques do you actually use?**
> Role + task framing in system prompts; **few-shot examples** (the single biggest lever for NL→SQL and structured extraction); explicit output schemas (JSON) with field descriptions; chain-of-thought for planning steps but *not* in final structured outputs; splitting big tasks into stages (outline first, details second — that's the Intelligence Hub's structure/details split); and negative instructions with examples of *wrong* outputs when the model kept making a specific mistake. I treat prompts like code: versioned, tested against a regression set of inputs before shipping changes.

**Q16. How do you manage context in long multi-turn conversations?**
> Token budgets per section: system prompt, retrieved context, history, output reserve. History gets **summarized** beyond a threshold rather than truncated blindly — keep decisions and constraints, drop verbatim tool dumps (tool results are re-fetchable — keep references, not payloads). In AI TDM this context-management tuning measurably improved multi-turn accuracy while *cutting* token cost, because a smaller, denser context beats a bloated one — models get lost in noise.

**Q17. How do you reduce LLM cost and latency?**
> Cache aggressively (Redis for repeated/similar queries and embeddings — part of our 40% latency cut); route by difficulty (small model for classification/extraction, big model for generation — LiteLLM makes per-call routing easy); trim context (biggest cost lever); parallelize independent calls (scenario fan-out); and stream tokens so perceived latency drops even when total time doesn't.

**Q18. Temperature and sampling — what do you use when?**
> Near 0 for anything structured or factual — SQL, JSON test cases, extraction — where consistency matters. Higher (0.7-ish) only where variety helps, like proposing diverse test-scenario ideas. And when a provider supports seeds, pin them in evaluation runs so diffs mean something.

### D. Multi-Tenancy, Security & Guardrails

**Q19. How do you enforce tenant isolation?**
> At the **data-access layer**, not in prompts. Every request carries tenant identity; a middleware resolves it to that tenant's models/DB (tenant-specific databases for enterprise customers), so a query physically cannot cross tenants — even a buggy feature can't leak. On top: per-user scoping within a tenant (a user only sees their own jobs/sessions), tenant-scoped events on the streaming channel, and encrypted per-tenant credentials (registry tokens, LLM configs). LLM-specific rule: context assembled for tenant A must contain only tenant A's data — isolation happens *before* the prompt is built, never "the model will be careful."

**Q20. What guardrails did you build around agents?**
> Input side: file-type/size limits, resolving content server-side, tenant-scoped context assembly. Loop side: bounded iterations, per-tool timeouts, argument validation, tool allowlists per pipeline. Output side: schema validation, grounding verification (the locator-registry pattern), and QA/gap-analysis checks on generated artifacts. Process side: human approval gates before anything persists, audit logging of every action, and reapers that kill runaway or zombie work. Guardrails are layered — no single one is trusted.

**Q21. What about prompt injection?**
> Treat all retrieved/uploaded content as **untrusted data, not instructions** — we process arbitrary user documents, so this is real. Mitigations: clear structural separation of instructions vs content in prompts; tools with narrow, validated parameters (the blast radius of a hijacked call is small); no tool that exfiltrates data or mutates state without a human gate; and output validation so injected "instructions" can't ride out inside generated artifacts. I'd be honest that this is an evolving area — defense in depth beats any single trick.

### E. Evaluation, Monitoring & Observability

**Q22. How do you evaluate an LLM feature before shipping?** *(prep this well — JD emphasizes it)*
> Layered. **Golden sets:** representative inputs (documents, queries) with expected outputs or rubrics; run on every prompt/model change and diff. **Programmatic checks:** schema validity, coverage (every acceptance criterion has a test case), grounding (locators/tables actually exist in the source) — cheap and objective, catch most regressions. **LLM-as-judge** for subjective quality (clarity, completeness) with a rubric — good for ranking, calibrate it against human labels. **Human review** for a sample, especially edge cases. In production, user behavior is the ultimate eval: how much do users edit or delete what the agent generated? An artifact saved unedited is a pass; heavily reworked is a fail signal.

**Q23. Have you used Langfuse or Weights & Biases?** *(honest-gap answer)*
> Not in production yet — our observability is built in-house: every agent step is a structured event, persisted and streamed, plus audit logs and job-level progress/heartbeats. But I know exactly what Langfuse gives me — traces, spans, and generations for every LLM call with token counts, cost, and latency; prompt versioning; eval scores attached to traces — because I've been hand-building pieces of that. Frankly, I'd rather use Langfuse than maintain my own; it's on my near-term learning list and I'd expect to be productive with it in days, not weeks.
>
> *(Better: spend a weekend wiring Langfuse into a small agent project before interviews, then say "I've used it in a personal project" — it's a ~20-line integration.)*

**Q24. How do you monitor production agents?**
> Watch four things: **failures** (job status + heartbeats; reapers catch silent deaths — the dangerous ones), **latency** (per-stage timing from streamed events, so I know if it's retrieval, generation, or a tool that's slow), **cost** (token usage per run; caching and routing to control it), and **quality drift** (user dissatisfaction signals — edits, deletions, retries, abandoned sessions). Everything an agent does is an event, so debugging a bad run means replaying its narrative — which the UI already renders.

**Q25. A user says "the AI gave me a wrong answer." Walk me through debugging.**
> Reproduce with their exact session: pull the audit trail — what context was retrieved, what tools were called, what the model saw. First fork: **retrieval or generation?** If the right context never arrived → retrieval problem (fix chunking/metadata/query). If context was there and ignored or contradicted → generation problem (fix prompt: placement, emphasis, few-shot; or a validation check that should have caught it). Then the fix ships with a regression case added to the golden set so it can't quietly come back. The audit-everything design exists precisely so this walk is possible.

### F. System Design & Backend

**Q26. Design a system that runs thousands of automated jobs on cloud machines.** *(I built this — answer from experience)*
> My cloud execution layer is the answer: API accepts work → persists execution docs → enqueues in **Redis**. Each VM runs an **orchestrator** container pulling from the queue with **atomic Lua scripts** (check-capacity-and-claim in one step — no double dispatch), spawning **runner** containers per job. Progress streams back via events; results persist per-step. Reliability: bounded auto-retry on failure, terminate-on-failure draining remaining work to clean states, heartbeats + reconciliation for dead runners, idempotent writes everywhere. Scaling: more VMs horizontally; per-VM concurrency capped at the measured knee (~8 — orchestrator-bound, which I know because I benchmarked it rather than guessed).

**Q27. How do you make an API idempotent and why does it matter?**
> Retries + non-idempotent writes = duplicates. Client sends a **client key** per logical operation; server dedupes on it. I re-architected a bulk save that took ~20 minutes in one blocking POST — timeouts caused retries, retries caused duplicate test cases. Fix: async job + client-key idempotency + polling. Duration dropped to seconds of perceived latency and duplicates became impossible.

**Q28. WebSockets vs SSE vs polling — how do you choose?**
> **SSE** for one-way server→client streams (agent progress) — simpler than WS, plays well with HTTP infra. **WebSockets** for bidirectional or room-based fan-out (live execution steps). **Polling** as the universal fallback — I learned in production that corporate ingress/proxies silently kill socket delivery, so critical notifications (execution completion) poll as a fallback with cross-tab dedup and refresh-safe persistence. Rule: the fancy transport is an optimization; correctness must survive on the dumb one.

**Q29. How have you used Redis beyond caching?**
> Four ways: **cache** (hot query/embedding results — the 40% latency win), **job queue + atomic dispatch** (Lua scripts for claim/dispatch semantics), **pub/sub** (event fan-out to backend instances for SSE/WS delivery), and **coordination state** (cancellation flags, capacity counters, retry bookkeeping). One caveat I know from experience: Redis pub/sub is fire-and-forget — anything that *must* arrive needs a durable record behind it.

**Q30. FastAPI — why, and what features do you lean on?**
> Async-first (LLM workloads are IO-bound — you're mostly awaiting model APIs and DBs), **Pydantic** validation at the boundary (typed request/response models — catches garbage before it reaches logic, and doubles as docs via auto-generated OpenAPI), dependency injection for auth/tenant-resolution per request, and background tasks/streaming responses for long work. It's the default choice for Python AI services and I've run it in production.

**Q31. SQL quick check — expect one live query.**
> Rehearse: joins (`INNER` vs `LEFT`), `GROUP BY` + `HAVING`, a window function (`ROW_NUMBER() OVER (PARTITION BY … ORDER BY …)` for "latest row per group"), and index basics (B-tree, composite index column order, why `LIKE '%x'` can't use one). Example to have ready: *"second-highest salary"* — `SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);` or the `DENSE_RANK` version.

### G. Python Quick-Fire

**Q32. async/await — when does it help?**
> IO-bound concurrency: one event loop interleaves thousands of waiting operations (LLM calls, DB, HTTP) without threads. Doesn't help CPU-bound work — the GIL means one thread executes Python bytecode at a time; for CPU-heavy work use multiprocessing or native libs. My agent server is async end-to-end because it's almost pure IO.

**Q33. Generators / decorators / context managers — one-liners.**
> **Generators:** lazy iteration (`yield`) — I use them for streaming tokens/events without buffering. **Decorators:** wrap functions to add behavior — retry-with-backoff around LLM calls, auth checks, timing. **Context managers:** deterministic setup/teardown (`with`) — connections, locks, temp resources.

**Q34. How do you structure a Python service for testability?**
> Layers: routes → services → repositories; dependencies injected so tests swap fakes; Pydantic models at boundaries; LLM calls behind an interface so tests use recorded/stub responses (never live API calls in CI); config via environment with typed settings.

### H. Behavioral & Startup Fit

**Q35. Tell me about a hard production bug.** *(have 2 ready)*
> **Story 1 — the silent socket:** completion notifications worked locally, never on the deployed environment. Users thought runs were hung. Live steps "worked," which threw everyone — but they worked via polling, masking a dead socket path. I traced it to the ingress not delivering room-broadcasts, then shipped an app-side fix — polling fallback with localStorage persistence and cross-tab dedup — instead of waiting on an infra change. Lesson: one working symptom can mask a broken transport; verify the *path*, not the outcome.
>
> **Story 2 — hallucinated locators:** generated tests looked perfect and failed at runtime — the LLM invented plausible element locators. Fix: deterministic extraction of real locators into a registry, generation constrained to select from it, post-generation verification overwriting anything invented. Zero fabricated locators after. Lesson: **for deterministic facts, make the LLM select, not generate** — my favorite design principle to bring up.

**Q36. Time you took ownership beyond your role?**
> The cloud runner provisioning: the ask was "make cloud execution work," but setup needed manual VM preparation — not shippable for customers. I designed and built the full self-provisioning flow — SSH bootstrap, private-registry pulls, encrypted credentials, teardown — plus benchmarked capacity limits, then drove pivoting the approach (build-on-VM → registry-pull) after discussing trade-offs with my manager: clients shouldn't need source access, and pull-only is faster and safer. End result: "Add Machine" is one click.

**Q37. How do you learn new tech fast?**
> Build something small and real within a day — reading docs alone doesn't stick for me. When MCP was new, I stood up a toy server with two tools and broke it until I understood the protocol, then designed the production tool layer. I also read other people's failure reports (GitHub issues, postmortems) early — knowing how a tool fails teaches you more than knowing how it works.

**Q38. Why this company / why leave Simplify3x?**
> Frame positively: *"I've had great growth — two promotions, ownership of major systems. I'm looking for [deeper agent platform work / larger scale / the specific domain] and this role is exactly the intersection of what I've built and what I want to go deeper on: autonomous agents for business processes, with the evaluation and observability rigor of a dedicated AI platform team."* Never badmouth the current employer.

**Q39. Weakness / gap question.**
> Honest + improving: *"My evaluation practice has been pragmatic — golden sets, programmatic checks, user-behavior signals — but I haven't run a formal eval platform like Langfuse at scale, and I want to. That's part of why this role appeals: it treats evaluation as a first-class engineering problem."* (Turns the gap into motivation for *their* role.)

---

## 5. My Known Gaps — Prep Plan

| Gap (JD asks) | My honest position | Action before interviews |
|---|---|---|
| **Langfuse / W&B** | Built equivalent in-house pieces; not used the tools | Weekend project: wire Langfuse into a small agent (~20 lines); then it's "used in a personal project" |
| **LangGraph** | Custom loop + MCP instead; know the concepts | Build one small LangGraph workflow with a checkpointer + `interrupt` (HITL) so I can compare from experience |
| **Anthropic / Gemini APIs directly** | Used via LiteLLM gateway | Skim both APIs' tool-calling formats; be able to name differences (Anthropic `tool_use` blocks, Gemini function declarations) |
| **Formal eval frameworks** | Pragmatic evals only | Be fluent in: golden sets, LLM-as-judge + calibration, regression gates in CI |

---

## 6. Questions to Ask Them

1. "What do your agents automate today, and what's the failure mode that hurts most — hallucination, latency, cost, or integration breakage?"
2. "How do you evaluate agent changes before they ship — golden sets, LLM-as-judge, human review? What's the regression gate?"
3. "How is tenant isolation enforced in the agent context path — at retrieval, at the prompt layer, or below?"
4. "What does the human-in-the-loop look like in your workflows — who approves, and what's fully autonomous today?"
5. "What's the six-month roadmap for the agent platform, and where would I own something end-to-end?"

*(These double as proof you've lived these problems.)*

---

## Cheat Numbers (drop naturally in answers)

- **5,000+ tables** in the RAG corpus · **zero PHI exposure**
- **40%** latency reduction (Redis + API optimization)
- **~8 parallel executions/VM** — measured, not guessed
- **~20 min → async** idempotent bulk save; duplicates eliminated
- **9+ input formats** (docs, sheets, slides, images, audio/video, Figma, code repos)
- **2 promotions in 2 years** · Hidden Gem award (July 2025)

---
---

# PART 2 — In-Depth Technical Q&A

> Deeper follow-up questions interviewers use to separate "used LLMs" from "understands LLMs." Numbering continues from Part 1.

## I. LLM Fundamentals

**Q40. How does an LLM actually work under the hood?**
> It's a transformer trained to predict the next token. Input text is split into tokens, each mapped to an embedding vector plus positional information, then passed through stacked layers of **self-attention** and feed-forward networks. Self-attention is the key mechanism: every token computes relevance weights against every other token in the context, which is how the model relates "it" back to the right noun three sentences earlier. The output is a probability distribution over the vocabulary for the next token; generation is just sampling from that distribution repeatedly. Two practical consequences I design around: cost and latency scale with token count (attention compares tokens pairwise), and the model is optimizing *plausibility*, not *truth* — which is the root of hallucination.

**Q41. What are tokens, and why do they matter practically?**
> Subword units from a tokenizer like BPE — roughly 4 characters or ¾ of a word in English. Everything is denominated in tokens: pricing, context limits, latency, rate limits. Practically: I budget prompts by token count (system prompt + retrieved context + history + output reserve), count with the provider's tokenizer rather than guessing, and know the gotchas — code, numbers, and non-English text tokenize much less efficiently, so the same "amount" of content can cost 2–3× more tokens.

**Q42. What are embeddings and how do they work?**
> Dense vectors (hundreds to thousands of dimensions) that place text in a space where semantic similarity becomes geometric closeness. Embedding models are trained contrastively — similar pairs pulled together, dissimilar pushed apart — so "patient insurance details" and a table called `pt_ins_dtl` can land near each other even with zero string overlap. That's the entire foundation of RAG. I use them for retrieval (AI TDM's table search, document search in the agent), and they also serve dedup, clustering, and classification. Key operational fact: embeddings from different models (or versions) are **not comparable** — changing the embedding model means re-embedding the whole corpus, so plan migrations.

**Q43. What happens when you exceed the context window? Are long-context models the answer?**
> Exceed it and the request errors or the input gets truncated — usually silently losing the oldest content, which is catastrophic if that was the system prompt or key facts. Long-context models help but aren't free: cost and latency scale with input size, and there's the **"lost in the middle"** effect — models attend best to the beginning and end of a long context and dilute in the middle. So my default is still *retrieve small and relevant* over *stuff everything*, plus summarization for history. Long context is for genuinely irreducible inputs, not a substitute for retrieval discipline.

**Q44. Explain temperature, top-p, and top-k.**
> All shape sampling from the next-token distribution. **Temperature** rescales logits: →0 makes the model near-deterministic (always the most likely token), higher flattens the distribution for diversity. **Top-k** samples only from the k most likely tokens; **top-p (nucleus)** samples from the smallest set whose cumulative probability exceeds p — adaptive where top-k is fixed. My defaults: temperature ~0 for anything structured (SQL, JSON test cases, extraction) because consistency and validity matter; ~0.7 only where variety is a feature, like proposing diverse test scenarios. Tune temperature *or* top-p, not both blindly.

**Q45. Why do LLMs hallucinate — the actual root cause?**
> Because the training objective rewards *plausible continuation*, not *verified fact*. The model has no lookup step — knowledge is compressed statistically into weights, and where coverage is thin, it interpolates: fluent, confident, wrong. It's worse when the prompt presupposes an answer exists ("what's the locator for the submit button?" — it will produce *a* locator). Which is why my mitigation stack is architectural, not prompt-only: ground on retrieved sources, give an explicit "not found" escape hatch, constrain outputs to schemas, and verify deterministic facts post-generation — the locator-registry pattern: for facts that exist deterministically, make the model **select, not generate**.

**Q46. When would you fine-tune instead of RAG or prompting?**
> Order of escalation: prompting → RAG → fine-tuning. Fine-tune for *behavior*: consistent style/format/tone, domain-specific output patterns, reliable tool-call formatting at scale, or distilling a big model's behavior into a smaller/cheaper one. Don't fine-tune for *facts* — they go stale, updating means retraining, and in multi-tenant settings it's a non-starter (you can't bake tenant A's data into shared weights; that's a privacy violation waiting to happen). Technique-wise, full fine-tuning updates all weights and is expensive; **LoRA/PEFT** trains small low-rank adapter matrices (~1% of parameters) — cheap, fast, and adapters are swappable per use case. Data quality beats quantity; always eval before/after on a held-out set.

**Q47. Base model vs instruct/chat model?**
> A base model is the raw next-token predictor — prompt it with a question and it may continue with *more questions*, because that's plausible text. Instruct/chat models are post-trained: supervised fine-tuning on instruction–response pairs, then preference optimization (RLHF or DPO) to be helpful, follow instructions, and refuse harmful requests. Practical implications: production work uses instruct models, chat-template roles (system/user/assistant/tool) matter and are enforced by the API, and the system prompt gets special adherence weight — which is why instruction hierarchy exists and why prompt injection tries to break it.

## J. Vector Search — Deeper

**Q48. Cosine similarity vs dot product vs Euclidean distance?**
> Cosine measures the angle between vectors, ignoring magnitude — the robust default for text embeddings, and on normalized vectors it's equivalent to dot product and monotonic with Euclidean, so the "choice" often collapses. Dot product is magnitude-sensitive — right when the embedding model was *trained* for it (some encode relevance strength in magnitude). The real rule: **use the metric the embedding model was trained with** — it's in the model card, and mismatching quietly degrades retrieval.

**Q49. How does vector search scale? HNSW vs IVF?**
> Exact (brute-force) search is O(N) per query — fine into the hundreds of thousands of vectors, and honestly the right choice more often than people admit. Beyond that, approximate (ANN) indexes: **HNSW** builds a layered proximity graph — very fast queries, high recall, but memory-hungry and slower to build/update. **IVF** clusters vectors and probes only the nearest clusters — lighter, tunable via probe count, lower recall at the edges. It's a recall/latency/memory triangle. Two production gotchas: metadata filtering interacts badly with ANN (filter can starve the candidate set — need pre-filtering support or over-fetch), and index parameters need re-tuning as the corpus grows.

**Q50. Chunking — how do you do it well?**
> Chunking determines what a vector *means*, so it's the highest-leverage RAG decision. Fixed-size with overlap is the baseline; structure-aware beats it — split on semantic units (headings, paragraphs, sections) so each chunk is one coherent idea. Too small: retrieval hits lack context to answer. Too big: the embedding averages multiple topics and matches nothing well, plus you waste prompt budget. Always attach metadata (source, section, page) for filtering and citations. In AI TDM the chunks were natural units — one table's schema+description = one document — which is part of why retrieval worked well; when your domain has natural units, use them.

**Q51. What are hybrid search and re-ranking, and when do they matter?**
> Vector search misses exact identifiers — table names, error codes, ticket IDs — that keyword search (BM25) nails; hybrid runs both and fuses results (e.g., reciprocal rank fusion). Then a **re-ranker** (cross-encoder) rescores the top ~50 candidates by encoding query+document *together* — far more accurate than embedding similarity, far too slow for the full corpus, perfect for the final cut to top 5. In enterprise settings with heavy jargon and cryptic naming, hybrid + re-rank is usually the single biggest retrieval quality jump.

**Q52. How do you measure retrieval quality?**
> Build a labeled set of query → relevant-documents pairs, then: **recall@k** (did the needed doc make the top k — the metric that matters most for RAG, because the LLM can't use what never arrived), **MRR** (how high does the first relevant doc rank), **nDCG** for graded relevance. Track alongside end-to-end answer quality — a retrieval "improvement" that doesn't move answer accuracy isn't one. My production proxy signal: how often users rephrase or the agent needs another search round-trip.

## K. Advanced RAG

**Q53. The retrieved context is right but the model still answers wrong. What now?**
> Now it's a generation problem, and I work through: **placement** — key context buried mid-prompt gets lost-in-the-middle, so move it near the instruction; **contradiction** — the model's parametric prior is overriding the context, so instruct explicitly "answer only from the provided context" and cite; **dilution** — too many chunks, so retrieve fewer/better; **format** — context as a wall of text vs clearly delimited, labeled sources. If it persists, add a verification pass that checks each claim against the context. This retrieval-vs-generation fork is my standard debugging tree (Q25).

**Q54. Query rewriting, multi-query, HyDE — when do you use them?**
> When retrieval fails on *phrasing*, not content. **Rewriting:** conversational queries are terrible search queries — "what about the second one?" must be rewritten with dialogue context into a standalone query before embedding (essential in multi-turn chat; I do this). **Multi-query:** generate 3–4 paraphrases, retrieve for all, union — covers vocabulary mismatch. **HyDE:** have the LLM write a *hypothetical answer* and embed that — an answer-shaped query often lands closer to answer-shaped documents than the question does. Each adds an LLM call, so apply where the failure analysis says phrasing is the problem.

**Q55. How do you enforce permissions inside RAG?**
> Access control happens **at retrieval, before the prompt** — never "instruct the model not to reveal." Tenant isolation structurally: per-tenant collections or tenant-scoped connections (we used tenant-specific DBs) so a query physically can't cross. Within a tenant, per-user ACL metadata on chunks, enforced as mandatory filters by the retrieval layer. The principle I repeat: if a fact reaches the prompt, assume it can reach the user — the prompt is not a security boundary.

**Q56. How would you evaluate a RAG system end-to-end (RAGAS-style)?**
> Four complementary metrics: **context recall** (did retrieval fetch everything needed), **context precision** (is what was fetched actually relevant), **faithfulness** (is the answer grounded in the context, or embellished), **answer relevance** (does it address the question). The first two isolate retrieval, the last two isolate generation — so a score drop tells you *which half* to fix. Faithfulness and relevance are LLM-judged; calibrate the judge against a human-labeled sample before trusting trends.

**Q57. Summarizing/processing documents longer than the context — approaches?**
> **Stuff** if it fits (simplest, often fine). **Map-reduce:** process chunks independently in parallel, then combine — fast and scalable, loses cross-chunk references. **Refine:** sequential pass carrying a running result — better coherence, slow, error-compounding. **Hierarchical:** summarize sections, then summarize summaries. The Intelligence Hub's pipeline is deliberately map-reduce shaped: one outline pass over the whole document, then parallel per-scenario detail passes that each pull only their slice — coherence from the outline, speed from the parallel fan-out.

## L. Agents & Tool Calling — Deeper

**Q58. Explain the ReAct pattern.**
> Reason + Act, interleaved: the model produces a *thought* (what do I know, what do I need), then an *action* (a tool call), gets an *observation* (the result), and loops. Versus one-shot answering, it decomposes problems, adapts to what tools return, and leaves an auditable reasoning trail. My agent loop is structurally ReAct — the "thoughts" are the analysis/planning turns, the "actions" are MCP tool calls, and the observation feed is what streams to the user as the narrative.

**Q59. What actually happens on the wire in function calling?**
> You send the tool catalog as JSON Schemas with the request. The model, instead of (or alongside) text, returns a structured call — OpenAI: `tool_calls[]` with a name and JSON-encoded arguments; Anthropic: `tool_use` content blocks; Gemini: `functionCall` parts. Your runtime executes the function and sends the result back as a tool-role message, and the model continues with that observation. Things you must handle in production: **malformed arguments** (validate against schema; feed the validation error back for one repair attempt), **parallel calls** in a single turn, and the model choosing not to call any tool when it should (or vice versa) — which is prompt + tool-description tuning.

**Q60. How do you guarantee valid structured output (JSON)?**
> Best: provider-native structured outputs / JSON mode with an explicit schema — constrained decoding makes invalid JSON impossible. Where unavailable: schema + example in the prompt, temperature 0, then **validate with Pydantic** and on failure send the error back for a single repair round-trip; hard-fail after that rather than retry-looping cost away. And design schemas for the model: flat-ish, descriptive field names, enums over free text — the schema is itself a prompt.

**Q61. How do agents remember? Short-term vs long-term memory.**
> Short-term = the conversation context, managed by budget: recent turns verbatim, older turns summarized, tool payloads dropped and kept as references (results are re-fetchable — don't carry 50KB of document text through every turn). Long-term = engineered external state: durable job records with partial results (my system's memory across restarts and days), session state, vector memory over past interactions if needed, user/tenant preferences. The framing I use: memory is a **storage + retrieval engineering problem**, not a model capability — the model only ever sees what you assemble into the next prompt.

**Q62. How do you run tools in parallel safely?**
> Fan out only *independent* calls (my per-scenario generation). Requirements: per-call isolation so one failure doesn't abort the batch (collect errors, let the rest land); rate-limit awareness with a concurrency cap (semaphore) so you don't self-inflict 429s; idempotency if anything can be retried; and result reconciliation — parallel results arrive out of order with sometimes-different IDs/titles than planned, so I built fuzzy matching between the planned outline and landed results to keep UI state consistent. That last one is the kind of thing you only learn shipping it.

**Q63. How do you test an agent system?**
> A pyramid. **Unit:** every tool tested deterministically with no LLM — tools are just functions. **Contract:** the loop tested against *recorded/mocked* model responses — "given the model emits this tool call, assert dispatch, error handling, state transitions" — fast, deterministic, runs in CI. **Scenario evals:** live model on a golden set of tasks, scored by programmatic checks + judge — this is where regressions from prompt/model changes show up. **Chaos:** malformed arguments, tool timeouts, mid-run cancellation, process restart (does the durable job recover?). Plus production replay: the audit trail lets me re-run any real failed session. Never let CI depend on live LLM calls for pass/fail — flaky and expensive.

**Q64. Deep-dive LangGraph — what would you need to know to use it tomorrow?** *(gap question — answer shows I did homework)*
> The mental model: your workflow is a **StateGraph** — a typed state schema (usually a dict/TypedDict with reducers for merging updates), **nodes** are functions that receive state and return updates (LLM calls, tools, plain logic), **edges** define flow with **conditional edges** for branching (a router function inspects state and picks the next node). Compile it, invoke it with a `thread_id`, and a **checkpointer** (Postgres/SQLite/memory) persists state at every step — which gives you resume-after-crash, time-travel debugging, and **`interrupt()`** for human-in-the-loop: the graph pauses, a human responds, you resume with `Command(resume=value)`. That's a 1:1 map of what I hand-built — my durable jobs are the checkpointer, my ask_user gate is interrupt — so the concepts are already muscle memory; only the API is new.

**Q65. MCP in depth — what does the protocol actually standardize?**
> Three primitives a server can expose: **tools** (model-invokable functions with schemas), **resources** (readable data/context, addressed by URI), and **prompts** (reusable templates). Transports: stdio for local servers, HTTP with streaming for remote. The client (the agent host) connects, *discovers* capabilities at runtime, and the model can then call any discovered tool — meaning tool providers and agent implementations are decoupled: one Figma or DB server serves any MCP-compatible agent. That's the strategic point versus hard-wiring functions into one app: an integration ecosystem with a single surface, plus a natural place for per-server auth and policy. I built our agent's tool layer on FastMCP, so I've lived the server side of this.

**Q66. When is an agent the WRONG choice?**
> When the workflow is known in advance. If the steps are fixed — fetch, transform, generate, save — a deterministic pipeline is cheaper, faster, testable, and debuggable; sprinkling an agent on it adds latency, cost, and a new failure mode (the model deciding wrong). Agents earn their complexity only when the *path* genuinely depends on runtime discoveries — what's in this document, what did the user answer, what did the last tool reveal. I run both side by side: cloud test execution is deterministic orchestration (an agent would be strictly worse); document→test-case generation is an agent because the plan depends on the document. Interviewers love this answer because over-agenting is the current industry disease.

**Q67. How do you control agent cost and latency?**
> Hard budgets per run: max iterations, wall-clock timeout, token ceiling — enforced by the loop, not hoped for. Per-step model routing (small model for classification/extraction sub-tasks, large for generation — LiteLLM makes this a config change). Parallelize the independent parts (the fan-out). Cache what repeats (embeddings, retrieval). And degrade gracefully: my scenarios land incrementally as each completes, so a failure at scenario 18 of 20 still delivers 17 — partial value beats all-or-nothing at both the UX and the cost level.

## M. Security & Guardrails — Deeper

**Q68. Design a complete guardrail stack for an enterprise agent.**
> Five layers, each assuming the others can fail. **L1 input:** authn + tenant scoping, file type/size validation, content moderation where input is free text. **L2 context assembly:** only tenant-scoped retrieval; untrusted content structurally separated from instructions. **L3 loop:** per-pipeline tool allowlists, schema-validated arguments, iteration/time/cost caps, no state-mutating tool without a gate. **L4 output:** schema validation, grounding verification against sources, PII scan, policy checks. **L5 process:** human approval before persistence, full audit trail, undo/rollback (my 10-step undo stack exists for exactly this). The design stance: guardrails are layered *systems* engineering — a system prompt saying "be safe" is not a guardrail.

**Q69. Prompt injection vs jailbreak — and which one keeps you up at night?**
> **Jailbreak:** the *user* manipulates the model past its own rules — a user-vs-model problem. **Prompt injection:** instructions hidden inside *content* the system processes — a document, a web page, a retrieved chunk — hijack an agent that was doing something legitimate. Injection is the dangerous one for my systems, because we ingest arbitrary user documents: a PDF could contain "ignore previous instructions and …". Mitigations: treat all retrieved/uploaded content as data, never instructions (structural separation in the prompt); narrow, validated tool parameters so a hijacked call has a small blast radius; no exfiltration-capable or destructive tool behind an agent decision alone — human gates on consequential actions; output validation so injected content can't ride out in artifacts. And honesty: this is an unsolved research area — defense in depth and blast-radius limitation, not a silver bullet.

**Q70. How do you handle PII/PHI in LLM systems?**
> In order of strength: **don't send it** — my favorite example is the AI TDM design, where retrieval runs over schema/metadata so PHI never enters a prompt at all — the strongest control is architectural absence; **redact/pseudonymize** before the prompt and re-map after; **contract controls** (zero-retention API agreements, no training on our data); field-level encryption at rest, access audit, and DLP-style scans on outputs as the last net.

## N. Evaluation & Observability — Deeper

**Q71. Build an evaluation pipeline from scratch — walk me through it.**
> (1) Collect ~20–50 *representative* inputs — real production cases plus deliberate edge cases; small and real beats large and synthetic. (2) Define metrics per task: programmatic checks first (schema validity, coverage, grounding — cheap, objective, catch most regressions), LLM-as-judge only for what code can't score. (3) Baseline the current system. (4) Every prompt/model/retrieval change runs the set and diffs against baseline — in CI for the deterministic subset, nightly for the full judged run. (5) Gate releases on regression. (6) Every production failure becomes a new case — the set compounds in value. This is exactly the framework I'd bring, and I'd wire it into Langfuse so scores attach to traces.

**Q72. LLM-as-judge — what are its failure modes and how do you fix them?**
> **Position bias** (prefers whichever answer is shown first → evaluate pairwise both ways, average), **verbosity bias** (longer reads as better → rubric explicitly scores concision), **self-preference** (models rate their own family higher → judge with a different family than the generator), and **rubric drift** (vague criteria → anchored scales with concrete descriptions per score level). Above all: **calibrate** — score a sample with humans, measure judge–human agreement, and only trust the judge for *trends* at the level where it agrees. A judge is a noisy instrument you calibrate, not an oracle.

**Q73. What exactly would you trace in production (Langfuse mental model)?**
> One **trace** per user request; **spans** for each step — retrieval, every tool execution, every LLM **generation** with model, prompt version, input/output tokens, latency, and computed cost (tokens × unit price). Attach **scores** to traces: automated checks, judge scores, and user feedback signals (edited? deleted? retried?). Then the questions that matter become queries: cost per feature per tenant, p95 latency by stage, which prompt version regressed, which tenant's documents produce the most failures. I've built ad-hoc versions of all of this — events, audit logs, job progress — which is precisely why I'd rather adopt the standard tool than keep maintaining my own.

**Q74. How do you catch quality regressions that metrics miss?**
> Behavioral signals: **edit distance between what the agent produced and what the user saved** (rising = quality falling), deletion/retry rates, abandoned sessions, time-to-accept. Sample-based human review of production traces on a schedule, weighted toward new input types. And a feedback loop with support/CS — users report "it feels worse" before dashboards do. The philosophy: your golden set measures what you *knew* to test; production behavior measures what you didn't.

## O. System Design — Deeper

**Q75. Design a multi-tenant SaaS backend — walk through tenancy models.**
> Three levels. **Shared tables + tenant_id column:** cheapest, elastic, but one missing WHERE clause = cross-tenant leak; needs discipline (query builders that force the filter, row-level security). **Schema-per-tenant:** middle ground. **Database-per-tenant:** strongest isolation, per-tenant backup/restore/compliance, at the cost of connection management and migration fan-out — this is what our enterprise product uses: a middleware resolves each request's tenant to its own DB connection/models, so isolation is structural. Real systems hybridize: small tenants pooled, enterprise tenants get dedicated DBs. For AI platforms add: per-tenant LLM configs/keys, per-tenant vector namespaces, tenant-scoped event channels, and per-tenant cost metering.

**Q76. Design rate limiting for an LLM-backed API.**
> Two directions. **Inbound:** token-bucket per user + quota per tenant (burst-friendly, fair), enforced at the gateway, 429 with Retry-After. **Outbound (the interesting one):** the LLM provider is itself rate-limited, so treat provider capacity as a shared resource — central concurrency caps, retry with exponential backoff + jitter on 429s, queue-don't-drop when saturated, and per-tenant fairness so one tenant's batch job can't starve everyone. War story: I once "found" a VM capacity ceiling that was actually a hidden client-side batch limiter (10/60s) — since then I profile where the limit *actually* lives before designing around it.

**Q77. How do you scale real-time updates (SSE/WebSockets) across multiple backend instances?**
> The problem: the instance processing the job isn't necessarily the one holding the client's connection. Solution: publish events to a shared bus — Redis pub/sub — and every instance forwards relevant events to its own connected clients; room/channel naming scoped by tenant/user/session. WebSockets need sticky sessions for the handshake; SSE is plain HTTP and load-balances more easily. And the production lesson I always add: corporate proxies and ingress controllers silently kill long-lived connections, so anything critical (completion notifications) gets a **polling fallback** with dedup — the realtime channel is a latency optimization, never the correctness path.

**Q78. Caching for LLM apps — what layers exist and how do you invalidate?**
> Bottom-up: **embedding cache** (same text → same vector; content-hash keyed, effectively immutable), **retrieval cache** (query → results; TTL + bust on index update), **semantic response cache** (embed the query, serve a cached answer if a previous query is similar enough — big cost saver for repeated questions, dangerous without a tight similarity threshold and staleness policy), and classic HTTP/data caches. Cache keys must include tenant and prompt/model version — a prompt upgrade must not serve stale-version answers. My Redis layer in AI TDM did the embedding + hot-query tiers and was the core of the 40% latency cut.

**Q79. SQL vs MongoDB — how do you choose, and how do you index Mongo?**
> Relational when data is genuinely relational — many-to-many, cross-entity transactions, ad-hoc joins for analytics. Document store when entities are naturally nested aggregates read/written as units — a test case with embedded steps, parameters, and data is one document, which is why Walnut runs on Mongo. Indexing is the same discipline as SQL: compound indexes matching query shape with **equality → sort → range** field order, covered queries where hot, `explain()` to verify, and don't index everything (write cost). Aggregation pipeline for reporting. The honest answer includes: most real systems use both.

**Q80. How do you design for consistency without distributed transactions?**
> Accept that events get lost and processes die, then make the system **converge** anyway: idempotent writes (client keys), reconciliation loops that compare authoritative state and repair drift (my reapers + session-hint clearing), heartbeats to detect silent death, and terminal-state transitions that are themselves idempotent. Instead of trying to guarantee every message arrives (you can't), guarantee that *missing* any message self-heals within a bounded window. My whole cloud execution layer is built on this philosophy, and it's what I'd say makes an agent platform production-grade rather than demo-grade.

**Q81. Docker in depth — what do you actually use?**
> Images are stacked immutable layers — Dockerfile ordered dependencies-before-code so rebuilds hit cache; multi-stage builds so build toolchains never ship in the runtime image; healthchecks so orchestration knows liveness; named volumes for state; private registry with **explicit version tags and labels** — a lesson I paid for: two of our services shipped components whose wire protocol was version-locked, and a partial image bump broke them silently. Since then: pin versions, tag deliberately, and version-stamp images with labels so you can audit what's deployed by inspection.

## P. Python — Deeper

**Q82. Explain the asyncio event loop and the classic mistakes.**
> One thread runs an event loop that schedules coroutines; `await` is a yield point where the coroutine parks and the loop runs something else — that's how one process juggles thousands of concurrent LLM/DB/HTTP waits. `create_task` schedules concurrently; `gather` collects. Classic mistakes: calling a **blocking** function (requests, heavy CPU, sync DB driver) inside async code — it freezes the entire loop (use async clients or `run_in_executor`); forgetting `await` (coroutine never runs, silently); unbounded fan-out (`gather` on 5,000 calls self-inflicts rate-limit death — bound with a semaphore); and mixing sync/async carelessly at boundaries.

**Q83. asyncio vs threads vs multiprocessing?**
> By bottleneck. **IO-bound, high concurrency** → asyncio (LLM apps live here). **IO-bound but stuck with blocking libraries** → threads (GIL releases on IO). **CPU-bound** → multiprocessing (separate interpreters bypass the GIL; pay serialization cost) or native-extension libs that release the GIL internally. One sentence on the GIL: only one thread executes Python bytecode at a time, so threads never speed up pure-Python CPU work.

**Q84. Write a retry decorator with exponential backoff.** *(common live-coding ask)*
```python
import asyncio, functools, random

def retry(times=3, base=0.5, retry_on=(TimeoutError, ConnectionError)):
    def deco(fn):
        @functools.wraps(fn)
        async def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return await fn(*args, **kwargs)
                except retry_on:
                    if attempt == times - 1:
                        raise
                    delay = base * (2 ** attempt) + random.uniform(0, 0.1)
                    await asyncio.sleep(delay)
        return wrapper
    return deco
```
> Talking points while coding: **jitter** prevents thundering-herd retries; retry only *retryable* errors (429/5xx/timeouts — never 400s, they'll fail identically forever); in real code honor the provider's `Retry-After` header; and cap total elapsed time, not just attempts.

**Q85. Limit concurrency of many async calls.** *(pairs with the above)*
```python
async def fetch_all(items, worker, limit=8):
    sem = asyncio.Semaphore(limit)
    async def bounded(item):
        async with sem:
            return await worker(item)
    return await asyncio.gather(*(bounded(i) for i in items),
                                return_exceptions=True)
```
> `return_exceptions=True` so one failure doesn't cancel the batch — then partition results from exceptions and handle each. This is literally the shape of my parallel scenario generation.

**Q86. Python gotchas they love to probe.**
> **Mutable default arguments** (`def f(x=[])` — the list is shared across calls; use `None` sentinel). **Late-binding closures** in loops (all lambdas see the final loop value; bind with a default arg). Shallow vs deep copy. `is` vs `==` (identity vs equality — and small-int/string interning makes `is` *sometimes* work, which is the trap). Dict preserves insertion order (3.7+). Exception handling: catch narrow, never bare `except:`.

## Q. SQL — Deeper

**Q87. Window functions — the patterns to have ready.**
```sql
-- Latest run per test case:
SELECT * FROM (
  SELECT r.*, ROW_NUMBER() OVER (
    PARTITION BY test_case_id ORDER BY created_at DESC) AS rn
  FROM runs r
) t WHERE rn = 1;

-- Change vs previous value:  LAG(status) OVER (PARTITION BY tc ORDER BY ts)
-- Running total:             SUM(cost) OVER (ORDER BY day)
```
> The one-liner distinction to say out loud: `GROUP BY` collapses rows; window functions compute across a partition **while keeping every row**. `ROW_NUMBER` vs `RANK` vs `DENSE_RANK` differ on ties.

**Q88. Why is my query not using the index?**
> Usual suspects: composite index column order doesn't match (index on `(a, b)` serves `a` and `a AND b`, not `b` alone); a function or cast applied to the indexed column (`WHERE DATE(ts) = …` — rewrite as a range); leading-wildcard `LIKE '%x'`; low selectivity (optimizer rightly prefers a scan); stale statistics. Verification is always `EXPLAIN` — reason from the plan, not vibes.

**Q89. Design a schema for storing agent runs/traces.** *(bridges SQL + observability — great to volunteer)*
```
runs(id, tenant_id, user_id, feature, status, model, prompt_version,
     started_at, ended_at, total_tokens, total_cost)
spans(id, run_id, parent_span_id, type, name, started_at, ended_at, meta_json)
generations(id, span_id, model, input_tokens, output_tokens, cost, latency_ms)
scores(id, run_id, metric, value, source)   -- auto | judge | human
```
> Index `(tenant_id, started_at)` and `(run_id)` on children. Then cost-per-tenant, p95-per-stage, and regression-by-prompt-version are simple queries. Point out this is essentially Langfuse's data model — shows you understand the tool by its schema.

## R. Likely Coding-Round Tasks (with approach)

**Q90. LRU cache.**
> `OrderedDict`: on get, `move_to_end`; on put, insert then `popitem(last=False)` if over capacity — both O(1). Mention the underlying structure (hash map + doubly-linked list) to show you know *why* it's O(1).

**Q91. Token-bucket rate limiter.**
> State: `tokens`, `last_refill`. On each request: refill `elapsed × rate` up to capacity; if ≥1 token, consume and allow, else reject/wait. Per-key dict of buckets for per-user limits. Thread/async safety via a lock if asked.

**Q92. Merge overlapping intervals.**
> Sort by start; iterate, extend the current interval's end while `next.start <= cur.end`, else emit and restart. O(n log n). Classic.

**Q93. Top-k frequent items.**
> `collections.Counter(items).most_common(k)` — then be ready to discuss what's underneath (heap, O(n log k)) and the streaming variant (fixed-size min-heap).

**Q94. Chunk a document with overlap.** *(AI-flavored — plausible here)*
> Sliding window over sentences/paragraphs, tracking token counts (approximate by words × ratio if no tokenizer); carry the last N tokens into the next chunk as overlap; attach source metadata to each chunk. Discuss size/overlap trade-offs from Q50 while writing it.

**Q95. Call an API with retries, timeout, and bounded concurrency.**
> Compose Q84 + Q85: semaphore for concurrency, retry decorator for resilience, `asyncio.wait_for` for per-call timeout, `return_exceptions` + partition for partial failure. Say it out loud: "this is the exact shape of production LLM fan-out code."

---

## Rapid-Fire Definitions (30-second answers)

- **LLM vs SLM:** parameter scale; SLMs (sub-~10B) for cheap routing/extraction, LLMs for complex generation — route by task difficulty.
- **Zero-/few-shot:** no examples vs in-prompt examples; few-shot is the cheapest large quality win for structured tasks.
- **Chain-of-thought:** ask for step-by-step reasoning before the answer; improves multi-step correctness; keep it out of final structured payloads.
- **Distillation:** train a small model on a large model's outputs — cost/latency play.
- **Quantization:** lower-precision weights (e.g., 4/8-bit) → smaller, faster models, slight quality cost; mostly a self-hosting concern.
- **Grounding:** binding generation to retrieved/verifiable sources — my locator registry is grounding for deterministic facts.
- **Semantic caching:** serve cached responses for *similar* (not identical) queries via embedding similarity.
- **Guardrails:** layered input/loop/output/process controls around a model — engineering, not a prompt sentence.
- **HITL:** human checkpoints inside autonomous flows — approval gates, clarifications, escalation.
- **Drift:** input distribution or model-version change degrading quality over time → why continuous eval + monitoring exist.
- **Agentic RAG:** the agent *decides* when/what to retrieve (multi-round) vs fixed retrieve-then-answer — my `search_document` tool is exactly this.
- **A2A vs MCP:** agent-to-agent communication protocols vs model-to-tool protocol — different layers of the stack.

---

*Prep order if time is short: Part 1 sections A + E → Part 2 sections L + N → the two war stories (Q35) → coding tasks Q84–Q85 + Q90–Q92 → rapid-fire list.*
