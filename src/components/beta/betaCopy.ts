import { FEATURES, type FeatureFlags } from "@/config/features";
import type { Language } from "@/i18n/translate";

/** Exact bilingual copy for the private-beta frame. */
export const BETA_COPY = {
  banner: {
    es: "Beta privada · estás probando una versión en pruebas",
    en: "Private beta · you're testing a work-in-progress version",
  },
  notActiveTitle: {
    es: "Todavía no está activo",
    en: "Not active yet",
  },
  notActive: {
    es: "En esta fase de pruebas esto todavía no se activa. Cuando lo esté, te pondremos en contacto con la clínica. De momento lo estamos probando.",
    en: "This isn't active yet during testing. When it is, we'll put you in touch with the clinic. For now we're still trying things out.",
  },
  close: { es: "Entendido", en: "Got it" },
} as const;

export const betaText = (key: keyof typeof BETA_COPY, language: Language) =>
  BETA_COPY[key][language === "es" ? "es" : "en"];

/** True when clinic contact/booking actions must show the "not active yet" notice instead of running. */
export const shouldInterceptClinicAction = (flags: Pick<FeatureFlags, "betaBanner"> = FEATURES) =>
  flags.betaBanner === true;
