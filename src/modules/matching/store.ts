import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ShortlistedClinic {
  id: string;
  name: string;
  city?: string | null;
  country: string;
  estimatedPrice: number;
  matchScore: number;
}

export interface MatchingState {
  shortlist: ShortlistedClinic[];
  /** Weights the user explicitly tweaked (0-100 each, will be normalized). */
  weights: { clinical: number; value: number; distance: number };
  add: (clinic: ShortlistedClinic) => void;
  remove: (id: string) => void;
  clear: () => void;
  setWeights: (w: Partial<MatchingState["weights"]>) => void;
}

const DEFAULTS = {
  shortlist: [] as ShortlistedClinic[],
  weights: { clinical: 50, value: 30, distance: 20 },
};

export const useMatchingStore = create<MatchingState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      add: (clinic) =>
        set((s) =>
          s.shortlist.find((c) => c.id === clinic.id)
            ? s
            : { ...s, shortlist: [...s.shortlist, clinic] },
        ),
      remove: (id) => set((s) => ({ ...s, shortlist: s.shortlist.filter((c) => c.id !== id) })),
      clear: () => set({ ...DEFAULTS }),
      setWeights: (w) => set((s) => ({ ...s, weights: { ...s.weights, ...w } })),
    }),
    {
      name: "fc:matching",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
