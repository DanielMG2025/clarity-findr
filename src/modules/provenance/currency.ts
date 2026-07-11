// Currency normalization — everything is stored in EUR, keeping the original
// currency for traceability. Rates are a DATED, injectable table: there is no
// live FX fetch here (a cold-start guardrail — no network at normalize time).
// Refresh DEFAULT_FX deliberately, or inject a table dated to the capture time.

export interface FxTable {
  /** ISO date the rates were valid for. */
  asOf: string;
  /** EUR per 1 unit of the currency. EUR itself is 1. */
  ratesToEur: Record<string, number>;
}

// Approximate reference rates. NOT authoritative — replace with dated rates
// per capture. Kept small: only currencies of the initial target markets.
export const DEFAULT_FX: FxTable = {
  asOf: "2026-01-01",
  ratesToEur: {
    EUR: 1,
    CZK: 0.04, // Czech koruna
    GBP: 1.17, // pound sterling
    DKK: 0.134, // Danish krone
    USD: 0.92,
    CHF: 1.05,
  },
};

export interface FxResult {
  amount_eur: number;
  rate: number;
  fx_as_of: string;
  /** True when the currency wasn't in the table and a 1:1 fallback was used. */
  fallback: boolean;
}

/**
 * Convert an amount to EUR using a dated FX table. Unknown currencies fall back
 * to 1:1 and are flagged so callers can lower parse_confidence accordingly.
 */
export function convertToEur(
  amount: number,
  currency: string,
  fx: FxTable = DEFAULT_FX,
): FxResult {
  const code = (currency || "EUR").trim().toUpperCase();
  const rate = fx.ratesToEur[code];
  if (rate === undefined) {
    return { amount_eur: amount, rate: 1, fx_as_of: fx.asOf, fallback: true };
  }
  return {
    amount_eur: Math.round(amount * rate * 100) / 100,
    rate,
    fx_as_of: fx.asOf,
    fallback: false,
  };
}
