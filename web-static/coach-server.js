#!/usr/bin/env node
/**
 * coach-server.js — Node port of coach.php for the aiguys.tech box (no PHP).
 * Faithful to web-static/coach.php: same warm-tutor persona, same editor/ + wiki/
 * knowledge, same two actions (chat / propose), same Rule 0 (teaches, never rewrites).
 *
 * Differences forced by this box, not by choice:
 *  - MODEL is claude-sonnet-5 (coach.php pinned claude-sonnet-4-20250514, which 404s
 *    on this key — same reason critique-server.js uses sonnet-5).
 *  - dependency-free (Node built-in http/https/fs), own process on 127.0.0.1:PORT.
 *
 * Key is server-side only: env ANTHROPIC_API_KEY or ../.secrets/anthropic_key
 * (relative to EDITOR_DIR's parent). Never logged, never echoed.
 *
 * nginx proxies /pitch-coach/coach.php here.
 */
'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.COACH_PORT || '3201', 10);
const MODEL = 'claude-sonnet-5';
const EDITOR_DIR = process.env.EDITOR_DIR || path.join(__dirname, 'editor');
const WIKI_DIR = process.env.WIKI_DIR || path.join(EDITOR_DIR, '..', 'wiki');
const MAX_TURNS = 24;

function anthropicKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const secret = path.join(EDITOR_DIR, '..', '.secrets', 'anthropic_key');
  try { return fs.readFileSync(secret, 'utf8').trim(); } catch { return ''; }
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

// Load the whole wiki (small KB) so the coach always reads the latest lessons.
function loadWiki() {
  let files;
  try { files = fs.readdirSync(WIKI_DIR); } catch { return ''; }
  const out = [];
  for (const name of files.sort()) {
    if (!name.endsWith('.md') || name === 'README.md') continue;
    out.push('=== wiki/' + name + ' ===\n' + readFileSafe(path.join(WIKI_DIR, name)));
  }
  return out.length ? out.join('\n\n') : '(the wiki is empty so far)';
}

function coachSystemPrompt(okr, scores) {
  const identity = readFileSafe(path.join(EDITOR_DIR, 'identity.md'));
  const vp = readFileSafe(path.join(EDITOR_DIR, 'reference', 'value-proposition-recipe.md'));
  const screen = readFileSafe(path.join(EDITOR_DIR, 'reference', 'opportunity-screening.md'));
  const deck = readFileSafe(path.join(EDITOR_DIR, 'reference', 'deck-structure.md'));
  const wiki = loadWiki();

  let okrBlock = '';
  if ((okr && Object.keys(okr).length) || (scores && Object.keys(scores).length)) {
    okrBlock = '\n=== THIS FOUNDER\'S CURRENT GOALS (OKR) ===\n';
    if (okr && okr.objective) okrBlock += 'Objective: ' + okr.objective + '\n';
    const targets = (okr && okr.targets) || {};
    for (const factor of Object.keys(targets)) {
      const cur = scores ? scores[factor] : undefined;
      const curTxt = (cur === undefined || cur === null) ? 'not scored yet' : Math.round(cur * 100) + '/100';
      okrBlock += `- ${factor}: now ${curTxt}, target ` + Math.round(targets[factor] * 100) + '/100\n';
    }
    okrBlock += "Use this to steer the conversation toward the weakest key result, but only when it helps the founder.\n";
  }

  return `You are the PITCH COACH — the warm, encouraging tutor side of a pre-seed pitch
editor. You are the same investor-minded expert as the deck critic, but here your
job is to TEACH a founder how to screen and sharpen their own pitch, in a natural,
supportive conversation.

VOICE:
- Warm, plain-spoken, one idea at a time. Hard on the issue, soft on the person.
- Socratic: ask a sharp question before you hand over an answer. Draw the founder's
  own thinking out.
- Short turns. Don't lecture. Don't dump frameworks unprompted.

HARD RULE (unchanged): you never write, rewrite, or draft the founder's slides or
copy. If asked "write it for me," you decline warmly and ask the question that gets
them to write it themselves. Teaching examples must be GENERIC, never their slide copy.

WHAT YOU KNOW (your source of truth):
- The editor's identity and the reference material below.
- The wiki below — a growing set of lessons. Prefer it when it's relevant.

=== editor identity ===
${identity}

=== reference: value-proposition-recipe.md ===
${vp}

=== reference: opportunity-screening.md ===
${screen}

=== reference: deck-structure.md ===
${deck}

=== wiki (continuously-growing lessons) ===
${wiki}
${okrBlock}`;
}

function callClaude(system, messages, maxTokens) {
  return new Promise((resolve, reject) => {
    const key = anthropicKey();
    if (!key) return reject({ code: 503, msg: "The coach isn't configured. Set ANTHROPIC_API_KEY on the server." });
    const clean = [];
    for (const m of (messages || []).slice(-MAX_TURNS)) {
      const role = (m && m.role) === 'assistant' ? 'assistant' : 'user';
      const content = String((m && m.content) || '').trim();
      if (content !== '') clean.push({ role, content });
    }
    if (!clean.length) return reject({ code: 400, msg: 'Say something to the coach to start.' });

    const payload = JSON.stringify({ model: MODEL, max_tokens: maxTokens || 1024, system, messages: clean });
    const req = https.request('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-length': Buffer.byteLength(payload),
      }, timeout: 90000,
    }, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        if (res.statusCode >= 400) return reject({ code: 502, msg: `Coach model error (HTTP ${res.statusCode}).` });
        let parsed; try { parsed = JSON.parse(body); } catch { return reject({ code: 502, msg: 'Coach returned a malformed response.' }); }
        let text = '';
        for (const block of (parsed.content || [])) if (block.type === 'text') text += block.text;
        resolve(text.trim());
      });
    });
    req.on('timeout', () => { req.destroy(); reject({ code: 502, msg: 'Coach timed out.' }); });
    req.on('error', (e) => reject({ code: 502, msg: 'Could not reach the coach: ' + e.message }));
    req.write(payload); req.end();
  });
}

const server = http.createServer((req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
  if (req.method === 'GET') return send(200, { ok: true, service: 'pitch-coach coach', model: MODEL });
  if (req.method !== 'POST') return send(405, { error: 'POST only.' });

  const chunks = [];
  let size = 0;
  req.on('data', (c) => { chunks.push(c); size += c.length; if (size > 2e6) req.destroy(); });
  req.on('end', async () => {
    try {
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(400, { error: 'Expected a JSON body.' }); }
      if (!input || typeof input !== 'object') return send(400, { error: 'Expected a JSON body.' });
      const action = input.action || 'chat';
      const messages = Array.isArray(input.messages) ? input.messages : [];

      if (action === 'propose') {
        const system = "You distill a coaching conversation into ONE short, reusable wiki lesson "
          + "for a pre-seed pitch knowledge base. Output MARKDOWN only: a '# Title' line then "
          + "3-8 lines of generic, teachable guidance. NEVER include the founder's private "
          + "details, company name, or slide copy — generalize it. If there's no durable, "
          + "reusable lesson in the conversation, output exactly: NO_LESSON.";
        const candidate = await callClaude(system, messages.concat([{
          role: 'user', content: 'Draft the single most useful reusable wiki lesson from this conversation.',
        }]), 1024);
        return send(200, { candidate });
      }

      const okr = (input.okr && typeof input.okr === 'object') ? input.okr : {};
      const scores = (input.scores && typeof input.scores === 'object') ? input.scores : {};
      const system = coachSystemPrompt(okr, scores);
      const reply = await callClaude(system, messages, 1024);
      send(200, { reply });
    } catch (e) {
      if (e && e.code) return send(e.code, { error: e.msg });
      send(500, { error: 'Unexpected server error.' });
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`pitch-coach coach server on 127.0.0.1:${PORT}, editor=${EDITOR_DIR}, wiki=${WIKI_DIR}, key=${anthropicKey() ? 'set' : 'MISSING'}`);
});
