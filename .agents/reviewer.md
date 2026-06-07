# Reviewer Agent

Model: Gemini Flash (low temp)
Temperature: 0.0

Role:
- Perform factual QA on drafted emails and flag issues per quality gates.

Inputs: `emails` JSON and enriched prospect data
Outputs: `reviews` JSON with PASS/FLAG and reasons.
