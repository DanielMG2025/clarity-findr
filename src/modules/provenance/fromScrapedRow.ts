// Adapter — turn the existing ScrapedPricingRow (src/lib/engines) into a
// canonical PriceObservation. Returns null when the treatment can't be mapped,
// so unrecognized rows never silently pollute the estimate.

import type { ScrapedPricingRow } from "@/lib/engines/types";
import { convertToEur, type FxTable } from "./currency";
import { normalizeMarket, normalizeTreatment } from "./taxonomy";
import type { PriceObservation } from "./types";

export interface FromScrapedOptions {
  /** The Source catalogue id this row was captured under (required for provenance). */
  source_id: string;
  /** Market override; falls back to the row's source_domain if absent. */
  market?: string;
  /** Dated FX table for the currency conversion. */
  fx?: FxTable;
}

export function fromScrapedRow(
  row: ScrapedPricingRow,
  opts: FromScrapedOptions,
): PriceObservation | null {
  const treatment = normalizeTreatment(row.treatment_type);
  if (!treatment) return null;

  const fx = convertToEur(row.scraped_price, row.currency, opts.fx);
  // An unknown currency (1:1 fallback) is less trustworthy — dampen parse_confidence.
  const parse_confidence = fx.fallback
    ? Math.max(0, Math.min(1, row.parse_confidence) * 0.6)
    : Math.max(0, Math.min(1, row.parse_confidence));

  return {
    treatment,
    market: normalizeMarket(opts.market ?? row.source_domain ?? ""),
    amount_eur: fx.amount_eur,
    currency_original: row.currency,
    source_id: opts.source_id,
    source_kind: "scraped_web",
    parse_confidence,
    inclusions: "unknown",
    observed_at: row.scraped_at,
  };
}
