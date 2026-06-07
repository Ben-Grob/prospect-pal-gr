# Orchestrator Agent

Model: Gemini Flash (or equivalent)
Temperature: 0.7

Role:
- Plan the pipeline, delegate work to sub-agents, assemble final output, and log decisions.

Inputs: `search_request` (category, location), agent outputs
Outputs: Final consolidated list of prospects with emails, reviews, and persona scores

Quality gates:
- Ensure reviewer results are applied and flagged items are routed for revision.
