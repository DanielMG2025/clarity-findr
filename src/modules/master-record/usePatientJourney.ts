// usePatientJourney — the SAME golden-path engine the demo uses (computeJourney),
// but fed live from the Master Patient Record instead of a demo seed.
// Both AdminDemoRun (via runDemo) and the patient pages (via this hook) share one
// source of truth. No duplicated journey logic.

import { useMemo } from "react";
import { useMasterRecord } from "./store";
import { computeJourney, type Journey, type JourneyInput } from "./runDemo";
import type { MasterPatientRecord } from "./types";

/** Project the MPR onto the normalized shape the journey engine consumes. */
export function mprToJourneyInput(mpr: MasterPatientRecord): JourneyInput {
  const priorIvf = mpr.history.filter((h) => /ivf|icsi/i.test(h.treatment)).length;
  const priorIui = mpr.history.filter((h) => /iui|insemin/i.test(h.treatment)).length;
  return {
    name: mpr.identity.name || undefined,
    age: mpr.identity.age,
    amh: mpr.clinical.amh,
    afc: mpr.clinical.afc,
    fsh: mpr.clinical.fsh,
    diagnosis: mpr.clinical.diagnosis,
    prior_ivf: priorIvf,
    prior_iui: priorIui,
    treatment_interest: mpr.intent.treatment_interest,
    family_structure: mpr.identity.family_structure,
    country: mpr.identity.country_of_residence,
  };
}

/**
 * Completeness of the MPR for journey confidence (0-100). Kept independent of the
 * patient-profile module to avoid a module cycle (master-record must not import it).
 */
export function mprJourneyCompleteness(mpr: MasterPatientRecord): number {
  const fields = [
    mpr.identity.age,
    mpr.identity.country_of_residence,
    mpr.identity.family_structure,
    mpr.intent.treatment_interest,
    mpr.clinical.amh,
    mpr.clinical.afc,
    mpr.clinical.fsh,
    mpr.clinical.diagnosis?.length,
  ];
  const filled = fields.filter((x) => x !== undefined && x !== null && x !== 0 && x !== "").length;
  return Math.round((filled / fields.length) * 100);
}

/** Live patient journey derived from the Master Patient Record. */
export function usePatientJourney(marketCode = "ES"): Journey {
  const mpr = useMasterRecord();
  return useMemo(
    () => computeJourney(mprToJourneyInput(mpr), mprJourneyCompleteness(mpr), marketCode),
    [mpr, marketCode],
  );
}
