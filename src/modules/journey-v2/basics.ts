// "Lo básico" (journey v2 · step 2): the answers that focus the information,
// starting with who the information is for.
// Kept in the browser only (localStorage `fc:basics-v2`), never sent anywhere.
// The age is a band, never an exact age, so it is not copied into the case.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Localized } from "@/modules/content/types";
import type { TreatmentId } from "./treatments";

export type AgeBandV2 = "lt30" | "30-34" | "35-37" | "38-40" | "41-42" | "43plus";
/** Who the information is for. */
export type Who = "mujer" | "hombre" | "pareja" | "otra-persona";
/** "¿Qué te trae aquí?" */
export type Reason = "embarazo" | "preservar" | "masculina" | "donacion" | "en-tratamiento" | "tras-intento" | "entender";
/** "same" = where I live; "unsure" = not decided; otherwise a country code. */
export type Destination = "same" | "unsure" | string;
export type TreatmentChoice = TreatmentId | "unsure";

export interface Basics {
  who?: Who;
  residence?: string;
  destination?: Destination;
  age?: AgeBandV2;
  reason?: Reason;
  treatment?: TreatmentChoice;
  /** The treatment was preselected from "what brings you here", not tapped by the person. */
  treatmentFromReason?: boolean;
}

export const AGE_BANDS_V2: { id: AgeBandV2; label: Localized }[] = [
  { id: "lt30", label: { en: "Under 30", es: "<30" } },
  { id: "30-34", label: { en: "30–34", es: "30–34" } },
  { id: "35-37", label: { en: "35–37", es: "35–37" } },
  { id: "38-40", label: { en: "38–40", es: "38–40" } },
  { id: "41-42", label: { en: "41–42", es: "41–42" } },
  { id: "43plus", label: { en: "43+", es: "43+" } },
];

export const WHO_OPTIONS: { id: Who; label: Localized }[] = [
  { id: "mujer", label: { en: "For me (woman)", es: "Para mí (mujer)" } },
  { id: "hombre", label: { en: "For me (man)", es: "Para mí (hombre)" } },
  { id: "pareja", label: { en: "As a couple", es: "En pareja" } },
  { id: "otra-persona", label: { en: "For someone in my circle", es: "Para alguien de mi entorno" } },
];

/** Case goal used by the existing engines (intent.goal). */
export type ReasonGoal = "treatment" | "preserve" | "unsure";

/**
 * Each "what brings you here" answer mapped onto what already exists: the case
 * goal, and (only where an existing guide matches) a preselected treatment.
 * Male fertility has no treatment of its own: it switches on the male focus.
 */
export const REASONS: { id: Reason; label: Localized; goal: ReasonGoal; treatment?: TreatmentId; male?: true }[] = [
  { id: "embarazo", label: { en: "I'm seeking a pregnancy with the help of treatment", es: "Busco un embarazo con ayuda de un tratamiento" }, goal: "treatment" },
  { id: "preservar", label: { en: "Freeze eggs / preserve fertility", es: "Congelar óvulos / preservar" }, goal: "preserve", treatment: "preservacion" },
  { id: "masculina", label: { en: "Male fertility", es: "Fertilidad masculina" }, goal: "treatment", male: true },
  { id: "donacion", label: { en: "Donation (eggs / embryos)", es: "Donación (óvulos / embriones)" }, goal: "treatment", treatment: "ovodonacion" },
  { id: "en-tratamiento", label: { en: "I'm already in treatment", es: "Ya estoy en tratamiento" }, goal: "treatment" },
  { id: "tras-intento", label: { en: "After an attempt that didn't work", es: "Tras un intento fallido" }, goal: "treatment" },
  { id: "entender", label: { en: "I just want to understand", es: "Solo quiero entender" }, goal: "unsure" },
];

export const reasonById = (id?: Reason) => REASONS.find((r) => r.id === id);

/** Male content goes first when the information is for a man or about male fertility. */
export const maleFocus = (b: Pick<Basics, "who" | "reason">) => b.who === "hombre" || b.reason === "masculina";

/**
 * Picking a reason preselects its treatment, unless the person already chose one
 * themselves; a preselection is replaced (or cleared) when the reason changes.
 */
export function pickReason(b: Basics, reason: Reason): Partial<Basics> {
  const next = reasonById(reason)?.treatment;
  const own = b.treatment && !b.treatmentFromReason;
  if (own) return { reason };
  return next ? { reason, treatment: next, treatmentFromReason: true } : { reason, treatment: undefined, treatmentFromReason: false };
}

export const ageLabel = (id: AgeBandV2 | undefined, lang: "en" | "es") => {
  const b = AGE_BANDS_V2.find((x) => x.id === id);
  if (!b) return undefined;
  return lang === "es" ? `${b.label.es} años` : `${b.label.en}${b.id === "lt30" ? "" : " years"}`;
};
export const reasonLabel = (id: Reason | undefined, lang: "en" | "es") => reasonById(id)?.label[lang];
export const whoLabel = (id: Who | undefined, lang: "en" | "es") => WHO_OPTIONS.find((x) => x.id === id)?.label[lang];

/** Build A stored `stage`; carry each answer over to the matching reason. */
const STAGE_TO_REASON: Record<string, Reason> = {
  entendiendo: "entender", "en-tratamiento": "en-tratamiento", "tras-intento": "tras-intento",
  preservar: "preservar", donacion: "donacion", masculina: "masculina",
};
export function migrateBasics(persisted: unknown, version: number): Basics {
  const old = (persisted ?? {}) as Basics & { stage?: string };
  if (version >= 2) return old;
  const { stage, ...rest } = old;
  return stage && STAGE_TO_REASON[stage] ? { ...rest, reason: STAGE_TO_REASON[stage] } : rest;
}

/** Where prices and rules are shown for: the destination when one is chosen, otherwise where they live. */
export function treatmentCountry(b: Basics): string | undefined {
  if (b.destination && b.destination !== "same" && b.destination !== "unsure") return b.destination;
  return b.residence;
}

/** Destination different from residence (so both are shown). */
export function abroad(b: Basics): string | undefined {
  const t = treatmentCountry(b);
  return t && b.residence && t !== b.residence ? t : undefined;
}

interface BasicsState extends Basics {
  patch: (p: Partial<Basics>) => void;
  reset: () => void;
}

export const BASICS_KEY = "fc:basics-v2";

export const useBasics = create<BasicsState>()(
  persist(
    (set) => ({
      patch: (p) => set(p),
      reset: () => set({ who: undefined, residence: undefined, destination: undefined, age: undefined, reason: undefined, treatment: undefined, treatmentFromReason: undefined }),
    }),
    { name: BASICS_KEY, storage: createJSONStorage(() => localStorage), version: 2, migrate: (p, v) => migrateBasics(p, v) as BasicsState },
  ),
);
