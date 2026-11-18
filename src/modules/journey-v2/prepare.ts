// "Preparar mi tratamiento" (journey v2 · 4b): the five modules, each made of
// existing material only — subsections of the bilingual guides, the existing
// clinic page and the travel note from the guidance page. Parts with nothing
// to show are listed in `pending` and render as "en preparación".

import type { Localized } from "@/modules/content/types";
import type { DepthRef } from "./depth";
import type { TreatmentChoice } from "./basics";

export type PrepareStep = "preguntas" | "clinica" | "financiacion" | "viaje" | "despues" | "consulta" | "informe";
export const PREPARE_STEPS: PrepareStep[] = ["preguntas", "clinica", "financiacion", "viaje", "despues", "consulta", "informe"];

export const PREPARE_TITLES: Record<PrepareStep, Localized> = {
  preguntas: { en: "Tell us a little more", es: "Cuéntanos un poco más" },
  clinica: { en: "1 · The clinic", es: "1 · La clínica" },
  financiacion: { en: "2 · Financing", es: "2 · La financiación" },
  viaje: { en: "3 · Travel", es: "3 · El viaje" },
  despues: { en: "4 · Afterwards", es: "4 · El después" },
  consulta: { en: "5 · Your first consultation", es: "5 · Tu primera consulta" },
  informe: { en: "Your report", es: "Tu informe" },
};

type Group = "ivf-based" | "freezing" | "iui";
const groupOf = (t?: TreatmentChoice): Group => (t === "preservacion" ? "freezing" : t === "inseminacion" ? "iui" : "ivf-based");

const SECTIONS: Record<"clinica" | "financiacion" | "despues" | "consulta", Record<Group, DepthRef[]>> = {
  clinica: {
    "ivf-based": [{ slug: "patient-journey", heading: "Choosing a route" }],
    freezing: [{ slug: "how-egg-freezing-is-paid", heading: "Comparing prices fairly" }],
    iui: [{ slug: "patient-journey", heading: "Choosing a route" }],
  },
  financiacion: {
    "ivf-based": [
      { slug: "how-a-treatment-is-financed", heading: "Reading the small print" },
      { slug: "how-a-treatment-is-financed", heading: "Public health systems" },
      { slug: "how-a-treatment-is-financed", heading: "Planning your budget" },
    ],
    freezing: [
      { slug: "how-egg-freezing-is-paid", heading: "If you need more than one cycle" },
      { slug: "how-egg-freezing-is-paid", heading: "The future cost" },
      { slug: "how-a-treatment-is-financed", heading: "Planning your budget" },
    ],
    iui: [
      { slug: "how-a-treatment-is-financed", heading: "Public health systems" },
      { slug: "how-a-treatment-is-financed", heading: "Planning your budget" },
    ],
  },
  despues: {
    "ivf-based": [
      { slug: "ivf-step-by-step", heading: "Transfer and the wait" },
      { slug: "ivf-step-by-step", heading: "If it doesn't work" },
      { slug: "patient-journey", heading: "After the result" },
    ],
    freezing: [
      { slug: "egg-freezing-step-by-step", heading: "Using them later" },
      { slug: "freezing-journey", heading: "Years of storage" },
      { slug: "freezing-journey", heading: "When and if you use them" },
    ],
    iui: [{ slug: "patient-journey", heading: "After the result" }],
  },
  consulta: {
    "ivf-based": [
      { slug: "ivf-step-by-step", heading: "Before you start" },
      { slug: "patient-journey", heading: "The first steps" },
    ],
    freezing: [
      { slug: "egg-freezing-step-by-step", heading: "What to ask your clinic" },
      { slug: "freezing-journey", heading: "The first appointment" },
    ],
    iui: [{ slug: "patient-journey", heading: "The first steps" }],
  },
};

export const prepareSections = (step: keyof typeof SECTIONS, treatment?: TreatmentChoice): DepthRef[] => SECTIONS[step][groupOf(treatment)];

/** Full guide linked from each module. */
export const prepareGuide = (step: "financiacion" | "despues" | "consulta", treatment?: TreatmentChoice): string =>
  groupOf(treatment) === "freezing"
    ? { financiacion: "how-egg-freezing-is-paid", despues: "freezing-journey", consulta: "egg-freezing-step-by-step" }[step]
    : { financiacion: "how-a-treatment-is-financed", despues: groupOf(treatment) === "iui" ? "patient-journey" : "ivf-step-by-step", consulta: "patient-journey" }[step];

/** Parts of a module with no existing content yet; shown as "en preparación". */
export const PENDING: Partial<Record<PrepareStep, Localized[]>> = {
  despues: [{ en: "Physical recovery after each step", es: "La recuperación física después de cada paso" }],
  viaje: [{ en: "Practical travel and stay planning", es: "La planificación práctica del viaje y la estancia" }],
};
