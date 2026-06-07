# development-checklist.md
## GVSU Men's Club Soccer — Sponsor Outreach Agent
### Phased Build Plan

Check off items as completed. Orchestrator reads this file to know what's done and what's next.

---

## Phase 0 — Planning & Architecture ✅
- [x] Define problem and user pain points
- [x] Write `prd.md`
- [x] Write `architecture.md`
- [x] Write `copilot-instructions.md`
- [x] Write `evaluation.md`
- [x] Write `personas.md`
- [x] Write `domain-primer.md`
- [ ] Human approval of architecture before build begins

---

## Phase 1 — Project Setup
- [x] Create GitHub repository
- [x] Initialize React + Tailwind project
- [x] Add `.env.example` with API Keys
- [x] Commit all planning docs to repo root
- [x] Verify Brave API key works with a test call
- [x] Set up `src/prompts/` directory

---

## Phase 2 — Agent Harness
- [x] Write `.agents/orchestrator.md`
- [x] Write `.agents/prospector.md`
- [x] Write `.agents/researcher.md`
- [x] Write `.agents/copywriter.md`
- [x] Write `.agents/reviewer.md`
- [x] Write `.agents/persona-evaluator.md`
- [x] Write `.skills/prospect-search.md`
- [x] Write `.skills/contact-research.md`
- [x] Write `.skills/email-personalization.md`
- [ ] Load letter template into `src/prompts/letter-template.md`

---

## Phase 3 — Core Pipeline (Backend)
- [ ] Implement Prospector agent function with web search
- [ ] Implement Researcher agent function with web search
- [ ] Implement Copywriter agent function with letter template
- [ ] Implement Reviewer agent function (temp=0)
- [ ] Implement Persona Evaluator agent function
- [ ] Implement Orchestrator — chains all agents, handles flags, assembles output
- [ ] Smoke test full pipeline end-to-end with "restaurants near Allendale MI"

---

## Phase 4 — Frontend
- [ ] Build search input (category + location)
- [ ] Build pipeline progress indicator (shows which agent is running)
- [ ] Build prospect card component (business info + drafted email)
- [ ] Build review badges (PASS / FLAG, persona score)
- [ ] Build export — copy to clipboard per email
- [ ] Build export — download all as CSV

---

## Phase 5 — Evaluation
- [ ] Run Prospector planted signal test
- [ ] Run Researcher hallucination test
- [ ] Run Copywriter placeholder test
- [ ] Run Reviewer planted error test (3 broken emails)
- [ ] Run Persona Evaluator correlation test
- [ ] Run full end-to-end pipeline test
- [ ] Run multi-model comparison (Gemini vs Claude Sonnet)
- [ ] Document all results in `evaluation.md`

---

## Phase 6 — Deployment
- [ ] Deploy to Lovable or GitHub Pages
- [ ] Verify public URL loads and pipeline runs
- [ ] Send demo URL to instructor
- [ ] Final commit with all docs updated
