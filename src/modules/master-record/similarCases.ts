// "Find a case like me" — pick the example cases closest to a visitor's quick inputs.
// Pure helper (no store access) so the matching rule is unit-tested.

import type { DemoPatientSeed } from "./demoPatients";
import type { FamilyStructure, Goal } from "./types";

export type AgeBand = "under_32" | "32_35" | "36_39" | "40_plus";

/** Representative age for each band (used for "nearest age"). */
export const AGE_BAND_MID: Record<AgeBand, number> = { under_32: 29, "32_35": 34, "36_39": 38, "40_plus": 42 };

export interface SimilarQuery {
  goal: Exclude<Goal, "unsure">;
  ageBand: AgeBand;
  family?: FamilyStructure;
}

/** Same route only; then family match (if given), then nearest age, then more data first. */
export function findSimilarCases(cases: DemoPatientSeed[], q: SimilarQuery, limit = 3): DemoPatientSeed[] {
  const mid = AGE_BAND_MID[q.ageBand];
  const dataRank = { high: 0, medium: 1, low: 2 } as const;
  return cases
    .filter((c) => c.goal === q.goal)
    .map((c) => ({
      c,
      family: q.family && (c.family_structure ?? "hetero_couple") !== q.family ? 1 : 0,
      age: Math.abs(c.age - mid),
    }))
    .sort((a, b) => a.family - b.family || a.age - b.age || dataRank[a.c.data_level] - dataRank[b.c.data_level])
    .slice(0, limit)
    .map((x) => x.c);
}
