# Workspace CONTEXT — what this is and how it's shaped

## What leaves this workspace

One thing: the `editor/` folder. Zip it, or add it to a Claude project. A stranger drops it in, pastes a pre-seed pitch deck, and gets back expert critique that improves the deck — with zero rewritten copy.

## Form: knowledge bundle

The editor is not a pipeline (nothing "runs" stage-to-stage) and not a record library. It is a **navigable context pack** — a body of knowledge Claude loads to become the editor. So it follows the knowledge-bundle form: layered files, one job each, loaded by need.

## The bundle map

| Layer | File | One job | Load order |
|---|---|---|---|
| Identity | `editor/identity.md` | Who the editor is, what it reviews, its perspective | Always first |
| Behavior | `editor/rules.md` | How it critiques; the critique-not-rewrite constraint; the protocols | Always |
| Calibration | `editor/examples.md` | FAIL vs PASS critique samples that fix the voice | Always |
| Domain | `editor/reference/deck-structure.md` | Standard slide sequence, each slide's job, the ten questions | By task |
| Domain | `editor/reference/value-proposition-recipe.md` | The value-prop recipe + 8 ingredients to test positioning | By task |
| Domain | `editor/reference/opportunity-screening.md` | The investor opportunity screen + risk/reward framing | By task |
| Domain | `editor/reference/investor-signals.md` | What pre-seed investors pattern-match for | By task |
| Domain | `editor/reference/red-flags.md` | The common deck-killers, grouped | By task |
| Domain | `editor/reference/founder-archetypes.md` | Blind spots by founder background | By task |
| Use | `editor/README.md` | How a stranger runs it | Human-facing entry |

**Always-load:** identity + rules + examples. **Load-by-task:** the `reference/` files, pulled when a specific slide or issue is in play.

## Status

**COMPLETE.** Every file in `editor/` holds real content, the walk test passes, and
the editor passed a live UAT in a Claude project: activated via the **Instructions**
slot (see `editor/SYSTEM-PROMPT.md`), it critiqued a real deck following the full
protocol, upheld critique-not-rewrite, and declined an explicit “rewrite / build the
.pptx” request — handing it back as questions instead. Ready to ship.

> **Activation note:** dropping the `editor/` files into a project is necessary but
> not sufficient — the model must be told to *be* the editor via the project's
> Instructions. Paste `editor/SYSTEM-PROMPT.md` there (or pre-load it into a
> Gem/Project). See `editor/README.md`.

Constraints and judging bar: `_planning/competition-rules.md`.
Full spec and rationale: `_planning/prd.md`.
How the build happened, step by step: `how-i-created-the-pitch-coach.md`.
Raw reference artifacts and sample pitch material (input, not product): `pitch-coach-knowledge/`.
