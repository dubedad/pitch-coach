# The Pre-Seed Pitch-Deck Editor

**Weekly Comp #9: THE EDITOR.** A portable AI **editor** for pre-seed founder pitch
decks. Drop it into a Claude project and it reads your deck the way a skeptical seed
investor reads it cold, tells you exactly what would kill the raise, and hands it
back for you to fix.

> **It critiques. It never rewrites.** Ask it to "just fix my slide" or "build me a
> cleaned deck" and it declines, then asks you the question that gets you there.
> **That refusal is the product.**

## The deliverable

Everything the editor needs lives in **[`editor/`](editor/)** — that's what you drop
into Claude. Start with **[`editor/README.md`](editor/README.md)**.

| File | Job |
|---|---|
| `editor/SYSTEM-PROMPT.md` | Paste this into your project's **Instructions** to activate the editor |
| `editor/identity.md` | Who the editor is |
| `editor/rules.md` | How it critiques — Rule 0: critique, never rewrite |
| `editor/examples.md` | FAIL-vs-PASS critique samples that calibrate the voice |
| `editor/reference/` | Deck structure, value-prop recipe, opportunity screen, investor signals, red flags, founder blind spots |
| `editor/CONTEXT.md` | The bundle's load order + the one rule |

## How to run it (30 seconds)

1. Create a Claude Project and add the files in `editor/` to its **Context/knowledge**.
2. Paste the block from `editor/SYSTEM-PROMPT.md` into the project's **Instructions**.
   *(This is the step that activates it — attaching files alone isn't enough.)*
3. Paste your deck → say **"Review this."**

Sanity check: ask *"Quote the HARD STOP banner at the top of rules.md."* If it can,
the editor is live.

## How it's built (methodology)

An **ICM** (Interpretable Context Methodology) knowledge bundle — folders carry the
structure, files carry the state; a stranger can open the folder and understand the
whole system cold. The full build story is in
**[`how-i-created-the-pitch-coach.md`](how-i-created-the-pitch-coach.md)**, including
the UAT that proved the never-rewrite guardrail holds even when the model is asked
directly to rewrite.

- `_planning/` — the PRD and the competition rules it's judged against
- `web/` — (bonus) the runtime contract for an aiguys.tech demo that renders the
  critique as a scored, interactive dashboard

## What's next

**Stay tuned — I'm going to try and turn this into a webapp.** The `web/` folder
already sketches the runtime contract (a scored critique dashboard); the plan is to
give the editor a real front end so founders can paste a deck and get the same
never-rewrite critique in the browser.

## The one rule this whole project enforces

The editor is a **critic, not a rewriter.** Every file exists to hold that line.
