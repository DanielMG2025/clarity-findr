// Seed prices — verified snapshot (NOT live scraping)
// ---------------------------------------------------------------------------
// A referenced, fixed-date price base so the demo can show real ranges before
// the live scraper / crowd / B2B feeds exist. Every figure carries its source
// and a confidence flag. These are MARKET-GUIDE aggregates (secondary sources),
// so confidence is capped at "medium" — they are meant to be superseded by
// clinic B2B tariffs and patient quotes, exactly as the pricing spec describes.
//
// Treatments covered: FIV con óvulos propios · ovodonación · congelación.
// Markets: España + destinos UE (Chequia, Grecia, Portugal, Dinamarca, Chipre).
// Currency: EUR. Prices are per cycle and typically EXCLUDE medication
// (~€1.000–2.200) and long-term storage (~€300–400/año), noted per record.

import type {
  Source,
  PriceObservation,
  PriceEstimate,
  Citation,
  Confidence,
  TreatmentKey,
} from "@/modules/provenance/types";

export const SEED_AS_OF = "2026-05";

// --- Sources (market guides; kind = public_report) -------------------------
export const SEED_PRICE_SOURCES: Source[] = [
  { id: "ovu_we_2026", kind: "public_report", label: "OVU — Fertility cost guide (Western/Eastern Europe), 2026", url: "https://ovu.com/fertility-insights/", market: "EU", as_of: "2026", weight: 0.5, usage_note: "Aggregator; verify before publishing. Replace with B2B/crowd." },
  { id: "edf_2026", kind: "public_report", label: "EggDonationFriends — Egg donation costs worldwide, 2026", url: "https://www.eggdonationfriends.com/", market: "EU", as_of: "2026", weight: 0.5 },
  { id: "fca_2026", kind: "public_report", label: "FertilityClinicsAbroad — Cheapest IVF in Europe, 2026", url: "https://www.fertilityclinicsabroad.com/", market: "EU", as_of: "2026", weight: 0.5 },
  { id: "froad_2026", kind: "public_report", label: "FertilityRoad — IVF cost explained, 2026", url: "https://fertilityroad.com/", market: "EU", as_of: "2026", weight: 0.5 },
  { id: "fconsult_2026", kind: "public_report", label: "Fertility Consultancy — Donor egg IVF costs worldwide, 2026", url: "https://www.fertilityconsultancy.com/", market: "EU", as_of: "2026", weight: 0.5 },
  { id: "sef_local_2025", kind: "public_report", label: "Spanish Fertility Society (SEF) / The Local ES, 2025", url: "https://www.thelocal.es/", market: "ES", as_of: "2025", weight: 0.6 },
];

export const SEED_SOURCE_MAP = new Map(SEED_PRICE_SOURCES.map((s) => [s.id, s]));

export type SeedTreatment = "ivf" | "donor" | "freezing";

export interface SeedPrice {
  treatment: SeedTreatment;
  market: string; // ISO-ish code
  market_label: string;
  min: number;
  mid: number;
  max: number;
  currency: "EUR";
  source_ids: string[];
  confidence: Confidence;
  as_of: string;
  note?: string;
}

// Prices per cycle, EUR, generally EXCLUDING medication unless noted.
export const SEED_PRICES: SeedPrice[] = [
  // ---- FIV con óvulos propios ----
  { treatment: "ivf", market: "ES", market_label: "España", min: 4000, mid: 4900, max: 6000, currency: "EUR", source_ids: ["sef_local_2025", "ovu_we_2026", "edf_2026"], confidence: "medium", as_of: SEED_AS_OF, note: "excl. medication (~€1,000–2,200)" },
  { treatment: "ivf", market: "CZ", market_label: "Chequia", min: 2500, mid: 3000, max: 3500, currency: "EUR", source_ids: ["fca_2026", "edf_2026"], confidence: "medium", as_of: SEED_AS_OF, note: "European low end; excl. medication" },
  { treatment: "ivf", market: "GR", market_label: "Grecia", min: 3000, mid: 3500, max: 4000, currency: "EUR", source_ids: ["edf_2026", "fca_2026"], confidence: "medium", as_of: SEED_AS_OF },
  { treatment: "ivf", market: "PT", market_label: "Portugal", min: 3500, mid: 4200, max: 5000, currency: "EUR", source_ids: ["ovu_we_2026", "fca_2026"], confidence: "medium", as_of: SEED_AS_OF },
  { treatment: "ivf", market: "DK", market_label: "Dinamarca", min: 4000, mid: 4700, max: 5500, currency: "EUR", source_ids: ["ovu_we_2026"], confidence: "low", as_of: SEED_AS_OF, note: "sparse data; to validate" },
  { treatment: "ivf", market: "CY", market_label: "Chipre", min: 2500, mid: 3000, max: 3500, currency: "EUR", source_ids: ["fca_2026", "froad_2026"], confidence: "low", as_of: SEED_AS_OF, note: "includes Cyprus/Northern Cyprus clinics (variable regulation)" },

  // ---- Ovodonación ----
  { treatment: "donor", market: "ES", market_label: "España", min: 6000, mid: 7200, max: 9000, currency: "EUR", source_ids: ["edf_2026", "fconsult_2026", "sef_local_2025"], confidence: "medium", as_of: SEED_AS_OF, note: "guarantee programmes reach €16,500–19,000" },
  { treatment: "donor", market: "CZ", market_label: "Chequia", min: 4200, mid: 5000, max: 6000, currency: "EUR", source_ids: ["edf_2026", "fconsult_2026"], confidence: "medium", as_of: SEED_AS_OF },
  { treatment: "donor", market: "GR", market_label: "Grecia", min: 5000, mid: 6000, max: 7000, currency: "EUR", source_ids: ["edf_2026", "fconsult_2026"], confidence: "medium", as_of: SEED_AS_OF },
  { treatment: "donor", market: "PT", market_label: "Portugal", min: 6000, mid: 7000, max: 9000, currency: "EUR", source_ids: ["fconsult_2026"], confidence: "medium", as_of: SEED_AS_OF },
  { treatment: "donor", market: "DK", market_label: "Dinamarca", min: 6000, mid: 7000, max: 9000, currency: "EUR", source_ids: ["froad_2026"], confidence: "low", as_of: SEED_AS_OF, note: "sparse data; to validate" },
  { treatment: "donor", market: "CY", market_label: "Chipre", min: 5000, mid: 6000, max: 7500, currency: "EUR", source_ids: ["edf_2026", "fconsult_2026"], confidence: "low", as_of: SEED_AS_OF },

  // ---- Congelación de óvulos ----
  { treatment: "freezing", market: "ES", market_label: "España", min: 2300, mid: 2900, max: 3500, currency: "EUR", source_ids: ["fca_2026"], confidence: "medium", as_of: SEED_AS_OF, note: "procedure only; full €3,500–4,700; excl. medication" },
  { treatment: "freezing", market: "CZ", market_label: "Chequia", min: 1500, mid: 2200, max: 3000, currency: "EUR", source_ids: ["fca_2026"], confidence: "medium", as_of: SEED_AS_OF, note: "~€1,500 includes 1 year of storage; excl. medication" },
  { treatment: "freezing", market: "GR", market_label: "Grecia", min: 1500, mid: 2300, max: 3000, currency: "EUR", source_ids: ["fca_2026"], confidence: "medium", as_of: SEED_AS_OF },
  { treatment: "freezing", market: "PT", market_label: "Portugal", min: 2500, mid: 3000, max: 4000, currency: "EUR", source_ids: ["ovu_we_2026"], confidence: "low", as_of: SEED_AS_OF, note: "sparse data; to validate" },
  { treatment: "freezing", market: "DK", market_label: "Dinamarca", min: 2500, mid: 3000, max: 4000, currency: "EUR", source_ids: ["ovu_we_2026"], confidence: "low", as_of: SEED_AS_OF, note: "sparse data; to validate" },
  { treatment: "freezing", market: "CY", market_label: "Chipre", min: 2000, mid: 2400, max: 3000, currency: "EUR", source_ids: ["fca_2026"], confidence: "low", as_of: SEED_AS_OF },
];

// --- Adapters into the provenance model ------------------------------------

const SEED_MAP: Record<SeedTreatment, TreatmentKey> = { ivf: "ivf", donor: "donor", freezing: "freezing" };

/** Emit min/mid/max as PriceObservations so aggregatePrices() yields a range. */
export function toPriceObservations(rows: SeedPrice[] = SEED_PRICES): PriceObservation[] {
  const out: PriceObservation[] = [];
  for (const r of rows) {
    const base = {
      treatment: SEED_MAP[r.treatment],
      market: r.market,
      currency_original: r.currency,
      source_id: r.source_ids[0],
      source_kind: "public_report" as const,
      parse_confidence: r.confidence === "medium" ? 0.7 : 0.5,
      inclusions: "unknown" as const,
      observed_at: r.as_of,
    };
    out.push({ id: `seed_${r.treatment}_${r.market}_min`, amount_eur: r.min, ...base });
    out.push({ id: `seed_${r.treatment}_${r.market}_mid`, amount_eur: r.mid, ...base });
    out.push({ id: `seed_${r.treatment}_${r.market}_max`, amount_eur: r.max, ...base });
  }
  return out;
}

/** Quick lookup for the configurator: the seed range for a treatment+market. */
export function seedRange(treatment: SeedTreatment, market: string): SeedPrice | undefined {
  return SEED_PRICES.find((r) => r.treatment === treatment && r.market === market);
}

// --- ADDED (bridge): direct seed → PriceEstimate ---------------------------
// NOTE: added during integration. A seed row IS a range (min/mid/max) from one
// or a few guides. Routing min/mid/max through aggregatePrices() would collapse
// them (same source_id → dedup), so for the demo we build the estimate straight
// from the row, citing every source behind it. Replace with the real
// aggregate over price_observations once B2B/crowd data lands.
export function seedEstimate(treatment: SeedTreatment, market: string): PriceEstimate | null {
  const r = seedRange(treatment, market);
  if (!r) return null;
  const citations: Citation[] = r.source_ids.map((id) => ({
    source_id: id,
    source_kind: "public_report",
    label: SEED_SOURCE_MAP.get(id)?.label ?? id,
    url: SEED_SOURCE_MAP.get(id)?.url ?? null,
    observed_at: r.as_of,
    amount_eur: r.mid,
    weight: Math.round((1 / r.source_ids.length) * 1000) / 1000,
  }));
  return {
    treatment: SEED_MAP[treatment],
    market,
    range_min: r.min,
    range_max: r.max,
    expected: r.mid,
    confidence: r.confidence,
    sample_size: r.source_ids.length,
    citations,
    empty: false,
  };
}

// Bridge for the configurator, which speaks TreatmentKey + canonical country
// labels ("Spain") rather than the seed's ISO-ish codes ("ES").
const SEED_MARKET_CODE_BY_LABEL: Record<string, string> = {
  Spain: "ES",
  "Czech Republic": "CZ",
  Greece: "GR",
  Portugal: "PT",
  Denmark: "DK",
  Cyprus: "CY",
};
const SEED_TREATMENTS = new Set<string>(["ivf", "donor", "freezing"]);

/** Seed estimate for a configurator profile (TreatmentKey + country label). */
export function seedEstimateForProfile(treatment: string, country: string): PriceEstimate | null {
  if (!SEED_TREATMENTS.has(treatment)) return null;
  const code = SEED_MARKET_CODE_BY_LABEL[country] ?? country;
  return seedEstimate(treatment as SeedTreatment, code);
}
