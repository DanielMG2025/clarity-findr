// Site title/description per language. index.html carries the English version for
// crawlers (no SSR); the app swaps it in the open tab when the language changes.
import type { Language } from "./translate";

export const SITE_META: Record<Language, { title: string; description: string }> = {
  en: {
    title: "Fertility Compass — Understand and prepare your fertility treatment",
    description: "What would take you months to gather, condensed into a single place.",
  },
  es: {
    title: "Fertility Compass — Entiende y prepara tu tratamiento de fertilidad",
    description: "Lo que tardarías meses en recopilar, condensado en un único sitio.",
  },
};

const DESCRIPTION_SELECTORS = ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'];
const TITLE_SELECTORS = ['meta[property="og:title"]', 'meta[name="twitter:title"]'];

export function applySiteMeta(language: Language, doc: Document = document) {
  const meta = SITE_META[language] ?? SITE_META.en;
  doc.title = meta.title;
  for (const s of TITLE_SELECTORS) doc.querySelector(s)?.setAttribute("content", meta.title);
  for (const s of DESCRIPTION_SELECTORS) doc.querySelector(s)?.setAttribute("content", meta.description);
}
