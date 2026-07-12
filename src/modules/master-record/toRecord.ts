// Map a demo seed onto the Master Patient Record. The seed already speaks the
// MPR's canonical vocabulary (treatment_interest, family_structure, diagnosis…),
// so this is almost a straight copy — country stays a code, no label translation.
// Pure mapper (no store access) so it can be unit-tested; the picker applies it.

import type { DemoPatientSeed } from "./demoPatients";
import type { Identity, Intent, Clinical, HistoryItem } from "./types";

export interface DemoRecordMapping {
  identity: Partial<Identity>;
  intent: Partial<Intent>;
  clinical: Partial<Clinical>;
  history: Array<Omit<HistoryItem, "id">>;
}

export function demoPatientToRecord(seed: DemoPatientSeed): DemoRecordMapping {
  const history: Array<Omit<HistoryItem, "id">> = [];
  for (let i = 0; i < (seed.prior_ivf ?? 0); i++) history.push({ treatment: "ivf", outcome: "none" });
  for (let i = 0; i < (seed.prior_iui ?? 0); i++) history.push({ treatment: "iui", outcome: "none" });

  return {
    identity: {
      name: seed.name,
      age: seed.age,
      country_of_residence: seed.country,
      family_structure: seed.family_structure,
    },
    intent: {
      treatment_interest: seed.treatment_interest,
      trying_duration: seed.trying_duration,
      budget_eur: seed.budget_eur,
      donor_openness: seed.donor_openness,
    },
    clinical: {
      amh: seed.amh,
      afc: seed.afc,
      fsh: seed.fsh,
      diagnosis: seed.diagnosis,
      partner_sperm_quality: (seed.diagnosis ?? []).includes("male_factor") ? "severe" : undefined,
    },
    history,
  };
}
