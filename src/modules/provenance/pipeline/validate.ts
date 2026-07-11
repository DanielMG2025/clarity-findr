// Sanity validation before an observation is allowed into the store. Absurd
// prices go to quarantine (rejected here) rather than into the range.

import type { PriceObservation } from "../types";
import type { Validator } from "./types";

/** Upper sanity bound for a single treatment price point, in EUR. */
export const MAX_PLAUSIBLE_EUR = 100_000;

export function validateObservation(obs: PriceObservation): { ok: boolean; reason?: string } {
  if (!obs.source_id) return { ok: false, reason: "missing source_id" };
  if (!obs.observed_at || Number.isNaN(new Date(obs.observed_at).getTime())) {
    return { ok: false, reason: "invalid observed_at" };
  }
  if (!(obs.amount_eur > 0)) return { ok: false, reason: "non-positive amount" };
  if (obs.amount_eur > MAX_PLAUSIBLE_EUR) return { ok: false, reason: "implausibly high amount" };
  if (obs.parse_confidence < 0 || obs.parse_confidence > 1) {
    return { ok: false, reason: "parse_confidence out of range" };
  }
  return { ok: true };
}

export const defaultValidator: Validator = { validate: validateObservation };
