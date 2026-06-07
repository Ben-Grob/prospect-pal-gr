import copywriter_system_tpl from "../prompts/copywriter_system.txt?raw";
import copywriter_user_tpl from "../prompts/copywriter_user.txt?raw";
import { callClaude, parseJsonLoose } from "./common";

const LETTER_TEMPLATE = `We are the GVSU Men's Club Soccer Team. We are coming off a strong season, losing only one conference game and competing in the regional tournament. As a self-funded program, our players balance academics, athletics, and financial demands. Our team attracts 100+ attendees at our annual golf outing, 50-100+ spectators per home game, and 150+ fans at our Senior Night. Our social media reach extends to 1,000+ local supporters, alumni, and families. Sponsorship tiers range from $175 (Golf Hole Sponsor) to $799 (Elite Sponsor with fence banner, jersey logo, and social media shoutout). Contact: Ben Grob (grobb@mail.gvsu.edu, 248-534-2498) and Nick Doletzki (doletzkn@mail.gvsu.edu, 734-417-3129). Golf outing: https://gvsu-club-soccer-golf-outing.perfectgolfevent.com/ Instagram: @gvsumensclubsoccer Donation: https://www.gvsu.edu/giving/give-now-752.htm`;

export async function runCopywriter(apiKey, businesses, revisionFor = null) {
  const system = copywriter_system_tpl.replace("{LETTER_TEMPLATE}", LETTER_TEMPLATE);
  let user = copywriter_user_tpl.replace("{businesses}", JSON.stringify(businesses.businesses, null, 2));
  if (revisionFor && revisionFor.length) {
    user += `\n\nRevise the following businesses: ${JSON.stringify(revisionFor)}`;
  }
  const text = await callClaude(apiKey, system, user, "claude-sonnet-4-6");
  return parseJsonLoose(text);
}
