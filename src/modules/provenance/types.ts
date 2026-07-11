// Provenance model — the contract described by the cold-start pricing spec.
// Everything that produces a patient-facing price range flows through these
// types. No price exists without a source_id, observed_at and parse_confidence.

import type { TreatmentKey } from "./taxonomy";

export type { TreatmentKey };

// Source tiers, lowest trust first. Scraping is the base layer, designed to be
// displaced by crowd and B2B as they arrive.
export type SourceKind =
  | "scraped_web"
  | "aggregator"
  | "public_report"
  | "crowd"
  | "b2b";

// Trust weight per source kind. The patient never sees "scraping"; these weights
// decide how much each observation pulls the estimate.
export const SOURCE_WEIGHT: Record<SourceKind, number> = {
  scraped_web: 0.3,
  aggregator: 0.3,
  public_report: 0.5,
  crowd: 0.6,
  b2b: 0.9,
};

// What a captured price is known to include. "unknown" is honest and lowers the
// observation's weight — a price of uncertain inclusions shouldn't anchor a range.
export type Inclusions =
  | "unknown"
  | {
      base?: boolean;
      medication?: boolean;
      icsi?: boolean;
      vitrification?: boolean;
      storage?: boolean;
    };

export interface Source {
  id: string;
  kind: SourceKind;
  label: string;
  url?: string | null;
  domain?: string | null;
  market?: string | null;
  /** ISO date the source's data is valid for. */
  as_of?: string | null;
  weight: number;
  usage_note?: string | null;
  /** Hard guardrail: nothing is crawled while this is false. */
  allowlisted: boolean;
  reviewed_by?: string | null;
}

export interface PriceObservation {
  treatment: TreatmentKey;
  market: string;
  amount_eur: number;
  currency_original: string;
  source_id: string;
  source_kind: SourceKind;
  /** 0..1 quality of the extraction. */
  parse_confidence: number;
  inclusions: Inclusions;
  /** ISO timestamp of capture — drives time-decay and expiry. */
  observed_at: string;
}

export type EstimateConfidence = "low" | "medium" | "high";

// A single traceable data point behind an estimate. This is what powers the
// patient-facing "where your price comes from" — never the raw table.
export interface Citation {
  source_id: string;
  source_kind: SourceKind;
  label?: string | null;
  url?: string | null;
  observed_at: string;
  amount_eur: number;
  /** Weight this citation carried in the aggregate (0..1, normalized). */
  weight: number;
}

export interface PriceEstimate {
  treatment: TreatmentKey;
  market: string;
  range_min: number;
  range_max: number;
  expected: number;
  confidence: EstimateConfidence;
  /** Number of observations that survived dedup + outlier filtering. */
  sample_size: number;
  citations: Citation[];
  /** True when there were no usable observations — callers should fall back. */
  empty: boolean;
}
