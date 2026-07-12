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

// The MPR is the single superset store — it absorbs what the legacy profile /
// patient-profile / pricing stores used to hold, so nothing else needs them.

import type { FamilyStructure, RegulatoryOrientation } from "@/modules/regulatory";
export type { FamilyStructure };

export interface Identity {
  age?: number;
  country_of_residence?: string;
  /** Regulatory-gate input (with country). */
  family_structure?: FamilyStructure;
}

export interface Intent {
  trying_duration?: TryingDuration;
  treatment_interest?: TreatmentInterest;
  budget_eur?: number;
  donor_openness?: DonorOpenness;
  // preferences
  priority?: "cost" | "success" | "speed" | "balanced";
  travel?: "home_only" | "regional" | "europe" | "global";
  language?: string;
  pgt_interest?: boolean;
  // pricing add-ons
  needs_icsi?: boolean;
  needs_pgt?: boolean;
  needs_vitrification?: boolean;
  storage_years?: number;
}

export interface Clinical {
  amh?: number;
  afc?: number;
  fsh?: number;
  bmi_band?: "under" | "normal" | "over" | "obese";
  cycle_regularity?: "regular" | "irregular" | "absent";
  diagnosis?: Diagnosis[];
  partner_sperm_quality?: "normal" | "mild" | "severe" | "unknown";
}

export interface HistoryItem {
  id: string;
  treatment: string;
  outcome: TreatmentOutcome;
  year?: number;
  clinic?: string;
  notes?: string;
}

export interface ProfileDocument {
  id: string;
  name: string;
  category: "quote" | "lab" | "report" | "other";
  size?: number;
  added_at: string;
}

export interface SharedQuote {
  id: string;
  clinic_name: string;
  treatment_type: string;
  total_price: number;
  country?: string;
  added_at: string;
}

export interface Derived {
  /** Profile completeness 0–100, drives the confidence story. */
  completion_score?: number;
  /** Regulatory orientation result (step 2 legal half), cached for handoff. */
  orientation?: RegulatoryOrientation | null;
}

export interface MasterPatientRecord {
  status: RecordStatus;
  identity: Identity;
  intent: Intent;
  clinical: Clinical;
  history: HistoryItem[];
  documents: ProfileDocument[];
  shared_quotes: SharedQuote[];
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
    documents: [],
    shared_quotes: [],
    derived: {},
  };
}
