// @ts-nocheck
import researcher_system from "../prompts/researcher_system.txt?raw";
import researcher_user_tpl from "../prompts/researcher_user.txt?raw";
import { callClaude, parseJsonLoose } from "./common";

export async function runResearcher(apiKey, businesses, location) {
  const businessSearchResults = [];
  for (const business of businesses) {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `${business.name} ${location}`, size: 4 }),
    });
    const result = await response.json();
    businessSearchResults.push({ name: business.name, results: result.results ?? [] });
  }

  const user = researcher_user_tpl
    .replace("{location}", location)
    .replace("{businesses}", JSON.stringify(businesses, null, 2))
    .replace("{businessSearchResults}", JSON.stringify(businessSearchResults, null, 2));

  const text = await callClaude(apiKey, researcher_system, user, "claude-sonnet-4-6");
  return parseJsonLoose(text);
}