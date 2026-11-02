/**
 * Canonical centres layer — the shared "opacity" vocabulary.
 *
 * Expresses our existing `clinics` table in the canonical Centre shape used
 * by the sibling aesthetic project (whose DB has centres + practitioners),
 * through a PURE adapter: row in → canonical record out, no I/O.
 *
 * 1. clinics' PRICING fields (base_price_*, medication_estimate,
 *    extras_estimate, total_estimated_price) are NOT carried here — they
 *    belong to the canonical pricing layer (./pricing.ts).
 * 2. clinics' `rating_score` and `success_rate_estimate` are DELIBERATELY
 *    NOT carried — the canonical model has no scores or rankings (the
 *    opacity thesis; the sibling's centres has no such column).
 * 3. `Practitioner` is defined for vocabulary parity but has no clinics
 *    source yet — a seam for later.
 * 4. The database is unchanged and existing consumers are untouched.
 */

export type Verification = "verified" | "unverified" | "pending";

export interface Centre {
  id: string;
  name: string;
  city: string | null;
  jurisdiction: string | null; // from clinics.country
  registration_number: string | null;
  authorised_units: string[]; // from clinics.treatments_available
  verification: Verification;
  verified_at: string | null;
  source_url: string | null;
  note: string | null;
}

/** Canonical vocabulary; no clinics source maps to it yet (seam). */
export interface Practitioner {
  id: string;
  name: string;
  jurisdiction: string | null;
  register_name: string | null;
  register_id: string | null;
  official_specialty: string | null;
  verification: Verification;
  verified_at: string | null;
  source_url: string | null;
  note: string | null;
}

/* ---------- Row input type (mirrors existing clinics columns) ---------- */

export interface ClinicRow {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  treatments_available: string[] | null;
  base_price_ivf: number | null;
  base_price_egg_donation: number | null;
  base_price_freezing: number | null;
  medication_estimate: number | null;
  extras_estimate: number | null;
  total_estimated_price: number | null;
  success_rate_estimate: number | null;
  rating_score: number | null;
  created_at: string;
  tier: string | null;
}

export function clinicToCentre(row: ClinicRow): Centre {
  return {
    id: row.id,
    name: row.name,
    city: row.city ?? null,
    jurisdiction: row.country ?? null,
    registration_number: null, // clinics carries no official registration
    authorised_units: row.treatments_available ?? [],
    verification: "unverified", // no verification source in clinics
    verified_at: null,
    source_url: null,
    note: row.tier ? `tier=${row.tier}` : null,
  };
}
