// Demo patients — hardcoded seed for the demonstrator
// ---------------------------------------------------------------------------
// 10 test patients across the typologies the product must handle, with varying
// data completeness so the demo can show "more data → higher confidence".
// These feed the same engines as real users (via the Master Patient Record).
//
// In the demo UI: load any of these OR let the presenter enter a patient by
// hand — both paths produce the same record shape.

import {
  emptyRecord,
  type MasterPatientRecord,
  type TryingDuration,
  type TreatmentInterest,
  type Diagnosis,
  type DonorOpenness,
} from "@/modules/master-record/types";
import type { FamilyStructure } from "@/modules/regulatory";

export interface DemoPatientSeed {
  key: string;
  label: string; // one-line typology description for the demo picker
  data_level: "high" | "medium" | "low"; // how complete the profile is
  name: string;
  age: number;
  country: string;
  /** Drives the regulatory gate. Defaults to hetero_couple when unset. */
  family_structure?: FamilyStructure;
  trying_duration?: TryingDuration;
  treatment_interest?: TreatmentInterest;
  budget_eur?: number;
  donor_openness?: DonorOpenness;
  // clinical (may be absent → lower confidence)
  amh?: number;
  afc?: number;
  fsh?: number;
  diagnosis?: Diagnosis[];
  prior_ivf?: number;
  prior_iui?: number;
}

export const DEMO_PATIENTS: DemoPatientSeed[] = [
  {
    key: "ana_31_favorable",
    label: "31 · good prognosis, complete profile",
    data_level: "high",
    name: "Ana", age: 31, country: "ES", trying_duration: "6_12m",
    treatment_interest: "ivf", budget_eur: 6000,
    amh: 2.8, afc: 14, fsh: 6.5, diagnosis: ["unexplained"],
  },
  {
    key: "marta_38_reserva_baja",
    label: "38 · low reserve + endometriosis (complex case)",
    data_level: "high",
    name: "Marta", age: 38, country: "ES", trying_duration: "1_2y",
    treatment_interest: "unsure", budget_eur: 9000, donor_openness: "maybe",
    amh: 0.8, afc: 6, fsh: 11, diagnosis: ["low_ovarian_reserve", "endometriosis"], prior_iui: 1,
  },
  {
    key: "lucia_42_donante",
    label: "42 · very limited own eggs, considering donor",
    data_level: "high",
    name: "Lucía", age: 42, country: "ES", family_structure: "female_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 10000, donor_openness: "yes",
    amh: 0.4, afc: 4, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
  {
    key: "sofia_34_pocos_datos",
    label: "34 · barely any data (age and time only)",
    data_level: "low",
    name: "Sofía", age: 34, country: "ES", trying_duration: "6_12m",
  },
  {
    key: "carmen_29_sop",
    label: "29 · PCOS, irregular cycles, high reserve",
    data_level: "high",
    name: "Carmen", age: 29, country: "ES", trying_duration: "1_2y",
    treatment_interest: "ivf", budget_eur: 5000,
    amh: 5.2, afc: 22, diagnosis: ["pcos"],
  },
  {
    key: "elena_36_factor_masc",
    label: "36 · severe male factor → ICSI",
    data_level: "high",
    name: "Elena", age: 36, country: "ES", trying_duration: "1_2y",
    treatment_interest: "icsi", budget_eur: 7000,
    amh: 2.1, afc: 12, diagnosis: ["male_factor"],
  },
  {
    key: "paula_33_freezing",
    label: "33 · no partner, freezing (planning)",
    data_level: "medium",
    name: "Paula", age: 33, country: "ES", family_structure: "single_woman",
    treatment_interest: "social_freezing", budget_eur: 3500,
    amh: 1.9, afc: 10,
  },
  {
    key: "nadia_40_tubarico",
    label: "40 · tubal factor, 2 failed IVF",
    data_level: "high",
    name: "Nadia", age: 40, country: "ES", trying_duration: "over_2y",
    treatment_interest: "ivf", budget_eur: 8000, donor_openness: "maybe",
    amh: 1.0, afc: 7, diagnosis: ["tubal_factor"], prior_ivf: 2,
  },
  {
    key: "julia_27_minima",
    label: "27 · minimal profile (started, didn't finish)",
    data_level: "low",
    name: "Julia", age: 27, country: "ES", family_structure: "single_woman", treatment_interest: "ivf",
  },
  {
    key: "rosa_45_donante",
    label: "45 · very low reserve, donor route",
    data_level: "high",
    name: "Rosa", age: 45, country: "ES", family_structure: "female_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 11000, donor_openness: "yes",
    amh: 0.2, afc: 3, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
];

/** Build a Master Patient Record fragment from a demo seed. */
export function buildDemoRecord(seed: DemoPatientSeed): MasterPatientRecord {
  const r = emptyRecord();
  r.status = "anonymous";
  r.identity = { ...r.identity, age: seed.age, country_of_residence: seed.country };
  r.intent = {
    ...r.intent,
    trying_duration: seed.trying_duration,
    treatment_interest: seed.treatment_interest,
    budget_eur: seed.budget_eur,
    donor_openness: seed.donor_openness,
  };
  r.clinical = {
    ...r.clinical,
    amh: seed.amh,
    afc: seed.afc,
    fsh: seed.fsh,
    diagnosis: seed.diagnosis,
  };
  const hist = [];
  for (let i = 0; i < (seed.prior_ivf ?? 0); i++) hist.push({ id: `d_ivf_${i}`, treatment: "ivf", outcome: "none" as const });
  for (let i = 0; i < (seed.prior_iui ?? 0); i++) hist.push({ id: `d_iui_${i}`, treatment: "iui", outcome: "none" as const });
  r.history = hist;
  r.derived = { ...r.derived, completion_score: completeness(seed) };
  return r;
}

/** Rough profile-completeness score (0-100) — drives the confidence demo. */
export function completeness(seed: DemoPatientSeed): number {
  const fields = [
    seed.age != null,
    !!seed.trying_duration,
    !!seed.treatment_interest,
    seed.budget_eur != null,
    seed.amh != null,
    seed.afc != null,
    seed.fsh != null,
    !!(seed.diagnosis && seed.diagnosis.length),
    seed.prior_ivf != null || seed.prior_iui != null,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
