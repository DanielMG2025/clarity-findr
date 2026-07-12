// Glossary index — maps concept aliases to their explainer article and detects
// those terms inside arbitrary text. Powers <Term> and <AutoGlossary>.

import { getArticle, type Article } from "./contentLibrary";

export interface GlossaryEntry {
  /** Article slug the term links to. */
  slug: string;
  /** Aliases matched case-insensitively on word boundaries. First = canonical. */
  aliases: string[];
}

export interface Match {
  start: number;
  end: number;
  text: string; // the exact matched substring
  entry: GlossaryEntry;
}

// Curated concept → article. Multi-word aliases first so they win over parts.
export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  { slug: "what-is-ivf", aliases: ["IVF", "in vitro fertilisation", "in vitro fertilization"] },
  { slug: "what-is-icsi", aliases: ["ICSI"] },
  { slug: "what-is-iui", aliases: ["IUI", "intrauterine insemination"] },
  { slug: "what-is-pgt-a", aliases: ["PGT-A", "PGT"] },
  { slug: "what-is-egg-donation", aliases: ["egg donation", "egg donor"] },
  { slug: "what-is-vitrification", aliases: ["vitrification"] },
  { slug: "what-is-ovarian-reserve", aliases: ["ovarian reserve"] },
  { slug: "what-is-amh", aliases: ["AMH", "anti-Müllerian hormone", "anti-mullerian hormone"] },
  { slug: "what-is-afc", aliases: ["antral follicle count", "AFC"] },
  { slug: "what-is-blastocyst", aliases: ["blastocyst"] },
  { slug: "fresh-vs-frozen-transfer", aliases: ["frozen embryo transfer", "frozen transfer", "FET"] },
  { slug: "what-is-ovarian-stimulation", aliases: ["ovarian stimulation"] },
  { slug: "what-is-egg-retrieval", aliases: ["egg retrieval", "follicular puncture"] },
  { slug: "what-is-ropa-method", aliases: ["ROPA"] },
  { slug: "anonymous-donation", aliases: ["anonymous donation"] },
];

const norm = (s: string) => s.trim().toLowerCase();

const ALIAS_TO_ENTRY = new Map<string, GlossaryEntry>();
for (const e of GLOSSARY_ENTRIES) for (const a of e.aliases) ALIAS_TO_ENTRY.set(norm(a), e);

/** Resolve a single term/label to its article, if known. */
export function articleForTerm(label: string): Article | undefined {
  const entry = ALIAS_TO_ENTRY.get(norm(label));
  return entry ? getArticle(entry.slug) : undefined;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// One combined, word-bounded, case-insensitive matcher. Aliases sorted longest
// first so "PGT-A" wins over "PGT" and "frozen embryo transfer" over "FET".
const ALL_ALIASES = GLOSSARY_ENTRIES.flatMap((e) => e.aliases).sort((a, b) => b.length - a.length);
const TERM_RE = new RegExp(`\\b(${ALL_ALIASES.map(escapeRe).join("|")})\\b`, "gi");

/**
 * Find known glossary terms in `text`. Returns non-overlapping matches in order,
 * at most one per concept (first occurrence) to avoid over-decorating.
 */
export function findTerms(text: string): Match[] {
  const matches: Match[] = [];
  const seen = new Set<string>();
  const re = new RegExp(TERM_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const entry = ALIAS_TO_ENTRY.get(norm(m[0]));
    if (!entry || seen.has(entry.slug)) continue;
    seen.add(entry.slug);
    matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], entry });
  }
  return matches.sort((a, b) => a.start - b.start);
}
