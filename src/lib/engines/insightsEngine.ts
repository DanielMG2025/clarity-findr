// Insights engine.
// Produces a ranked list of plain-English explanations per clinic that the UI
// renders under each result card. Combines the user profile, pricing output,
// match breakdown, and clinic quality signals.

import type {
  AssessmentData,
  Clinic,
  MatchScore,
  PricingResult,
  TreatmentInterest,
} from "./types";
import { BUDGET_UPPER } from "./matchingEngine";

const MAX_EXPLANATIONS = 4;

export function insightsEngine(
  clinic: Clinic,
  assessment: AssessmentData,
  pricing: PricingResult,
  match: MatchScore,
): string[] {
  const treatment = (assessment.treatment_interest || "IVF") as TreatmentInterest;
  const budgetCap = BUDGET_UPPER[assessment.budget_range || "unsure"];
  const recommendEggDonation = assessment.age > 40 && treatment !== "Egg Donation";

  const out: string[] = [];

  // 1) Budget verdict — the most important signal for users
  if (pricing.expected <= budgetCap) {
    const headroom = budgetCap - pricing.expected;
    out.push(
      headroom >= 500
        ? `Fits your budget — about €${headroom.toLocaleString()} below your ceiling.`
        : `Fits your budget.`,
    );
  } else {
    out.push(
      `Slightly above your stated budget (by €${(pricing.expected - budgetCap).toLocaleString()}).`,
    );
  }

  // 2) Price positioning vs market
  if (pricing.vs_country_avg_pct !== null) {
    const pct = pricing.vs_country_avg_pct;
    if (pct <= -5) {
      out.push(`${Math.abs(pct)}% cheaper than the ${clinic.country} average.`);
    } else if (pct >= 5) {
      out.push(`${pct}% pricier than the ${clinic.country} average.`);
    } else {
      out.push(`Priced in line with the ${clinic.country} average.`);
    }
  }

  // 3) Quality / outcomes
  if (clinic.success_rate_estimate && clinic.success_rate_estimate >= 60) {
    out.push(`Strong reported outcomes (${clinic.success_rate_estimate}% success rate).`);
  } else if (clinic.success_rate_estimate && clinic.success_rate_estimate < 45) {
    out.push(`Lower reported success rate (${clinic.success_rate_estimate}%) — worth verifying.`);
  }

  // 4) Geography
  if (match.breakdown.geography_fit > 0) {
    out.push(`In your preferred country (${clinic.country}).`);
  } else {
    out.push(`Abroad in ${clinic.country} — factor travel into total cost.`);
  }

  // 5) Treatment-specific note
  if (recommendEggDonation && clinic.treatments_available.includes("Egg Donation")) {
    out.push(`Offers egg donation — often more relevant above 40.`);
  }

  // 6) Data quality / variability
  if (pricing.sample_size >= 10 && pricing.volatility >= 0.15) {
    out.push(
      `Prices vary noticeably between patients (±${(pricing.volatility * 100).toFixed(0)}%) — request a written quote.`,
    );
  }

  // 7) Source-of-truth note (scraped > crowd > listed)
  if (pricing.source === "scraped") {
    const domain = pricing.scraped_source_domain ? ` (${pricing.scraped_source_domain})` : "";
    out.push(`Pricing extracted directly from clinic website${domain} — based on real published data.`);
  } else if (pricing.source === "crowd") {
    out.push(
      `Pricing normalized from ${pricing.sample_size} real patient quote${pricing.sample_size === 1 ? "" : "s"}.`,
    );
  }

  return Array.from(new Set(out)).slice(0, MAX_EXPLANATIONS);
}
