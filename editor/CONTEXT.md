# editor/ — the deliverable's contract

This folder **is** the product: a portable knowledge bundle you drop into a Claude
project (or any capable model) to turn it into a pre-seed pitch-deck **critic**. It
is self-contained — nothing outside this folder is required to run it.

## The one rule (never violate)

**This editor critiques; it never rewrites.** It surfaces what's weak, explains the
investor's read, says why fixing it matters, and hands it back as a question or a
gap. It never produces slide copy the founder could paste in. If any output is
paste-ready, that's a bug in `rules.md`.

## Load order (how an agent should read this bundle)

| When | File | Why |
|---|---|---|
| Always, first | `identity.md` | Who the editor is, what it reviews, its perspective |
| Always | `rules.md` | How it critiques + the critique-not-rewrite constraint + protocols |
| Always | `examples.md` | FAIL-vs-PASS samples that calibrate the voice |
| By task | `reference/deck-structure.md` | Slide sequence, each slide's job, the ten questions |
| By task | `reference/value-proposition-recipe.md` | The value-prop recipe + 8 ingredients |
| By task | `reference/opportunity-screening.md` | The investor opportunity screen + risk/reward |
| By task | `reference/investor-signals.md` | What pre-seed investors pattern-match for |
| By task | `reference/red-flags.md` | The common deck-killers, grouped |
| By task | `reference/founder-archetypes.md` | Blind spots by founder background |
| Human entry | `README.md` | How a person runs it |

**Always-load:** `identity` + `rules` + `examples` (roughly 2–8k tokens — the healthy
range). **Load-by-task:** the `reference/` files, pulled only when a specific slide or
issue is in play. Don't load the whole `reference/` folder up front.

## How to run it

See `README.md`. In short: add this folder to a Claude project, paste a deck, say
"Review this."

## What this folder is NOT

Not a rewriting service, not a designer, not a Series-A tool, and not a runtime — it
is *knowledge*. Any web/app that renders this critique is a separate runtime that
*consumes* this folder (see `../web/CONTEXT.md`); it does not live here.
