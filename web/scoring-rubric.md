# Scoring rubric — prose critique → a 0–1 score per factor

This rubric powers the **web dashboard only**. The competition deliverable
(`../editor/`) stays pure prose. Here we define how the same critique becomes
numbers the dashboard can render as dials.

## Core principle: the model judges, the code scores

Do **not** ask the model to emit a float. That produces inconsistent, indefensible
numbers. Instead:

1. The model assesses each **criterion** as `met` / `partial` / `missing` (plus a
   one-line justification quoting the deck).
2. The runtime (deterministic code) maps `met = 1.0`, `partial = 0.5`, `missing = 0`,
   then computes each factor score as the weighted average of its criteria.
3. The composite "fundability" score is the weighted average of the seven factors.

This mirrors the 60/30/10 pattern: the AI reads and judges (10%); the code does the
arithmetic (30%). Scores stay consistent and explainable.

## The seven factors (the dials)

Each factor draws its criteria from a `../editor/reference/` file.

| # | Factor | Weight | Criteria source |
|---|---|---|---|
| 1 | Value Proposition | 0.20 | `value-proposition-recipe.md` (8 ingredients) |
| 2 | Problem | 0.15 | `deck-structure.md` (observable? who? cost? painkiller?) |
| 3 | Market & Opportunity | 0.15 | `opportunity-screening.md` (bottoms-up, why-now, potential) |
| 4 | Solution & Differentiation | 0.15 | `deck-structure.md` + `red-flags.md` (insight, moat) |
| 5 | Traction & Validation | 0.15 | `investor-signals.md` (a qualified, least-gameable proof) |
| 6 | Team & Founder–Market Fit | 0.10 | `deck-structure.md` (lived it / shipped it) |
| 7 | Risk / Reward & Ask | 0.10 | `opportunity-screening.md` (both sides + milestone-tied ask) |

Weights sum to 1.0. Tune later against real runs.

## The bands (same scale on every dial)

| Score | Band | Meaning |
|---|---|---|
| 0.0–0.2 | `missing_or_fatal` | The job isn't done — a deal-killer |
| 0.3–0.4 | `present_but_broken` | There, but fails the investor read — a credibility gap |
| 0.5–0.6 | `adequate` | Does its job, unremarkable |
| 0.7–0.8 | `strong` | Clears the bar, leans an investor in |
| 0.9–1.0 | `exceptional` | Memorable, de-risks the raise |

## Example: criteria for Factor 1 (Value Proposition)

Score = weighted average of these (equal weight unless noted):

- Segment is specific and reachable (not "everyone").
- The key need is stated observably.
- The benefit is in the segment's terms, not features.
- A delivery mechanism ("by …") is present.
- The status-quo / alternative is named.
- A differentiator that isn't easily copied is present.
- The whole thing is positioned *against* the alternative, not in a vacuum.

`met` for 6–7 of these → ~0.9; 3–5 → ~0.5; 0–2 → ~0.2.

## Benchmark ("vs. average")

At launch there is no data. Seed an **honest synthetic baseline** (most pre-seed
decks score low on Problem, Traction, and Ask), label it "benchmark — updating as
more decks are scored," and update the running average server-side as real decks
come through. The accumulating benchmark is the product's flywheel.

## Guardrail

Scores summarize the critique; they never replace it, and they never license the
tool to rewrite the founder's slides. Every score links back to the prose findings
defined by `../editor/rules.md`.
