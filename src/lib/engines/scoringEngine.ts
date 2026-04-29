// Scoring engine — the core decision intelligence of the platform.
//
// Produces 3 independent 0-100 scores per (patient, clinic) pair:
//
//   1. Patient Score   — how clear/treatable the patient profile is
//                        (age, fertility indicators, history, questionnaire depth)
//   2. Clinic Fit Score — how well THIS clinic fits THIS patient
//                        (specialization, past performance, profile match, location)
//   3. Value Score      — pricing quality (normalized price vs market, transparency)
//
// These are blended into a final weighted Match Score (0-100) with a
// data-quality Confidence rating (high / medium / low) and a list of
// human-readable "why this match" explanations.
//
// Default blend weights (sum = 1):
//   patient     0.20
//   clinic_fit  0.50
//   value       0.30

import type {
  AssessmentData,
  Clinic,
  ClinicInsight,
  Confidence,
  PricingResult,
  TreatmentInterest,
} from "./types";

export const SCORE_WEIGHTS = {
  patient: 0.2,
  clinic_fit: 0.5,
  value: 0.3,
} as const;

export interface ScoreBreakdown {
  patient_score: number;
  clinic_fit_score: number;
  value_score: number;
  match_score: number;
  confidence: Confidence;
  explanations: string[];
  reasons: {
    patient: string[];
    clinic_fit: string[];
    value: string[];
  };
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// ---------- 1. Patient Score ----------
// Higher = clearer profile, well-defined treatment path, more actionable.
export function patientScore(a: AssessmentData): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let s = 50; // neutral baseline

  // Age fertility curve (peak treatability ~30-34)
  const age = a.age ?? 35;
  if (age <= 29) {
    s += 22;
    reasons.push(`Age ${age} — strong biological window.`);
  } else if (age <= 34) {
    s += 18;
    reasons.push(`Age ${age} — good prognosis range.`);
  } else if (age <= 37) {
    s += 8;
    reasons.push(`Age ${age} — solid candidate, time-sensitive.`);
  } else if (age <= 40) {
    s -= 4;
    reasons.push(`Age ${age} — reduced ovarian reserve typical.`);
  } else if (age <= 43) {
    s -= 14;
    reasons.push(`Age ${age} — donor pathways often more effective.`);
  } else {
    s -= 22;
    reasons.push(`Age ${age} — donor-egg pathway strongly indicated.`);
  }

  // Fertility indicators / diagnosis clarity
  const dx = a.diagnosis ?? [];
  if (dx.length === 0) {
    s -= 4;
  } else if (dx.includes("Unexplained")) {
    s -= 2;
    reasons.push("Unexplained infertility — broader treatment exploration.");
  } else {
    s += 6;
    reasons.push(`Clear diagnosis recorded (${dx.slice(0, 2).join(", ")}).`);
  }

  // Treatment history — prior cycles = more actionable data
  const prev = a.previous_treatments ?? [];
  const hasPrior = prev.length > 0 && !(prev.length === 1 && prev[0] === "None");
  if (hasPrior) {
    s += 4;
    reasons.push("Prior treatment history available.");
  }

  // Questionnaire depth (proxy for data quality)
  const filled =
    [a.gender, a.trying_duration, a.treatment_interest, a.budget_range, a.country_preference].filter(
      (v) => v && String(v).length > 0,
    ).length + (dx.length ? 1 : 0) + (prev.length ? 1 : 0);
  if (filled >= 6) {
    s += 6;
    reasons.push("Detailed questionnaire — high-confidence inputs.");
  } else if (filled <= 3) {
    s -= 6;
    reasons.push("Sparse questionnaire — consider the advanced module.");
  }

  return { score: Math.round(clamp(s)), reasons: reasons.slice(0, 4) };
}

// ---------- 2. Clinic Fit Score ----------
// Higher = better match between clinic capabilities and this patient.
export function clinicFitScore(
  clinic: Clinic,
  assessment: AssessmentData,
  insight?: ClinicInsight,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let s = 0;
  const treatment = (assessment.treatment_interest || "IVF") as TreatmentInterest;

  // Specialization (treatment availability + breadth)
  if (clinic.treatments_available.includes(treatment)) {
    s += 28;
    reasons.push(`Specializes in ${treatment}.`);
  } else {
    s += 6;
  }
  const breadth = clinic.treatments_available.length;
  if (breadth >= 4) {
    s += 6;
    reasons.push("Full-service clinic — multiple treatment options.");
  }

  // Past performance — success rate + user rating
  const success = clinic.success_rate_estimate ?? 50;
  const successPts = ((success - 30) / 40) * 22; // 30%→0pts, 70%→22pts
  s += clamp(successPts, 0, 22);
  if (success >= 60) reasons.push(`Strong reported outcomes (${success}% success).`);
  else if (success >= 50) reasons.push(`Solid reported outcomes (${success}%).`);

  const rating = clinic.rating_score ?? 4;
  s += (rating / 5) * 12;
  if (rating >= 4.5) reasons.push(`Excellent patient ratings (${rating}/5).`);

  // Profile-specific match: age 40+ + offers egg donation
  const age = assessment.age ?? 35;
  if (age >= 40 && clinic.treatments_available.includes("Egg Donation")) {
    s += 10;
    reasons.push("Offers egg donation — recommended pathway above 40.");
  }

  // Location fit
  if (clinic.country === assessment.country_preference) {
    s += 12;
    reasons.push(`In your preferred country (${clinic.country}).`);
  } else {
    s += 4; // travel possible but not preferred
  }

  // Demand / availability blend (from insights)
  if (insight) {
    const avail = insight.availability_score ?? 50;
    s += (avail / 100) * 6;
    if (avail >= 70) reasons.push("Good current availability.");
  }

  return { score: Math.round(clamp(s)), reasons: reasons.slice(0, 4) };
}

// ---------- 3. Value Score ----------
// Higher = better value: lower price vs market, low volatility, transparent source.
export function valueScore(
  pricing: PricingResult,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let s = 50;

  // Normalized pricing vs country average (-30% → +30 pts; +30% → -30 pts)
  if (pricing.vs_country_avg_pct !== null) {
    const delta = -pricing.vs_country_avg_pct; // cheaper is positive
    s += clamp(delta, -30, 30);
    if (pricing.vs_country_avg_pct <= -10) {
      reasons.push(`${Math.abs(pricing.vs_country_avg_pct)}% cheaper than country average.`);
    } else if (pricing.vs_country_avg_pct >= 10) {
      reasons.push(`${pricing.vs_country_avg_pct}% above country average.`);
    } else {
      reasons.push("Priced in line with the market.");
    }
  } else {
    s -= 5;
    reasons.push("No comparable market data yet — value estimate is provisional.");
  }

  // Price stability (low volatility = predictable value)
  if (pricing.sample_size >= 5) {
    if (pricing.volatility <= 0.1) {
      s += 8;
      reasons.push("Stable pricing across patients (±10%).");
    } else if (pricing.volatility >= 0.2) {
      s -= 8;
      reasons.push(`Variable pricing (±${Math.round(pricing.volatility * 100)}%) — request a quote.`);
    }
  }

  // Transparency / source-of-truth bonus
  if (pricing.source === "scraped") {
    s += 12;
    reasons.push("Price extracted directly from clinic website — fully transparent.");
  } else if (pricing.source === "crowd") {
    s += 8;
    reasons.push(`Normalized from ${pricing.sample_size} real patient quote${pricing.sample_size === 1 ? "" : "s"}.`);
  } else {
    s -= 3;
    reasons.push("Estimated from clinic-listed prices — verify before committing.");
  }

  return { score: Math.round(clamp(s)), reasons: reasons.slice(0, 4) };
}

// ---------- 4. Confidence ----------
// Data quality of the decision: pricing source, sample size, insight depth.
export function decisionConfidence(
  pricing: PricingResult,
  assessment: AssessmentData,
  insight?: ClinicInsight,
): Confidence {
  let pts = 0;
  if (pricing.source === "scraped") pts += 3;
  else if (pricing.source === "crowd") pts += 2;
  else pts += 0;

  if (pricing.sample_size >= 8) pts += 2;
  else if (pricing.sample_size >= 3) pts += 1;

  if (insight?.confidence_level === "high") pts += 2;
  else if (insight?.confidence_level === "medium") pts += 1;

  // Questionnaire completeness adds confidence
  const filled = [
    assessment.age,
    assessment.treatment_interest,
    assessment.budget_range,
    assessment.country_preference,
    assessment.diagnosis?.length,
  ].filter(Boolean).length;
  if (filled >= 5) pts += 1;

  if (pts >= 6) return "high";
  if (pts >= 3) return "medium";
  return "low";
}

// ---------- 5. Final blended score + summary explanations ----------
export function scoreClinic(
  clinic: Clinic,
  assessment: AssessmentData,
  pricing: PricingResult,
  insight?: ClinicInsight,
): ScoreBreakdown {
  const p = patientScore(assessment);
  const cf = clinicFitScore(clinic, assessment, insight);
  const v = valueScore(pricing);

  const match = Math.round(
    p.score * SCORE_WEIGHTS.patient +
      cf.score * SCORE_WEIGHTS.clinic_fit +
      v.score * SCORE_WEIGHTS.value,
  );

  // Top-line explanations: pick the strongest signal from each dimension
  const explanations: string[] = [];
  if (cf.score >= 75) explanations.push("Strong clinical fit for your profile.");
  else if (cf.score >= 60) explanations.push("Good clinical fit.");
  else explanations.push("Partial clinical fit — review the details.");

  if (v.score >= 70) explanations.push("Excellent value for money.");
  else if (v.score >= 55) explanations.push("Fair value vs the local market.");
  else explanations.push("Premium pricing — verify what's included.");

  const success = clinic.success_rate_estimate ?? 50;
  if (success >= 60) explanations.push("High reported success probability.");
  else if (success < 45) explanations.push("Lower reported success — request data.");

  return {
    patient_score: p.score,
    clinic_fit_score: cf.score,
    value_score: v.score,
    match_score: clamp(match),
    confidence: decisionConfidence(pricing, assessment, insight),
    explanations: explanations.slice(0, 3),
    reasons: {
      patient: p.reasons,
      clinic_fit: cf.reasons,
      value: v.reasons,
    },
  };
}
