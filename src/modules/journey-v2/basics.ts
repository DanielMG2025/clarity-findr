// "Lo básico" (journey v2 · step 2): the four answers that focus the information.
// Kept in the browser only (localStorage `fc:basics-v2`), never sent anywhere.
// The age is a band, never an exact age, so it is not copied into the case.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Localized } from "@/modules/content/types";
import type { TreatmentId } from "./treatments";

export type AgeBandV2 = "lt30" | "30-34" | "35-37" | "38-40" | "41-42" | "43plus";
export type Stage = "entendiendo" | "en-tratamiento" | "tras-intento" | "preservar" | "donacion" | "masculina";
/** "same" = where I live; "unsure" = not decided; otherwise a country code. */
export type Destination = "same" | "unsure" | string;
export type TreatmentChoice = TreatmentId | "unsure";

export interface Basics {
  residence?: string;
  destination?: Destination;
  age?: AgeBandV2;
  stage?: Stage;
  treatment?: TreatmentChoice;
}

export const AGE_BANDS_V2: { id: AgeBandV2; label: Localized }[] = [
  { id: "lt30", label: { en: "Under 30", es: "<30" } },
  { id: "30-34", label: { en: "30–34", es: "30–34" } },
  { id: "35-37", label: { en: "35–37", es: "35–37" } },
  { id: "38-40", label: { en: "38–40", es: "38–40" } },
  { id: "41-42", label: { en: "41–42", es: "41–42" } },
  { id: "43plus", label: { en: "43+", es: "43+" } },
];

export const STAGES: { id: Stage; label: Localized }[] = [
  { id: "entendiendo", label: { en: "Starting to understand", es: "Empezando a entender" } },
  { id: "en-tratamiento", label: { en: "Already in treatment", es: "Ya en tratamiento" } },
  { id: "tras-intento", label: { en: "After an attempt that didn't work", es: "Tras un intento fallido" } },
  { id: "preservar", label: { en: "I want to preserve my fertility", es: "Quiero preservar mi fertilidad" } },
  { id: "donacion", label: { en: "I'm considering donation", es: "Me planteo donación" } },
  { id: "masculina", label: { en: "Male fertility", es: "Fertilidad masculina" } },
];

export const ageLabel = (id: AgeBandV2 | undefined, lang: "en" | "es") => {
  const b = AGE_BANDS_V2.find((x) => x.id === id);
  if (!b) return undefined;
  return lang === "es" ? `${b.label.es} años` : `${b.label.en}${b.id === "lt30" ? "" : " years"}`;
};
export const stageLabel = (id: Stage | undefined, lang: "en" | "es") => STAGES.find((x) => x.id === id)?.label[lang];

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
      reset: () => set({ residence: undefined, destination: undefined, age: undefined, stage: undefined, treatment: undefined }),
    }),
    { name: BASICS_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
