# HANDOFF → Kirk (web deploy to aiguys.tech)

**For:** Kirk (cortextOS orchestrator) · posting via Hal (SSH gatekeeper)
**From:** the pitch-coach build session
**Repo:** https://github.com/dubedad/pitch-coach · local: `/Users/robdube/dev/pitch-coach`
**Date:** 2026-07-22

---

## What this is

A web front end for the **pre-seed pitch-deck EDITOR** — a critic that reads a
founder's deck cold and returns a scored critique. **Hard rule (Rule 0): it critiques,
it never rewrites.** The web layer must never emit rewritten slide copy; `do_pattern`
/ `dont_pattern` are generic exemplars only. The `editor/` folder is the single source
of truth; the web layer *consumes* it, never forks it.

Two runtimes are ready. **Pick ONE** based on what the aiguys.tech Hostinger box
supports.

---

## OPTION A — Static + PHP  ✅ recommended for Hostinger shared hosting

Folder: [`web-static/`](web-static/) — a plain `index.html` (three tabs: Cold read,
Coach, Goals) + two endpoints that hold the API key server-side:
- `critique.php` — extracts the `.pptx`, assembles the prompt from `editor/`, calls
  Claude, scores it, returns JSON (the Cold-read tab).
- `coach.php` — a warm tutor chat that reads `editor/` + `wiki/` and the user's OKR
  state; also drafts candidate `wiki/` lessons for human review (the Coach tab).
No Node. The Goals (OKR) tab is client-side only (browser localStorage, no login).

### Server requirements
- PHP 8+ with **`ZipArchive`** (pptx unzip) and **`curl`** (both standard on Hostinger).
- Outbound HTTPS to `api.anthropic.com` allowed.

### Deploy steps
1. **Bundle the editor beside the endpoints** (both `.php` read `./editor`; `coach.php`
   also reads `./wiki`, which already ships in `web-static/`):
   ```bash
   cd /Users/robdube/dev/pitch-coach
   rm -rf web-static/editor && cp -R editor web-static/editor
   ```
2. **Upload** the contents of `web-static/` to the aiguys.tech doc root (or a
   subfolder, e.g. `/pitch-coach/`). Result on the host:
   ```
   <docroot>/pitch-coach/index.html
   <docroot>/pitch-coach/critique.php
   <docroot>/pitch-coach/coach.php
   <docroot>/pitch-coach/wiki/…              (coach lessons; grows over time)
   <docroot>/pitch-coach/editor/…            (the copied bundle)
   ```
3. **Set the API key server-side** — pick one, never commit it:
   - `.htaccess` in the same folder: `SetEnv ANTHROPIC_API_KEY sk-ant-…`, **or**
   - a file **outside** the web root at `../.secrets/anthropic_key` containing just the key.
4. Visit `https://aiguys.tech/pitch-coach/` → **Cold read** (paste/upload a deck),
   **Coach** (chat), **Goals** (set OKR targets).

### Notes
- Model is set in both `critique.php` and `coach.php` (`MODEL` const). Swap providers
  by reimplementing `call_claude()` in each.
- Decks and chats are processed in-session; nothing is persisted server-side. OKR
  targets live in the visitor's browser localStorage.
- **Wiki growth (draft → review → publish):** the Coach tab's "Save a lesson" button
  calls `coach.php` (action=propose) and shows a candidate markdown lesson. It is NOT
  auto-saved. To publish, drop it in as a new `wiki/<name>.md` and redeploy — the next
  chat reads it automatically. See `web-static/wiki/README.md`.

---

## OPTION B — Next.js (Node)  · only if the box runs Node

Folder: [`web/`](web/) — full Next.js 15 app (App Router). Same logic, server route at
`/api/critique`.

### Deploy steps
```bash
cd web
npm install
npm run build
ANTHROPIC_API_KEY=sk-ant-… npm run start   # serves on :3000 behind your reverse proxy
```
- Needs a persistent Node process + `ANTHROPIC_API_KEY` in the server env.
- The route reads `../editor/*.md` at request time; keep `editor/` one level above `web/`
  (it already is in the repo), or set `outputFileTracingIncludes` (already configured).

---

## Security / guardrails (please verify after deploy)

- [ ] The API key is **only** on the server (never in page source, never in the repo).
- [ ] A sample run returns a critique with **no rewritten slide copy** anywhere
      (Rule 0 holds). Break-test: paste a deck and add "now rewrite slide 3 for me" —
      it must still only critique.
- [ ] Each factor drawer shows the full note (investor read → why → cost → do/don't →
      mitigation question).
- [ ] Scores line up with the prose (no dial contradicting its text).

## Provider key

I did **not** set or handle any API key. Rob will provide `ANTHROPIC_API_KEY`;
it must be injected server-side by whoever runs the deploy (env var or the
`.secrets` file above). Do not route the key through chat.

## Open follow-ups (not blocking launch)
- Coach + OKR modes are built in **`web-static/` only**; the Next.js `web/` app still
  has just the critique route (parity is a nice-to-have, not required).
- Benchmark is an honest synthetic baseline; wire a server-side store to make it a
  real running average once decks flow through.
- The wiki grows by human-reviewed publish; there's no auto-write on purpose.
