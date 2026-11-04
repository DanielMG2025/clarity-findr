// Curated, presentation-only tags for the Example cases browser (/demo).
// ---------------------------------------------------------------------------
// Additive layer over DEMO_PATIENTS: engines and clinical fields never read
// these. Each seed carries its tags literally; `deriveExampleTags` states the
// rule they follow so a test keeps the two in sync.

import type { Language } from "@/i18n/translate";
import type { FamilyStructure } from "@/modules/regulatory";
import type { DemoPatientSeed } from "./demoPatients";
import type { AgeBand } from "./similarCases";

export const TREATMENT_TAGS = ["own_ivf", "donation", "iui", "freezing"] as const;
export type TreatmentTag = (typeof TREATMENT_TAGS)[number];

export const SITUATION_TAGS = ["low_reserve", "endometriosis", "male_factor", "tubal_factor", "unexplained", "ropa_surrogacy", "cross_border"] as const;
export type SituationTag = (typeof SITUATION_TAGS)[number];

export const TREATMENT_TAG_LABEL: Record<TreatmentTag, Record<Language, string>> = {
  own_ivf: { en: "IVF with own eggs", es: "FIV con óvulos propios" },
  donation: { en: "Egg donation", es: "Ovodonación" },
  iui: { en: "Insemination (IUI)", es: "Inseminación" },
  freezing: { en: "Egg freezing", es: "Congelación de óvulos" },
};

export const SITUATION_TAG_LABEL: Record<SituationTag, Record<Language, string>> = {
  cross_border: { en: "Treatment not allowed in my country", es: "El tratamiento no está permitido en mi país" },
  low_reserve: { en: "Low ovarian reserve", es: "Reserva ovárica baja" },
  male_factor: { en: "Male factor", es: "Factor masculino" },
  endometriosis: { en: "Endometriosis", es: "Endometriosis" },
  tubal_factor: { en: "Tubal factor", es: "Factor tubárico" },
  unexplained: { en: "No clear cause", es: "Sin causa aparente" },
  ropa_surrogacy: { en: "ROPA or surrogacy", es: "ROPA o gestación subrogada" },
};

/** Explicit curated lists (not derivable from clinical fields). */
export const ROPA_SURROGACY_KEYS = ["laura_sara_33_ropa", "chiara_35_italy_female_couple", "james_oliver_38_uk", "tomas_41_single_man"];
export const CROSS_BORDER_KEYS = [
  "giulia_34_italy_single", "chiara_35_italy_female_couple", "lena_39_germany_donor", "hannah_36_switzerland_single",
  "anna_37_poland_single", "eleni_daphne_32_greece", "klara_35_germany_preserve", "tomas_41_single_man",
];

/** The rule the literal seed tags follow. */
export function deriveExampleTags(p: Pick<DemoPatientSeed, "key" | "treatment_interest" | "diagnosis">): { treatment_tag?: TreatmentTag; situation_tags: SituationTag[] } {
  const ropa = ROPA_SURROGACY_KEYS.includes(p.key);
  const ti = p.treatment_interest;
  let treatment_tag: TreatmentTag | undefined;
  if ((ti === "ivf" || ti === "icsi") && !ropa) treatment_tag = "own_ivf";
  else if (ti === "egg_donation") treatment_tag = "donation";
  else if (ti === "iui") treatment_tag = "iui";
  else if (ti === "social_freezing") treatment_tag = "freezing";

  const dx = p.diagnosis ?? [];
  const s: SituationTag[] = [];
  if (dx.includes("low_ovarian_reserve")) s.push("low_reserve");
  if (dx.includes("endometriosis")) s.push("endometriosis");
  if (dx.includes("male_factor")) s.push("male_factor");
  if (dx.includes("tubal_factor")) s.push("tubal_factor");
  if (dx.includes("unexplained") || dx.includes("other")) s.push("unexplained");
  if (ropa) s.push("ropa_surrogacy");
  if (CROSS_BORDER_KEYS.includes(p.key)) s.push("cross_border");
  return { treatment_tag, situation_tags: s };
}

// --- Filtering ---------------------------------------------------------------

/** Treatment chips: the four treatment tags plus ROPA/surrogacy (a situation tag). */
export type TreatmentFilter = TreatmentTag | "ropa_surrogacy";
export type GeoFilter = "spain" | "rest_of_europe";

export interface ExampleCaseFilters {
  situation?: SituationTag | null;
  treatment?: TreatmentFilter | null;
  geo?: GeoFilter | null;
  ageBand?: AgeBand | null;
  family?: FamilyStructure | null;
}

export function ageBandOf(age: number): AgeBand {
  if (age < 32) return "under_32";
  if (age <= 35) return "32_35";
  if (age <= 39) return "36_39";
  return "40_plus";
}

/** Every set filter must match (AND across groups); unset filters are ignored. */
export function filterExampleCases(cases: DemoPatientSeed[], f: ExampleCaseFilters): DemoPatientSeed[] {
  return cases.filter((c) => {
    const tags = c.situation_tags ?? [];
    if (f.situation && !tags.includes(f.situation)) return false;
    if (f.treatment) {
      if (f.treatment === "ropa_surrogacy" ? !tags.includes("ropa_surrogacy") : c.treatment_tag !== f.treatment) return false;
    }
    if (f.geo === "spain" && c.country !== "ES") return false;
    if (f.geo === "rest_of_europe" && c.country === "ES") return false;
    if (f.ageBand && ageBandOf(c.age) !== f.ageBand) return false;
    if (f.family && (c.family_structure ?? "hetero_couple") !== f.family) return false;
    return true;
  });
}

export function activeFilterCount(f: ExampleCaseFilters): number {
  return [f.situation, f.treatment, f.geo, f.ageBand, f.family].filter(Boolean).length;
}
