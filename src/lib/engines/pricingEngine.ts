// Pricing engine.
// Single source of truth for: expected price, price range, vs-market comparison.
//
// Inputs:  clinic + treatment + (optional) crowdsourced aggregate row + country-average map
// Outputs: PricingResult (expected, range, % vs market, confidence, source)

import type {
  AggregatedRow,
  Clinic,
  Confidence,
  PricingResult,
  TreatmentInterest,
} from "./types";

/** Use crowdsourced average when this many submitted quotes are available. */
const CROWD_MIN_SAMPLES = 3;

/** Confidence thresholds (number of submitted quotes per clinic+treatment). */
const CONFIDENCE_HIGH = 30;
const CONFIDENCE_MEDIUM = 10;

/** Range bounds applied to the expected price (per spec). */
const RANGE_LOW = 0.9;
const RANGE_HIGH = 1.2;

function basePriceFor(clinic: Clinic, treatment: TreatmentInterest | ""): number | null {
  if (treatment === "Egg Donation") return clinic.base_price_egg_donation;
  if (treatment === "Social Freezing") return clinic.base_price_freezing;
  return clinic.base_price_ivf;
}

/** Listed estimate = base + medication + extras (clinic-published numbers). */
export function listedTotal(clinic: Clinic, treatment: TreatmentInterest | ""): number {
  const base = basePriceFor(clinic, treatment) ?? clinic.base_price_ivf ?? 0;
  return base + (clinic.medication_estimate ?? 0) + (clinic.extras_estimate ?? 0);
}

function confidenceFromSamples(n: number): Confidence {
  if (n >= CONFIDENCE_HIGH) return "high";
  if (n >= CONFIDENCE_MEDIUM) return "medium";
  return "low";
}

/**
 * Build a map of country → average expected price for a given treatment,
 * blending crowdsourced averages with listed totals.
 */
export function buildCountryAverages(
  clinics: Clinic[],
  aggregated: AggregatedRow[],
  treatment: TreatmentInterest | "",
): Map<string, number> {
  const groups = new Map<string, number[]>();
  for (const c of clinics) {
    if (!c.treatments_available.includes(treatment as string)) continue;
    const agg = aggregated.find((a) => a.clinic_name === c.name && a.treatment_type === treatment);
    const value =
      agg && agg.sample_size >= CROWD_MIN_SAMPLES ? agg.avg_price : listedTotal(c, treatment);
    if (!value) continue;
    if (!groups.has(c.country)) groups.set(c.country, []);
    groups.get(c.country)!.push(value);
  }
  const out = new Map<string, number>();
  groups.forEach((arr, country) => {
    out.set(country, arr.reduce((s, n) => s + n, 0) / arr.length);
  });
  return out;
}

/** Core pricing calculation for a single clinic. */
export function pricingEngine(
  clinic: Clinic,
  treatment: TreatmentInterest | "",
  agg: AggregatedRow | undefined,
  countryAverages: Map<string, number>,
): PricingResult {
  const listed = listedTotal(clinic, treatment);
  const useCrowd = !!agg && agg.sample_size >= CROWD_MIN_SAMPLES && agg.avg_price > 0;
  const expected = useCrowd ? Math.round(agg!.avg_price) : listed;

  const price_min = useCrowd
    ? Math.min(agg!.min_price, Math.round(expected * RANGE_LOW))
    : Math.round(expected * RANGE_LOW);
  const price_max = useCrowd
    ? Math.max(agg!.max_price, Math.round(expected * RANGE_HIGH))
    : Math.round(expected * RANGE_HIGH);

  const country_avg = countryAverages.get(clinic.country) ?? null;
  const vs_country_avg_pct =
    country_avg && country_avg > 0
      ? Math.round(((expected - country_avg) / country_avg) * 100)
      : null;

  const sample_size = agg?.sample_size ?? 0;

  return {
    expected,
    listed,
    price_min,
    price_max,
    source: useCrowd ? "crowd" : "listed",
    vs_country_avg_pct,
    country_avg: country_avg ? Math.round(country_avg) : null,
    volatility: agg?.price_volatility ?? 0,
    sample_size,
    confidence: confidenceFromSamples(sample_size),
  };
}
