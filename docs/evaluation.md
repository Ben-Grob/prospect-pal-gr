# evaluation.md
## GVSU Men's Club Soccer — Sponsor Outreach Agent
### Evaluation Criteria & Success Metrics

---

## Evaluation Philosophy

Define success before building. Each agent has its own measurable success criteria. The system passes when all agents pass their individual gates AND the end-to-end output is something the fundraising chair would actually send.

---

## Agent-Level Evaluation

### Prospector Agent
**Test:** Run pipeline with category="restaurants" and location="Allendale MI"

| Criterion | Pass Condition |
|---|---|
| Returns real businesses | Spot-check 5 results on Google Maps — all exist |
| Returns local businesses | No national chains (McDonald's, Applebee's, etc.) in results |
| Minimum quantity | At least 10 results per search |
| Structured output | JSON matches data contract in `copilot-instructions.md` |

**Planted signal test:** Search "auto repair near Allendale MI" — verify that Rybicki's Auto or similarly known local shops appear.

---

### Researcher Agent
**Test:** Run on a known business (e.g. a real Allendale restaurant)

| Criterion | Pass Condition |
|---|---|
| Contact name accuracy | Spot-check 3 results — name matches publicly listed owner |
| No hallucination | Agent never fabricates an email address — logs null if not found |
| Contact found rate | At least 50% of businesses return some contact signal |
| Flags honestly | Businesses with no findable contact are marked `contact_found: false` |

---

### Copywriter Agent
**Test:** Run on 5 enriched prospects across different size signals

| Criterion | Pass Condition |
|---|---|
| Placeholder replacement | Zero instances of `[Company Name]` in output |
| Tier logic | micro→$175, small→$499, established→$599, regional→$799 |
| Links preserved | Golf outing URL, Instagram, donation link all present |
| Personalization | Email references business type naturally in opening paragraph |
| Contact info | Signed with Nick and Ben's names, emails, and phone numbers |

**Planted failure test:** Intentionally pass a business with `size_signal: "micro"` and verify the Copywriter does NOT recommend the $799 Elite tier.

---

### Reviewer Agent
**Test:** Feed it 3 intentionally broken emails

| Planted Error | Expected Reviewer Response |
|---|---|
| `[Company Name]` left in body | FLAG — placeholder not replaced |
| Golf outing URL removed | FLAG — link missing |
| micro business assigned Elite tier | FLAG — tier inappropriate |
| Correct email | PASS |

**Pass condition:** Reviewer catches all 3 planted errors and passes the correct email.

---

### Persona Evaluator Agent
**Test:** Run on 5 emails — 2 generic, 3 well-personalized

| Criterion | Pass Condition |
|---|---|
| Scores correlate with quality | Generic emails score ≤ 2, personalized emails score ≥ 4 |
| Improvement notes are useful | Notes identify specific changes, not vague feedback |
| Does not rubber-stamp | At least one email per batch scores below 4 |

---

## End-to-End Evaluation

**Full pipeline test:** Enter "restaurants" + "Allendale MI" and run the complete pipeline.

| Criterion | Pass Condition |
|---|---|
| Runtime | Pipeline completes in under 3 minutes |
| Output quantity | At least 10 prospect emails in final output |
| Ready-to-send rate | At least 70% of emails pass both Reviewer and Persona Evaluator without revision |
| Human spot-check | Fundraising chair reviews 5 emails and would send at least 4 without editing |

---

## Multi-Model Comparison (Graduate Requirement)

Run the Copywriter Agent prompt on:
1. Gemini 2.0 Flash
2. Claude Sonnet (via Claude.ai, manual test)

Evaluate on: personalization quality, tone appropriateness, tier accuracy, link preservation.

Document results in a comparison table and include in project submission as evidence of multi-model evaluation.

---

## Definition of Failure

The system fails if:
- Any email contains a hallucinated business fact
- Any email still contains `[Company Name]`
- The Reviewer passes a demonstrably wrong email (false negative)
- The pipeline returns zero results for a valid category + location
