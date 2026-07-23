import {
  Band,
  Critique,
  FACTOR_BY_ID,
  FACTORS,
  FactorId,
  FactorResult,
  Verdict,
} from "./schema";

const VERDICT_VALUE: Record<Verdict, number> = {
  met: 1,
  partial: 0.5,
  missing: 0,
};

export function bandFor(score: number): Band {
  if (score <= 0.2) return "missing_or_fatal";
  if (score <= 0.4) return "present_but_broken";
  if (score <= 0.6) return "adequate";
  if (score <= 0.8) return "strong";
  return "exceptional";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Factor score = mean of its criteria verdicts (equal weight). */
function scoreFactor(criteria: { verdict: Verdict }[]): number {
  if (criteria.length === 0) return 0;
  const total = criteria.reduce((sum, c) => sum + (VERDICT_VALUE[c.verdict] ?? 0), 0);
  return round2(total / criteria.length);
}

/**
 * Take the model's raw critique (criteria verdicts + prose) and compute every
 * score and band deterministically, plus the weighted composite. The model never
 * emits a float; this is the 30% arithmetic layer.
 */
export function scoreCritique(raw: Critique): Critique {
  const factorsById = new Map<FactorId, FactorResult>();
  for (const f of raw.factors ?? []) {
    factorsById.set(f.id, f);
  }

  // Rebuild in canonical order, scoring each; fill gaps if the model omitted one.
  const factors: FactorResult[] = FACTORS.map((def) => {
    const rawFactor = factorsById.get(def.id);
    const criteria = rawFactor?.criteria ?? [];
    const score = scoreFactor(criteria);
    return {
      id: def.id,
      label: def.label,
      score,
      band: bandFor(score),
      criteria,
      investor_read: rawFactor?.investor_read ?? "",
      why_it_matters: rawFactor?.why_it_matters ?? "",
      cost_if_ignored: rawFactor?.cost_if_ignored ?? "",
      do_pattern: rawFactor?.do_pattern ?? "",
      dont_pattern: rawFactor?.dont_pattern ?? "",
      mitigation_question: rawFactor?.mitigation_question ?? "",
    };
  });

  const composite = round2(
    factors.reduce((sum, f) => sum + f.score * FACTOR_BY_ID[f.id].weight, 0),
  );

  return {
    overall: {
      composite_score: composite,
      cold_read_verdict: raw.overall?.cold_read_verdict ?? "",
      top_3_dealkillers: (raw.overall?.top_3_dealkillers ?? []).slice(0, 3),
    },
    factors,
  };
}

// An honest synthetic baseline (see scoring-rubric.md): most pre-seed decks score
// low on Problem, Traction, and Ask. Updated server-side as real decks come through.
export const SYNTHETIC_BENCHMARK: Record<FactorId, number> = {
  value_proposition: 0.5,
  problem: 0.4,
  market_opportunity: 0.55,
  solution_differentiation: 0.5,
  traction_validation: 0.35,
  team_fit: 0.6,
  risk_reward_ask: 0.35,
};
