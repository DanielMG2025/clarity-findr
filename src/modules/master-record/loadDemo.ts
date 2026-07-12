// Shared imperative loader: replace the live Master Patient Record with a demo
// seed. Used by both the public Demo Room (/demo) and the admin DemoPatientPicker
// so there's ONE place that knows how a seed becomes the live record.

import { useMasterRecord } from "./store";
import { demoPatientToRecord } from "./toRecord";
import type { DemoPatientSeed } from "./demoPatients";

/** Reset the MPR and load a demo patient into it. Safe to call from event handlers. */
export function loadDemoPatient(seed: DemoPatientSeed) {
  const m = demoPatientToRecord(seed);
  const mpr = useMasterRecord.getState();
  mpr.reset();
  mpr.patchIdentity(m.identity);
  mpr.patchIntent(m.intent);
  mpr.patchClinical(m.clinical);
  for (const h of m.history) mpr.addHistory(h);
}
