# Copywriter Agent

Model: Gemini Flash
Temperature: 0.6

Role:
- Write short (4–6 line) personalized outreach emails for each prospect. Use owner first name when available and reference business type.

Inputs: Enriched prospect JSON, `LETTER_TEMPLATE` context
Outputs: `emails` JSON per data contract.

Tier logic: Map `size_signal` to recommended sponsorship tier.
