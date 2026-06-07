// @ts-nocheck
import orchestrator_system from "../prompts/orchestrator.txt?raw";
import { callClaudeTool } from "./common";
import { runProspector } from "./prospector";
import { runResearcher } from "./researcher";
import { runCopywriter } from "./copywriter";
import { runReviewer } from "./reviewer";
import { runPersonaEvaluator } from "./personaEvaluator";

const tools = [
  {
    name: "run_prospector",
    description: "Find local businesses for the chosen category and location.",
    type: "custom",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        location: { type: "string" },
      },
      required: ["category", "location"],
    },
  },
  {
    name: "run_researcher",
    description: "Enrich a business list with contact details.",
    type: "custom",
    input_schema: {
      type: "object",
      properties: {
        businesses: { type: "array", items: { type: "object" } },
        location: { type: "string" },
      },
      required: ["businesses", "location"],
    },
  },
  {
    name: "run_copywriter",
    description: "Draft or revise personalized outreach emails for the business list.",
    type: "custom",
    input_schema: {
      type: "object",
      properties: {
        businesses: { type: "array", items: { type: "object" } },
        revision_for: { type: "array", items: { type: "string" } },
      },
      required: ["businesses"],
    },
  },
  {
    name: "run_reviewer",
    description: "Review drafted emails and flag issues.",
    type: "custom",
    input_schema: {
      type: "object",
      properties: {
        emails: { type: "array", items: { type: "object" } },
        businesses: { type: "array", items: { type: "object" } },
      },
      required: ["emails", "businesses"],
    },
  },
  {
    name: "run_persona_evaluator",
    description: "Score emails from the perspective of a local business owner.",
    type: "custom",
    input_schema: {
      type: "object",
      properties: {
        emails: { type: "array", items: { type: "object" } },
      },
      required: ["emails"],
    },
  },
  {
    name: "finish",
    description: "Indicates the pipeline is complete and the host should assemble final results.",
    type: "custom",
    input_schema: {
      type: "object",
      properties: {
        note: { type: "string" },
      },
      required: [],
    },
  },
];

export async function runOrchestrator(apiKey, category, location, setStatus) {
  const messages = [
    { role: "system", content: orchestrator_system },
    {
      role: "user",
      content: `Start the sponsor outreach pipeline for category: ${category} and location: ${location}. Use the available tools to decide which agent to invoke next. Return only a single tool call at a time.`,
    },
  ];

  let prospects = null;
  let enriched = null;
  let emails = null;
  let reviews = null;
  let evaluations = null;
  let revisionCount = 0;

  for (let loop = 0; loop < 10; loop++) {
    const toolCall = await callClaudeTool(apiKey, messages, tools, "claude-sonnet-4-6");
    if (!toolCall || !toolCall.name) {
      break;
    }

    if (toolCall.name === "finish") {
      break;
    }

    const toolUseId = toolCall.tool_use_id ?? `toolu_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    messages.push({
      role: "assistant",
      content: [
        {
          type: "tool_use",
          id: toolUseId,
          name: toolCall.name,
          input: toolCall.arguments,
          caller: { type: "direct" },
        },
      ],
    });

    let toolResult;
    if (toolCall.name === "run_prospector") {
      setStatus?.("prospector", "running");
      prospects = await runProspector(apiKey, toolCall.arguments.category, toolCall.arguments.location);
      setStatus?.("prospector", "done");
      toolResult = prospects;
    } else if (toolCall.name === "run_researcher") {
      setStatus?.("researcher", "running");
      enriched = await runResearcher(apiKey, toolCall.arguments.businesses, toolCall.arguments.location);
      setStatus?.("researcher", "done");
      toolResult = enriched;
    } else if (toolCall.name === "run_copywriter") {
      setStatus?.("copywriter", "running");
      const revisionFor = toolCall.arguments.revision_for ?? null;
      emails = await runCopywriter(apiKey, toolCall.arguments.businesses, revisionFor);
      setStatus?.("copywriter", "done");
      toolResult = emails;
    } else if (toolCall.name === "run_reviewer") {
      setStatus?.("reviewer", "running");
      reviews = await runReviewer(apiKey, toolCall.arguments.emails, toolCall.arguments.businesses);
      setStatus?.("reviewer", "done");
      toolResult = reviews;
    } else if (toolCall.name === "run_persona_evaluator") {
      setStatus?.("persona", "running");
      evaluations = await runPersonaEvaluator(apiKey, toolCall.arguments.emails);
      setStatus?.("persona", "done");
      toolResult = evaluations;
    } else {
      throw new Error(`Unknown orchestrator tool: ${toolCall.name}`);
    }

    messages.push({
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: toolUseId,
          content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
        },
      ],
    });

    if (toolCall.name === "run_reviewer") {
      const flagged = reviews?.reviews?.filter((r) => r.status === "FLAG").map((r) => r.business_name) || [];
      if (flagged.length && revisionCount < 1) {
        revisionCount += 1;
        messages.push({
          role: "user",
          content: `There are flagged emails for businesses ${JSON.stringify(flagged)}. Please invoke run_copywriter next and revise only those flagged emails using revision_for.`,
        });
      }
    }
  }

  const assembled = (emails?.emails ?? []).map((email) => {
    const biz = (enriched?.businesses ?? []).find((b) => b.name === email.business_name) || {};
    const review = (reviews?.reviews ?? []).find((r) => r.business_name === email.business_name) || {};
    const evaluation = (evaluations?.evaluations ?? []).find((e) => e.business_name === email.business_name) || {};
    return { email, business: biz, review, evaluation };
  });

  return assembled;
}