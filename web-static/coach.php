<?php
/**
 * coach.php — warm tutor chat for the pitch-coach web runtime.
 *
 * A DIFFERENT persona from critique.php: supportive, Socratic, encouraging — it
 * teaches a founder how to screen and sharpen their own pitch. It reads the SAME
 * editor/ knowledge (single source of truth) plus a growing wiki/ of lessons.
 *
 * Rule 0 still holds: it teaches and asks; it NEVER rewrites the founder's slides.
 *
 * Actions (JSON body):
 *   { "action": "chat", "messages": [{role,content}...], "okr": {...}, "scores": {...} }
 *     → { "reply": "…" }
 *   { "action": "propose", "messages": [...] }
 *     → { "candidate": "# Title\n\n…markdown lesson…" }   (for human review, not auto-saved)
 */

header("Content-Type: application/json");

function anthropic_key(): string {
    $env = getenv("ANTHROPIC_API_KEY");
    if ($env) return trim($env);
    $secret = __DIR__ . "/../.secrets/anthropic_key";
    if (is_readable($secret)) return trim(file_get_contents($secret));
    return "";
}

const MODEL = "claude-sonnet-4-20250514";
const EDITOR_DIR = __DIR__ . "/editor";
const WIKI_DIR = __DIR__ . "/wiki";
const MAX_TURNS = 24;

function fail(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(["error" => $msg]);
    exit;
}

function read_file_safe(string $path): string {
    return is_readable($path) ? file_get_contents($path) : "";
}

/** Load the whole wiki (small KB) so the coach always reads the latest lessons. */
function load_wiki(): string {
    if (!is_dir(WIKI_DIR)) return "";
    $out = [];
    foreach (glob(WIKI_DIR . "/*.md") as $path) {
        if (basename($path) === "README.md") continue;
        $out[] = "=== wiki/" . basename($path) . " ===\n" . file_get_contents($path);
    }
    return $out ? implode("\n\n", $out) : "(the wiki is empty so far)";
}

function coach_system_prompt(array $okr, array $scores): string {
    $identity = read_file_safe(EDITOR_DIR . "/identity.md");
    $vp = read_file_safe(EDITOR_DIR . "/reference/value-proposition-recipe.md");
    $screen = read_file_safe(EDITOR_DIR . "/reference/opportunity-screening.md");
    $deck = read_file_safe(EDITOR_DIR . "/reference/deck-structure.md");
    $wiki = load_wiki();

    $okrBlock = "";
    if ($okr || $scores) {
        $okrBlock = "\n=== THIS FOUNDER'S CURRENT GOALS (OKR) ===\n";
        if (!empty($okr["objective"])) $okrBlock .= "Objective: " . $okr["objective"] . "\n";
        $targets = $okr["targets"] ?? [];
        foreach ($targets as $factor => $target) {
            $cur = $scores[$factor] ?? null;
            $curTxt = $cur === null ? "not scored yet" : round($cur * 100) . "/100";
            $okrBlock .= "- $factor: now $curTxt, target " . round($target * 100) . "/100\n";
        }
        $okrBlock .= "Use this to steer the conversation toward the weakest key result, but only when it helps the founder.\n";
    }

    return <<<TXT
You are the PITCH COACH — the warm, encouraging tutor side of a pre-seed pitch
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
$identity

=== reference: value-proposition-recipe.md ===
$vp

=== reference: opportunity-screening.md ===
$screen

=== reference: deck-structure.md ===
$deck

=== wiki (continuously-growing lessons) ===
$wiki
$okrBlock
TXT;
}

function call_claude(string $system, array $messages): string {
    $key = anthropic_key();
    if (!$key) fail(503, "The coach isn't configured. Set ANTHROPIC_API_KEY on the server.");

    // Normalize to Anthropic message format, cap history length.
    $clean = [];
    foreach (array_slice($messages, -MAX_TURNS) as $m) {
        $role = ($m["role"] ?? "") === "assistant" ? "assistant" : "user";
        $content = trim((string)($m["content"] ?? ""));
        if ($content !== "") $clean[] = ["role" => $role, "content" => $content];
    }
    if (!$clean) fail(400, "Say something to the coach to start.");

    $payload = json_encode([
        "model" => MODEL,
        "max_tokens" => 1024,
        "system" => $system,
        "messages" => $clean,
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
    if ($res === false) fail(502, "Could not reach the coach: " . curl_error($ch));
    curl_close($ch);
    if ($httpCode >= 400) fail(502, "Coach model error (HTTP $httpCode).");

    $body = json_decode($res, true);
    $text = "";
    foreach ($body["content"] ?? [] as $block) {
        if (($block["type"] ?? "") === "text") $text .= $block["text"];
    }
    return trim($text);
}

// ---- main ----------------------------------------------------------------

if ($_SERVER["REQUEST_METHOD"] !== "POST") fail(405, "POST only.");

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) fail(400, "Expected a JSON body.");

$action = $input["action"] ?? "chat";
$messages = $input["messages"] ?? [];

if ($action === "propose") {
    // Draft ONE candidate wiki lesson from the conversation — for human review.
    // Nothing is written to disk here; publishing is a deliberate, separate step.
    $system = "You distill a coaching conversation into ONE short, reusable wiki lesson "
        . "for a pre-seed pitch knowledge base. Output MARKDOWN only: a '# Title' line then "
        . "3-8 lines of generic, teachable guidance. NEVER include the founder's private "
        . "details, company name, or slide copy — generalize it. If there's no durable, "
        . "reusable lesson in the conversation, output exactly: NO_LESSON.";
    $candidate = call_claude($system, array_merge($messages, [[
        "role" => "user",
        "content" => "Draft the single most useful reusable wiki lesson from this conversation.",
    ]]));
    echo json_encode(["candidate" => $candidate]);
    exit;
}

$okr = is_array($input["okr"] ?? null) ? $input["okr"] : [];
$scores = is_array($input["scores"] ?? null) ? $input["scores"] : [];
$system = coach_system_prompt($okr, $scores);
$reply = call_claude($system, $messages);
echo json_encode(["reply" => $reply]);
