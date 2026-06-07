// @ts-nocheck
import prospector_system from "../prompts/prospector_system.txt?raw";
import prospector_user_tpl from "../prompts/prospector_user.txt?raw";
import { callClaude, parseJsonLoose } from "./common";

export async function runProspector(apiKey, category, location) {
  const searchResponse = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: `${category} near ${location}`, size: 8 }),
  });
  const searchData = await searchResponse.json();

  const user = prospector_user_tpl
    .replace("{category}", category)
    .replace("{location}", location)
    .replace("{searchResults}", JSON.stringify(searchData.results ?? [], null, 2));

  const text = await callClaude(apiKey, prospector_system, user, "claude-sonnet-4-6");
  return parseJsonLoose(text);
}