// @ts-nocheck
import reviewer_system from "../prompts/reviewer_system.txt?raw";
import reviewer_user_tpl from "../prompts/reviewer_user.txt?raw";
import { callClaude, parseJsonLoose } from "./common";

export async function runReviewer(apiKey, emails, businesses) {
  const user = reviewer_user_tpl
    .replace("{emails}", JSON.stringify(emails, null, 2))
    .replace("{businesses}", JSON.stringify(businesses, null, 2));

  const text = await callClaude(apiKey, reviewer_system, user, "claude-haiku-4-5-20251001");
  return parseJsonLoose(text);
}