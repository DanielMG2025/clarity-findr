import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TryingDuration = "" | "<6m" | "6-12m" | "1-2y" | ">2y";
export type TreatmentInterest = "" | "ivf" | "icsi" | "freezing" | "donor" | "iui" | "study" | "unsure";
export type JourneyKind = "explorer" | "navigator" | "expert" | "donor" | "freezing";

export interface ProfileState {
  /** Which patient journey the user picked (drives UI tone & order). */
  journey: JourneyKind | null;
  age: number;
  trying: TryingDuration;
  treatment: TreatmentInterest;
  budget: number;
  country: string;
  amh?: number;
  diagnosis?: string;
  priorFailedCycles?: number;
  setJourney: (j: JourneyKind | null) => void;
  patch: (partial: Partial<Omit<ProfileState, "patch" | "reset" | "setJourney">>) => void;
  reset: () => void;
}

const DEFAULTS = {
  journey: null as JourneyKind | null,
  age: 32,
  trying: "" as TryingDuration,
  treatment: "" as TreatmentInterest,
  budget: 8000,
  country: "Spain",
  amh: undefined as number | undefined,
  diagnosis: undefined as string | undefined,
  priorFailedCycles: 0,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setJourney: (journey) => set({ journey }),
      patch: (partial) => set((s) => ({ ...s, ...partial })),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "fc:profile",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
