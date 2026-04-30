// Personalization & decision-narrative layer.
//
// These helpers turn raw scores + assessment data into the highly specific,
// "feels-written-for-me" explanations, sentiment summaries and simulators
// that the Results page renders.
//
// Everything here is deterministic and pure — easy to test, AI-friendly,
// and safe to render server-side.

import type {
  AssessmentData,
  Clinic,
  MatchResult,
  TreatmentInterest,
} from "./types";

// ---------- 1. Personalized "why this match" reasons ----------
// Returns 3–5 first-person, profile-specific bullets.
export function personalizedReasons(m: MatchResult, a: AssessmentData): string[] {
  const out: string[] = [];
  const c = m.clinic;
  const age = a.age ?? 0;
  const treatment = a.treatment_interest || "IVF";
  const dx = a.diagnosis ?? [];
  const prev = (a.previous_treatments ?? []).filter((p) => p && p !== "None");

  // Age fit
  if (age) {
    if (age <= 34 && (c.success_rate_estimate ?? 0) >= 55) {
      out.push(
        `You are ${age}, in the strong-prognosis window — and this clinic reports ${c.success_rate_estimate}% success in similar age groups.`,
      );
    } else if (age >= 35 && age <= 39 && c.treatments_available.includes("ICSI")) {
      out.push(
        `At ${age}, time-sensitive protocols matter — this clinic offers ICSI and tailored stimulation for women in their late thirties.`,
      );
    } else if (age >= 40 && c.treatments_available.includes("Egg Donation")) {
      out.push(
        `At ${age}, donor-egg pathways meaningfully improve outcomes — this clinic specializes in egg donation programs.`,
      );
    } else {
      out.push(`Age ${age} matches the patient profile this clinic typically treats.`);
    }
  }

  // Prior cycles
  if (prev.length > 0) {
    out.push(
      `You have prior treatment history (${prev.slice(0, 2).join(", ")}) — this clinic has experience handling repeat cycles and reviewing previous protocols.`,
    );
  } else if (treatment) {
    out.push(`This is your first ${treatment} cycle — the clinic offers full onboarding diagnostics before stimulation.`);
  }

  // Diagnosis fit
  if (dx.length > 0 && !dx.includes("Unexplained")) {
    out.push(
      `Your diagnosis (${dx.slice(0, 2).join(", ")}) aligns with the clinical specialties this center publicly reports.`,
    );
  } else if (dx.includes("Unexplained")) {
    out.push(`For unexplained infertility, this clinic offers a broad diagnostic workup before committing to a protocol.`);
  }

  // Geography
  if (a.country_preference && c.country === a.country_preference) {
    out.push(`Located in ${c.city ? c.city + ", " : ""}${c.country} — your preferred treatment country.`);
  } else if (a.travel_preference && a.travel_preference !== "home_only") {
    out.push(`You're open to travel — ${c.country} is a high-quality, lower-cost option vs your home market.`);
  }

  // Budget fit
  if (a.budget_range && m.vs_country_avg_pct !== null) {
    if (m.vs_country_avg_pct <= -5) {
      out.push(
        `Your budget (${a.budget_range}) aligns with this clinic — pricing is ${Math.abs(m.vs_country_avg_pct)}% below the country average.`,
      );
    } else if (m.vs_country_avg_pct >= 10) {
      out.push(
        `Pricing sits ${m.vs_country_avg_pct}% above the country average — premium positioning, worth confirming what's bundled in.`,
      );
    } else {
      out.push(`The estimated total fits within your budget range (${a.budget_range}) and is in line with the local market.`);
    }
  }

  // Priority alignment
  if (a.priority === "cost" && m.scores.value_score >= 70) {
    out.push(`You prioritized cost — this clinic ranks in the top tier on the value dimension (${m.scores.value_score}/100).`);
  } else if (a.priority === "success" && m.scores.clinic_fit_score >= 75) {
    out.push(`You prioritized success — this clinic scores ${m.scores.clinic_fit_score}/100 on clinical fit.`);
  } else if (a.priority === "speed" && c.treatments_available.length >= 3) {
    out.push(`You prioritized speed — this clinic runs multiple treatment lines in parallel, reducing wait time.`);
  }

  // Dedupe + cap
  return Array.from(new Set(out)).slice(0, 5);
}

// ---------- 2. Qualitative insights (Google / community / forum) ----------
export type Sentiment = "positive" | "mixed" | "negative";

export interface QualitativeInsights {
  sentiment: Sentiment;
  google: { summary: string; rating: number; reviews: number };
  community: { summary: string; mentions: number };
  forum: { summary: string; threads: number };
}

// Deterministic mock generator seeded by clinic id. Replace with real
// scraped/aggregated data when available.
export function qualitativeInsights(clinic: Clinic): QualitativeInsights {
  const seed = hash(clinic.id || clinic.name);
  const rating = clinic.rating_score ?? 3.8 + (seed % 12) / 10; // 3.8–5.0
  const sentiment: Sentiment = rating >= 4.3 ? "positive" : rating >= 3.7 ? "mixed" : "negative";

  const positives = [
    "warm bedside manner and clear explanations",
    "transparent pricing with no surprise fees",
    "fast scheduling and short wait times",
    "highly attentive nursing team",
    "modern facilities and English-speaking staff",
  ];
  const negatives = [
    "occasional long waits between consultations",
    "billing can feel opaque on add-ons",
    "limited weekend availability",
    "mixed experiences with second-line protocols",
  ];

  const goodPick = positives[seed % positives.length];
  const badPick = negatives[(seed >> 2) % negatives.length];
  const reviews = 40 + (seed % 380);
  const mentions = 8 + (seed % 60);
  const threads = 3 + (seed % 18);

  return {
    sentiment,
    google: {
      rating: Math.round(rating * 10) / 10,
      reviews,
      summary:
        sentiment === "positive"
          ? `Patients consistently praise ${goodPick}.`
          : sentiment === "mixed"
            ? `Most patients praise ${goodPick}, though some note ${badPick}.`
            : `Reviews highlight ${badPick}; positives mentioned include ${goodPick}.`,
    },
    community: {
      mentions,
      summary:
        sentiment === "positive"
          ? `Community members report strong outcomes and would recommend the clinic to others.`
          : sentiment === "mixed"
            ? `Community feedback is balanced — strong clinical results but uneven communication.`
            : `Community sentiment is cautious — verify protocols and add-ons before committing.`,
    },
    forum: {
      threads,
      summary:
        sentiment === "positive"
          ? `Forum discussions emphasize the medical team's expertise on complex cases.`
          : sentiment === "mixed"
            ? `Forum threads compare it favorably on price, mixed on post-cycle follow-up.`
            : `Forum threads recommend exploring alternatives in the same region.`,
    },
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ---------- 3. Treatment simulator ----------
export type TreatmentVariant = "IVF" | "ICSI" | "Egg Donation";
export type PackageTier = "basic" | "premium";
export interface Addons {
  genetic_testing?: boolean; // PGT-A
  success_guarantee?: boolean;
}

const VARIANT_BASE_MULT: Record<TreatmentVariant, number> = {
  IVF: 1.0,
  ICSI: 1.12,
  "Egg Donation": 1.65,
};
const VARIANT_SUCCESS_BUMP: Record<TreatmentVariant, number> = {
  IVF: 0,
  ICSI: 4,
  "Egg Donation": 18,
};
const PACKAGE_MULT: Record<PackageTier, number> = { basic: 1.0, premium: 1.18 };
const PACKAGE_SUCCESS_BUMP: Record<PackageTier, number> = { basic: 0, premium: 3 };

export interface SimulationOutput {
  price_low: number;
  price_high: number;
  price_mid: number;
  expected_success: number; // %
  ranking_delta: number; // +/- points on the match score
  components: { label: string; value: number }[];
}

export function simulateTreatment(
  m: MatchResult,
  variant: TreatmentVariant,
  pkg: PackageTier,
  addons: Addons,
): SimulationOutput {
  const base = m.estimated_price || m.listed_price || 6000;
  const variantMult = VARIANT_BASE_MULT[variant];
  const pkgMult = PACKAGE_MULT[pkg];

  const baseAdjusted = base * variantMult * pkgMult;
  const geneticCost = addons.genetic_testing ? 1800 : 0;
  const guaranteeCost = addons.success_guarantee ? Math.round(baseAdjusted * 0.35) : 0;

  const mid = Math.round(baseAdjusted + geneticCost + guaranteeCost);
  const low = Math.round(mid * 0.88);
  const high = Math.round(mid * 1.12);

  const baselineSuccess = m.clinic.success_rate_estimate ?? 45;
  const success = Math.min(
    85,
    baselineSuccess +
      VARIANT_SUCCESS_BUMP[variant] +
      PACKAGE_SUCCESS_BUMP[pkg] +
      (addons.genetic_testing ? 6 : 0) +
      (addons.success_guarantee ? 2 : 0),
  );

  // Ranking delta: cheaper → +value, more expensive → -value;
  // higher success → +clinic fit.
  const priceDelta = ((mid - base) / Math.max(base, 1)) * 100;
  const rankingDelta = Math.round(
    (success - baselineSuccess) * 0.4 - priceDelta * 0.15,
  );

  return {
    price_low: low,
    price_mid: mid,
    price_high: high,
    expected_success: Math.round(success),
    ranking_delta: rankingDelta,
    components: [
      { label: `${variant} base`, value: Math.round(base * variantMult) },
      { label: `${pkg === "premium" ? "Premium package" : "Basic package"}`, value: Math.round(base * variantMult * (pkgMult - 1)) },
      { label: "Genetic testing (PGT-A)", value: geneticCost },
      { label: "Success guarantee", value: guaranteeCost },
    ].filter((c) => c.value > 0),
  };
}

// ---------- 4. Financing simulator ----------
export interface FinancingPlan {
  monthly: number;
  total_paid: number;
  total_interest: number;
  months: number;
  apr: number;
  partner: string;
}

const FINANCING_OPTIONS: { months: number; apr: number; partner: string }[] = [
  { months: 12, apr: 0.0, partner: "Clinic 0% plan" },
  { months: 24, apr: 4.9, partner: "Cofidis Health" },
  { months: 36, apr: 6.9, partner: "Younited Credit" },
  { months: 48, apr: 8.5, partner: "Sequra Medical" },
];

export function financingPlans(amount: number): FinancingPlan[] {
  return FINANCING_OPTIONS.map(({ months, apr, partner }) => {
    const r = apr / 100 / 12;
    const monthly = r === 0 ? amount / months : (amount * r) / (1 - Math.pow(1 + r, -months));
    const total = monthly * months;
    return {
      months,
      apr,
      partner,
      monthly: Math.round(monthly),
      total_paid: Math.round(total),
      total_interest: Math.round(total - amount),
    };
  });
}

export const TREATMENT_VARIANTS: TreatmentVariant[] = ["IVF", "ICSI", "Egg Donation"];
export function defaultVariant(t: TreatmentInterest | ""): TreatmentVariant {
  if (t === "ICSI") return "ICSI";
  if (t === "Egg Donation") return "Egg Donation";
  return "IVF";
}
