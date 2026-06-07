# prd.md
## GVSU Men's Club Soccer — Sponsor Outreach Agent
### Product Requirements Document

---

## Problem

The GVSU Men's Club Soccer team is a self-funded program. Each year, the fundraising chair must manually identify local businesses, find contact information, and write personalized sponsorship emails by hand.

**Current workflow:** 
1. Brainstorm local business categories (restaurants, auto shops, etc.)
2. Google "[category] near Allendale Michigan" manually
3. Copy business names and addresses into a spreadsheet
4. Search each business individually for an owner/manager email
5. Edit a template letter 10+ times, once per business
6. Send emails one at a time

This process takes **8-10 hours** to generate 20 quality leads.

**Pain point (direct):** "I don't know where to send them." — Fundraising Chair, on having a letter template but no prospect list.

---

## Users & Personas

Defined fully in `personas.md`. Primary user: the Fundraising Chair (Ben Grob). Secondary: Team President (Nick Doletzki), future fundraising chairs.

---

## Scope

### In scope (prototype)
- Business discovery by category + location in Grand Rapids / Allendale MI area
- Contact enrichment (name, email, or contact URL)
- Email personalization using the team's existing letter template
- Sponsorship tier recommendation per business
- Factual review and persona-based quality scoring
- Export of final prospect list + emails

### Out of scope (prototype)
- Automated email sending (user sends manually)
- CRM or response tracking
- Multi-city support
- Social media outreach

---

## Requirements by Theme

### Theme 1: Business Discovery
**Problem:** No system exists to find local sponsors. Manual Googling is slow and incomplete.  
**Solution:** Prospector Agent searches the web by category + location and returns structured results.  
**Requirements:**
- Accept free-text category input ("restaurants", "auto shops", "dental offices")
- Return minimum 10 results per search
- Include business name, type, address, and Google Maps URL
- Filter out chains and franchises when possible (local businesses only)

**Value:** Turns hours of Googling into seconds.

### Theme 2: Contact Enrichment
**Problem:** Even with a business name, finding the right person to email is slow.  
**Solution:** Researcher Agent searches for owner name and contact email per business.  
**Requirements:**
- Attempt to find owner or manager name
- Attempt to find direct email or contact page URL
- Flag businesses where contact info could not be found
- Never fabricate contact details — log "not found" rather than guess

**Value:** Removes the most tedious part of the outreach process.

### Theme 3: Personalized Outreach
**Problem:** A generic letter gets ignored. Each business needs to feel like it was written for them.  
**Solution:** Copywriter Agent personalizes the template per business using enriched data.  
**Requirements:**
- Replace all `[Company Name]` placeholders with real business name
- Reference the business type naturally in the opening
- Recommend and emphasize the appropriate sponsorship tier
- Preserve all links, contact info, and deadlines from the original template
- Never invent facts about the business

**Value:** Higher open and response rates; emails are ready to send, not just ready to edit.

### Theme 4: Quality Assurance
**Problem:** AI can hallucinate or produce emails that feel generic despite personalization.  
**Solution:** Reviewer Agent (factual check) + Persona Evaluator Agent (tone/relevance check).  
**Requirements:**
- Reviewer catches: wrong business name, missing links, inappropriate tier, hallucinated facts
- Persona Evaluator scores: would this business owner open and respond to this email?
- Flagged emails are routed back for one revision pass before final output
- All quality decisions are logged

**Value:** User can trust the output without reading every word before sending.

---

## Definition of Done

A feature is done when:
1. It traces to a pain point above
2. It passes the relevant evaluation criteria in `evaluation.md`
3. The Reviewer agent has approved the output
4. The user can demo it at a public URL
