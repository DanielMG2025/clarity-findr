// Cross-link guides (tags) to published forum-listening topics. Pure, so it is unit-tested.
import type { TopicRow } from "./conversation";
import type { Localized } from "./types";

/** Guide tag → keywords searched (accent-insensitive substring) in a topic's treatment + questions. */
const TAG_KEYWORDS: Record<string, string[]> = {
  ivf: ["ivf", "fiv"],
  icsi: ["icsi", "male factor", "factor masculino"],
  "male-factor": ["male factor", "factor masculino", "mtese", "varicocele", "sperm", "semin"],
  iui: ["iui", "insemin"],
  pgt: ["pgt", "mosaic", "aneuploid", "genetic", "genétic"],
  genetics: ["pgt", "mosaic", "aneuploid", "genetic", "genétic"],
  "egg-donation": ["egg donation", "ovodonación", "donor", "donante", "donación", "tandem", "tándem"],
  donor: ["egg donation", "ovodonación", "donor", "donante", "donación", "tandem", "tándem"],
  freezing: ["egg freezing", "vitrificación", "freezing", "congel"],
  vitrification: ["egg freezing", "vitrificación", "freezing", "congel"],
  reserve: ["reserve", "reserva", "low reserve", "baja reserva", "egg quality", "calidad ovocitaria", "amh"],
  amh: ["reserve", "reserva", "low reserve", "baja reserva", "egg quality", "calidad ovocitaria", "amh"],
  afc: ["reserve", "reserva", "low reserve", "baja reserva", "egg quality", "calidad ovocitaria", "amh"],
  transfer: ["transfer", "transferencia", "implantation", "fallo de implantación", "era"],
  fet: ["transfer", "transferencia", "implantation", "fallo de implantación", "era"],
  stimulation: ["stimulation", "estimulación", "protocol", "protocolo", "duostim", "mini-ivf", "mini-fiv"],
  retrieval: ["stimulation", "estimulación", "protocol", "protocolo", "duostim", "mini-ivf", "mini-fiv"],
  ropa: ["ropa", "recíproca", "reciprocal"],
  legal: ["cross-border", "surrogacy", "subrogada", "legal"],
  lgbt: ["ropa", "donante", "donor"],
};

/** Keywords that are also common word fragments ("era" in "espera") only count as whole words. */
const WHOLE_WORD = new Set(["era"]);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function keywordsForTags(tags: string[]): string[] {
  return [...new Set(tags.flatMap((t) => TAG_KEYWORDS[t] ?? []).map(norm))];
}

type TopicLike = Pick<TopicRow, "treatment" | "treatment_en" | "question_en" | "question_es" | "audiences" | "created_at">;

/** Published topics on the guide's subject: most distinct keyword hits first, then newest; max `limit`. */
export function forumTopicsForArticle<T extends TopicLike>(article: { tags: string[] }, topics: T[], limit = 3): T[] {
  const keys = keywordsForTags(article.tags);
  const lgbt = article.tags.includes("lgbt");
  if (keys.length === 0 && !lgbt) return [];
  return topics
    .map((t) => {
      const text = norm([t.treatment_en, t.treatment, t.question_en, t.question_es].join(" "));
      const words = new Set(text.split(/[^a-z0-9-]+/));
      let hits = keys.filter((k) => (WHOLE_WORD.has(k) ? words.has(k) : text.includes(k))).length;
      if (lgbt && t.audiences.includes("lgbt")) hits += 1;
      return { t, hits };
    })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits || b.t.created_at.localeCompare(a.t.created_at))
    .slice(0, limit)
    .map((x) => x.t);
}

/** Most representative forum search term per guide, by tag priority. */
const TERM_BY_TAG: [string, Localized][] = [
  ["ropa", { es: "ROPA", en: "ROPA" }],
  ["pgt", { es: "PGT-A", en: "PGT-A" }],
  ["icsi", { es: "factor masculino", en: "male factor" }],
  ["male-factor", { es: "factor masculino", en: "male factor" }],
  ["iui", { es: "IUI", en: "IUI" }],
  ["egg-donation", { es: "ovodonación", en: "egg donation" }],
  ["freezing", { es: "vitrificación", en: "egg freezing" }],
  ["vitrification", { es: "vitrificación", en: "egg freezing" }],
  ["amh", { es: "reserva", en: "reserve" }],
  ["afc", { es: "reserva", en: "reserve" }],
  ["reserve", { es: "reserva", en: "reserve" }],
  ["transfer", { es: "transferencia", en: "transfer" }],
  ["fet", { es: "transferencia", en: "transfer" }],
  ["stimulation", { es: "protocolo", en: "protocol" }],
  ["retrieval", { es: "protocolo", en: "protocol" }],
  ["donor", { es: "donante", en: "donor" }],
  ["ivf", { es: "FIV", en: "IVF" }],
  ["genetics", { es: "PGT-A", en: "PGT-A" }],
  ["legal", { es: "cross-border", en: "cross-border" }],
];

export function forumSearchTerm(article: { tags: string[] }): Localized | null {
  return TERM_BY_TAG.find(([tag]) => article.tags.includes(tag))?.[1] ?? null;
}

/** Deep link into the Conversación section of /descubre, pre-filled with a search. */
export function conversationLink(query: string): string {
  return `/descubre?q=${encodeURIComponent(query)}#conversacion`;
}
