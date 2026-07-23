# Output schema — the structured critique the dashboard renders

The web runtime asks the model to return the critique as **JSON conforming to this
schema**, instead of prose. The dashboard is then just a renderer of this object.
This is the bridge from the prose editor to the UI (ICM: plain text made queryable).

## Rule 0 still holds

`do_pattern` / `dont_pattern` are **generic teaching exemplars** (like
`../editor/examples.md`) — never the founder's rewritten copy. `mitigation_question`
is a question that hands the gap back. The structured mode critiques and teaches; it
never writes the founder's slides.

## Schema

```json
{
  "overall": {
    "composite_score": 0.0,
    "cold_read_verdict": "≤3 sentences: what stage this honestly reads as, the one thing working, the one thing killing it.",
    "top_3_dealkillers": [
      { "factor_id": "value_proposition", "one_line": "…tied to a specific slide…" }
    ]
  },
  "factors": [
    {
      "id": "value_proposition",
      "label": "Value Proposition",
      "score": 0.0,
      "band": "missing_or_fatal | present_but_broken | adequate | strong | exceptional",
      "criteria": [
        { "name": "specific reachable segment", "verdict": "met | partial | missing", "evidence": "…quote or reference from the deck…" }
      ],
      "investor_read": "What a pre-seed investor concludes about this factor right now.",
      "why_it_matters": "How closing this gap helps the investor complete their Top Task (deciding to take the next meeting).",
      "cost_if_ignored": "What leaving it unaddressed quietly signals or forfeits.",
      "do_pattern": "A generic exemplar of this factor done well (NOT the founder's copy).",
      "dont_pattern": "A generic exemplar of the failure mode.",
      "mitigation_question": "The question that hands the gap back to the founder."
    }
  ]
}
```

## Field notes

- **`score` / `band`** — computed by the runtime from `criteria` per `scoring-rubric.md`; the model fills `criteria`, not the float.
- **`investor_read`, `why_it_matters`, `cost_if_ignored`** — map directly to the deepened note anatomy in `../editor/rules.md` (Rule 4).
- **`top_3_dealkillers`** — mirrors the deck-level protocol (Rule 5): lead with these.
- **Factor ids** (stable keys): `value_proposition`, `problem`, `market_opportunity`,
  `solution_differentiation`, `traction_validation`, `team_fit`, `risk_reward_ask`.

## Two render targets, one knowledge source

- **Prose mode** → drop `../editor/` into a Claude project = the competition entry.
- **Structured mode** → this schema → the aiguys.tech dashboard.

Same `../editor/` knowledge, two runtimes. Never fork the knowledge into web code.
