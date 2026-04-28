// Decision engine orchestrator.
// Pipeline: user input → matching → pricing → insights → ranked results.

import {
  buildCountryAverages,
  listedTotal,
  pricingEngine,
} from "./pricingEngine";
import { BUDGET_UPPER, matchingEngine } from "./matchingEngine";
import { insightsEngine } from "./insightsEngine";
import type {
  AggregatedRow,
  AssessmentData,
  Clinic,
  ClinicInsight,
  MatchResult,
  TreatmentInterest,
} from "./types";

/**
 * Orchestrates the three engines and returns the top 5 clinics
 * ranked by match score.
 */
export function runDecisionPipeline(
  assessment: AssessmentData,
  clinics: Clinic[],
  aggregated: AggregatedRow[],
  insights: ClinicInsight[] = [],
): MatchResult[] {
  const treatment = (assessment.treatment_interest || "IVF") as TreatmentInterest;
  const budgetCap = BUDGET_UPPER[assessment.budget_range || "unsure"];
  const recommendEggDonation = assessment.age > 40 && treatment !== "Egg Donation";

  // 1. Pre-filter candidates
  let candidates = clinics.filter((c) => {
    const offersTreatment = c.treatments_available.includes(treatment);
    const offersED = c.treatments_available.includes("Egg Donation");
    return offersTreatment || (recommendEggDonation && offersED);
  });

  // Soft budget filter (allow 15% headroom; fall back to all clinics if empty)
  const aggOf = (c: Clinic) =>
    aggregated.find((a) => a.clinic_name === c.name && a.treatment_type === treatment);
  candidates = candidates.filter((c) => {
    const expected = aggOf(c)?.sample_size && aggOf(c)!.sample_size >= 3
      ? aggOf(c)!.avg_price
      : listedTotal(c, treatment);
    return expected <= budgetCap * 1.15;
  });
  if (candidates.length === 0) candidates = [...clinics];

  // 2. Pricing engine — per clinic + country averages
  const countryAverages = buildCountryAverages(clinics, aggregated, treatment);
  const priced = candidates.map((c) => {
    const agg = aggOf(c);
    return { clinic: c, agg, pricing: pricingEngine(c, treatment, agg, countryAverages) };
  });

  const candidateMinPrice = Math.min(...priced.map((p) => p.pricing.expected));
  const candidateMaxPrice = Math.max(...priced.map((p) => p.pricing.expected));

  // 3. Matching engine + 4. Insights engine
  const results: MatchResult[] = priced.map(({ clinic, agg, pricing }) => {
    const insight = insights.find((i) => i.clinic_name === clinic.name);
    const match = matchingEngine(clinic, assessment, pricing, {
      candidateMinPrice,
      candidateMaxPrice,
      insight,
    });
    const explanations = insightsEngine(clinic, assessment, pricing, match);

    return {
      clinic,
      match_score: match.match_score,
      composite_score: match.composite_score,
      pricing_percentile: match.pricing_percentile,
      estimated_price: pricing.expected,
      listed_price: pricing.listed,
      price_source: pricing.source,
      price_low: pricing.price_min,
      price_high: pricing.price_max,
      confidence: pricing.confidence,
      sample_size: pricing.sample_size,
      vs_country_avg_pct: pricing.vs_country_avg_pct,
      volatility: pricing.volatility,
      agg,
      insight,
      explanations,
    };
  });

  return results.sort((a, b) => b.match_score - a.match_score).slice(0, 5);
}

export * from "./types";
export { pricingEngine, buildCountryAverages, listedTotal } from "./pricingEngine";
export { matchingEngine, computeCompositeScore, BUDGET_UPPER, WEIGHTS } from "./matchingEngine";
export { insightsEngine } from "./insightsEngine";
