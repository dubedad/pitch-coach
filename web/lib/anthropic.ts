import Anthropic from "@anthropic-ai/sdk";
import { Critique } from "./schema";

// Thin provider adapter. The key stays server-side (env var). Swapping providers
// later means reimplementing this one function; nothing else changes.
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

export function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Pull the first JSON object out of a model response, tolerating stray prose/fences. */
function parseJsonObject(text: string): Critique {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return a JSON object.");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as Critique;
}

/**
 * Single model call: system = assembled editor prompt, user = the deck text.
 * Requests schema-conforming JSON. (The 10% AI step.)
 */
export async function critiqueDeck(
  systemPrompt: string,
  deckText: string,
): Promise<Critique> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content:
          "Review this pitch deck and return the JSON critique described in your instructions.\n\n" +
          deckText,
      },
    ],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  return parseJsonObject(text);
}
