// Treatment taxonomy — collapse the many ways of naming a treatment (across
// languages and source vocabularies) into one canonical key. Without this,
// observations from different sources aren't comparable.
//
// The canonical set intentionally matches the pricing-configurator's TreatmentKey
// so provenance estimates can be wired straight into the configurator.

export type TreatmentKey = "ivf" | "icsi" | "donor" | "freezing" | "iui" | "study";

export const TREATMENT_KEYS: TreatmentKey[] = ["ivf", "icsi", "donor", "freezing", "iui", "study"];

/** Lowercase + strip accents/punctuation so synonyms match regardless of styling. */
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Synonym → canonical key. Keys are already norm()'d. Multilingual (ES/EN);
// extend per language as new sources are allowlisted.
const TREATMENT_SYNONYMS: Record<string, TreatmentKey> = {
  // IVF
  "ivf": "ivf",
  "fiv": "ivf",
  "in vitro": "ivf",
  "in vitro fertilization": "ivf",
  "fecundacion in vitro": "ivf",
  "fivte": "ivf",
  // ICSI
  "icsi": "icsi",
  "microinjection": "icsi",
  "microinyeccion": "icsi",
  "fiv icsi": "icsi",
  // Egg / sperm donation
  "donor": "donor",
  "egg donation": "donor",
  "ovodonacion": "donor",
  "donacion de ovulos": "donor",
  "donacion ovulos": "donor",
  "donacion": "donor",
  "double donation": "donor",
  "embryo donation": "donor",
  // Freezing / vitrification
  "freezing": "freezing",
  "social freezing": "freezing",
  "egg freezing": "freezing",
  "vitrificacion": "freezing",
  "vitrification": "freezing",
  "preservacion de fertilidad": "freezing",
  "fertility preservation": "freezing",
  // IUI
  "iui": "iui",
  "artificial insemination": "iui",
  "inseminacion artificial": "iui",
  "inseminacion": "iui",
  // Study / workup
  "study": "study",
  "workup": "study",
  "estudio": "study",
  "estudio de fertilidad": "study",
  "fertility assessment": "study",
};

/** Map a free-text treatment label to a canonical key, or null if unrecognized. */
export function normalizeTreatment(raw: string | null | undefined): TreatmentKey | null {
  if (!raw) return null;
  const n = norm(raw);
  if (!n) return null;
  if (TREATMENT_SYNONYMS[n]) return TREATMENT_SYNONYMS[n];
  // Fall back to substring match (longest synonym first for specificity).
  const keys = Object.keys(TREATMENT_SYNONYMS).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (n.includes(k)) return TREATMENT_SYNONYMS[k];
  }
  return null;
}

// Market normalization — collapse country spellings/languages to one label.
const MARKET_SYNONYMS: Record<string, string> = {
  "spain": "Spain",
  "espana": "Spain",
  "es": "Spain",
  "czech republic": "Czech Republic",
  "czechia": "Czech Republic",
  "republica checa": "Czech Republic",
  "cz": "Czech Republic",
  "greece": "Greece",
  "grecia": "Greece",
  "gr": "Greece",
  "portugal": "Portugal",
  "pt": "Portugal",
  "cyprus": "Cyprus",
  "chipre": "Cyprus",
  "cy": "Cyprus",
  "denmark": "Denmark",
  "dinamarca": "Denmark",
  "dk": "Denmark",
  "belgium": "Belgium",
  "belgica": "Belgium",
  "be": "Belgium",
};

/** Canonicalize a market/country label. Unknown values are title-cased as-is. */
export function normalizeMarket(raw: string | null | undefined): string {
  if (!raw) return "Unknown";
  const n = norm(raw);
  if (!n) return "Unknown";
  if (MARKET_SYNONYMS[n]) return MARKET_SYNONYMS[n];
  return n.replace(/\b\w/g, (c) => c.toUpperCase());
}
