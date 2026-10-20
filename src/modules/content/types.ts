export type Audience = "planners" | "first-steps" | "experienced" | "men" | "lgbt";
export type Mold = "stat" | "myth" | "deep-dive" | "market" | "curiosity" | "glossary" | "pick";
export type Localized = { en: string; es: string };

export interface Pill {
  id: string;
  date: string;
  audiences: Audience[];
  mold: Mold;
  title: Localized;
  body: Localized;
  source: { name: string; url?: string; date?: string; confidence: "high" | "medium" | "low"; note?: Localized };
}

export interface Resource {
  id: string;
  name: string;
  handle?: string;
  url: string;
  platform: string;
  audiences: Audience[];
  blurb: Localized;
  affiliation: Localized;
}

export const AUDIENCE_LABEL: Record<Audience, Localized> = {
  planners: { en: "Planners", es: "Planificadoras" },
  "first-steps": { en: "First steps", es: "Primeros pasos" },
  experienced: { en: "Experienced", es: "Con experiencia" },
  men: { en: "Men", es: "Hombres" },
  lgbt: { en: "LGBTQ+", es: "LGTBIQ+" },
};

export const MOLD_LABEL: Record<Mold, Localized> = {
  stat: { en: "Stat", es: "Dato" },
  myth: { en: "Myth vs fact", es: "Mito vs realidad" },
  "deep-dive": { en: "In depth", es: "En profundidad" },
  market: { en: "Market", es: "Mercado" },
  curiosity: { en: "Curiosity", es: "Curiosidad" },
  glossary: { en: "Term of the day", es: "Término del día" },
  pick: { en: "Worth a look", es: "Para ver" },
};

export const CONFIDENCE_LABEL: Record<Pill["source"]["confidence"], Localized> = {
  high: { en: "high confidence", es: "confianza alta" },
  medium: { en: "medium confidence", es: "confianza media" },
  low: { en: "low confidence", es: "confianza baja" },
};
