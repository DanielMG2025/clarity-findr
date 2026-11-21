// Treatments in journey v2, each linked ONLY to content that already exists:
// guide slugs (education library), seed price key, evidence findings (science.ts),
// pills (by id) and the case's treatment_interest. A null link renders
// "en preparación" and its block is omitted; nothing is ever filled in.

import type { Localized } from "@/modules/content/types";
import type { TreatmentInterest } from "@/modules/master-record/types";
import type { SeedTreatment } from "@/modules/provenance/seedPrices";

export type TreatmentId = "fiv" | "icsi" | "inseminacion" | "ovodonacion" | "preservacion" | "adopcion-embriones" | "fertilidad-masculina";

/** How "Qué cambia a tu edad" is sourced: the HFEA age table, or one finding's own text. */
export type AgeSource = { kind: "hfea-table" } | { kind: "finding"; id: string };

export interface TreatmentV2 {
  id: TreatmentId;
  label: Localized;
  /** Glossary/treatment article whose summary is "Qué es". */
  what: string | null;
  /** Articles whose FAQs, tags and sources feed the deeper layer, in order. */
  guides: string[];
  price: SeedTreatment | null;
  age: AgeSource | null;
  /** science.ts finding ids shown as evidence inside the FAQ block. */
  findings: string[];
  /** HFEA add-ons apply to IVF-based cycles only. */
  addons: boolean;
  pills: string[];
  interest: TreatmentInterest | null;
  /** false = a guide page only, not offered in "¿Sabes qué tratamiento te interesa?". */
  picker?: false;
}

export const TREATMENTS_V2: TreatmentV2[] = [
  { id: "fiv", label: { en: "IVF", es: "FIV" }, what: "what-is-ivf", guides: ["what-is-ivf", "ivf-step-by-step"], price: "ivf", age: { kind: "hfea-table" }, findings: ["acumulada", "eset", "amh", "estilo"], addons: true, pills: ["spain-1-in-10", "uk-1-in-32", "amh-myth"], interest: "ivf" },
  { id: "icsi", label: { en: "ICSI", es: "ICSI" }, what: "what-is-icsi", guides: ["what-is-icsi", "ivf-step-by-step"], price: null, age: { kind: "hfea-table" }, findings: ["icsi", "acumulada", "eset"], addons: true, pills: ["seminogram", "sperm-debate"], interest: "icsi" },
  { id: "inseminacion", label: { en: "Insemination (IUI)", es: "Inseminación" }, what: "what-is-iui", guides: ["what-is-iui"], price: null, age: null, findings: ["estilo"], addons: false, pills: ["seminogram"], interest: "iui" },
  { id: "ovodonacion", label: { en: "Egg donation", es: "Ovodonación" }, what: "what-is-egg-donation", guides: ["what-is-egg-donation", "anonymous-donation"], price: "donor", age: { kind: "finding", id: "donante" }, findings: ["acumulada", "eset"], addons: true, pills: [], interest: "egg_donation" },
  { id: "preservacion", label: { en: "Fertility preservation", es: "Preservación" }, what: "egg-freezing-step-by-step", guides: ["egg-freezing-step-by-step", "what-is-vitrification", "freezing-journey", "how-egg-freezing-is-paid"], price: "freezing", age: { kind: "finding", id: "congelacion" }, findings: ["amh"], addons: false, pills: ["freeze-age", "amh-myth"], interest: "social_freezing" },
  { id: "adopcion-embriones", label: { en: "Embryo adoption", es: "Adopción de embriones" }, what: null, guides: [], price: null, age: null, findings: [], addons: false, pills: [], interest: null },
  // No male-fertility guide exists yet: the page says so and gathers the male content that does exist.
  { id: "fertilidad-masculina", label: { en: "Male fertility", es: "Fertilidad masculina" }, what: null, guides: ["what-is-icsi"], price: null, age: null, findings: ["icsi"], addons: false, pills: ["seminogram", "sperm-debate"], interest: null, picker: false },
];

/** Treatments offered in the basics picker. */
export const PICKER_TREATMENTS = TREATMENTS_V2.filter((t) => t.picker !== false);
export const MALE_GUIDE_ID: TreatmentId = "fertilidad-masculina";

export const treatmentById = (id?: string | null) => TREATMENTS_V2.find((t) => t.id === id);
