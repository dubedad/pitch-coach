# Theory of Change & Logic Model — the deck as a causal argument

This is the deep lens behind the **spine check** (`rules.md`, Rule 5). The spine check
asks "does the story hold as a chain?" — this file is *how* you interrogate that chain
with the rigour of a Theory of Change (ToC) and a Logic Model, instead of just a
narrative sniff test.

Use it to critique the **logic** of the pitch, never to author the founder's answers.
Everything here produces questions handed back, per Rule 0.

---

## Why this lens

A pitch deck is a **causal claim**: *"If you give us this money, then — through this
chain of cause and effect — a large, valuable outcome results."* Investors don't buy
slides; they buy whether that causal chain is believable. A ToC makes the chain
explicit and forces every hidden "and then a miracle happens" into the open.

Two complementary framings:

- **Theory of Change** works **backward** from the outcome: *for the outcome to happen,
  what must be true just before it? And before that?* — until you reach today. It
  surfaces the **assumptions** riding under each link.
- **Logic Model** works **forward**: **inputs → activities → outputs → outcomes →
  impact.** It checks that what the team actually *does* plausibly produces what they
  *claim*.

A strong deck is a valid ToC whose load-bearing assumptions are either evidenced or
honestly flagged. A weak deck is a chain with an unstated assumption doing all the work.

---

## The pitch as a causal chain

Map the deck onto this spine and read it as one connected argument, not a set of slides:

```
Problem  →  Why-now  →  Solution  →  Why-you  →  Traction/Proof  →  Model  →  Ask → Outcome
(a real,     (a shift    (addresses   (this team   (evidence the    (this     (buys    (the
 costly       makes it    THAT exact   can execute   chain is         captures   the      valuable
 problem)     possible    problem)     THIS)         already firing)  the value) next     result)
              now)                                                               link)
```

Each **arrow is a causal claim with an assumption under it.** Your job is to find where
an arrow is asserted rather than earned.

### The link-by-link interrogation

For every arrow, ask the two ToC questions:

1. **The if-then:** does the claim on the left actually *cause* the claim on the right,
   or are they just placed next to each other? (Adjacency is not causation. A problem
   slide followed by a solution slide does not prove the solution solves *that* problem.)
2. **The assumption:** what must be true, but is *unstated*, for this arrow to hold?
   Name it. That unstated "for this to work, X must be true" is almost always where the
   deck is weakest — and the founder usually can't see it because it's invisible to them.

Worked examples of the assumption under each arrow:

| Arrow | The unstated assumption to surface |
|---|---|
| Problem → Solution | "...that our solution addresses the *cause* of the problem, not a symptom." |
| Why-now → Solution | "...that the shift we name is what *unlocks* this, not just a nice backdrop." |
| Solution → Traction | "...that the traction shown was *caused by* the solution's value, not by founder hustle / free pilots / a one-off." |
| Traction → Model | "...that the behaviour proven in pilots survives when we start charging for it." |
| Model → Outcome | "...that unit economics that work at small scale still work at large scale." |
| Ask → Outcome | "...that this specific amount buys the milestones that unlock the next round." |

---

## Finding the load-bearing assumption

Most decks fail because **one** unsupported assumption sits under **several** later
claims. Find it and you've found the single highest-leverage note (this is exactly the
"one spine break per pass" cap in `rules.md`).

Procedure:

1. List the arrows and the assumption under each (above).
2. For each assumption, mark it **E** (evidenced somewhere in the deck), **F** (flagged
   honestly as a risk/hypothesis), or **A** (silently assumed).
3. The **load-bearing break** is the `A` assumption that the most downstream claims
   depend on. Trace what inherits it: *"the $300M reward, the 30% margin, and the whole
   'why invest' rest on the unproven assumption that owning the transaction converts to
   margin — and that assumption is never named, let alone evidenced."*
4. Hand it back as a question about the assumption, not a fix:
   *"Your rewards slide assumes owning the transaction becomes margin. Where in the deck
   does a skeptic see that conversion actually happen — and what's the mechanism?"*

This is why the ToC lens beats a plain narrative check: a narrative check says "the
story feels disconnected here"; the ToC check says "here is the exact unstated
assumption, here is everything downstream that collapses if it's wrong, and here is the
question that makes the founder either evidence it or flag it."

---

## The Logic-Model forward check (the reciprocal test)

Run the chain the other way to catch a different failure — the deck that claims
outcomes its activities can't produce:

- **Inputs** — what the team/round actually provides (people, capital, tech, access).
- **Activities** — what they will *do* with it.
- **Outputs** — the direct, countable results of those activities.
- **Outcomes** — the change in the market/customer that the outputs cause.
- **Impact** — the large valuable end-state (the investor's return thesis).

The failure this catches: **an outcome or impact with no activity underneath it.** If
the deck claims "we become the category leader" (impact) but the activities only support
"we build a POS tool" (output), there's a gap the founder is asking the investor to
leap. Name the gap; ask what activity bridges output to the claimed outcome.

Two directions, one test: ToC pulls backward to find the missing *assumption*; the Logic
Model pushes forward to find the missing *activity*. Run both; they catch different holes.

---

## What good vs. broken looks like

**A valid chain (say so, in a sentence — don't manufacture a break):**
> problem is costly and evidenced → why-now names a real unlock → solution attacks the
> named cause → traction shows the value landing with real users → model captures it →
> ask buys the next proof point. Every arrow either carries evidence or an honestly
> flagged hypothesis.

**A broken chain (name the one biggest break):**
> the arrows look fine slide-to-slide, but the jump from "free pilots" to "$300M at 30%
> margin" rests on a silent assumption — that free-pilot behaviour converts to paid at
> scale — that nothing in the deck evidences or even names. Everything downstream of that
> arrow is borrowing credibility it hasn't earned.

---

## Guardrails (Rule 0 still governs)

- **You name assumptions and gaps; you never write the answer.** "Your Problem→Solution
  arrow assumes X — where's that shown?" is a critique. "Add a slide saying X because Y"
  starts to author it; stop at the question.
- **One break per pass.** The ToC analysis will surface several `A` assumptions. Report
  only the single most load-bearing one as the spine break; the rest wait for the next
  pass. Depth comes from iteration, not from dumping the whole map.
- **Don't demand a literal ToC diagram from the founder.** This is *your* internal
  analytical tool for finding the weak arrow — not a deliverable you impose on them. The
  founder should never have to learn "Theory of Change" to use your feedback; they just
  get a sharp question about the one assumption that matters.
- **Evidence beats assertion, but a flagged hypothesis beats a hidden one.** Reward a
  deck that *names* its risky assumption ("we're betting pilots convert — here's why we
  think so") over one that hides it, even if neither has full proof yet.
