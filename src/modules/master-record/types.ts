// Master Patient Record (MPR)
// ---------------------------------------------------------------------------
// The single canonical record every downstream engine reads — whether the data
// came from a real user filling their profile or a demo seed entered by a
// presenter. Sub-objects are always present (empty by default) so callers can
// spread-patch them without null checks.
//
// NOTE: this record uses its own snake_case vocabulary (e.g. "egg_donation"),
// distinct from the legacy `src/lib/engines` vocabulary ("Egg Donation"). It is
// the intended canonical layer; a mapping to the legacy engines can be added
// where they meet.

export type RecordStatus = "anonymous" | "identified" | "verified";

export type TryingDuration = "under_6m" | "6_12m" | "1_2y" | "over_2y" | "not_trying";

export type TreatmentInterest =
  | "ivf"
  | "icsi"
  | "egg_donation"
  | "social_freezing"
  | "iui"
  | "unsure";

export type DonorOpenness = "no" | "maybe" | "yes";

export type Diagnosis =
  | "unexplained"
  | "low_ovarian_reserve"
  | "endometriosis"
  | "pcos"
  | "male_factor"
  | "tubal_factor"
  | "other";

export type TreatmentOutcome = "none" | "miscarriage" | "live_birth" | "ongoing";

export interface Identity {
  age?: number;
  country_of_residence?: string;
}

export interface Intent {
  trying_duration?: TryingDuration;
  treatment_interest?: TreatmentInterest;
  budget_eur?: number;
  donor_openness?: DonorOpenness;
}

export interface Clinical {
  amh?: number;
  afc?: number;
  fsh?: number;
  diagnosis?: Diagnosis[];
}

export interface HistoryItem {
  id: string;
  treatment: string;
  outcome: TreatmentOutcome;
}

export interface Derived {
  /** Profile completeness 0–100, drives the confidence story. */
  completion_score?: number;
}

export interface MasterPatientRecord {
  status: RecordStatus;
  identity: Identity;
  intent: Intent;
  clinical: Clinical;
  history: HistoryItem[];
  derived: Derived;
}

/** A blank record with every sub-object present, ready to spread-patch. */
export function emptyRecord(): MasterPatientRecord {
  return {
    status: "anonymous",
    identity: {},
    intent: {},
    clinical: {},
    history: [],
    derived: {},
  };
}
