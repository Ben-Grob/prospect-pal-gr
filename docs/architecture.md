# architecture.md
## GVSU Men's Club Soccer — Sponsor Outreach Agent

---

## 1. Mission

This system automates the sponsorship prospecting and outreach process for the GVSU Men's Club Soccer Golf Outing. It finds local businesses in the Grand Rapids / Allendale, MI area, researches contacts, and generates personalized sponsorship emails.

**Users:** Ben Grob (Fundraising Chair), Nick Doletzki (President), future fundraising chairs  
**Success metric:** A user enters a business category, and within 2 minutes receives 10–20 real, researched businesses with ready-to-send personalized sponsorship emails that pass quality review.

---

## 2. Tech Stack

| Layer | Tool | Reason |
|---|---|---|
| Frontend | React + Tailwind (Lovable) | Fast to build, easy to deploy |
| Agent Runtime | Anthropic Claude API | Cost-efficient, good reasoning, $5 credits available |
| Production models | Claude 3.5 Sonnet | Balances quality and speed for agent tasks |
| Development (fast iteration) | Claude 3.5 Haiku | Faster responses for local testing, lower cost |
| Web search | Anthropic web search integration (Claude) | Real business discovery at runtime |
| Hosting | Lovable (auto-deploy) | Instructor-accessible demo URL |
| API keys | Environment variables only — never in code | Security |

> **Model note:** GitHub Copilot models are not accessible via API. Using Anthropic Claude API exclusively (Haiku for dev, Sonnet for prod). If future evaluation requires multi-model comparison, can add OpenAI or other providers as secondary evaluators.

---

## 3. System Architecture

```
USER INPUT
  └── Business category (e.g. "restaurants") + location (e.g. "Allendale MI")

        │
        ▼
┌─────────────────────────────────┐
│         ORCHESTRATOR            │  ← Claude 3.5 Sonnet, temp=0.7
│  Reads: prd.md, personas.md,    │
│  domain-primer.md, checklist    │
│  Plans task breakdown           │
│  Delegates to sub-agents        │
│  Assembles final output         │
│  Logs decisions to feedback-log │
└────────────┬────────────────────┘
             │
     ┌────────┴──────────────────────────────────────┐
     │                                               │
     ▼                                               ▼
┌──────────────────┐                   ┌────────────────────────┐
│ PROSPECTOR AGENT │                   │   RESEARCHER AGENT     │
│ (Claude 3.5      │  ──prospect list─▶│ (Claude 3.5 Sonnet     │
│  Sonnet + web    │                   │  + web search)         │
│  search)         │                   │                        │
│                  │                   │ For each business:     │
│ Searches:        │                   │ - Owner/contact name   │
│ "[category] near │                   │ - Email or contact URL │
│  Allendale MI"   │                   │ - Business size signal │
│                  │                   │ - Years in community   │
│ Output:          │                   │                        │
│ - Business name  │                   │ Output: enriched       │
│ - Type           │                   │ prospect list JSON     │
│ - Address        │                   └──────────┬─────────────┘
│ - Google Maps URL│                              │
└──────────────────┘                              │
                                                  ▼
                                    ┌─────────────────────────┐
                                    │    COPYWRITER AGENT     │
                                    │    (Claude 3.5 Sonnet)  │
                                    │                         │
                                    │ Reads: enriched prospect│
                                    │ data (name, type, owner)│
                                    │                         │
                                    │ Per business:           │
                                    │ - Writes short 4–6 line │
                                    │   personalized intro    │
                                    │ - Names the owner/biz   │
                                    │ - References biz type   │
                                    │   naturally in opener   │
                                    │ - Instructs user to     │
                                    │   attach PDF packet     │
                                    │                         │
                                    │ Output: short warm intro│
                                    │ email per prospect      │
                                    └──────────┬──────────────┘
                                               │
                               ┌────────────────┴──────────────────┐
                               │                                   │
                               ▼                                   ▼
                 ┌─────────────────────────┐      ┌───────────────────────────┐
                 │    REVIEWER AGENT       │      │  PERSONA EVALUATOR AGENT  │
                 │  (Claude 3.5 Haiku,     │      │  (Claude 3.5 Haiku)       │
                 │   temp=0, fast)         │      │  (temp=0.5)               │
                 │                         │      │                           │
                 │ Checks each email:      │      │ Reads as the business     │
                 │ ✓ Business name correct?│      │ owner would:              │
                 │ ✓ No hallucinated facts?│      │ - Would they open this?   │
                 │ ✓ Tone is warm/personal?│      │ - Does it feel personal   │
                 │ ✓ Owner name used?      │      │   or generic?             │
                 │ ✓ PDF mention included? │      │ - Is it concise enough    │
                 │                         │      │   to actually get read?   │
                 │ Output: PASS / FLAG     │      │                           │
                 │ + reason per email      │      │ Output: score (1-5)       │
                 └────────────┬────────────┘      │ + one improvement note    │
                              │                   └──────────┬────────────────┘
                              │                              │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                               ┌─────────────────────────┐
                               │      ORCHESTRATOR       │
                               │   (assembles output)    │
                               │                         │
                               │ - Passes: include       │
                               │ - Flags: route back to  │
                               │   Copywriter for 1      │
                               │   revision pass         │
                               │ - Final list presented  │
                               │   to user               │
                               └─────────────────────────┘
```

---

## 4. Data Flow

```
Raw Input → Prospector → [business list JSON]
                      → Researcher → [enriched prospect JSON]
                                  → Copywriter → [draft emails]
                                              → Reviewer → [pass/flag]
                                              → Persona Eval → [score/note]
                                                           → Orchestrator → Final Output UI
```

All intermediate data passes as structured JSON between agents. No external database needed for the prototype — state is held in memory per session.

---

## 5. UX Primitives

Every screen supports the same three actions:
1. **Search** — category + location input triggers the agent pipeline
2. **Review** — read prospect cards with drafted emails, reviewer scores, persona scores
3. **Export** — copy email to clipboard or download full list as CSV

---

## 6. Agent Definitions (summary)

Full agent `.md` files live in `.agents/`. Summary:

| Agent | Model | Role | Temperature |
|---|---|---|---|
| Orchestrator | Claude 3.5 Sonnet | Plans, delegates, assembles, logs | 0.7 |
| Prospector | Claude 3.5 Sonnet + web search | Finds real local businesses | 0.3 |
| Researcher | Claude 3.5 Sonnet + web search | Enriches with contact info | 0.3 |
| Copywriter | Claude 3.5 Sonnet | Writes short personalized email intro per business | 0.6 |
| Reviewer | Claude 3.5 Haiku | Factual QA, flags errors (fast, cheaper) | 0.0 |
| Persona Evaluator | Claude 3.5 Haiku | Reads as business owner, scores (cheaper) | 0.5 |

**Rationale:**
- **Sonnet for complex tasks** (Orchestrator, Prospector, Researcher, Copywriter): Better reasoning, planning, and multi-step task handling
- **Haiku for QA/scoring** (Reviewer, Persona Evaluator): Deterministic tasks, lower cost, fast enough for feedback

---

## 7. Email + PDF Approach

The Copywriter Agent produces a **short, warm intro email** (4–6 lines) rather than a full letter. The existing PDF sponsorship packet (`ClubSoccerLetterTemplate.pdf`) is attached by the user when sending.

**Email structure:**
1. Personal greeting using owner name if found
2. One sentence introducing Ben/the team
3. One sentence why this business specifically is a good fit (references business type)
4. One sentence pointing to the attached PDF for full details
5. Call to action — reply or contact gvmensoccer@gmail.com
6. Sign-off from Ben and Nick

**Why this works better than a long email:**
- Short emails get read; long ones get skipped
- The PDF already exists and is polished — no need to recreate it in text
- Personalization is concentrated where it matters most: the opening

---

## 8. Evaluation Criteria

Defined fully in `evaluation.md`. In brief:

- **Prospector:** Did it return real, verifiable businesses? (manual spot-check 5 results)
- **Researcher:** Is contact info accurate? (manual spot-check 3 results)
- **Copywriter:** Is business name and owner name used? Is the email short (4–6 lines)? Does it reference the PDF? Is tone warm and specific?
- **Reviewer:** Did it catch intentionally planted errors in test run?
- **Persona Evaluator:** Do scores correlate with human judgment on the same emails?

---

## 9. Deployment

- **Dev:** React app running locally, Claude API key in `.env`
- **Production:** Deploy to Lovable for a public URL the instructor can demo
- **Repository:** GitHub, with `README.md`, this file, and all agent `.md` files committed

---

## 10. Model & Cost Assumptions

**Credit allocation ($5 Anthropic credits):**
- **Development:** Claude 3.5 Haiku (fast iteration, lower cost)
- **Production pipeline:** Claude 3.5 Sonnet (better reasoning + consistency)
- **Reviewer & Persona Eval:** Claude 3.5 Haiku (deterministic tasks, cost optimization)

**Estimated usage per run (10–20 prospects):**
- Prospector: ~2,000 input + 1,500 output tokens (Sonnet) = $0.035 per run
- Researcher: ~3,000 input + 2,000 output tokens (Sonnet) = $0.050 per run
- Copywriter: ~2,500 input + 1,000 output tokens (Sonnet) = $0.038 per run
- Reviewer: ~1,500 input + 800 output tokens (Haiku) = $0.006 per run
- Persona Eval: ~1,500 input + 800 output tokens (Haiku) = $0.006 per run
- Orchestrator: ~500 input + 300 output tokens (Sonnet) = $0.009 per run

**Total per run: ~$0.14.** $5 credits = ~35 full pipeline runs before running out.

---

## 11. Project File Structure

```
prospect-pal-gr/
├── README.md
├── docs/
│   ├── architecture.md          ← this file
│   ├── prd.md
│   ├── personas.md
│   ├── domain-primer.md
│   ├── evaluation.md
│   ├── development-checklist.md
│   └── feedback-log.md
├── .agents/
│   ├── orchestrator.md
│   ├── prospector.md
│   ├── researcher.md
│   ├── copywriter.md
│   ├── reviewer.md
│   └── persona-evaluator.md
├── .skills/
│   ├── prospect-search.md
│   ├── contact-research.md
│   └── email-personalization.md
├── src/
│   ├── components/
│   │   └── SponsorOutreachAgent.tsx
│   ├── agents/              ← agent runner functions
│   ├── prompts/             ← prompt library (never inline)
│   └── ...
└── .env.example             ← API key template, never committed
```
