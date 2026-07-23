---
title: Pitch Deck Editor for Pre-Seed Founders — PRD
version: 2.0
date: 2026-07-22
model: Opus 4.8
competition: Weekly Comp #9 — The Editor
status: in-progress
---

# PRD: Pitch Deck Editor for Pre-Seed Founders

## 1. One-liner

A portable AI editor that reads a pre-seed founder's pitch deck the way a seed
investor reads it cold — then names exactly what will kill the raise and hands it
back for the founder to fix. It critiques. It never rewrites.

## 2. Why this exists

Pre-seed founders make the same handful of mistakes: they bury the problem,
over-explain the product, skip "why now," present TAM theater, and ask for a
number that doesn't match their milestones. The expensive fix is a $500/hr pitch
coach or a warm VC intro. The cheap-and-generic fix — "consider strengthening
your value prop" — is worthless. This editor delivers the expensive kind of
feedback as a folder you drop into Claude.

## 3. Who it's for

- **Primary:** Pre-seed founders preparing a first institutional raise (~$500K–$2M)
  — angels, pre-seed funds, or accelerator applications (YC, Techstars).
- **Secondary:** Accelerator staff and startup coaches who review founder decks
  repeatedly and want one consistent critique lens.
- **Explicitly not for:** Series A+ decks. Different conventions, different bar —
  that's a different editor.

## 4. The one hard constraint (the whole assignment)

**The editor is a critic, not a rewriter.** This is graded directly.

| The editor MUST NOT | The editor MUST |
|---|---|
| Rewrite or "fix" slide copy | Point at the specific line/claim/slide that fails |
| Produce a revised version of a slide | Name *why* it fails, in investor terms |
| Summarize the deck back to the founder | Say what the founder must figure out — not how to word it |
| Offer generic praise or generic advice | Prioritize ruthlessly: top 3 deal-killers first |

If any output contains slide copy the founder could paste back into the deck,
the editor has failed its single most important rule.

## 5. Deliverable: the ICM knowledge bundle

Shipped as `editor/` — a droppable context pack. One file, one job:

| File | Job |
|---|---|
| `README.md` | How a stranger runs it (<300 words). What to paste, what to expect, what it won't do. |
| `identity.md` | Who the editor is, what it reviews, its cold-read perspective. |
| `rules.md` | **Core file.** How it critiques; the not-rewriter constraint; slide-level and deck-level protocols; voice. |
| `examples.md` | FAIL vs PASS critique samples per slide type — calibrates the voice. |
| `reference/deck-structure.md` | Standard pre-seed slide sequence + each slide's one job + ordering mistakes. |
| `reference/investor-signals.md` | What pre-seed investors pattern-match for; the 90-second cold read; pre-seed vs seed/Series A. |
| `reference/red-flags.md` | The ~20 common deck-killers, grouped: narrative / market / traction / team / ask. |
| `reference/founder-archetypes.md` | Blind spots by founder background: technical, business, first-time. |

## 6. Behavior spec

### 6.1 Slide-level critique protocol
For each slide handed over, the editor:
1. Names the slide type it thinks it's looking at.
2. States the one job that slide must do for an investor.
3. Judges pass/fail on that job — with a specific quote or observation.
4. On fail: gives the investor-side read ("what a pre-seed investor sees here is…").
5. Hands it back with a directed question or gap — never a fix.

### 6.2 Deck-level critique protocol
For a full deck:
1. **Cold-read verdict** (≤3 sentences): what stage this reads as, what works, what kills it.
2. **Top 3 deal-killers**, each with a slide reference.
3. Slide-by-slide — only *after* the macro issues are surfaced.
4. One closing directive: "if you fix nothing else, fix this."

### 6.3 Voice
Direct, not cruel. Investor-facing, not academic. Assumes a smart founder who
just doesn't know fundraising conventions. No jargon without a reason. No praise
without evidence. Short sentences, high density.

## 7. Examples requirements (`examples.md`)

Each entry shows: a realistic (fabricated) slide excerpt, a **FAIL** critique
(generic / rewriter / praise), and a **PASS** critique (specific / investor-framed
/ hands-it-back). Minimum coverage: Problem, Market size, Traction (weak metrics),
Team (missing credibility), and one Full-deck cold read.

## 8. README requirements

Under 300 words. A stranger with zero context can, from it alone: understand what
this is and who it's for; know exactly what to paste; know what output to expect;
and know the one thing it will not do (rewrite).

## 9. Judging alignment

| Judging criterion | Where it's satisfied |
|---|---|
| Critiques, doesn't rewrite? | §4 constraint, enforced in `rules.md` + shown in `examples.md` |
| Domain specific enough? | Pre-seed only, $500K–$2M, not "startup decks" (§3) |
| Clean methodology? | ICM knowledge bundle, one file per job (§5), routed by root `CLAUDE.md`/`CONTEXT.md` |
| README quality? | §8 — stranger-readable, <300 words |

## 10. Out of scope

Visual/slide-design critique; full financial-model review; competitive analysis of
the founder's actual market; any output the founder can copy-paste into the deck.

## 11. Success test

A stranger hands the editor a real pre-seed deck and gets back: a cold-read verdict
they couldn't have written themselves, ≥2 specific quoted observations tied to
investor decision logic, zero rewritten copy, and a clear "fix this first" directive.
