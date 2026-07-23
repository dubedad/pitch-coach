import { promises as fs } from "node:fs";
import path from "node:path";
import { FACTORS } from "./schema";

// The editor bundle is the single source of truth. We read it from disk at request
// time rather than copying its content into web code (ICM: link, don't fork).
// When `next dev`/`next build` runs from web/, the bundle sits at ../editor.
const EDITOR_DIR = path.join(process.cwd(), "..", "editor");
const REFERENCE_DIR = path.join(EDITOR_DIR, "reference");

async function readEditorFile(relPath: string): Promise<string> {
  return fs.readFile(path.join(EDITOR_DIR, relPath), "utf8");
}

async function readReferenceFile(fileName: string): Promise<string> {
  return fs.readFile(path.join(REFERENCE_DIR, fileName), "utf8");
}

/** Collect the distinct reference files the seven factors draw their criteria from. */
function referenceFilesForFactors(): string[] {
  const files = new Set<string>();
  for (const factor of FACTORS) {
    for (const token of factor.source.split("+")) {
      const name = token.trim();
      if (name.endsWith(".md")) files.add(name);
    }
  }
  return [...files];
}

const SCHEMA_INSTRUCTION = `
=== OUTPUT CONTRACT (web runtime only) ===
You are running inside a web dashboard, not a chat. Return your critique as a SINGLE
JSON object and nothing else — no prose before or after, no markdown fences.

Rule 0 still holds absolutely: do_pattern / dont_pattern are GENERIC teaching
exemplars, never the founder's rewritten copy. mitigation_question hands the gap
back. You are critiquing and teaching — you never write the founder's slides.

Do NOT emit numeric scores or bands — the runtime computes those from your criteria
verdicts. For every criterion, judge "met", "partial", or "missing" and quote or
reference the deck in "evidence".

The JSON must match this shape exactly:
{
  "overall": {
    "cold_read_verdict": "<=3 sentences: stage it honestly reads as, the one thing working, the one thing killing it",
    "top_3_dealkillers": [ { "factor_id": "<one of the factor ids>", "one_line": "tied to a specific slide" } ]
  },
  "factors": [
    {
      "id": "<factor id>",
      "criteria": [ { "name": "<criterion text, verbatim from the list>", "verdict": "met|partial|missing", "evidence": "quote/reference from the deck" } ],
      "investor_read": "what a pre-seed investor concludes about this factor now",
      "why_it_matters": "how closing this gap helps the investor take the next meeting",
      "cost_if_ignored": "what leaving it unaddressed quietly signals or forfeits",
      "do_pattern": "generic exemplar of this factor done well (NOT the founder's copy)",
      "dont_pattern": "generic exemplar of the failure mode",
      "mitigation_question": "the question that hands the gap back to the founder"
    }
  ]
}

You MUST return all seven factors, using these exact ids and the criteria listed:
`;

function factorCriteriaBlock(): string {
  return FACTORS.map(
    (f) =>
      `- ${f.id} ("${f.label}"), criteria:\n` +
      f.criteria.map((c) => `    • ${c}`).join("\n"),
  ).join("\n");
}

/**
 * Assemble the full system prompt: the editor persona + rules + examples, the
 * relevant reference files, and the JSON output contract. (30% orchestration.)
 */
export async function assembleSystemPrompt(): Promise<string> {
  const [identity, rules, examples] = await Promise.all([
    readEditorFile("identity.md"),
    readEditorFile("rules.md"),
    readEditorFile("examples.md"),
  ]);

  const refFiles = referenceFilesForFactors();
  const references = await Promise.all(
    refFiles.map(async (name) => {
      try {
        const body = await readReferenceFile(name);
        return `\n\n=== reference/${name} ===\n${body}`;
      } catch {
        return "";
      }
    }),
  );

  return [
    "You are the pre-seed pitch-deck EDITOR. Your full instructions follow.",
    "\n=== identity.md ===\n" + identity,
    "\n=== rules.md ===\n" + rules,
    "\n=== examples.md ===\n" + examples,
    references.join(""),
    SCHEMA_INSTRUCTION,
    factorCriteriaBlock(),
  ].join("\n");
}
