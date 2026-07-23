// Factor definitions, weights, and criteria — the single place the seven dials are
// configured. Mirrors web/scoring-rubric.md and web/output-schema.md.
// Factor ids are STABLE keys used by both the model output and the renderer.

export type Verdict = "met" | "partial" | "missing" | "not_applicable";

export type Band =
  | "missing_or_fatal"
  | "present_but_broken"
  | "adequate"
  | "strong"
  | "exceptional"
  | "not_applicable";

export type FactorId =
  | "value_proposition"
  | "problem"
  | "market_opportunity"
  | "solution_differentiation"
  | "traction_validation"
  | "team_fit"
  | "risk_reward_ask";

export interface FactorDef {
  id: FactorId;
  label: string;
  weight: number;
  /** Which editor/reference file(s) source this factor's criteria. */
  source: string;
  /** The criteria the model must judge met/partial/missing. */
  criteria: string[];
}

// Weights sum to 1.0 (see scoring-rubric.md).
export const FACTORS: FactorDef[] = [
  {
    id: "value_proposition",
    label: "Value Proposition",
    weight: 0.2,
    source: "value-proposition-recipe.md",
    criteria: [
      "Segment is specific and reachable (not \"everyone\")",
      "The key need is stated observably",
      "The benefit is in the segment's terms, not features",
      "A delivery mechanism (\"by …\") is present",
      "The status-quo / alternative is named",
      "A differentiator that isn't easily copied is present",
      "Positioned against the alternative, not in a vacuum",
    ],
  },
  {
    id: "problem",
    label: "Problem",
    weight: 0.15,
    source: "deck-structure.md",
    criteria: [
      "The problem is observable, not asserted",
      "It is clear WHO has the problem",
      "The cost of the problem is quantified or made vivid",
      "It reads as a painkiller, not a vitamin",
    ],
  },
  {
    id: "market_opportunity",
    label: "Market & Opportunity",
    weight: 0.15,
    source: "opportunity-screening.md",
    criteria: [
      "Market is sized bottoms-up, not a top-down TAM claim",
      "A credible \"why now\" is present",
      "The potential upside is large enough to matter to a seed investor",
    ],
  },
  {
    id: "solution_differentiation",
    label: "Solution & Differentiation",
    weight: 0.15,
    source: "deck-structure.md + red-flags.md",
    criteria: [
      "The solution follows directly from the stated problem",
      "There is a non-obvious insight behind it",
      "A defensibility / moat argument is present and credible",
    ],
  },
  {
    id: "traction_validation",
    label: "Traction & Validation",
    weight: 0.15,
    source: "investor-signals.md",
    criteria: [
      "At least one qualified, least-gameable proof point is present",
      "Evidence is specific (numbers, named users) not vague",
      "The signal shown is the hardest one the stage can offer",
    ],
  },
  {
    id: "team_fit",
    label: "Team & Founder–Market Fit",
    weight: 0.1,
    source: "deck-structure.md",
    criteria: [
      "The team has lived the problem or shipped in this space",
      "Roles cover the core risks of executing this specific plan",
    ],
  },
  {
    id: "risk_reward_ask",
    label: "Risk / Reward & Ask",
    weight: 0.1,
    source: "opportunity-screening.md",
    criteria: [
      "Both the upside AND the key risks are named honestly",
      "The ask is tied to specific milestones, not a round number",
    ],
  },
];

export const FACTOR_BY_ID: Record<FactorId, FactorDef> = Object.fromEntries(
  FACTORS.map((f) => [f.id, f]),
) as Record<FactorId, FactorDef>;

// ---- The critique object the model returns (see output-schema.md) ----

export interface CriterionResult {
  name: string;
  verdict: Verdict;
  evidence: string;
}

export interface FactorResult {
  id: FactorId;
  label: string;
  score: number | null; // filled by runtime; null when the whole factor is N/A at this stage
  band: Band; // filled by runtime
  na: boolean; // true when every criterion was not_applicable
  criteria: CriterionResult[];
  investor_read: string;
  why_it_matters: string;
  cost_if_ignored: string;
  do_pattern: string;
  dont_pattern: string;
  mitigation_question: string;
}

export interface OverallResult {
  composite_score: number; // filled by runtime
  cold_read_verdict: string;
  top_3_dealkillers: { factor_id: FactorId; one_line: string }[];
}

export interface Critique {
  overall: OverallResult;
  factors: FactorResult[];
}
