// Pricing engine.
// Single source of truth for: expected price, price range, vs-market comparison.
//
// Source priority (highest → lowest):
//   1. scraped  — price extracted from clinic website (parse_confidence ≥ threshold)
//   2. crowd    — average of community-submitted quotes (≥ CROWD_MIN_SAMPLES)
//   3. listed   — clinic-published base + medication + extras

import type {
  AggregatedRow,
  Clinic,
  Confidence,
  PricingResult,
  ScrapedPricingRow,
  TreatmentInterest,
} from "./types";

/** Use crowdsourced average when this many submitted quotes are available. */
const CROWD_MIN_SAMPLES = 3;

/** Minimum parser confidence (0-1) to trust scraped data over a listed estimate. */
const SCRAPED_MIN_CONFIDENCE = 0.6;
/** Above this, we treat scraped data as a strong signal even alone. */
const SCRAPED_HIGH_CONFIDENCE = 0.85;

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

function confidenceFromCrowdSamples(n: number): Confidence {
  if (n >= CONFIDENCE_HIGH) return "high";
  if (n >= CONFIDENCE_MEDIUM) return "medium";
  return "low";
}

function confidenceFromScraped(parseConfidence: number, scrapedRows: number): Confidence {
  // High when parser is very confident OR multiple corroborating sources.
  if (parseConfidence >= SCRAPED_HIGH_CONFIDENCE || scrapedRows >= 3) return "high";
  if (parseConfidence >= SCRAPED_MIN_CONFIDENCE || scrapedRows >= 2) return "medium";
  return "low";
}

/** Pick the best scraped row for a clinic+treatment (highest confidence, most recent). */
function bestScrapedRow(
  clinic: Clinic,
  treatment: TreatmentInterest | "",
  scraped: ScrapedPricingRow[],
): { row: ScrapedPricingRow; total: number } | null {
  const matches = scraped.filter(
    (s) => s.clinic_name === clinic.name && s.treatment_type === treatment,
  );
  if (!matches.length) return null;
  const sorted = [...matches].sort(
    (a, b) =>
      b.parse_confidence - a.parse_confidence ||
      new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime(),
  );
  const top = sorted[0];
  if (top.parse_confidence < SCRAPED_MIN_CONFIDENCE) return null;
  return { row: top, total: top.scraped_price };
}

/**
 * Build a map of country → average expected price for a given treatment.
 * Blends scraped → crowd → listed, in that priority order.
 */
export function buildCountryAverages(
  clinics: Clinic[],
  aggregated: AggregatedRow[],
  treatment: TreatmentInterest | "",
  scraped: ScrapedPricingRow[] = [],
): Map<string, number> {
  const groups = new Map<string, number[]>();
  for (const c of clinics) {
    if (!c.treatments_available.includes(treatment as string)) continue;
    const scrape = bestScrapedRow(c, treatment, scraped);
    const agg = aggregated.find((a) => a.clinic_name === c.name && a.treatment_type === treatment);
    let value: number;
    if (scrape) value = scrape.total;
    else if (agg && agg.sample_size >= CROWD_MIN_SAMPLES) value = agg.avg_price;
    else value = listedTotal(c, treatment);
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
  scraped: ScrapedPricingRow[] = [],
): PricingResult {
  const listed = listedTotal(clinic, treatment);
  const scrape = bestScrapedRow(clinic, treatment, scraped);
  const scrapedRowCount = scraped.filter(
    (s) => s.clinic_name === clinic.name && s.treatment_type === treatment,
  ).length;

  const useCrowd = !!agg && agg.sample_size >= CROWD_MIN_SAMPLES && agg.avg_price > 0;
  const useScraped = !!scrape;

  let expected: number;
  let source: PricingResult["source"];
  let confidence: Confidence;
  let sample_size: number;
  let price_min: number;
  let price_max: number;

  if (useScraped) {
    expected = Math.round(scrape!.total);
    source = "scraped";
    confidence = confidenceFromScraped(scrape!.row.parse_confidence, scrapedRowCount);
    sample_size = scrapedRowCount;
    price_min = Math.round(expected * RANGE_LOW);
    price_max = Math.round(expected * RANGE_HIGH);
  } else if (useCrowd) {
    expected = Math.round(agg!.avg_price);
    source = "crowd";
    confidence = confidenceFromCrowdSamples(agg!.sample_size);
    sample_size = agg!.sample_size;
    price_min = Math.min(agg!.min_price, Math.round(expected * RANGE_LOW));
    price_max = Math.max(agg!.max_price, Math.round(expected * RANGE_HIGH));
  } else {
    expected = listed;
    source = "listed";
    confidence = confidenceFromCrowdSamples(agg?.sample_size ?? 0);
    sample_size = agg?.sample_size ?? 0;
    price_min = Math.round(expected * RANGE_LOW);
    price_max = Math.round(expected * RANGE_HIGH);
  }

  const country_avg = countryAverages.get(clinic.country) ?? null;
  const vs_country_avg_pct =
    country_avg && country_avg > 0
      ? Math.round(((expected - country_avg) / country_avg) * 100)
      : null;

  return {
    expected,
    listed,
    price_min,
    price_max,
    source,
    vs_country_avg_pct,
    country_avg: country_avg ? Math.round(country_avg) : null,
    volatility: agg?.price_volatility ?? 0,
    sample_size,
    confidence,
    scraped_source_url: useScraped ? scrape!.row.source_url : null,
    scraped_source_domain: useScraped ? scrape!.row.source_domain : null,
    scraped_parse_confidence: useScraped ? scrape!.row.parse_confidence : null,
    scraped_at: useScraped ? scrape!.row.scraped_at : null,
  };
}
