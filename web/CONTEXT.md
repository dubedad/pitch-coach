# web/ — the runtime adapter contract

This folder describes the **web deployment** of the pitch-coach (the aiguys.tech
demo). It is **not** the competition deliverable — that's `../editor/`, shipped as-is.
The web runtime *consumes* `../editor/` as its single source of truth and renders the
critique as an interactive, founder-friendly dashboard.

> The ICM lesson this obeys: **the folder is the transfer package, not the runtime.**
> `../editor/` carries the knowledge; this runtime executes and renders it.

## Inputs

- **Reference (every run):** the whole `../editor/` bundle (identity, rules, examples,
  reference/) + `web/scoring-rubric.md` + `web/output-schema.md`.
- **Working (per run):** the founder's pasted or uploaded deck.

## Process (the 60 / 30 / 10 split)

1. **Assemble the system prompt** — always-load `../editor/identity.md` + `rules.md` +
   `examples.md`; inject the `reference/` file(s) relevant to the deck; append the
   output schema and instruct the model to return JSON. *(30% orchestration)*
2. **Call the model** once, requesting schema-conforming JSON. *(10% AI)*
3. **Parse + score** — validate JSON, map criteria to numbers, compute factor and
   composite scores per `scoring-rubric.md`, update the running benchmark. *(30%)*
4. **Render** — dashboard of dials; click a factor to open its drill-down panel
   (investor read → why it matters → do/don't patterns → mitigation question → cost
   if ignored). *(60% infrastructure: UI + editor pack + schema)*

## Outputs

- A rendered dashboard (scores + drill-downs). No file is written to this repo; the
  critique is per-session unless the user opts to save.

## Human check

- Does the rendered critique still obey Rule 0 (no rewritten slide copy anywhere)?
- Does each factor's drill-down carry the full note anatomy (read / why / cost /
  mitigation question)?
- Do the scores line up with the prose findings (no dial that contradicts its text)?

## Deployment notes

- **Front-end:** static site (dials + panels). Plain HTML/JS is sufficient.
- **Back-end:** one serverless function that holds the model API key **server-side**,
  assembles the prompt, calls the model, returns JSON. Never call the model from the
  browser; the key stays behind the function.
- **Privacy:** don't persist a user's deck beyond the session unless they opt in.
- **Single source of truth:** import `../editor/` verbatim. Do not copy its content
  into web code — a link/import beats a copy.

## Planned modes (see the breadcrumb log for status)

All three modes read the **same** `../editor/` knowledge — different personas and
renderings, one source of truth. None of them rewrites the founder's deck.

1. **Critique mode** (this contract) — scores each factor and renders the
   score-dashboard + drill-down panels via `output-schema.md`.
2. **OKR overlay** — lets a founder set an Objective ("make my pitch fundable") and
   Key Results (target scores per factor, e.g. Value Proposition ≥ 0.7). Each
   resubmission moves the KRs; watching the dials climb is the safe-learning
   reinforcement loop. Client-side goal state on top of the critique scores.
3. **Coach / tutor mode** — a warm, natural-language Q&A grounded in
   `../editor/reference/opportunity-screening.md` (+ `value-proposition-recipe.md`),
   where a founder asks how to better *screen* their own pitch/opportunity. A
   supportive tutor persona, not the cold-read critic — still teaching, never
   rewriting. Retrieval-light: load the relevant `reference/` file into context; no
   vector DB needed for a knowledge base this small.
