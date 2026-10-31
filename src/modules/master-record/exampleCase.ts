// Which example case (if any) is loaded into the live Master Patient Record.
// Presentation-only marker: it lets report pages frame the output as "what we'd
// suggest to this example patient" and offer the jump to the user's own data.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useMasterRecord } from "./store";
import { DEMO_PATIENTS, type DemoPatientSeed } from "./demoPatients";
import { loadDemoPatient } from "./loadDemo";

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

/** Load an example case into the live record and remember which one it is. */
export function openExampleCase(seed: DemoPatientSeed) {
  loadDemoPatient(seed);
  useExampleCaseStore.getState().setKey(seed.key);
}

/** Leave the example: clear the demo data so the user's own flow starts from the route question. */
export function startOwnCase() {
  useMasterRecord.getState().reset();
  useExampleCaseStore.getState().setKey(null);
}
