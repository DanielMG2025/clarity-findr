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
  type Goal,
} from "@/modules/master-record/types";
import type { FamilyStructure } from "@/modules/regulatory";

export interface DemoPatientSeed {
  key: string;
  label: string; // one-line typology description for the demo picker
  /** Spanish version of the label for the patient-facing Example cases page. */
  label_es?: string;
  /** Route this case illustrates; drives "find a case like me". */
  goal: Goal;
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
    label_es: "31 · buen pronóstico, perfil completo",
    goal: "treatment",
    data_level: "high",
    name: "Ana", age: 31, country: "ES", trying_duration: "6_12m",
    treatment_interest: "ivf", budget_eur: 6000,
    amh: 2.8, afc: 14, fsh: 6.5, diagnosis: ["unexplained"],
  },
  {
    key: "marta_38_reserva_baja",
    label: "38 · low reserve + endometriosis (complex case)",
    label_es: "38 · reserva baja + endometriosis (caso complejo)",
    goal: "treatment",
    data_level: "high",
    name: "Marta", age: 38, country: "ES", trying_duration: "1_2y",
    treatment_interest: "unsure", budget_eur: 9000, donor_openness: "maybe",
    amh: 0.8, afc: 6, fsh: 11, diagnosis: ["low_ovarian_reserve", "endometriosis"], prior_iui: 1,
  },
  {
    key: "lucia_42_donante",
    label: "42 · very limited own eggs, considering donor",
    label_es: "42 · muy pocos óvulos propios, valora donante",
    goal: "treatment",
    data_level: "high",
    name: "Lucía", age: 42, country: "ES", family_structure: "female_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 10000, donor_openness: "yes",
    amh: 0.4, afc: 4, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
  {
    key: "sofia_34_pocos_datos",
    label: "34 · barely any data (age and time only)",
    label_es: "34 · casi sin datos (solo edad y tiempo)",
    goal: "treatment",
    data_level: "low",
    name: "Sofía", age: 34, country: "ES", trying_duration: "6_12m",
  },
  {
    key: "carmen_29_sop",
    label: "29 · PCOS, irregular cycles, high reserve",
    label_es: "29 · SOP, ciclos irregulares, reserva alta",
    goal: "treatment",
    data_level: "high",
    name: "Carmen", age: 29, country: "ES", trying_duration: "1_2y",
    treatment_interest: "ivf", budget_eur: 5000,
    amh: 5.2, afc: 22, diagnosis: ["pcos"],
  },
  {
    key: "elena_36_factor_masc",
    label: "36 · severe male factor → ICSI",
    label_es: "36 · factor masculino severo → ICSI",
    goal: "treatment",
    data_level: "high",
    name: "Elena", age: 36, country: "ES", trying_duration: "1_2y",
    treatment_interest: "icsi", budget_eur: 7000,
    amh: 2.1, afc: 12, diagnosis: ["male_factor"],
  },
  {
    key: "paula_33_freezing",
    label: "33 · no partner, freezing (planning)",
    label_es: "33 · sin pareja, congelación (planificando)",
    goal: "preserve",
    data_level: "medium",
    name: "Paula", age: 33, country: "ES", family_structure: "single_woman",
    treatment_interest: "social_freezing", budget_eur: 3500,
    amh: 1.9, afc: 10,
  },
  {
    key: "nadia_40_tubarico",
    label: "40 · tubal factor, 2 failed IVF",
    label_es: "40 · factor tubárico, 2 FIV sin éxito",
    goal: "treatment",
    data_level: "high",
    name: "Nadia", age: 40, country: "ES", trying_duration: "over_2y",
    treatment_interest: "ivf", budget_eur: 8000, donor_openness: "maybe",
    amh: 1.0, afc: 7, diagnosis: ["tubal_factor"], prior_ivf: 2,
  },
  {
    key: "julia_27_minima",
    label: "27 · minimal profile (started, didn't finish)",
    label_es: "27 · perfil mínimo (empezó y no terminó)",
    goal: "treatment",
    data_level: "low",
    name: "Julia", age: 27, country: "ES", family_structure: "single_woman", treatment_interest: "ivf",
  },
  {
    key: "rosa_45_donante",
    label: "45 · very low reserve, donor route",
    label_es: "45 · reserva muy baja, vía donante",
    goal: "treatment",
    data_level: "high",
    name: "Rosa", age: 45, country: "ES", family_structure: "female_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 11000, donor_openness: "yes",
    amh: 0.2, afc: 3, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
  {
    key: "giulia_34_italy_single",
    label: "34 · single woman in Italy (blocked at home)",
    label_es: "34 · mujer sola en Italia (sin acceso en casa)",
    goal: "treatment",
    data_level: "medium",
    name: "Giulia", age: 34, country: "IT", family_structure: "single_woman", trying_duration: "1_2y",
    treatment_interest: "ivf", budget_eur: 6000,
    amh: 1.8, afc: 11,
  },
  {
    key: "chiara_35_italy_female_couple",
    label: "35 · female couple in Italy (no access at home)",
    label_es: "35 · pareja de mujeres en Italia (sin acceso en casa)",
    goal: "treatment",
    data_level: "medium",
    name: "Chiara & Giorgia", age: 35, country: "IT", family_structure: "female_couple", trying_duration: "1_2y",
    treatment_interest: "ivf", budget_eur: 7000,
    amh: 2.2, afc: 13,
  },
  {
    key: "lena_39_germany_donor",
    label: "39 · egg donation needed in Germany (prohibited)",
    label_es: "39 · necesita ovodonación en Alemania (prohibida)",
    goal: "treatment",
    data_level: "high",
    name: "Lena", age: 39, country: "DE", family_structure: "hetero_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 9000, donor_openness: "yes",
    amh: 0.5, afc: 5, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
  // Fertility-preservation (egg freezing) cases — single women / planners.
  {
    key: "irene_30_preserve_high",
    label: "30 · planning ahead, freezing eggs, complete profile",
    label_es: "30 · planificando, congelar óvulos, perfil completo",
    goal: "preserve",
    data_level: "high",
    name: "Irene", age: 30, country: "ES", family_structure: "single_woman", trying_duration: "not_trying",
    treatment_interest: "social_freezing", budget_eur: 4000,
    amh: 3.1, afc: 16, fsh: 6.2, diagnosis: ["unexplained"], prior_ivf: 0,
  },
  {
    key: "claudia_34_preserve_medium",
    label: "34 · single, freezing eggs, partial results",
    label_es: "34 · sola, congelar óvulos, resultados parciales",
    goal: "preserve",
    data_level: "medium",
    name: "Claudia", age: 34, country: "ES", family_structure: "single_woman", trying_duration: "not_trying",
    treatment_interest: "social_freezing", budget_eur: 3500,
    amh: 1.6,
  },
  {
    key: "beatriz_38_preserve_low",
    label: "38 · thinking about freezing, barely any data",
    label_es: "38 · pensando en congelar, casi sin datos",
    goal: "preserve",
    data_level: "low",
    name: "Beatriz", age: 38, country: "ES", family_structure: "single_woman",
    treatment_interest: "social_freezing",
  },
];

/** Build a Master Patient Record fragment from a demo seed. */
export function buildDemoRecord(seed: DemoPatientSeed): MasterPatientRecord {
  const r = emptyRecord();
  r.status = "anonymous";
  r.identity = { ...r.identity, age: seed.age, country_of_residence: seed.country };
  r.intent = {
    ...r.intent,
    goal: seed.goal,
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
