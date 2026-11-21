// Journey v2 guide, as pure data: which existing content each block shows for
// a treatment + the basics. Every block is either built from existing sourced
// data or null (the page then omits it, or says "en preparación").

import { getArticle, type Article } from "@/modules/education";
import { REGULATION, type RegRow } from "@/modules/content/regulation";
import { AGE_BANDS, AGE_BANDS_CAPTION, AGE_BANDS_NOTE, FINDINGS, type Finding } from "@/modules/content/science";
import { seedRange, SEED_SOURCE_MAP, type SeedPrice } from "@/modules/provenance/seedPrices";
import type { Localized } from "@/modules/content/types";
import { countryOption } from "./countries";
import { abroad, treatmentCountry, type AgeBandV2, type Basics } from "./basics";
import type { TreatmentV2 } from "./treatments";

/** Our age bands → the rows of the HFEA table that cover them (a band can span two rows). */
export const HFEA_ROWS_FOR_BAND: Record<AgeBandV2, string[]> = {
  lt30: ["18–34"],
  "30-34": ["18–34"],
  "35-37": ["35–37"],
  "38-40": ["38–39", "40–42"],
  "41-42": ["40–42"],
  "43plus": ["43–44"],
};

export type AgeBlock =
  | { kind: "hfea-table"; rows: { band: string; rate: string }[]; caption: Localized; note?: Localized; finding: Finding }
  | { kind: "finding"; finding: Finding };

export function ageBlock(t: TreatmentV2, band?: AgeBandV2): AgeBlock | null {
  if (!t.age || !band) return null;
  if (t.age.kind === "finding") {
    const id = t.age.id;
    const finding = FINDINGS.find((f) => f.id === id);
    return finding ? { kind: "finding", finding } : null;
  }
  const wanted = HFEA_ROWS_FOR_BAND[band];
  const rows = AGE_BANDS.filter((r) => wanted.includes(r.band));
  const finding = FINDINGS.find((f) => f.id === "edad");
  if (rows.length === 0 || !finding) return null;
  return { kind: "hfea-table", rows, caption: AGE_BANDS_CAPTION, note: band === "43plus" ? AGE_BANDS_NOTE : undefined, finding };
}

export interface PriceLine { country: string; price: SeedPrice | null; sources: { label: string; url?: string }[] }

/** Seed price range per country shown (where they live, and the destination if different). Null price = en preparación. */
export function priceLines(t: TreatmentV2, b: Basics): PriceLine[] {
  const codes = [b.residence, abroad(b)].filter((c): c is string => !!c);
  return codes.map((code) => {
    const market = countryOption(code)?.priceMarket;
    const price = t.price && market ? seedRange(t.price, market) ?? null : null;
    const sources = (price?.source_ids ?? []).map((id) => ({ label: SEED_SOURCE_MAP.get(id)?.label ?? id, url: SEED_SOURCE_MAP.get(id)?.url }));
    return { country: code, price, sources };
  });
}

export function regulationFor(code?: string): RegRow | null {
  const name = countryOption(code)?.regulation;
  return (name && REGULATION.find((r) => r.country_en === name)) || null;
}

export const regulationLink = (row: RegRow) => `/descubre/regulacion?country=${encodeURIComponent(row.country_en)}`;

/**
 * The age figures we have are by the woman's age, so they are not shown when the
 * person being treated is a man.
 */
export const ageForGuide = (t: TreatmentV2, b: Basics) => (b.who === "hombre" ? null : ageBlock(t, b.age));

export const guideArticles = (t: TreatmentV2): Article[] => t.guides.map(getArticle).filter((a): a is Article => !!a);

export const guideFindings = (t: TreatmentV2): Finding[] => t.findings.map((id) => FINDINGS.find((f) => f.id === id)).filter((f): f is Finding => !!f);

/** Tags of every guide article, for forum topics and voices. */
export const guideTags = (t: TreatmentV2) => [...new Set(guideArticles(t).flatMap((a) => a.tags))];

export interface CollectedSource { label: string; url?: string; date?: string }

/** Every source the guide already cites, once each, in block order. */
export function guideSources(t: TreatmentV2, b: Basics): CollectedSource[] {
  const out: CollectedSource[] = [];
  const add = (s: CollectedSource) => { if (!out.some((x) => x.label === s.label && x.url === s.url)) out.push(s); };
  for (const a of guideArticles(t)) a.sources.forEach((s) => add({ label: s.label, url: s.url }));
  const age = ageForGuide(t, b);
  if (age) add({ label: age.finding.source_label, url: age.finding.source_url, date: age.finding.source_year });
  for (const p of priceLines(t, b)) if (p.price) p.sources.forEach((s) => add({ ...s, date: p.price!.as_of }));
  for (const f of guideFindings(t)) add({ label: f.source_label, url: f.source_url, date: f.source_year });
  if (t.addons) { const f = FINDINGS.find((x) => x.is_addons); if (f) add({ label: f.source_label, url: f.source_url, date: f.source_year }); }
  const reg = regulationFor(treatmentCountry(b));
  if (reg) add({ label: `${reg.source_label} — ${reg.legal_basis}`, url: reg.source_url });
  return out;
}
