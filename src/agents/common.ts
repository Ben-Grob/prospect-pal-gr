// @ts-nocheck
export async function callClaude(_apiKey, systemPrompt, userPrompt, model = "claude-sonnet-4-6") {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Claude API error");
  if (data.stop_reason === "max_tokens") {
    console.warn("Claude response hit max_tokens — output may be truncated");
  }
  return data.content?.[0]?.text ?? data?.completion?.content ?? "";
}

export async function callClaudeTool(_apiKey, messages, tools, model = "claude-sonnet-4-6") {
  let system;
  const filteredMessages = [];
  for (const m of messages) {
    if (m.role === "system") {
      system = system ? system + "\n\n" + m.content : m.content;
    } else {
      filteredMessages.push(m);
    }
  }

  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      ...(system ? { system } : {}),
      messages: filteredMessages,
      tools,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Claude tool API error");
  if (data.stop_reason === "max_tokens") {
    console.warn("Claude tool response hit max_tokens — output may be truncated");
  }

  const content = Array.isArray(data.content) ? data.content : data.content ? [data.content] : [];
  const toolUse = content.find((item) => item?.type === "tool_use");
  if (toolUse) {
    return {
      name: toolUse.name,
      arguments: toolUse.input,
      tool_use_id: toolUse.id,
    };
  }

  const textBlock = content.find((item) => item?.type === "text");
  const text = textBlock?.text ?? data.completion?.content ?? (typeof data.content === "string" ? data.content : "");
  try {
    return JSON.parse(text.trim());
  } catch (error) {
    throw new Error("Unable to parse Claude tool call response: " + text);
  }
}

export function parseJsonLoose(text) {
  let s = text.replace(/```json|```/gi, "").trim();
  const start = s.search(/[\{\[]/);
  if (start === -1) throw new Error("No JSON found in response");
  s = s.slice(start);
  try { return JSON.parse(s); } catch {}

  let repaired = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  let inStr = false, esc = false;
  const stack = [];
  for (let i = 0; i < repaired.length; i++) {
    const c = repaired[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") stack.pop();
  }
  if (inStr) repaired += '"';
  repaired = repaired.replace(/,\s*$/, "").replace(/:\s*$/, ": null");
  while (stack.length) {
    const open = stack.pop();
    repaired += open === "{" ? "}" : "]";
  }
  repaired = repaired.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(repaired);
}