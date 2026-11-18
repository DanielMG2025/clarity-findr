// Pull one subsection of an existing bilingual "In depth" body by its English
// subheading. Both languages share the same structure, so the same index is
// used for Spanish. Returns null if the heading does not exist (never invents).

import { getArticle } from "@/modules/education";
import type { Localized } from "@/modules/content/types";

export interface DepthRef { slug: string; heading: string }
export interface DepthSection { slug: string; heading: Localized; paragraphs: { en: string[]; es: string[] } }

export function depthSection(ref: DepthRef): DepthSection | null {
  const a = getArticle(ref.slug);
  const en = a?.body_en;
  const es = a?.body_es;
  if (!en || !es) return null;
  const start = en.indexOf(`### ${ref.heading}`);
  if (start < 0 || !es[start]?.startsWith("### ")) return null;
  const nextIn = (arr: string[]) => {
    const i = arr.findIndex((p, k) => k > start && p.startsWith("### "));
    return i < 0 ? arr.length : i;
  };
  return {
    slug: ref.slug,
    heading: { en: en[start].slice(4), es: es[start].slice(4) },
    paragraphs: { en: en.slice(start + 1, nextIn(en)), es: es.slice(start + 1, nextIn(es)) },
  };
}

export const depthSections = (refs: DepthRef[]) => refs.map(depthSection).filter((s): s is DepthSection => s !== null);
