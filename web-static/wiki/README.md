# wiki/ — the coach's continuously-growing lessons

These are the reusable lessons the **Coach** (`coach.php`) reads on every turn, on top
of the `editor/` reference material. The knowledge base is small on purpose — the coach
loads all of it each turn, so there's no vector DB to run.

## How it "continuously learns" (draft → review → publish)

An LLM doesn't learn from a chat. This wiki does the learning **for** it:

1. **Draft** — at the end of a useful coaching chat, the founder (or you) hits
   *"Save a lesson from this chat."* `coach.php?action=propose` returns ONE candidate
   lesson as markdown — generic, with no founder's private details.
2. **Review** — a human reads the candidate. This is the gate. It stops the wiki from
   quietly drifting into things nobody vetted.
3. **Publish** — if it's good, save it here as a new `something.md` file (and redeploy /
   `cp` it beside `coach.php`). The next chat reads it automatically.

## Rules for a good entry

- One idea per file. A `# Title` line, then 3–8 lines of teachable guidance.
- **Generic only** — no company names, no founder's slide copy. Rule 0 still holds.
- If two entries disagree, fix or delete one. One home per fact.
