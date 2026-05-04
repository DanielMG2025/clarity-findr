import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ScenarioKey, PricingProfile } from "@/modules/pricing-configurator/logic/types";

export interface PricingState {
  /** Last computed profile snapshot (for cross-page handoff). */
  lastProfile: PricingProfile | null;
  selectedScenario: ScenarioKey;
  needs_icsi: boolean;
  needs_pgt: boolean;
  needs_vitrification: boolean;
  storage_years: number;
  setScenario: (s: ScenarioKey) => void;
  patch: (partial: Partial<Omit<PricingState, "patch" | "reset" | "setScenario">>) => void;
  reset: () => void;
}

const DEFAULTS = {
  lastProfile: null as PricingProfile | null,
  selectedScenario: "premium" as ScenarioKey,
  needs_icsi: false,
  needs_pgt: false,
  needs_vitrification: true,
  storage_years: 1,
};

export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setScenario: (selectedScenario) => set({ selectedScenario }),
      patch: (partial) => set((s) => ({ ...s, ...partial })),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "fc:pricing",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
