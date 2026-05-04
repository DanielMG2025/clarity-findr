import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Base patient profile used by every module. The richer medical / preferences /
 * documents live in `@/modules/patient-profile/store`. This store keeps only
 * the baseline identity and intent — no journey/persona state.
 */

export type TryingDuration = "" | "<6m" | "6-12m" | "1-2y" | ">2y";
export type TreatmentInterest = "" | "ivf" | "icsi" | "freezing" | "donor" | "iui" | "study" | "unsure";

// Kept as a deprecated alias for backwards-compatibility with any leftover
// references; new code should not use it.
export type JourneyKind = never;

export interface ProfileState {
  age: number;
  trying: TryingDuration;
  treatment: TreatmentInterest;
  budget: number;
  country: string;
  amh?: number;
  diagnosis?: string;
  priorFailedCycles?: number;
  patch: (partial: Partial<Omit<ProfileState, "patch" | "reset">>) => void;
  reset: () => void;
}

const DEFAULTS = {
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
      patch: (partial) => set((s) => ({ ...s, ...partial })),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "fc:profile",
      storage: createJSONStorage(() => localStorage),
      version: 2,
    },
  ),
);
