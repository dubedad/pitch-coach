# The Pre-Seed Pitch Deck Editor

An AI editor that reviews pitch decks for pre-seed founders (~$500K–$2M raises:
angels, pre-seed funds, accelerator applications). It reads your deck the way a
seed investor reads it cold, tells you exactly what will kill the raise, and hands
it back for you to fix.

**It critiques. It does not rewrite.** You will not get "fixed" slides back. You
will get the three things that don't work, why they don't work in an investor's
head, and a directed push to solve them yourself.

## How to use it

1. **Load the files as knowledge.** Create a Claude Project and **upload the files
   in this `editor/` folder to Project Knowledge** (identity, rules, examples, and
   everything in `reference/`). Note: *pointing a filesystem tool at the folder is
   NOT the same as loading it* — the files must be in the project's knowledge so the
   model actually reads them.
2. **Activate the editor.** Open `SYSTEM-PROMPT.md`, copy the code block inside it,
   and paste it into the Project's **Instructions** field (this is the authoritative
   slot — the one that actually governs behavior). That block also carries the core
   guardrails on its own, so the editor holds even before it reads the other files.
3. **Give it your deck** — slide text, bullets, or a slide-by-slide dump (screenshots
   or exported text both work). Tell it if it's a full deck or one slide.
4. **Ask:** **"Review this."**

> If the review reads like generic deck advice, does a design critique, or offers to
> rebuild your deck, the files aren't loaded / the editor isn't activated — redo
> steps 1–2. A quick check: ask *"Quote the HARD STOP banner at the top of
> rules.md."* If it can't, it isn't running the editor.

## What you'll get back

- **For a full deck:** a 3-sentence cold-read verdict → your top 3 deal-killers →
  a slide-by-slide pass → one "if you fix nothing else, fix this" directive.
- **For a single slide:** what job that slide must do, whether it does it, the
  investor-side read if it fails, a question that points you at the fix, and the impact of not fixing it.

## What you will NOT get

- Rewritten slide copy or a "revised deck." That's your job — the editor only makes
  sure you're solving the right problem.
- Generic notes like "strengthen your intro." Every note is tied to a specific line
  and a specific investor reaction.
- Design or visual feedback. This editor reviews narrative and logic, not layout.

## What's inside

- `identity.md` — who the editor is.
- `rules.md` — how it critiques (and why it never rewrites).
- `examples.md` — what good vs. bad critique looks like.
- `reference/` — the deck structure, value-proposition recipe, opportunity screening guide,
  investor signals, red flags, and founder blind spots it critiques against.
- `CONTEXT.md` — the load order and the one rule, if you want the map.

## Bonus — the web version (aiguys.tech)

The competition entry is *this folder* — drop it into Claude and it works. As extra
credit, the same knowledge also powers a **web demo** on `aiguys.tech` that *renders*
this critique as a friendlier, interactive experience: a dashboard that scores each
part of your pitch on a dial (vs. a benchmark), and a click-to-drill-down panel that
shows, per factor, the investor's read, why it matters, do/don't patterns, and the
question to work on next. A coaching chat and an OKR goal-tracker are planned on top.

It's the *same* editor knowledge, rendered — not a different tool, and it still never
rewrites your slides. See `../web/CONTEXT.md` for how it's wired.

Best on pre-seed decks. It is not tuned for Series A or later.
