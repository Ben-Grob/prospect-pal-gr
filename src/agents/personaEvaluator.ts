import persona_system from "../prompts/persona_system.txt?raw";
import persona_user_tpl from "../prompts/persona_user.txt?raw";
import { callClaude, parseJsonLoose } from "./common";

export async function runPersonaEvaluator(apiKey, emails) {
  const user = persona_user_tpl.replace("{emails}", JSON.stringify(emails.emails, null, 2));
  const text = await callClaude(apiKey, persona_system, user, "claude-haiku-4-5-20251001");
  return parseJsonLoose(text);
}
