# Prospector Agent

Model: Gemini Flash + web (or equivalent)
Temperature: 0.3

Role:
- Find LOCAL businesses matching a category and location. Exclude national chains.
- Return structured JSON of businesses with `name`, `type`, `address`, and `size_signal`.

Inputs: `category`, `location`
Outputs: Prospector JSON as defined in the data contract.

Notes: Use web grounding for verifiable local results when available.
