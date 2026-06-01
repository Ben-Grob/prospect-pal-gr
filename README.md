# Sponsor Outreach Agent
**GVSU Men's Club Soccer — Golf Outing Sponsorship Pipeline**
AI 502 | Project 2 | Ben Grob

---

## Overview

This is an agentic system that aims to automate the sponsorship prospecting and outreach process for the GVSU Men's Club Soccer Golf Outing. It finds local businesses, researches contact information, and drafts personalized emails — replacing hours of manual work with a single user interaction.

The GVSU club soccer teams (and all other clubs) pay to play. This means that just about everyone on the team works full-time doing something else. To reduce the fees of playing, the team holds it's main
fundraiser in the form of an alumni golf outing each year. It is now up to the players on the Eboard, mostly me as the fundraising chair, and another alumn to organize this event. Simply put, I don't have a lot of time, and neither do my teammates. I'm hoping to save some time in the process with this automation.

**Live demo:** [[link here](https://prospect-pal-gr.lovable.app/)]

This repository was created fresh after realizing I would be switching to a lovable approach for deployment, since it is cleaner/easier to create a new repository than to merge with an existing one.
old commits can be found at [[my original repository](https://github.com/Ben-Grob/AI502-Project-Two)] for this project.


---

## Problem

Sending out cold emails is already an uphill battle, so it is important to personalize them. There are two major hurdles in doing this.
* manually searching for companies takes a large amount of time, I have a letter template but don't know where to send them.
* Emails need to be individual, so there is no easy way to send these all out manually.

---

## Agentic Architecture

This project uses a 6-agent pipeline with a model waterfall design:

| Agent | Role | Model Temp |
|---|---|---|
| Orchestrator | Plans, delegates, assembles output | 0.7 |
| Prospector | Finds local businesses by category + location | 0.3 |
| Researcher | Enriches prospects with contact info | 0.3 |
| Copywriter | Writes short personalized email intro | 0.6 |
| Reviewer | Factual QA — flags errors before output | 0.0 |
| Persona Evaluator | Scores email from business owner's POV | 0.5 |

<!-- Add 1-2 sentences on how the feedback loop works: flagged emails routed back to Copywriter. -->

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Tailwind CSS |
| Agent runtime | Anthropic Claude API (claude-sonnet-4-6) |
| Deployment | Lovable |
| Code hosting | GitHub |

---

## Features

- [ ] Business prospecting by category and location
- [ ] Contact enrichment (owner name + email)
- [ ] Personalized email drafting with PDF attachment instruction
- [ ] Reviewer quality gate (PASS / FLAG per email)
- [ ] Persona evaluation score (1–5) with improvement note
- [ ] Copy-to-clipboard per email
- [ ] CSV export of full prospect list

---

## How to Use

1. Enter your Anthropic API key in the key field
2. Type a business category (e.g. `restaurants`, `auto repair shops`)
3. Confirm or edit the location (default: Allendale, MI)
4. Click **Run agent pipeline** and watch each agent's status update
5. Review prospect cards — each shows the drafted email, pass/flag status, and persona score
6. Click **Copy email**, paste into Gmail, and attach `ClubSoccerLetterTemplate.pdf`

---

## Evaluation

One of the major gaps of this draft I would think. As a human I have two critical responsibilities in the project, the planning, and the feedback. While I have sub agents to review the outputs,
I still need to give feedback on another iteration. As of now, each response is given a pass/flag and a score from 1-5. The evaluation is there, but I need to evaluate the evaluation.

### Tests Run

| Test | Expected | Result |
|---|---|---|
| Prospector — returns local businesses | 8–12 results | satisfied |
| Copywriter — no generic placeholders | 0 generic openers | satisfied |
| Reviewer — catches planted bad email | FLAG returned | N/A (see limitations below) |
| Persona Evaluator — scores correlate with quality | Low scores on generic emails | seems to be working (see evaluation above) |
| End-to-end runtime | Under 3 minutes | satisfied |
| Human spot-check — would you send this? | 4/5 emails usable | hypothetically yes (see limitations below |

### Failure Analysis

**Known limitations:**
- Prospecting is currently simulated (Claude generates plausible businesses from training data rather than searching the live web). <-- this is the biggest issue
- providing an api key is kind of funny for a public facing app, I may navigate this differently for the second submission
- There is a narrow gap between a generic template and sounding fake and pretending that we have an existing relationship with the business. I hope to find the sweet spot or get closer to it.

**What I would do differently:**
- I would make the switch from claude to copilot earlier, this would keep the feedback I give presistint from planning to building, and would have also made me more aware of my usage limits.
- Spend a greater time talking with claude about what I want the final product to look like. Including a requirements document would have helped to clear any misunderstandings between me and the ai
- Focus on the live web search first since this is whats the most important

---

## Build Log
**Key Context given to claude** - Ledger transcripts, syllabus for the rubric, workflow implementation doc, the letter template, and my key objectives

### Session 1 — Problem Definition & Architecture
**Tool:** Claude.ai

**Key prompt:** *I'm building a project for AI 502. I'm the fundraising chair for a club soccer team. I need to find and email 30–100 local businesses for golf outing sponsorships. Help me design an agentic pipeline referencing the workflow implementation doc*

**Output:** 6-agent architecture, PRD, copilot-instructions.md, evaluation criteria

**Decision made:** Short email intro + PDF attachment approach instead of full letter in email body

### Session 2 — Deployment
**Tool:** Lovable
**Key prompt:** *"Build me a React app using this component. (passed component from Claude)

This system automates the sponsorship prospecting and outreach process for the GVSU Men's Club Soccer Golf Outing. It finds local businesses in the Grand Rapids / Allendale, MI area, researches contacts, and drafts personalized sponsorship emails"*

**Output:** A simple deployed prototype that put the current state of the project on screen.


---

## Ethical & Practical Limits

- **Human in the loop:** The agent drafts emails but does not send them. The user reviews every email before sending, preserving human judgment on outreach decisions.
- **Data accuracy:** Contact information is AI-generated and unverified in the current prototype. Users should verify emails before sending to avoid misdirected outreach.
- **Scope:** This tool is designed for a specific, low-stakes outreach context. It should not be used for high-volume cold email campaigns without a real web search backend and compliance review.

---

## What's Next

### Neccesary
- Replace simulated prospecting with real web search via a server-side backend
- Test the review system to make sure information is accurate
- Refine email response's tone and content

### Nice to haves
- Add response tracking (mark businesses as contacted, replied, or passed)
- Expand to multiple business categories in one session
