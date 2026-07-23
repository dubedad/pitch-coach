# How I Created the Pitch-Coach

A running breadcrumb trail of how this workspace was built — so anyone can repeat
the process. Newest steps are appended at the bottom. Each entry says **what** I
did, **why**, and **what file(s)** it produced.

> This is a build log, not a spec. For *what* the project is, read `CONTEXT.md`.
> For *why* each product decision was made, read `_planning/prd.md`.

---

## Step 0 — The trigger

Entered Skool "Weekly Comp #9: The Editor." The assignment: build a domain-specific
**editor** (a critic, not a rewriter) as a portable folder you drop into a Claude
project. I picked the domain: **pitch-deck editor for pre-seed founders.**

## Step 1 — Captured the rules verbatim

Pasted the raw competition post into a file so the constraints and judging bar are
a fixed reference I can check against — not something I'm remembering.

- **Produced:** `_planning/competition-rules.md`
- **Why:** The judging rubric *is* the acceptance criteria. Keep it raw and
  untouched.

## Step 2 — Wrote the first PRD

Turned the competition brief into a product spec: who it's for, the critique-not-
rewrite constraint, the deliverable file list, behavior protocols, and how each
piece maps to the judging rubric.

- **Produced:** `_planning/prd.md` (v1)
- **Why:** Decide *what good looks like* before writing any editor content.

## Step 3 — Switched the model to Opus 4.8

Moved off Sonnet because the core work (writing critique rules and calibrated
FAIL-vs-PASS examples) is judgment-heavy authoring where a stronger reasoning model
pays off.

- **Why:** Match the model to the hardest part of the task.

## Step 4 — Recreated the PRD on Opus 4.8

Regenerated the PRD tighter and better-aligned to the rubric, with YAML
frontmatter and an explicit judging-alignment table.

- **Produced:** `_planning/prd.md` (v2)

## Step 5 — Structured the whole thing as an ICM workspace

Used the **ICM Architect** method (folders as architecture, one file = one job).
Chose the **knowledge-bundle** form — the editor is a context pack Claude *loads*,
not a multi-stage pipeline, so a pipeline would have been over-engineering.

- **Produced:**
  - `CLAUDE.md` — small, stable entry file that routes ("where am I / where do I go")
  - `CONTEXT.md` — the workspace definition + the bundle map + status
  - Moved the raw rules into `_planning/` and recreated the PRD there
- **Why:** The structure becomes the documentation; a stranger can walk it cold.

## Step 6 — Authored the editor bundle (the deliverable)

Wrote real content for every file in `editor/` — the droppable pack:

- `editor/README.md` — how a stranger runs it (<300 words)
- `editor/identity.md` — who the editor is (investor-side critic, not a coach)
- `editor/rules.md` — how it critiques; **Rule 0 = critique, never rewrite**
- `editor/examples.md` — 5 FAIL-vs-PASS critique samples that calibrate the voice
- `editor/reference/` — `deck-structure.md`, `investor-signals.md`, `red-flags.md`,
  `founder-archetypes.md`

- **Why:** This is the competition entry; the bundle has to actually work, not stub.

## Step 7 — Started this breadcrumb log + the knowledge folder

Created this file to track the build, and a `pitch-coach-knowledge/` folder to hold
reference artifacts and sample pitch material the editor can be tested against or
draw domain knowledge from.

- **Produced:** `how-i-created-the-pitch-coach.md`, `pitch-coach-knowledge/`
- **Seeded knowledge with:** Econosure business plan + 1-pager and 5-pager pitch
  examples, a Venture Opportunity Screening Guide, a value-proposition recipe, and
  a pitch-coach ingredient-questions doc.
- **Why:** Separate raw source material (input) from the editor bundle (product).
  Reference lives here until it's distilled into `editor/reference/`.

## Step 8 — Populated the knowledge folder with guidance + examples

Organized `pitch-coach-knowledge/` into two kinds of material the editor can lean
on while critiquing a real deck:

- **Guidance (frameworks the editor reasons *with*):**
  - `venture-opportunity-screening-guide.doc` — how investors screen an opportunity.
  - `value-proposition-recipe.docx` / `.jpeg` — the value-prop structure to test a
    deck's positioning against.
  - `pitch-coach-ingredient-questions.docx` — the diagnostic questions a founder's
    deck must answer.
- **Examples (concrete decks the editor critiques *against*):**
  - `econosure-business-plan.doc` — a full plan for context.
  - `econosure-1-pager-pitch-example.doc` and `econosure-5-pager-pitch-example.doc`
    — worked pitch samples at two lengths.

- **How it's used:** This knowledge base is a reference the editor can consult when
  giving feedback — e.g., checking a deck's value prop against the recipe, or
  pattern-matching a founder's problem/market framing against the Econosure
  examples. It stays **input**, not product: insights get distilled into
  `editor/reference/`, and raw copy is never pasted back into a founder's deck
  (that would break the critique-not-rewrite rule).
- **Why:** Grounding critique in real frameworks and real decks keeps feedback
  specific and defensible instead of generic.

## Step 9 — Distilled the knowledge base into the editor's reference

I asked the agent to review my knowledge base and propose suggestions to integrate
the use of that knowledge into the solution to achieve its purpose. The docs were
`.doc`/`.docx` (unreadable as-is), so the agent converted them to text (macOS
`textutil`) to actually mine them, then distilled the two proprietary frameworks
into the portable bundle rather than shipping raw source files.

- **Produced:**
  - `editor/reference/value-proposition-recipe.md` — the value-prop formula + its 8
    ingredients, framed as a *test* to reconstruct a deck's positioning against.
  - `editor/reference/opportunity-screening.md` — the higher- vs. lower-potential
    investor screen (market, economics, advantage, team, exit) + fatal-flaw and
    risk/reward framing.
- **Updated:**
  - `editor/reference/deck-structure.md` — added the nine ingredient-questions every
    deck must answer and a worked short-form skeleton (the Econosure 5-pager order).
  - `editor/examples.md` — added Example 6 (value prop with missing ingredients) and
    Example 7 (risk/reward, upside-only).
- **Why:** The knowledge folder is *input* and doesn't ship inside `editor/`.
  Distilling its frameworks into `editor/reference/` bakes the domain expertise into
  the droppable pack while upholding critique-not-rewrite — the frameworks become
  lenses to find the gap, never copy to hand back.

> **A note on chronology.** Steps 5–9 above compress how it *actually* happened: I
> ran the **ICM Architect** skill to scaffold the workspace, then I personally went
> through the `editor/` md files and added my own edits (voice, the 10 questions,
> the value-prop emphasis). Step 10 came *after* those hand-edits — which is why it
> reads partly as an audit of my own work.

## Step 10 — Audited the workspace against a dedicated ICM knowledge folder

I created a separate ICM knowledge folder (outside this repo) holding the source
methodology — Van Clief's ICM paper, the 60/30/10 course, and an ICM-for-web
deployment brief — and asked the agent to review it and audit this workspace against
it. Because this came *after* my own hand-edits, the review doubled as a check on
what I'd changed. It caught issues, several of which I had introduced:

- `editor/identity.md` pointed to an **absolute path** — which breaks portability the
  moment the folder is dropped into a stranger's Claude project. → made relative.
- The root `CONTEXT.md` bundle map was **stale** (missing the Step 9 reference
  files). → refreshed.
- The "questions every deck must answer" said **nine**; it's **ten** — risks and
  rewards are separate questions. → corrected.

I reviewed the proposed fixes, adjusted them, and implemented them.

- **Updated:** `editor/identity.md`, `editor/reference/deck-structure.md`, `CONTEXT.md`
- **Why:** ICM's *walk test* — the deliverable folder must be self-describing and
  portable when opened cold. My hand-edits had quietly broken that; grounding the
  review in the source methodology surfaced it.

## Step 11 — Dry UAT run on a real deck

Took a real sample deck I have full artifacts for in the knowledge base (the
Econosure pitch — my own former startup) and asked the agent to do a dry UAT run:
critique it using only the editor's own rules. It produced a cold-read verdict, the
top-3 deal-killers, a slide-by-slide pass, and a closing directive — and it
referenced the knowledge-base frameworks (value-prop recipe, red flags) *without ever
rewriting a slide*. Rule 0 held. The feedback was sharp enough that it reshaped how I
think about the next version (see below).

- **Why:** ICM's rule that you don't ship until you've read a real run. This was the
  UAT gate, and it passed.

## Step 12 — Real UAT in Claude: found the activation bug, then a clean pass

Ran the editor for real by loading the `editor/` files into a Claude project and
critiquing the Econosure deck. The first three runs *failed the same way* — generic
review, a design critique, and an offer to “rebuild the .pptx” (a Rule 0 violation).
Strengthening the rules didn't help, which was the clue: asking the model to “quote
the HARD STOP banner” revealed it **had never loaded rules.md at all.** The bug was
never the rules — the files were attached as *Context* (filesystem access) but nothing
authoritative told the model to *be* the editor.

The fix: put the activation in the project's **Instructions** slot (the authoritative
layer), not just attached files. With a short activation line there, the very next run
was a **clean pass** — correct protocol, Rule 0 held, design kept to content-hygiene,
and it ended on the closing directive with no build-offer. A follow-up **break test**
(“just rewrite slide 4 and build me a .pptx”) was declined in-voice, handed back as
questions + a directive.

- **Produced:** `editor/SYSTEM-PROMPT.md` (a copy-paste activation block that carries
  the guardrails inline); load+activate steps added to `editor/README.md`;
  `editor/CONTEXT.md` (self-describing load order); `web/` runtime contract + scoring
  rubric + output schema for the aiguys.tech demo.
- **Lesson:** a knowledge pack governs behavior only from the **Instructions** slot;
  attaching files is necessary but not sufficient. “Drop the folder in” must be paired
  with an activation — now documented in the README and shipped as `SYSTEM-PROMPT.md`.
- **Why:** This was the true ship gate. The editor works, activated correctly, with
  every guardrail holding — including the hardest one (no offer to build).

---

## Planned direction (documented, NOT yet built)

These are the next moves — captured here so the intent is on record before the work
happens. Both must survive the one non-negotiable: **the editor critiques, it never
rewrites.** The UI and the richer feedback make the critique *friendlier and more
teachable*, not a rewriting service.

### A — A web-deployed, user-centric feedback dashboard (`aiguys.tech`)

A browser UI that *renders* the editor's text critique as a calmer, more navigable
experience for a stressed founder. Concept:

- **Score the key pitch components** on a dashboard (e.g., problem, value prop,
  market, traction, team, ask, risk/reward).
- **Select a component** to drill into its feedback in a panel below. Each drill-down
  shows: (1) what an investor concludes about that component *right now*; (2) do /
  don't **teaching patterns** (never the founder's rewritten copy); (3) *why* acting
  on it helps the founder's raise; (4) *how* it helps the investor complete their
  **top task** — deciding whether to take the next meeting.
- **Guardrail:** the dashboard renders and teaches; it still never writes the
  founder's slides. Rule 0 survives the UI.

### B — More comprehensive, less transactional feedback

Evolve the feedback md files from terse "here's the gap" notes toward a **learning
arc**: raise the founder's *awareness* of what's blocking them, build the *desire* to
fix it, make the *knowledge* consumable, let them *apply* it, then loop back through
the editor for fresh feedback. (This maps to the **ADKAR** change model — Awareness,
Desire, Knowledge, Ability, Reinforcement.)

- **Guardrail:** more teaching, still no rewriting.
- **Purpose:** pitching is high-stakes and stressful; the tool should let a founder
  *learn in a safe, friendly way* rather than just receive a verdict.

---

## How to repeat this (the short version)

1. Pick a **specific** domain and an editor that critiques, not rewrites.
2. Save the assignment/rules verbatim as your acceptance criteria.
3. Write a PRD before any content; align it to the judging rubric.
4. Structure as an ICM workspace — pick the form that fits (here: knowledge bundle).
5. Author the deliverable bundle, one file per job.
6. Keep this breadcrumb log and a knowledge folder as you go.
7. Distill the knowledge folder's frameworks into `editor/reference/` — don't ship
   raw source; keep the never-rewrite guardrail.
8. Audit the workspace against the source methodology — especially after hand-edits —
   and run the ICM walk test for portability.
9. Do a dry UAT run on a real deck before shipping; confirm the never-rewrite rule
   holds under a real critique.

_Next step goes here._
