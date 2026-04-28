// Shared domain types for the decision engines.

export type Gender = "female" | "male" | "couple" | "other";
export type TryingDuration = "<6 months" | "6-12 months" | "1-2 years" | ">2 years" | "not trying";
export type TreatmentInterest = "IVF" | "Egg Donation" | "Social Freezing" | "ICSI" | "Other";
export type BudgetRange = "<5k" | "5k-8k" | "8k-12k" | ">12k" | "unsure";
export type ClinicTier = "premium" | "mid" | "budget";
export type Confidence = "low" | "medium" | "high";

export interface AssessmentData {
  age: number;
  gender: Gender | "";
  trying_duration: TryingDuration | "";
  previous_treatments: string[];
  diagnosis: string[];
  treatment_interest: TreatmentInterest | "";
  budget_range: BudgetRange | "";
  country_preference: string;
}

export interface Clinic {
  id: string;
  name: string;
  country: string;
  city: string | null;
  tier: ClinicTier;
  treatments_available: string[];
  base_price_ivf: number | null;
  base_price_egg_donation: number | null;
  base_price_freezing: number | null;
  medication_estimate: number | null;
  extras_estimate: number | null;
  total_estimated_price: number | null;
  success_rate_estimate: number | null;
  rating_score: number | null;
}

export interface AggregatedRow {
  clinic_name: string;
  treatment_type: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  sample_size: number;
  price_volatility: number;
}

export interface ClinicInsight {
  clinic_name: string;
  avg_user_rating: number;
  pricing_percentile: number;
  demand_score: number;
  availability_score: number;
  confidence_level: Confidence;
  sample_size: number;
}

/** Output of pricingEngine for a single clinic. */
export interface PricingResult {
  expected: number;
  listed: number;
  price_min: number;
  price_max: number;
  source: "crowd" | "listed";
  /** % vs the country average for this treatment (negative = cheaper). null if no data. */
  vs_country_avg_pct: number | null;
  country_avg: number | null;
  volatility: number;
  sample_size: number;
  confidence: Confidence;
}

/** Output of matchingEngine for a single clinic. */
export interface MatchScore {
  match_score: number; // 0-100
  composite_score: number; // 0-100 overall clinic quality
  pricing_percentile: number; // among the candidate set
  breakdown: {
    price_fit: number;
    treatment_fit: number;
    geography_fit: number;
    success_rate: number;
    rating_score: number;
    bonus: number;
  };
}

/** Final consolidated row consumed by the UI / dashboard. */
export interface MatchResult {
  clinic: Clinic;
  match_score: number;
  composite_score: number;
  estimated_price: number;
  price_low: number;
  price_high: number;
  confidence: Confidence;
  sample_size: number;
  pricing_percentile: number;
  vs_country_avg_pct: number | null;
  volatility: number;
  agg?: AggregatedRow;
  insight?: ClinicInsight;
  explanations: string[];
}
