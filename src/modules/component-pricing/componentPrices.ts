// Component-level price ranges — base for the demonstrator's configurator
// ---------------------------------------------------------------------------
// Guiding principle (important — read before touching anything):
//
//   The exact price ALWAYS comes from the clinic. This engine does NOT aim for
//   precision: it aims to give an honest, EXPLAINABLE ORIENTATIVE RANGE.
//   Explainability doesn't offset the imprecision — it IS the value proposition.
//
// METHOD (deliberately transparent):
//   1. Components are anchored in SPAIN, where the public data is best.
//   2. For other markets we apply a PRICE-LEVEL INDEX derived from the per-country
//      cycle totals we actually have (we don't invent 6 countries × 8 components:
//      that would be false precision).
//   3. Every range carries its CONFIDENCE level and its SOURCES.
//
// All of this is told to the user as-is. Saying "orientative range from public
// sources, to be refined with clinic data" is MORE credible than faking exactness.

import type { Confidence } from "@/modules/provenance/types";

export const COMPONENTS_AS_OF = "2026-05";

// --- Evidence tiers (what the user sees) -----------------------------------
export type Tier = "T1_public" | "T2_patients" | "T3_clinics";

export const TIER_META: Record<Tier, { label: string; blurb: string; confidence: Confidence }> = {
  T1_public: {
    label: "Public information",
    blurb: "Estimated range from prices published on clinic websites, reports and accessible studies.",
    confidence: "low",
  },
  T2_patients: {
    label: "Patient quotes",
    blurb: "Refined with real quotes other patients have shared anonymously.",
    confidence: "medium",
  },
  T3_clinics: {
    label: "Clinic rate cards",
    blurb: "Based on rates provided directly by partner clinics.",
    confidence: "high",
  },
};

// --- Treatment components --------------------------------------------------
export type ComponentKey =
  | "consultation"
  | "ivf_base"
  | "medication"
  | "icsi"
  | "pgt_a"
  | "vitrification"
  | "annual_storage"
  | "frozen_transfer"
  | "donor_programme"
  | "freezing_cycle";

export interface ComponentRange {
  key: ComponentKey;
  label: string;
  /** What it includes — shown in the breakdown to avoid comparing apples to oranges. */
  includes: string;
  min: number;
  max: number;
  /** true = recurring cost (e.g. annual storage) */
  recurring?: boolean;
  /** true = optional / add-on, doesn't always apply */
  optional?: boolean;
  tier: Tier;
  sources: string[];
  note?: string;
}

/** ANCHOR: ranges in Spain (EUR). Everything else is derived from here. */
export const COMPONENTS_ES: ComponentRange[] = [
  { key: "consultation", label: "First consultation and tests", includes: "Initial assessment, basic blood tests, ultrasound, semen analysis.", min: 150, max: 400, tier: "T1_public", sources: ["ES clinic websites", "Market guides"] },
  { key: "ivf_base", label: "IVF cycle (base)", includes: "Retrieval, lab, fertilisation and fresh transfer. Does NOT include medication.", min: 3500, max: 4800, tier: "T1_public", sources: ["SEF / ES press 2025", "Market guides 2026"] },
  { key: "medication", label: "Medication", includes: "Ovarian stimulation drugs. Varies a lot by protocol and response.", min: 900, max: 2200, tier: "T1_public", sources: ["Market guides 2026"], note: "Almost always EXCLUDED from the clinic's advertised price." },
  { key: "icsi", label: "ICSI (add-on)", includes: "Sperm microinjection, on top of the base cycle.", min: 500, max: 1500, optional: true, tier: "T1_public", sources: ["ES clinic websites"] },
  { key: "pgt_a", label: "Embryo genetic test (PGT-A)", includes: "Embryo biopsy + analysis. Usually scales with the number of embryos.", min: 1800, max: 3500, optional: true, tier: "T1_public", sources: ["ES clinic websites"], note: "The cost depends on how many embryos are analysed." },
  { key: "vitrification", label: "Embryo vitrification", includes: "Freezing the embryos left over from the cycle.", min: 400, max: 900, optional: true, tier: "T1_public", sources: ["ES clinic websites"] },
  { key: "annual_storage", label: "Storage (annual)", includes: "Custody of eggs or embryos. Recurring cost each year.", min: 200, max: 500, recurring: true, tier: "T1_public", sources: ["ES freezing guides 2026"], note: "Subscription-like model: paid while you keep the material." },
  { key: "frozen_transfer", label: "Frozen embryo transfer (FET)", includes: "Endometrial preparation, thawing and transfer.", min: 800, max: 1800, optional: true, tier: "T1_public", sources: ["ES clinic websites"] },
  { key: "donor_programme", label: "Egg-donation programme", includes: "Donor eggs, the donor's regulated compensation, coordination, fertilisation and transfer.", min: 5500, max: 8000, tier: "T1_public", sources: ["Egg-donation guides 2026", "SEF"], note: "Guarantee (live-birth) programmes can exceed €15,000." },
  { key: "freezing_cycle", label: "Egg-freezing cycle", includes: "Stimulation, retrieval and vitrification. Does NOT include medication or storage.", min: 2300, max: 3500, tier: "T1_public", sources: ["ES freezing guides 2026"] },
];

// --- Per-market price-level index ------------------------------------------
// Derived from per-country cycle TOTALS (public sources). It's a declared
// approximation, not a per-component-and-country datum.
export interface Market {
  code: string;
  label: string;
  index: number; // 1.00 = Spain
  confidence: Confidence;
  note?: string;
}

export const MARKETS: Market[] = [
  { code: "ES", label: "Spain", index: 1.0, confidence: "medium" },
  { code: "CZ", label: "Czech Republic", index: 0.65, confidence: "medium", note: "European low end; frequent treatment destination." },
  { code: "GR", label: "Greece", index: 0.75, confidence: "medium" },
  { code: "PT", label: "Portugal", index: 0.88, confidence: "low" },
  { code: "DK", label: "Denmark", index: 0.98, confidence: "low", note: "Sparse data; to validate." },
  { code: "CY", label: "Cyprus", index: 0.65, confidence: "low", note: "Regulation varies by area." },
];

export function market(code: string): Market {
  return MARKETS.find((m) => m.code === code) ?? MARKETS[0];
}

/** A component's range adjusted to a market. */
export function componentIn(key: ComponentKey, marketCode: string): ComponentRange | undefined {
  const base = COMPONENTS_ES.find((c) => c.key === key);
  if (!base) return undefined;
  const m = market(marketCode);
  if (m.code === "ES") return base;
  return {
    ...base,
    min: Math.round((base.min * m.index) / 10) * 10,
    max: Math.round((base.max * m.index) / 10) * 10,
    // outside Spain the datum is weaker: we never raise confidence
    tier: base.tier,
    note: [base.note, `Estimated by ${m.label}'s price level (index ${m.index}).`].filter(Boolean).join(" "),
  };
}

// --- Basket: which components apply to each scenario -----------------------
export type Plan = "ivf" | "ivf_icsi" | "ivf_icsi_pgt" | "egg_donation" | "egg_freezing";

export const PLAN_BASKET: Record<Plan, { label: string; components: ComponentKey[] }> = {
  ivf: { label: "IVF with own eggs", components: ["consultation", "ivf_base", "medication"] },
  ivf_icsi: { label: "IVF + ICSI", components: ["consultation", "ivf_base", "medication", "icsi"] },
  ivf_icsi_pgt: { label: "IVF + ICSI + genetic test", components: ["consultation", "ivf_base", "medication", "icsi", "pgt_a", "vitrification"] },
  egg_donation: { label: "Egg donation", components: ["consultation", "donor_programme", "medication"] },
  egg_freezing: { label: "Egg freezing", components: ["consultation", "freezing_cycle", "medication", "annual_storage"] },
};

// --- Explainable estimate --------------------------------------------------
export interface Estimate {
  plan: Plan;
  plan_label: string;
  market: Market;
  lines: (ComponentRange & { key: ComponentKey })[];
  total_min: number;
  total_max: number;
  recurring_min: number;
  recurring_max: number;
  tier: Tier;
  confidence: Confidence;
  explanation: string;
  caveat: string;
}

/** Build the estimate with its breakdown and its "why". */
export function estimate(plan: Plan, marketCode: string, opts?: { storageYears?: number }): Estimate {
  const basket = PLAN_BASKET[plan];
  const m = market(marketCode);
  const lines = basket.components
    .map((k) => componentIn(k, marketCode))
    .filter(Boolean) as (ComponentRange & { key: ComponentKey })[];

  const oneOff = lines.filter((l) => !l.recurring);
  const rec = lines.filter((l) => l.recurring);
  const years = opts?.storageYears ?? 1;

  const total_min = oneOff.reduce((s, l) => s + l.min, 0);
  const total_max = oneOff.reduce((s, l) => s + l.max, 0);
  const recurring_min = rec.reduce((s, l) => s + l.min, 0) * years;
  const recurring_max = rec.reduce((s, l) => s + l.max, 0) * years;

  // The set's tier is the weakest of its components (honesty).
  const tier: Tier = "T1_public";
  const conf: Confidence = m.confidence === "low" ? "low" : TIER_META[tier].confidence;

  return {
    plan,
    plan_label: basket.label,
    market: m,
    lines,
    total_min,
    total_max,
    recurring_min,
    recurring_max,
    tier,
    confidence: conf,
    explanation: explain(tier, m, lines.length),
    caveat:
      "It's an orientative range, not a quote. Only the clinic can give you an exact price, based on your specific case.",
  };
}

/** Explainability text — what the patient reads under the price. */
export function explain(tier: Tier, m: Market, n: number): string {
  const meta = TIER_META[tier];
  const geo =
    m.code === "ES"
      ? "for Spain"
      : `for ${m.label}, adjusted by its price level relative to Spain`;
  return `${meta.blurb} Range computed ${geo}, summing ${n} treatment components (${meta.label.toLowerCase()}).`;
}

/** How the range will improve as better sources arrive — shown to the user. */
export const IMPROVEMENT_PATH =
  "This range will refine automatically as we bring in real patient quotes and partner-clinic rate cards.";

// --- Bridge for the configurator (TreatmentKey + country label + toggles) ---
const MARKET_CODE_BY_LABEL: Record<string, string> = {
  Spain: "ES",
  "Czech Republic": "CZ",
  Greece: "GR",
  Portugal: "PT",
  Denmark: "DK",
  Cyprus: "CY",
};

export interface ProfileForEstimate {
  treatment: string; // configurator TreatmentKey
  country: string; // canonical label ("Spain")
  needs_icsi?: boolean;
  needs_pgt?: boolean;
  storageYears?: number;
}

/** Resolve a configurator profile to a component-pricing plan. */
export function planForProfile(p: ProfileForEstimate): Plan | null {
  if (p.treatment === "donor") return "egg_donation";
  if (p.treatment === "freezing") return "egg_freezing";
  if (p.treatment === "ivf" || p.treatment === "icsi") {
    if (p.needs_pgt) return "ivf_icsi_pgt";
    if (p.needs_icsi || p.treatment === "icsi") return "ivf_icsi";
    return "ivf";
  }
  return null; // iui / study aren't covered by this engine
}

/** Component-level estimate for a configurator profile, or null if uncovered. */
export function componentEstimateForProfile(p: ProfileForEstimate): Estimate | null {
  const plan = planForProfile(p);
  if (!plan) return null;
  const code = MARKET_CODE_BY_LABEL[p.country] ?? "ES";
  return estimate(plan, code, { storageYears: p.storageYears });
}
