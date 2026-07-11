// Map a demo seed onto the app's live stores (profile + patient-profile), so a
// demo patient drives the SAME engines a real user would. Pure mapper (no store
// access) so it can be unit-tested; the picker applies the result.

import type { ProfileState, TreatmentInterest, TryingDuration } from "@/modules/profile/store";
import type {
  MedicalContext,
  ProfilePreferences,
  TreatmentHistoryItem,
} from "@/modules/patient-profile/store";
import type { DemoPatientSeed } from "./demoPatients";

const COUNTRY_LABEL: Record<string, string> = {
  ES: "Spain",
  CZ: "Czech Republic",
  GR: "Greece",
  PT: "Portugal",
  DK: "Denmark",
  CY: "Cyprus",
};

const TREATMENT: Record<string, TreatmentInterest> = {
  ivf: "ivf",
  icsi: "icsi",
  egg_donation: "donor",
  social_freezing: "freezing",
  iui: "iui",
  unsure: "unsure",
};

const TRYING: Record<string, TryingDuration> = {
  under_6m: "<6m",
  "6_12m": "6-12m",
  "1_2y": "1-2y",
  over_2y: ">2y",
  not_trying: "",
};

const DX_LABEL: Record<string, string> = {
  unexplained: "Unexplained",
  low_ovarian_reserve: "Low ovarian reserve",
  endometriosis: "Endometriosis",
  pcos: "PCOS",
  male_factor: "Male factor",
  tubal_factor: "Tubal factor",
  other: "Other",
};

export interface DemoStoreMapping {
  profile: Partial<ProfileState>;
  medical: Partial<MedicalContext>;
  preferences: Partial<ProfilePreferences>;
  history: Array<Omit<TreatmentHistoryItem, "id">>;
}

export function demoPatientMapping(seed: DemoPatientSeed): DemoStoreMapping {
  const diagnoses = (seed.diagnosis ?? []).map((d) => DX_LABEL[d] ?? d);
  const priorFailed = (seed.prior_ivf ?? 0) + (seed.prior_iui ?? 0);

  const history: Array<Omit<TreatmentHistoryItem, "id">> = [];
  for (let i = 0; i < (seed.prior_ivf ?? 0); i++) history.push({ treatment: "ivf", outcome: "none" });
  for (let i = 0; i < (seed.prior_iui ?? 0); i++) history.push({ treatment: "iui", outcome: "none" });

  return {
    profile: {
      age: seed.age,
      country: COUNTRY_LABEL[seed.country] ?? seed.country,
      treatment: seed.treatment_interest ? TREATMENT[seed.treatment_interest] ?? "" : "",
      trying: seed.trying_duration ? TRYING[seed.trying_duration] ?? "" : "",
      budget: seed.budget_eur ?? 8000,
      amh: seed.amh,
      diagnosis: diagnoses.join(", ") || undefined,
      priorFailedCycles: priorFailed,
    },
    medical: {
      amh: seed.amh,
      fsh: seed.fsh,
      afc: seed.afc,
      diagnosis: diagnoses.length ? diagnoses : undefined,
      partner_sperm_quality: (seed.diagnosis ?? []).includes("male_factor") ? "severe" : undefined,
    },
    preferences: {
      donor_openness: seed.donor_openness,
    },
    history,
  };
}
