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

function clinicListedTotal(clinic: Clinic, treatment: TreatmentInterest | ""): number {
  const base = clinicBasePriceFor(clinic, treatment) ?? clinic.base_price_ivf ?? 0;
  return base + (clinic.medication_estimate ?? 0) + (clinic.extras_estimate ?? 0);
}

// Budget midpoint used for "price fit" (instead of just a hard cap).
const BUDGET_MIDPOINT: Record<BudgetRange, number> = {
  "<5k": 4000,
  "5k-8k": 6500,
  "8k-12k": 10000,
  ">12k": 15000,
  unsure: 8000,
};

/**
 * Pricing engine — single source of truth.
 * Prefers crowdsourced avg when sample size is meaningful (>=3),
 * falls back to listed estimate. Range = avg * 0.9 .. * 1.2 (spec).
 */
export function computePricing(
  clinic: Clinic,
  treatment: TreatmentInterest | "",
  agg: AggregatedRow | undefined,
) {
  const listed = clinicListedTotal(clinic, treatment);
  const useCrowd = !!agg && agg.sample_size >= 3 && agg.avg_price > 0;
  const expected = useCrowd ? Math.round(agg!.avg_price) : listed;
  // Spec: price_min = expected * 0.9, price_max = expected * 1.2
  const price_min = useCrowd
    ? Math.min(agg!.min_price, Math.round(expected * 0.9))
    : Math.round(expected * 0.9);
  const price_max = useCrowd
    ? Math.max(agg!.max_price, Math.round(expected * 1.2))
    : Math.round(expected * 1.2);
  return { expected, listed, price_min, price_max, source: useCrowd ? "crowd" : "listed" as const };
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
  const budgetMid = BUDGET_MIDPOINT[assessment.budget_range || "unsure"];

  const recommendEggDonation = assessment.age > 40 && treatment !== "Egg Donation";

  let candidates = clinics.filter((c) => {
    const offersTreatment = c.treatments_available.includes(treatment);
    const offersED = c.treatments_available.includes("Egg Donation");
    return offersTreatment || (recommendEggDonation && offersED);
  });

  // Soft budget filter
  candidates = candidates.filter((c) => {
    const agg = aggregated.find((a) => a.clinic_name === c.name && a.treatment_type === treatment);
    return computePricing(c, treatment, agg).expected <= budgetCap * 1.15;
  });
  if (candidates.length === 0) candidates = [...clinics];

  // Per-clinic pricing (crowd-aware)
  const priced = candidates.map((c) => {
    const agg = aggregated.find((a) => a.clinic_name === c.name && a.treatment_type === treatment);
    return { c, agg, pricing: computePricing(c, treatment, agg) };
  });

  const totals = priced.map((p) => p.pricing.expected);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);
  const range = Math.max(maxTotal - minTotal, 1);

  // Country averages (per country) — used for "% vs avg" in user's preferred country
  const countryAverages = new Map<string, number>();
  {
    const groups = new Map<string, number[]>();
    aggregated
      .filter((a) => a.treatment_type === treatment)
      .forEach((a) => {
        // Need country; pull from clinic record
        const clinic = clinics.find((c) => c.name === a.clinic_name);
        if (!clinic) return;
        if (!groups.has(clinic.country)) groups.set(clinic.country, []);
        groups.get(clinic.country)!.push(a.avg_price);
      });
    groups.forEach((arr, country) => {
      countryAverages.set(country, arr.reduce((s, n) => s + n, 0) / arr.length);
    });
  }

  const results: MatchResult[] = priced.map(({ c, agg, pricing }) => {
    const total = pricing.expected;
    const pricing_percentile = Math.round(((total - minTotal) / range) * 100);

    // Price fit (40 pts): closer to budget midpoint = better, hard penalty if over cap
    const distFromBudget = Math.abs(total - budgetMid);
    const budgetSpan = Math.max(budgetMid * 0.6, 2000);
    let priceFit = 40 * Math.max(0, 1 - distFromBudget / budgetSpan);
    if (total > budgetCap) priceFit *= 0.4;

    const treatmentFit = c.treatments_available.includes(treatment) ? 25 : 0;
    const geo = c.country === assessment.country_preference ? 15 : 0;
    const successPts = ((c.success_rate_estimate ?? 50) / 100) * 10;
    const ratingPts = ((c.rating_score ?? 4) / 5) * 10;

    let score = Math.round(priceFit + treatmentFit + geo + successPts + ratingPts);
    if (recommendEggDonation && c.treatments_available.includes("Egg Donation")) {
      score = Math.min(100, score + 5);
    }

    const sample_size = agg?.sample_size ?? 0;
    const volatility = agg?.price_volatility ?? 0;
    const confidence: MatchResult["confidence"] =
      sample_size >= 30 ? "high" : sample_size >= 10 ? "medium" : "low";

    const countryAvg = countryAverages.get(c.country) ?? 0;
    const vs_country_avg_pct =
      countryAvg > 0 ? Math.round(((total - countryAvg) / countryAvg) * 100) : null;

    const composite_score = computeCompositeScore(c, insights.find((i) => i.clinic_name === c.name), pricing_percentile);

    // Explanations — ranked, plain-English, concrete numbers
    const explanations: string[] = [];

    // 1) Budget verdict
    if (total <= budgetCap) {
      const savings = budgetCap - total;
      if (savings >= 500) {
        explanations.push(`Fits your budget — about €${savings.toLocaleString()} below your ceiling.`);
      } else {
        explanations.push(`Fits your budget.`);
      }
    } else {
      explanations.push(`Slightly above your stated budget (by €${(total - budgetCap).toLocaleString()}).`);
    }

    // 2) Price vs market
    if (vs_country_avg_pct !== null) {
      if (vs_country_avg_pct <= -5) {
        explanations.push(`${Math.abs(vs_country_avg_pct)}% cheaper than the ${c.country} average.`);
      } else if (vs_country_avg_pct >= 5) {
        explanations.push(`${vs_country_avg_pct}% pricier than the ${c.country} average.`);
      } else {
        explanations.push(`Priced in line with the ${c.country} average.`);
      }
    }

    // 3) Outcomes
    if (c.success_rate_estimate && c.success_rate_estimate >= 60) {
      explanations.push(`Strong reported outcomes (${c.success_rate_estimate}% success rate).`);
    } else if (c.success_rate_estimate && c.success_rate_estimate < 45) {
      explanations.push(`Lower reported success rate (${c.success_rate_estimate}%) — worth verifying.`);
    }

    // 4) Geography fit
    if (geo > 0) {
      explanations.push(`In your preferred country (${c.country}).`);
    } else {
      explanations.push(`Abroad in ${c.country} — factor travel into total cost.`);
    }

    // 5) Treatment-specific note
    if (recommendEggDonation && c.treatments_available.includes("Egg Donation")) {
      explanations.push(`Offers egg donation — often more relevant above 40.`);
    }

    // 6) Data quality / variability
    if (sample_size >= 10 && volatility >= 0.15) {
      explanations.push(`Prices vary noticeably between patients (±${(volatility * 100).toFixed(0)}%) — request a written quote.`);
    }

    return {
      clinic: c,
      match_score: Math.max(0, Math.min(100, score)),
      estimated_price: total,
      price_low: pricing.price_min,
      price_high: pricing.price_max,
      confidence,
      sample_size,
      pricing_percentile,
      vs_country_avg_pct,
      volatility,
      composite_score,
      agg,
      insight: insights.find((i) => i.clinic_name === c.name),
      explanations: Array.from(new Set(explanations)).slice(0, 4),
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
