<?php
/**
 * critique.php — server-side critique endpoint for shared/PHP hosting (Hostinger).
 *
 * Mirrors the Next.js /api/critique route, but in plain PHP so it runs on standard
 * shared hosting with no Node. It:
 *   1. reads the deck (uploaded .pptx or pasted text),
 *   2. assembles the system prompt from ../editor/ (single source of truth),
 *   3. calls Claude with the key held SERVER-SIDE,
 *   4. scores the criteria deterministically (model judges, code scores),
 *   5. returns the final critique as JSON.
 *
 * The key never touches the browser. Never commit the key.
 */

header("Content-Type: application/json");

// ---- config --------------------------------------------------------------

// Prefer an env var (SetEnv ANTHROPIC_API_KEY in .htaccess, or panel env).
// Fallback: a secrets file OUTSIDE the web root, one line = the key.
function anthropic_key(): string {
    $env = getenv("ANTHROPIC_API_KEY");
    if ($env) return trim($env);
    $secret = __DIR__ . "/../.secrets/anthropic_key";
    if (is_readable($secret)) return trim(file_get_contents($secret));
    return "";
}

const MODEL = "claude-sonnet-4-20250514";
const EDITOR_DIR = __DIR__ . "/editor";      // deploy a copy of editor/ beside this file
const MAX_DECK_CHARS = 40000;

// The seven factors — weights + criteria. Single home for this config on the PHP side.
function factors(): array {
    return [
        ["id" => "value_proposition", "label" => "Value Proposition", "weight" => 0.20, "criteria" => [
            "Segment is specific and reachable (not \"everyone\")",
            "The key need is stated observably",
            "The benefit is in the segment's terms, not features",
            "A delivery mechanism (\"by …\") is present",
            "The status-quo / alternative is named",
            "A differentiator that isn't easily copied is present",
            "Positioned against the alternative, not in a vacuum",
        ]],
        ["id" => "problem", "label" => "Problem", "weight" => 0.15, "criteria" => [
            "The problem is observable, not asserted",
            "It is clear WHO has the problem",
            "The cost of the problem is quantified or made vivid",
            "It reads as a painkiller, not a vitamin",
        ]],
        ["id" => "market_opportunity", "label" => "Market & Opportunity", "weight" => 0.15, "criteria" => [
            "Market is sized bottoms-up, not a top-down TAM claim",
            "A credible \"why now\" is present",
            "The potential upside is large enough to matter to a seed investor",
        ]],
        ["id" => "solution_differentiation", "label" => "Solution & Differentiation", "weight" => 0.15, "criteria" => [
            "The solution follows directly from the stated problem",
            "There is a non-obvious insight behind it",
            "A defensibility / moat argument is present and credible",
        ]],
        ["id" => "traction_validation", "label" => "Traction & Validation", "weight" => 0.15, "criteria" => [
            "At least one qualified, least-gameable proof point is present",
            "Evidence is specific (numbers, named users) not vague",
            "The signal shown is the hardest one the stage can offer",
        ]],
        ["id" => "team_fit", "label" => "Team & Founder–Market Fit", "weight" => 0.10, "criteria" => [
            "The team has lived the problem or shipped in this space",
            "Roles cover the core risks of executing this specific plan",
        ]],
        ["id" => "risk_reward_ask", "label" => "Risk / Reward & Ask", "weight" => 0.10, "criteria" => [
            "Both the upside AND the key risks are named honestly",
            "The ask is tied to specific milestones, not a round number",
        ]],
    ];
}

// ---- helpers -------------------------------------------------------------

function fail(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(["error" => $msg]);
    exit;
}

function read_editor(string $rel): string {
    $path = EDITOR_DIR . "/" . $rel;
    return is_readable($path) ? file_get_contents($path) : "";
}

function extract_pptx(string $tmpPath): string {
    $zip = new ZipArchive();
    if ($zip->open($tmpPath) !== true) fail(400, "Could not read the file — is it a valid .pptx?");

    $slides = [];
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = $zip->getNameIndex($i);
        if (preg_match('#^ppt/slides/slide(\d+)\.xml$#', $name, $m)) {
            $slides[(int)$m[1]] = $zip->getFromName($name);
        }
    }
    $zip->close();
    if (!$slides) fail(400, "No slides found — is this an empty or non-PowerPoint file?");

    ksort($slides);
    $out = [];
    $n = 0;
    foreach ($slides as $xml) {
        $n++;
        $xml = str_replace("</a:p>", "\n", $xml);
        preg_match_all('/<a:t>(.*?)<\/a:t>/s', $xml, $mm);
        $text = trim(html_entity_decode(implode(" ", $mm[1]), ENT_QUOTES | ENT_XML1));
        $out[] = "Slide $n:\n" . ($text !== "" ? $text : "(no text on this slide)");
    }
    return implode("\n\n", $out);
}

function build_system_prompt(): string {
    $identity = read_editor("identity.md");
    $rules    = read_editor("rules.md");
    $examples = read_editor("examples.md");

    $refNames = ["value-proposition-recipe.md", "deck-structure.md", "opportunity-screening.md",
                 "red-flags.md", "investor-signals.md", "founder-archetypes.md", "theory-of-change.md"];
    $refs = "";
    foreach ($refNames as $r) {
        $body = read_editor("reference/" . $r);
        if ($body) $refs .= "\n\n=== reference/$r ===\n" . $body;
    }

    $critList = "";
    foreach (factors() as $f) {
        $critList .= "- {$f['id']} (\"{$f['label']}\"), criteria:\n";
        foreach ($f["criteria"] as $c) $critList .= "    • $c\n";
    }

    $schema = <<<TXT

=== OUTPUT CONTRACT (web runtime only) ===
You are running inside a web dashboard, not a chat. Return your critique as a SINGLE
JSON object and nothing else — no prose before or after, no markdown fences.

Rule 0 still holds absolutely: do_pattern / dont_pattern are GENERIC teaching
exemplars, never the founder's rewritten copy. mitigation_question hands the gap
back. You are critiquing and teaching — you never write the founder's slides.

Do NOT emit numeric scores or bands — the runtime computes those from your criteria
verdicts. For every criterion, judge "met", "partial", "missing", or "not_applicable"
and quote or reference the deck in "evidence".

Use "not_applicable" ONLY when a criterion genuinely does not apply at this deck's
stage — e.g. a pre-seed deck with no operating history isn't expected to show
financial projections; a traction-led deck may not need a formal "why now" slide.
N/A criteria drop out of the score entirely rather than dragging it down. Do NOT use
N/A to excuse a gap that SHOULD be closed — that's a "missing", and you should name it.

The JSON shape:
{
  "overall": {
    "cold_read_verdict": "<=3 sentences",
    "top_3_dealkillers": [ { "factor_id": "<factor id>", "one_line": "tied to a specific slide" } ]
  },
  "factors": [
    { "id": "<factor id>",
      "criteria": [ { "name": "<criterion text verbatim>", "verdict": "met|partial|missing|not_applicable", "evidence": "quote/reference" } ],
      "investor_read": "...", "why_it_matters": "...", "cost_if_ignored": "...",
      "do_pattern": "generic exemplar (NOT the founder's copy)", "dont_pattern": "generic failure exemplar",
      "mitigation_question": "the question that hands the gap back" }
  ]
}

Return all seven factors, using these exact ids and criteria:
TXT;

    return "You are the pre-seed pitch-deck EDITOR. Your full instructions follow.\n"
        . "\n=== identity.md ===\n" . $identity
        . "\n=== rules.md ===\n" . $rules
        . "\n=== examples.md ===\n" . $examples
        . $refs
        . $schema . "\n" . $critList;
}

function call_claude(string $system, string $deck): array {
    $key = anthropic_key();
    if (!$key) fail(503, "The critique model isn't configured. Set ANTHROPIC_API_KEY on the server.");

    $payload = json_encode([
        "model" => MODEL,
        "max_tokens" => 4096,
        "system" => $system,
        "messages" => [[
            "role" => "user",
            "content" => "Review this pitch deck and return the JSON critique described in your instructions.\n\n" . $deck,
        ]],
    ]);

    $ch = curl_init("https://api.anthropic.com/v1/messages");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            "content-type: application/json",
            "x-api-key: " . $key,
            "anthropic-version: 2023-06-01",
        ],
        CURLOPT_TIMEOUT => 60,
    ]);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($res === false) fail(502, "Could not reach the model: " . curl_error($ch));
    curl_close($ch);

    if ($httpCode >= 400) fail(502, "Model returned an error (HTTP $httpCode).");

    $body = json_decode($res, true);
    $text = "";
    foreach ($body["content"] ?? [] as $block) {
        if (($block["type"] ?? "") === "text") $text .= $block["text"];
    }

    // Extract the first JSON object, tolerating fences/prose.
    if (preg_match('/```(?:json)?\s*(.*?)```/s', $text, $m)) $text = $m[1];
    $start = strpos($text, "{");
    $end = strrpos($text, "}");
    if ($start === false || $end === false) fail(502, "Model did not return JSON.");
    $obj = json_decode(substr($text, $start, $end - $start + 1), true);
    if (!is_array($obj)) fail(502, "Model returned malformed JSON.");
    return $obj;
}

function band_for(float $s): string {
    if ($s <= 0.2) return "missing_or_fatal";
    if ($s <= 0.4) return "present_but_broken";
    if ($s <= 0.6) return "adequate";
    if ($s <= 0.8) return "strong";
    return "exceptional";
}

function score(array $raw): array {
    // not_applicable is deliberately absent: N/A criteria are excluded, not scored 0.
    $verdictVal = ["met" => 1.0, "partial" => 0.5, "missing" => 0.0];
    $byId = [];
    foreach ($raw["factors"] ?? [] as $f) $byId[$f["id"] ?? ""] = $f;

    $factors = [];
    $weightedSum = 0.0;
    $includedWeight = 0.0;
    foreach (factors() as $def) {
        $rf = $byId[$def["id"]] ?? [];
        $crit = $rf["criteria"] ?? [];
        // Score only over criteria that actually apply (drop not_applicable).
        $scorable = 0;
        $sum = 0.0;
        foreach ($crit as $c) {
            $v = $c["verdict"] ?? "missing";
            if (!array_key_exists($v, $verdictVal)) continue; // not_applicable / unknown
            $sum += $verdictVal[$v];
            $scorable++;
        }
        if ($scorable === 0) {
            // Every criterion is N/A (or none present): this factor drops out of the math.
            $factors[] = [
                "id" => $def["id"], "label" => $def["label"],
                "score" => null, "band" => "not_applicable", "na" => true,
                "criteria" => $crit,
                "investor_read" => $rf["investor_read"] ?? "",
                "why_it_matters" => $rf["why_it_matters"] ?? "",
                "cost_if_ignored" => $rf["cost_if_ignored"] ?? "",
                "do_pattern" => $rf["do_pattern"] ?? "",
                "dont_pattern" => $rf["dont_pattern"] ?? "",
                "mitigation_question" => $rf["mitigation_question"] ?? "",
            ];
            continue;
        }
        $sc = round($sum / $scorable, 2);
        $weightedSum += $sc * $def["weight"];
        $includedWeight += $def["weight"];
        $factors[] = [
            "id" => $def["id"], "label" => $def["label"], "score" => $sc, "band" => band_for($sc),
            "na" => false,
            "criteria" => $crit,
            "investor_read" => $rf["investor_read"] ?? "",
            "why_it_matters" => $rf["why_it_matters"] ?? "",
            "cost_if_ignored" => $rf["cost_if_ignored"] ?? "",
            "do_pattern" => $rf["do_pattern"] ?? "",
            "dont_pattern" => $rf["dont_pattern"] ?? "",
            "mitigation_question" => $rf["mitigation_question"] ?? "",
        ];
    }

    // Composite = weighted average over INCLUDED factors only (renormalized).
    $composite = $includedWeight > 0 ? round($weightedSum / $includedWeight, 2) : 0.0;

    return [
        "overall" => [
            "composite_score" => $composite,
            "cold_read_verdict" => $raw["overall"]["cold_read_verdict"] ?? "",
            "top_3_dealkillers" => array_slice($raw["overall"]["top_3_dealkillers"] ?? [], 0, 3),
        ],
        "factors" => $factors,
    ];
}

// ---- main ----------------------------------------------------------------

if ($_SERVER["REQUEST_METHOD"] !== "POST") fail(405, "POST only.");

$deck = "";
if (!empty($_FILES["deck"]["tmp_name"])) {
    $deck = extract_pptx($_FILES["deck"]["tmp_name"]);
} elseif (!empty($_POST["text"])) {
    $deck = trim($_POST["text"]);
} else {
    fail(400, "Upload a .pptx or paste your deck text.");
}

if (strlen($deck) > MAX_DECK_CHARS) $deck = substr($deck, 0, MAX_DECK_CHARS);

$system = build_system_prompt();
$raw = call_claude($system, $deck);
$critique = score($raw);

$benchmark = [
    "value_proposition" => 0.5, "problem" => 0.4, "market_opportunity" => 0.55,
    "solution_differentiation" => 0.5, "traction_validation" => 0.35,
    "team_fit" => 0.6, "risk_reward_ask" => 0.35,
];

echo json_encode(["critique" => $critique, "benchmark" => $benchmark]);
