// Matching engine.
// Computes a 0-100 match score per clinic using weighted criteria,
// plus a composite "clinic quality" score independent of the user.
//
// Weights (sum to 100):
//   price fit       40
//   treatment fit   25
//   geography fit   15
//   success rate    10
//   rating score    10

import type {
  AssessmentData,
  BudgetRange,
  Clinic,
  ClinicInsight,
  MatchScore,
  PricingResult,
  TreatmentInterest,
} from "./types";

export const WEIGHTS = {
  price_fit: 40,
  treatment_fit: 25,
  geography_fit: 15,
  success_rate: 10,
  rating_score: 10,
} as const;

export const BUDGET_UPPER: Record<BudgetRange, number> = {
  "<5k": 5000,
  "5k-8k": 8000,
  "8k-12k": 12000,
  ">12k": 100000,
  unsure: 100000,
};

const BUDGET_MIDPOINT: Record<BudgetRange, number> = {
  "<5k": 4000,
  "5k-8k": 6500,
  "8k-12k": 10000,
  ">12k": 15000,
  unsure: 8000,
};

/** Clinic-quality composite (independent of the user's profile). */
export function computeCompositeScore(
  clinic: Clinic,
  insight: ClinicInsight | undefined,
  pricingPercentile: number,
): number {
  const success = ((clinic.success_rate_estimate ?? 50) / 100) * 35;
  const priceEff = ((100 - pricingPercentile) / 100) * 25;
  const rating = ((clinic.rating_score ?? 4) / 5) * 25;
  const conf =
    (insight?.confidence_level === "high"
      ? 1
      : insight?.confidence_level === "medium"
        ? 0.66
        : 0.33) * 15;
  return Math.round(success + priceEff + rating + conf);
}

/**
 * Score a single clinic against the user's assessment.
 * `pricingByClinic` lets us compute the price-fit relative to the candidate set.
 */
export function matchingEngine(
  clinic: Clinic,
  assessment: AssessmentData,
  pricing: PricingResult,
  context: {
    candidateMinPrice: number;
    candidateMaxPrice: number;
    insight?: ClinicInsight;
  },
): MatchScore {
  const treatment = (assessment.treatment_interest || "IVF") as TreatmentInterest;
  const budgetCap = BUDGET_UPPER[assessment.budget_range || "unsure"];
  const budgetMid = BUDGET_MIDPOINT[assessment.budget_range || "unsure"];

  // pricing_percentile: 0 = cheapest of candidates, 100 = most expensive
  const range = Math.max(context.candidateMaxPrice - context.candidateMinPrice, 1);
  const pricing_percentile = Math.round(
    ((pricing.expected - context.candidateMinPrice) / range) * 100,
  );

  // Price fit: distance from budget midpoint, hard penalty over cap
  const distFromBudget = Math.abs(pricing.expected - budgetMid);
  const budgetSpan = Math.max(budgetMid * 0.6, 2000);
  let priceFit = WEIGHTS.price_fit * Math.max(0, 1 - distFromBudget / budgetSpan);
  if (pricing.expected > budgetCap) priceFit *= 0.4;

  const treatmentFit = clinic.treatments_available.includes(treatment) ? WEIGHTS.treatment_fit : 0;
  const geographyFit = clinic.country === assessment.country_preference ? WEIGHTS.geography_fit : 0;
  const successPts = ((clinic.success_rate_estimate ?? 50) / 100) * WEIGHTS.success_rate;
  const ratingPts = ((clinic.rating_score ?? 4) / 5) * WEIGHTS.rating_score;

  const recommendEggDonation = assessment.age > 40 && treatment !== "Egg Donation";
  const bonus =
    recommendEggDonation && clinic.treatments_available.includes("Egg Donation") ? 5 : 0;

  const raw = priceFit + treatmentFit + geographyFit + successPts + ratingPts + bonus;
  const match_score = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    match_score,
    composite_score: computeCompositeScore(clinic, context.insight, pricing_percentile),
    pricing_percentile,
    breakdown: {
      price_fit: Math.round(priceFit),
      treatment_fit: treatmentFit,
      geography_fit: geographyFit,
      success_rate: Math.round(successPts),
      rating_score: Math.round(ratingPts),
      bonus,
    },
  };
}
