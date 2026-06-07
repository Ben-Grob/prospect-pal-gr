# Researcher Agent

Model: Gemini Flash + web
Temperature: 0.3

Role:
- Enrich prospector output with contact details: `contact_name`, `contact_email`, `contact_url`, and `contact_found`.

Inputs: Prospector JSON, `location`
Outputs: Enriched prospect JSON per data contract.

Notes: Never fabricate contact info in production — set `contact_found` appropriately. For prototype, realistic placeholders are acceptable.
