import { NextRequest, NextResponse } from "next/server";
import { assembleSystemPrompt } from "@/lib/editor";
import { extractPptxText } from "@/lib/pptx";
import { critiqueDeck, isConfigured } from "@/lib/anthropic";
import { scoreCritique, SYNTHETIC_BENCHMARK } from "@/lib/scoring";

export const runtime = "nodejs";
export const maxDuration = 60;

// Cap upload size to keep the function fast and the deck reasonable.
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_DECK_CHARS = 40_000;

export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      {
        error:
          "The critique model isn't configured. Set ANTHROPIC_API_KEY on the server.",
      },
      { status: 503 },
    );
  }

  let deckText: string;

  try {
    const form = await req.formData();
    const file = form.get("deck");

    if (file instanceof File) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: "That file is too large (max 15 MB)." },
          { status: 413 },
        );
      }
      const buffer = await file.arrayBuffer();
      deckText = await extractPptxText(buffer);
    } else {
      const pasted = form.get("text");
      if (typeof pasted === "string" && pasted.trim()) {
        deckText = pasted.trim();
      } else {
        return NextResponse.json(
          { error: "Upload a .pptx or paste your deck text." },
          { status: 400 },
        );
      }
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not read the deck." },
      { status: 400 },
    );
  }

  if (deckText.length > MAX_DECK_CHARS) {
    deckText = deckText.slice(0, MAX_DECK_CHARS);
  }

  try {
    const systemPrompt = await assembleSystemPrompt();
    const raw = await critiqueDeck(systemPrompt, deckText);
    const critique = scoreCritique(raw);
    return NextResponse.json({ critique, benchmark: SYNTHETIC_BENCHMARK });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "The critique failed. Please try again.",
      },
      { status: 502 },
    );
  }
}
