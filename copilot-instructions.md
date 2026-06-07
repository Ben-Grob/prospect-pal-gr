# copilot-instructions.md
## GVSU Men's Club Soccer — Sponsor Outreach Agent
### Master Rules for All Agents

> For the human: Drop this file at the root of your repository. GitHub Copilot reads it automatically on every call. Fill in any remaining [PLACEHOLDER] values before kickoff.

---

## 1. Mission

You are working on the **Sponsor Outreach Agent**, which solves the sponsorship prospecting problem for the GVSU Men's Club Soccer Golf Outing. Users are fundraising chairs who need to find and contact local sponsors in under 3 minutes.

Everything you build must serve this real-world user. Not technical impressiveness. Not novel architecture. Real output that gets sponsors.

---

## 2. Operating Mindset

- Plan before building. Propose architecture and request confirmation before writing code.
- Build for the fundraising chair, not for the demo. Every feature traces to a pain point in `prd.md`.
- Move fast, fail fast. A working pipeline that gets feedback is worth more than a polished system built on assumptions.
- Never fabricate data. If contact info cannot be found, log "not found." Do not guess or hallucinate business details.
- Low temperature for factual work. Prospecting, researching, and reviewing use temp=0–0.3. Copywriting uses temp=0.6. Orchestration uses temp=0.7.
- All API keys live in environment variables. Never in code. Never committed to GitHub.
- All prompts live in `src/prompts/`. Never inline in business logic.

---

## 3. Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend / Agent runtime:** Claude api: Haiku and Sonnet models
- **Web search:** Brave grounding / web search tool
- **Hosting:** Lovable (production) / localhost (dev)
- **Dev servers:** Frontend on localhost:3000
- **API keys:** `CLAUDE_API_KEY` and `BRAVE_API_KEY` in `.env` (never committed)

---

## 4. UX Primitives

Every screen supports exactly three actions. These must be consistent everywhere:
1. **Search** — category + location input triggers the agent pipeline
2. **Review** — read prospect cards with drafted emails, reviewer scores, persona scores
3. **Export** — copy email to clipboard or download full list as CSV

No other primitives. Do not add complexity without explicit user instruction.

---

## 5. Agent Roster

All agent definitions live in `.agents/`. Each is a Markdown file with role, mandate, inputs, outputs, and quality gates.

| Agent | File | Model Temp | Role |
|---|---|---|---|
| Orchestrator | `.agents/orchestrator.md` | 0.7 | Plans, delegates, assembles, logs |
| Prospector | `.agents/prospector.md` | 0.3 | Finds real local businesses via web search |
| Researcher | `.agents/researcher.md` | 0.3 | Enriches prospects with contact info |
| Copywriter | `.agents/copywriter.md` | 0.6 | Personalizes letter template per business |
| Reviewer | `.agents/reviewer.md` | 0.0 | Factual QA — flags errors |
| Persona Evaluator | `.agents/persona-evaluator.md` | 0.5 | Scores email from business owner's POV |

The Orchestrator never writes content or code. It plans, delegates, and verifies only.

---

## 6. Skill Roster

All skills live in `.skills/`. Each is a Markdown recipe for a repeatable task.

| Skill | File | Used By |
|---|---|---|
| Prospect Search | `.skills/prospect-search.md` | Prospector Agent |
| Contact Research | `.skills/contact-research.md` | Researcher Agent |
| Email Personalization | `.skills/email-personalization.md` | Copywriter Agent |

If a skill fails, fix the skill before retrying. The skill is the canonical recipe.

---

## 7. Data Contracts

Agents pass structured JSON between steps. Never pass unstructured text between agents.

**Prospector output:**
```json
{
  "businesses": [
    {
      "name": "string",
      "type": "string",
      "address": "string",
      "maps_url": "string",
      "is_local": true
    }
  ]
}
```

**Researcher output (enriched):**
```json
{
  "businesses": [
    {
      "name": "string",
      "type": "string",
      "address": "string",
      "maps_url": "string",
      "contact_name": "string | null",
      "contact_email": "string | null",
      "contact_url": "string | null",
      "size_signal": "micro | small | established | regional",
      "contact_found": true
    }
  ]
}
```

**Copywriter output:**
```json
{
  "emails": [
    {
      "business_name": "string",
      "recommended_tier": "Golf ($175) | Game-Day ($499) | Premier ($599) | Elite ($799)",
      "subject_line": "string",
      "body": "string"
    }
  ]
}
```

**Reviewer output:**
```json
{
  "reviews": [
    {
      "business_name": "string",
      "status": "PASS | FLAG",
      "reason": "string | null"
    }
  ]
}
```

**Persona Evaluator output:**
```json
{
  "evaluations": [
    {
      "business_name": "string",
      "score": 1,
      "improvement": "string"
    }
  ]
}
```

---

## 8. Quality Gates

Before any output is shown to the user, the Reviewer must verify:
- [ ] Business name correctly substituted (no `[Company Name]` remaining)
- [ ] Recommended tier is appropriate for business size
- [ ] No hallucinated facts about the business
- [ ] All original links preserved (golf outing URL, Instagram, donation link)
- [ ] Contact info present or flagged as not found
- [ ] Subject line is not generic

Flagged emails are routed back to Copywriter for one revision pass. If they fail again, they are shown to the user with a flag indicator.

---

## 9. Sponsorship Tier Logic

Encoded in Copywriter's system prompt:

| Size Signal | Tier |
|---|---|
| micro | Golf Sponsorship — $175 |
| small | Game-Day Sponsor — $499 |
| established | Premier Sponsor — $599 |
| regional | Elite Sponsor — $799 |

---

## 10. Feedback and Continuous Improvement

- Every user prompt and correction is appended to `feedback-log.md`
- After each iteration, revise the relevant `.agents/*.md` files so the same feedback is not needed again
- Workspace memory is transient. The feedback log is durable. Trust the log.

---

## 11. Escalate to the Human Only When

- A foundational decision (scope change, new API, security concern) needs approval
- Two reasonable paths exist and the trade-off is non-obvious
- A phase is complete and the plan calls for human review
- An external credential is required

Otherwise: take the most reasonable path forward and log the decision in `feedback-log.md`.
