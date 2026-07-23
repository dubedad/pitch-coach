#!/usr/bin/env node
/**
 * critique-server.js — Node port of critique.php for the aiguys.tech box (no PHP).
 * Faithful to web-static/critique.php: same factors, weights, criteria, scoring,
 * system-prompt assembly, output contract, and JSON response shape.
 *
 * Runtime: dependency-free (Node built-in http/https/fs). Text-paste works now.
 * .pptx upload returns a clear "paste text for now" message until a zip reader is added.
 *
 * Key is SERVER-SIDE only: env ANTHROPIC_API_KEY, or a one-line file at
 * ../.secrets/anthropic_key (relative to EDITOR_DIR's parent). Never logged, never echoed.
 *
 * Listens on 127.0.0.1:PORT (default 3200); nginx proxies /pitch-coach/critique.php here.
 */
'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3200', 10);
const MODEL = 'claude-sonnet-5';
const EDITOR_DIR = process.env.EDITOR_DIR || path.join(__dirname, 'editor');
const MAX_DECK_CHARS = 40000;

function anthropicKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const secret = path.join(EDITOR_DIR, '..', '.secrets', 'anthropic_key');
  try { return fs.readFileSync(secret, 'utf8').trim(); } catch { return ''; }
}

function factors() {
  return [
    { id: 'value_proposition', label: 'Value Proposition', weight: 0.20, criteria: [
      'Segment is specific and reachable (not "everyone")',
      'The key need is stated observably',
      "The benefit is in the segment's terms, not features",
      'A delivery mechanism ("by …") is present',
      'The status-quo / alternative is named',
      "A differentiator that isn't easily copied is present",
      'Positioned against the alternative, not in a vacuum',
    ] },
    { id: 'problem', label: 'Problem', weight: 0.15, criteria: [
      'The problem is observable, not asserted',
      'It is clear WHO has the problem',
      'The cost of the problem is quantified or made vivid',
      'It reads as a painkiller, not a vitamin',
    ] },
    { id: 'market_opportunity', label: 'Market & Opportunity', weight: 0.15, criteria: [
      'Market is sized bottoms-up, not a top-down TAM claim',
      'A credible "why now" is present',
      'The potential upside is large enough to matter to a seed investor',
    ] },
    { id: 'solution_differentiation', label: 'Solution & Differentiation', weight: 0.15, criteria: [
      'The solution follows directly from the stated problem',
      'There is a non-obvious insight behind it',
      'A defensibility / moat argument is present and credible',
    ] },
    { id: 'traction_validation', label: 'Traction & Validation', weight: 0.15, criteria: [
      'At least one qualified, least-gameable proof point is present',
      'Evidence is specific (numbers, named users) not vague',
      'The signal shown is the hardest one the stage can offer',
    ] },
    { id: 'team_fit', label: 'Team & Founder–Market Fit', weight: 0.10, criteria: [
      'The team has lived the problem or shipped in this space',
      'Roles cover the core risks of executing this specific plan',
    ] },
    { id: 'risk_reward_ask', label: 'Risk / Reward & Ask', weight: 0.10, criteria: [
      'Both the upside AND the key risks are named honestly',
      'The ask is tied to specific milestones, not a round number',
    ] },
  ];
}

function readEditor(rel) {
  try { return fs.readFileSync(path.join(EDITOR_DIR, rel), 'utf8'); } catch { return ''; }
}

function buildSystemPrompt() {
  const identity = readEditor('identity.md');
  const rules = readEditor('rules.md');
  const examples = readEditor('examples.md');
  const refNames = ['value-proposition-recipe.md', 'deck-structure.md', 'opportunity-screening.md',
    'red-flags.md', 'investor-signals.md', 'founder-archetypes.md'];
  let refs = '';
  for (const r of refNames) {
    const body = readEditor('reference/' + r);
    if (body) refs += `\n\n=== reference/${r} ===\n` + body;
  }
  let critList = '';
  for (const f of factors()) {
    critList += `- ${f.id} ("${f.label}"), criteria:\n`;
    for (const c of f.criteria) critList += `    • ${c}\n`;
  }
  const schema = `
=== OUTPUT CONTRACT (web runtime only) ===
You are running inside a web dashboard, not a chat. Return your critique as a SINGLE
JSON object and nothing else — no prose before or after, no markdown fences.

Rule 0 still holds absolutely: do_pattern / dont_pattern are GENERIC teaching
exemplars, never the founder's rewritten copy. mitigation_question hands the gap
back. You are critiquing and teaching — you never write the founder's slides.

Do NOT emit numeric scores or bands — the runtime computes those from your criteria
verdicts. For every criterion, judge "met", "partial", or "missing" and quote or
reference the deck in "evidence".

The JSON shape:
{
  "overall": {
    "cold_read_verdict": "<=3 sentences",
    "top_3_dealkillers": [ { "factor_id": "<factor id>", "one_line": "tied to a specific slide" } ]
  },
  "factors": [
    { "id": "<factor id>",
      "criteria": [ { "name": "<criterion text verbatim>", "verdict": "met|partial|missing", "evidence": "quote/reference" } ],
      "investor_read": "...", "why_it_matters": "...", "cost_if_ignored": "...",
      "do_pattern": "generic exemplar (NOT the founder's copy)", "dont_pattern": "generic failure exemplar",
      "mitigation_question": "the question that hands the gap back" }
  ]
}

Return all seven factors, using these exact ids and criteria:`;

  return 'You are the pre-seed pitch-deck EDITOR. Your full instructions follow.\n'
    + '\n=== identity.md ===\n' + identity
    + '\n=== rules.md ===\n' + rules
    + '\n=== examples.md ===\n' + examples
    + refs
    + schema + '\n' + critList;
}

function callClaude(system, deck) {
  return new Promise((resolve, reject) => {
    const key = anthropicKey();
    if (!key) return reject({ code: 503, msg: "The critique model isn't configured. Set ANTHROPIC_API_KEY on the server." });
    const payload = JSON.stringify({
      model: MODEL, max_tokens: 8192, system,
      messages: [{ role: 'user', content: 'Review this pitch deck and return the JSON critique described in your instructions.\n\n' + deck }],
    });
    const req = https.request('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-length': Buffer.byteLength(payload),
      }, timeout: 120000,
    }, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        if (res.statusCode >= 400) return reject({ code: 502, msg: `Model returned an error (HTTP ${res.statusCode}).` });
        let parsed; try { parsed = JSON.parse(body); } catch { return reject({ code: 502, msg: 'Model returned malformed response.' }); }
        let text = '';
        for (const block of (parsed.content || [])) if (block.type === 'text') text += block.text;
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fence) text = fence[1];
        const start = text.indexOf('{'), end = text.lastIndexOf('}');
        if (start === -1 || end === -1) return reject({ code: 502, msg: 'Model did not return JSON.' });
        let obj; try { obj = JSON.parse(text.slice(start, end + 1)); } catch { return reject({ code: 502, msg: 'Model returned malformed JSON.' }); }
        resolve(obj);
      });
    });
    req.on('timeout', () => { req.destroy(); reject({ code: 502, msg: 'Model timed out.' }); });
    req.on('error', (e) => reject({ code: 502, msg: 'Could not reach the model: ' + e.message }));
    req.write(payload); req.end();
  });
}

function bandFor(s) {
  if (s <= 0.2) return 'missing_or_fatal';
  if (s <= 0.4) return 'present_but_broken';
  if (s <= 0.6) return 'adequate';
  if (s <= 0.8) return 'strong';
  return 'exceptional';
}

function score(raw) {
  const verdictVal = { met: 1.0, partial: 0.5, missing: 0.0 };
  const byId = {};
  for (const f of (raw.factors || [])) byId[f.id || ''] = f;
  const out = [];
  let composite = 0.0;
  for (const def of factors()) {
    const rf = byId[def.id] || {};
    const crit = rf.criteria || [];
    let sum = 0.0;
    for (const c of crit) sum += (verdictVal[c.verdict] !== undefined ? verdictVal[c.verdict] : 0.0);
    const sc = crit.length ? Math.round((sum / crit.length) * 100) / 100 : 0.0;
    composite += sc * def.weight;
    out.push({
      id: def.id, label: def.label, score: sc, band: bandFor(sc), criteria: crit,
      investor_read: rf.investor_read || '', why_it_matters: rf.why_it_matters || '',
      cost_if_ignored: rf.cost_if_ignored || '', do_pattern: rf.do_pattern || '',
      dont_pattern: rf.dont_pattern || '', mitigation_question: rf.mitigation_question || '',
    });
  }
  return {
    overall: {
      composite_score: Math.round(composite * 100) / 100,
      cold_read_verdict: (raw.overall && raw.overall.cold_read_verdict) || '',
      top_3_dealkillers: ((raw.overall && raw.overall.top_3_dealkillers) || []).slice(0, 3),
    },
    factors: out,
  };
}

// Minimal multipart/form-data parser: pulls text fields and detects a file field.
function parseMultipart(buf, boundary) {
  const fields = {}; const files = {};
  const delim = Buffer.from('--' + boundary);
  let start = buf.indexOf(delim);
  if (start === -1) return { fields, files };
  start += delim.length;
  while (start < buf.length) {
    if (buf[start] === 0x2d && buf[start + 1] === 0x2d) break; // closing --
    const headEnd = buf.indexOf('\r\n\r\n', start);
    if (headEnd === -1) break;
    const header = buf.slice(start, headEnd).toString('utf8');
    const next = buf.indexOf(delim, headEnd);
    const value = buf.slice(headEnd + 4, next - 2); // strip trailing \r\n
    const nameM = header.match(/name="([^"]*)"/);
    const fileM = header.match(/filename="([^"]*)"/);
    if (nameM) {
      if (fileM && fileM[1]) files[nameM[1]] = { filename: fileM[1], data: value };
      else fields[nameM[1]] = value.toString('utf8');
    }
    start = next + delim.length;
  }
  return { fields, files };
}

const server = http.createServer((req, res) => {
  const send = (code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };
  if (req.method === 'GET') return send(200, { ok: true, service: 'pitch-coach critique', model: MODEL });
  if (req.method !== 'POST') return send(405, { error: 'POST only.' });

  const chunks = [];
  let size = 0;
  req.on('data', (c) => { chunks.push(c); size += c.length; if (size > 8e6) req.destroy(); });
  req.on('end', async () => {
    try {
      const buf = Buffer.concat(chunks);
      const ct = req.headers['content-type'] || '';
      let deck = '';
      const bM = ct.match(/boundary=(.+)$/);
      if (ct.includes('multipart/form-data') && bM) {
        const { fields, files } = parseMultipart(buf, bM[1].replace(/^"|"$/g, ''));
        if (files.deck && files.deck.data && files.deck.data.length) {
          return send(400, { error: 'PowerPoint upload is being wired up — for now paste your deck text and try again.' });
        }
        deck = (fields.text || '').trim();
      } else if (ct.includes('application/json')) {
        try { deck = (JSON.parse(buf.toString('utf8')).text || '').trim(); } catch {}
      } else {
        deck = buf.toString('utf8').trim();
      }
      if (!deck) return send(400, { error: 'Upload a .pptx or paste your deck text.' });
      if (deck.length > MAX_DECK_CHARS) deck = deck.slice(0, MAX_DECK_CHARS);

      const system = buildSystemPrompt();
      const raw = await callClaude(system, deck);
      const critique = score(raw);
      const benchmark = {
        value_proposition: 0.5, problem: 0.4, market_opportunity: 0.55,
        solution_differentiation: 0.5, traction_validation: 0.35,
        team_fit: 0.6, risk_reward_ask: 0.35,
      };
      send(200, { critique, benchmark });
    } catch (e) {
      if (e && e.code) return send(e.code, { error: e.msg });
      send(500, { error: 'Unexpected server error.' });
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`pitch-coach critique server on 127.0.0.1:${PORT}, editor=${EDITOR_DIR}, key=${anthropicKey() ? 'set' : 'MISSING'}`);
});
