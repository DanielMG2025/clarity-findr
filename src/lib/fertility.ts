export type Gender = "female" | "male" | "couple" | "other";
export type TryingDuration = "<6 months" | "6-12 months" | "1-2 years" | ">2 years" | "not trying";
export type TreatmentInterest = "IVF" | "Egg Donation" | "Social Freezing" | "ICSI" | "Other";
export type BudgetRange = "<5k" | "5k-8k" | "8k-12k" | ">12k" | "unsure";

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

export const DEFAULT_ASSESSMENT: AssessmentData = {
  age: 32,
  gender: "",
  trying_duration: "",
  previous_treatments: [],
  diagnosis: [],
  treatment_interest: "",
  budget_range: "",
  country_preference: "Spain",
};

export const PREVIOUS_TREATMENTS = ["IUI", "IVF", "Egg Donation", "ICSI", "None", "Other"];
export const DIAGNOSES = [
  "Unexplained",
  "Low ovarian reserve",
  "Endometriosis",
  "PCOS",
  "Male factor",
  "Tubal factor",
  "Other",
];
export const COUNTRIES = ["Spain", "Portugal", "Germany", "UK", "Czech Republic", "Greece", "Other"];

export const BUDGET_UPPER: Record<BudgetRange, number> = {
  "<5k": 5000,
  "5k-8k": 8000,
  "8k-12k": 12000,
  ">12k": 100000,
  unsure: 100000,
};

export type ClinicTier = "premium" | "mid" | "budget";

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
  confidence_level: "low" | "medium" | "high";
  sample_size: number;
}

export interface MatchResult {
  clinic: Clinic;
  match_score: number;
  estimated_price: number;
  price_low: number;
  price_high: number;
  confidence: "low" | "medium" | "high";
  sample_size: number;
  pricing_percentile: number; // 0 = cheapest among candidates, 100 = most expensive
  vs_country_avg_pct: number | null; // negative = below average
  volatility: number; // 0..1 coefficient of variation from crowdsourced data
  composite_score: number; // overall clinic quality (0-100)
  agg?: AggregatedRow;
  insight?: ClinicInsight;
  explanations: string[];
}

function clinicBasePriceFor(clinic: Clinic, treatment: TreatmentInterest | ""): number | null {
  if (treatment === "Egg Donation") return clinic.base_price_egg_donation;
  if (treatment === "Social Freezing") return clinic.base_price_freezing;
  return clinic.base_price_ivf;
}

function clinicTotalFor(clinic: Clinic, treatment: TreatmentInterest | ""): number {
  const base = clinicBasePriceFor(clinic, treatment) ?? clinic.base_price_ivf ?? 0;
  return base + (clinic.medication_estimate ?? 0) + (clinic.extras_estimate ?? 0);
}

export function computeCompositeScore(
  clinic: Clinic,
  insight: ClinicInsight | undefined,
  pricingPercentile: number,
): number {
  // Success (35%) + price efficiency (25%) + rating (25%) + data confidence (15%)
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

export function runMatching(
  assessment: AssessmentData,
  clinics: Clinic[],
  aggregated: AggregatedRow[],
  insights: ClinicInsight[] = [],
): MatchResult[] {
  const treatment = (assessment.treatment_interest || "IVF") as TreatmentInterest;
  const budgetCap = BUDGET_UPPER[assessment.budget_range || "unsure"];

  const recommendEggDonation = assessment.age > 40 && treatment !== "Egg Donation";

  let candidates = clinics.filter((c) => {
    const offersTreatment = c.treatments_available.includes(treatment);
    const offersED = c.treatments_available.includes("Egg Donation");
    return offersTreatment || (recommendEggDonation && offersED);
  });

  candidates = candidates.filter((c) => clinicTotalFor(c, treatment) <= budgetCap);
  if (candidates.length === 0) candidates = [...clinics];

  const totals = candidates.map((c) => clinicTotalFor(c, treatment));
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);
  const range = Math.max(maxTotal - minTotal, 1);

  // Country average for the requested treatment
  const treatmentAggs = aggregated.filter((a) => a.treatment_type === treatment);
  const countryAvg =
    treatmentAggs.length > 0
      ? treatmentAggs.reduce((s, a) => s + a.avg_price, 0) / treatmentAggs.length
      : 0;

  const results: MatchResult[] = candidates.map((c) => {
    const total = clinicTotalFor(c, treatment);

    // Pricing percentile across candidates (0 = cheapest)
    const pricing_percentile = Math.round(((total - minTotal) / range) * 100);

    // Price fit: 40 pts
    const priceFit = 40 * (1 - (total - minTotal) / range);
    // Treatment fit: 25 pts (prompt v2)
    const treatmentFit = c.treatments_available.includes(treatment) ? 25 : 0;
    // Geography: 15 pts
    const geo = c.country === assessment.country_preference ? 15 : 0;
    // Success rate: 10 pts
    const successPts = ((c.success_rate_estimate ?? 50) / 100) * 10;
    // Clinic quality (rating): 10 pts
    const ratingPts = ((c.rating_score ?? 4) / 5) * 10;

    let score = Math.round(priceFit + treatmentFit + geo + successPts + ratingPts);
    if (recommendEggDonation && c.treatments_available.includes("Egg Donation")) {
      score = Math.min(100, score + 5);
    }

    const agg = aggregated.find(
      (a) => a.clinic_name === c.name && a.treatment_type === treatment,
    );
    const insight = insights.find((i) => i.clinic_name === c.name);

    const price_low = agg ? agg.min_price : Math.round(total * 0.85);
    const price_high = agg ? agg.max_price : Math.round(total * 1.15);
    const sample_size = agg?.sample_size ?? 0;
    const volatility = agg?.price_volatility ?? 0;
    const confidence: MatchResult["confidence"] =
      sample_size >= 8 ? "high" : sample_size >= 3 ? "medium" : "low";

    const vs_country_avg_pct =
      countryAvg > 0 && agg ? Math.round(((agg.avg_price - countryAvg) / countryAvg) * 100) : null;

    const composite_score = computeCompositeScore(c, insight, pricing_percentile);

    const explanations: string[] = [];
    if (vs_country_avg_pct !== null) {
      if (Math.abs(vs_country_avg_pct) >= 3) {
        explanations.push(
          vs_country_avg_pct < 0
            ? `${Math.abs(vs_country_avg_pct)}% below the typical ${treatment} cost.`
            : `${vs_country_avg_pct}% above the typical ${treatment} cost.`,
        );
      } else {
        explanations.push(`In line with the typical ${treatment} cost.`);
      }
    }
    if (treatmentFit > 0) {
      explanations.push(`Offers ${treatment} as a core service.`);
    } else if (recommendEggDonation) {
      explanations.push(`Recommended given your age — strong Egg Donation program.`);
    }
    if (c.success_rate_estimate && c.success_rate_estimate >= 60) {
      explanations.push(`Reported success rate of ${c.success_rate_estimate}%.`);
    }
    if (geo > 0) {
      explanations.push(`Located in your preferred country (${c.country}).`);
    }
    if (volatility >= 0.15) {
      explanations.push(`Price varies notably between patients (volatility ${(volatility * 100).toFixed(0)}%).`);
    }

    return {
      clinic: c,
      match_score: Math.max(0, Math.min(100, score)),
      estimated_price: total,
      price_low,
      price_high,
      confidence,
      sample_size,
      pricing_percentile,
      vs_country_avg_pct,
      volatility,
      composite_score,
      agg,
      insight,
      explanations,
    };
  });

  return results.sort((a, b) => b.match_score - a.match_score).slice(0, 5);
}

const ASSESSMENT_KEY = "fertility_assessment";
const UNLOCK_KEY = "crowdsourcing_unlocked";
const SUBMITTED_KEY = "quote_submitted";

export const storage = {
  loadAssessment(): AssessmentData | null {
    try {
      const raw = localStorage.getItem(ASSESSMENT_KEY);
      return raw ? (JSON.parse(raw) as AssessmentData) : null;
    } catch {
      return null;
    }
  },
  saveAssessment(data: AssessmentData) {
    localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
  },
  isUnlocked() {
    return localStorage.getItem(UNLOCK_KEY) === "true";
  },
  unlock() {
    localStorage.setItem(UNLOCK_KEY, "true");
  },
  hasSubmitted() {
    return localStorage.getItem(SUBMITTED_KEY) === "true";
  },
  markSubmitted() {
    localStorage.setItem(SUBMITTED_KEY, "true");
  },
};
