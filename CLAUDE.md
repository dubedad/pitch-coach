# Pitch Deck Editor — Workspace

An ICM workspace that houses and ships a portable AI editor: drop the `editor/` folder into a Claude project and Claude becomes a pre-seed pitch-deck critic that surfaces what's weak and hands it back — it never rewrites.

Built on ICM: folders carry structure, files carry state. If something needs explaining, the explanation lives in that folder's `CONTEXT.md`, not in your head.

## Where things live

| Folder | What it holds |
|---|---|
| `editor/` | **The deliverable.** The droppable context pack (identity, rules, examples, reference, README) |
| `web/` | **Gravy (not the entry).** Runtime-adapter contract for the aiguys.tech demo that renders the editor's critique — scoring rubric, output schema, runtime contract |
| `_planning/` | The spec + constraints: `prd.md` (what we're building) and `competition-rules.md` (the bar we're judged against) |
| `pitch-coach-knowledge/` | Raw reference artifacts and sample pitch material — input, not product |
| `how-i-created-the-pitch-coach.md` | Breadcrumb build log — the steps taken, so anyone can repeat the build |

## Route by what you're doing

| If you're… | Go to |
|---|---|
| trying to understand the whole build | `CONTEXT.md` |
| retracing how the build happened | `how-i-created-the-pitch-coach.md` |
| looking for sample decks or source knowledge | `pitch-coach-knowledge/` |
| checking what/why we're building | `_planning/prd.md` |
| checking the judging bar | `_planning/competition-rules.md` |
| shipping / testing the editor | `editor/README.md`, then the files it lists |
| editing how the editor critiques | `editor/rules.md` (the core file) |
| adding a critique pattern | `editor/examples.md` |
| adding domain knowledge | `editor/reference/` |

## The one rule this whole project teaches

The editor is a **critic, not a rewriter.** Every file in `editor/` exists to enforce that. If any output starts producing "fixed" slide copy, the bug is in `editor/rules.md`.
