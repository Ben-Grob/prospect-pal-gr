# architecture.md
## GVSU Men's Club Soccer — Sponsor Outreach Agent

---

## 1. Mission

This system automates the sponsorship prospecting and outreach process for the GVSU Men's Club Soccer Golf Outing. It finds local businesses in the Grand Rapids / Allendale, MI area, researches contacts, and drafts personalized sponsorship emails—all in under 3 minutes per search.

**Users:** Ben Grob (Fundraising Chair), Nick Doletzki (President), future fundraising chairs  
**Success metric:** A user enters a business category, and within 2 minutes receives 10–20 real, researched businesses with ready-to-send personalized sponsorship emails that pass quality review.

---

## 2. Tech Stack

| Layer | Tool | Reason |
|---|---|---|
| Frontend | React + Tailwind (Lovable) | Fast to build, easy to deploy |
| Agent Runtime | Claude Haiku 4.5 API (Google AI Studio) | allows for m |
| Orchestration model | Claude Haiku 4.5 | Handles planning and delegation |
| Specialist agents | Claude Haiku 4.5 | Prospecting, research, copywriting |
| Review agents | Claude Haiku 4.5 (low temp) | Cheap, deterministic checking |
| Web search | Claudegrounding / web search tool | Real business discovery at runtime |
| Hosting | Lovable (auto-deploy) or GitHub Pages | Instructor-accessible demo URL |
| API keys | Environment variables only — never in code | Security |

> **Multi-model note (satisfies syllabus requirement):** The Orchestrator prompt is also run against Claude Sonnet in evaluation to compare output quality across providers. Results are documented in `evaluation.md`.

---

## 3. System Architecture

```
USER INPUT
  └── Business category (e.g. "restaurants") + location (e.g. "Allendale MI")

        │
        ▼
┌─────────────────────────────────┐
│         ORCHESTRATOR            │  ← ClaudeFlash, high reasoning temp
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
│ (Claude + web    │  ──prospect list─▶│ (Claude+ web search)  │
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
                                    │    (ClaudeFlash)       │
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
                 │  (Claude, temp=0) │      │  (Claude)           │
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
1. **Search** — enter a category and location to trigger the pipeline
2. **Review** — read each prospect card with drafted email
3. **Export** — copy email to clipboard or download the full list as CSV

---

## 6. Agent Definitions (summary)

Full agent `.md` files live in `.agents/`. Summary:

| Agent | Model | Role | Temperature |
|---|---|---|---|
| Orchestrator | Claude | Plans, delegates, assembles, logs | 0.7 |
| Prospector | Claude + web | Finds real local businesses | 0.3 |
| Researcher | Claude + web | Enriches with contact info | 0.3 |
| Copywriter | Claude | Writes short personalized email intro per business | 0.6 |
| Reviewer | Claude | Factual QA, flags errors | 0.0 |
| Persona Evaluator | Claude | Reads as business owner, scores | 0.5 |

---

## 7. Email + PDF Approach

The Copywriter Agent produces a **short, warm intro email** (4–6 lines) rather than a full letter. The existing PDF sponsorship packet (`ClubSoccerLetterTemplate.pdf`) is attached by the user when they send.

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

- **Dev:** React app running locally, API key in `.env`
- **Production:** Deploy to Lovable for a public URL the instructor can demo
- **Repository:** GitHub, with `README.md`, this file, and all agent `.md` files committed

---

## 10. Project File Structure

```
sponsor-outreach-agent/
├── README.md
├── architecture.md          ← this file
├── prd.md
├── personas.md
├── domain-primer.md
├── evaluation.md
├── development-checklist.md
├── feedback-log.md
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
│   ├── app.tsx              ← React frontend
│   ├── agents/              ← agent runner functions
│   └── prompts/             ← prompt library (never inline)
└── .env.example             ← API key template, never committed
```
