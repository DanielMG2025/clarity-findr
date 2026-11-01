// Which example case (if any) is loaded into the live Master Patient Record.
// Presentation-only marker: it lets report pages frame the output as "what we'd
// suggest to this example patient" and offer the jump to the user's own data.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useMasterRecord } from "./store";
import { DEMO_PATIENTS, type DemoPatientSeed } from "./demoPatients";
import { loadDemoPatient } from "./loadDemo";
import { emptyRecord, type MasterPatientRecord } from "./types";

interface ExampleCaseState {
  key: string | null;
  setKey: (key: string | null) => void;
}

export const useExampleCaseStore = create<ExampleCaseState>()(
  persist((set) => ({ key: null, setKey: (key) => set({ key }) }), {
    name: "fc:example-case",
    storage: createJSONStorage(() => localStorage),
  }),
);

/** The example case still on screen, or null once the record no longer matches it. */
export function activeExampleCase(key: string | null, recordName: string | undefined): DemoPatientSeed | null {
  if (!key) return null;
  const seed = DEMO_PATIENTS.find((p) => p.key === key);
  return seed && seed.name === recordName ? seed : null;
}

export function useActiveExampleCase(): DemoPatientSeed | null {
  const key = useExampleCaseStore((s) => s.key);
  const name = useMasterRecord((s) => s.identity.name);
  return activeExampleCase(key, name);
}

/**
 * The user's OWN record, parked while an example case occupies the live record.
 * Example viewing never overwrites it; /situacion restores it on entry, so the
 * personal flow only ever shows what the user entered (or nothing).
 */
interface OwnRecordState {
  saved: MasterPatientRecord | null;
  setSaved: (saved: MasterPatientRecord | null) => void;
}

export const useOwnRecordStore = create<OwnRecordState>()(
  persist((set) => ({ saved: null, setSaved: (saved) => set({ saved }) }), {
    name: "fc:mpr-own",
    storage: createJSONStorage(() => localStorage),
  }),
);

function snapshotLiveRecord(): MasterPatientRecord {
  const s = useMasterRecord.getState();
  const out = emptyRecord();
  for (const k of Object.keys(out) as (keyof MasterPatientRecord)[]) {
    (out as unknown as Record<string, unknown>)[k] = structuredClone(s[k]);
  }
  return out;
}

/** Load an example case into the live record, parking the user's own data first. */
export function openExampleCase(seed: DemoPatientSeed) {
  // Only snapshot when leaving the user's own data — switching between examples keeps the original snapshot.
  if (!useExampleCaseStore.getState().key) useOwnRecordStore.getState().setSaved(snapshotLiveRecord());
  loadDemoPatient(seed);
  useExampleCaseStore.getState().setKey(seed.key);
}

/** Close any example and put the user's own data (or an empty record) back. Idempotent. */
export function restoreOwnCase() {
  if (!useExampleCaseStore.getState().key) return;
  const saved = useOwnRecordStore.getState().saved;
  useMasterRecord.setState({ ...emptyRecord(), ...(saved ?? {}) });
  useOwnRecordStore.getState().setSaved(null);
  useExampleCaseStore.getState().setKey(null);
}

/** Leave the example: start the user's own flow empty, from the route question. */
export function startOwnCase() {
  useMasterRecord.getState().reset();
  useOwnRecordStore.getState().setSaved(null);
  useExampleCaseStore.getState().setKey(null);
}
