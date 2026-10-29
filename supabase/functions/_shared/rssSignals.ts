import { XMLParser } from "npm:fast-xml-parser@4.5.3";

export const MIN_MENTIONS = 2;
export const CURRENT_DAYS = 7;
const THEMES: [RegExp, string, string][] = [
  [/beta|wait|espera|pregnancy test|test de embarazo|positive|positivo/i, "Pregnancy testing and the wait after treatment", "Pruebas de embarazo y espera tras el tratamiento"],
  [/transfer|implant|blastoc|embryo|embri[oó]n/i, "Embryo transfer and implantation", "Transferencia embrionaria e implantación"],
  [/sperm|semen|esperm|azoosperm|male|masculin/i, "Sperm health and male fertility", "Salud del semen y fertilidad masculina"],
  [/donor|donat|donaci|ovodon/i, "Fertility treatment with donation", "Tratamiento de fertilidad con donación"],
  [/ivf|icsi|fiv|insemin/i, "Planning assisted fertility treatment", "Planificación del tratamiento de reproducción asistida"],
  [/egg|ovari|[oó]vul|freez|congel/i, "Eggs and ovarian response", "Óvulos y respuesta ovárica"],
  [/progester|medic|hormon/i, "Medication during fertility treatment", "Medicación durante el tratamiento de fertilidad"],
];
const clean = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/^\s*(reply\s+to|respuesta\s+a)\s*:\s*/i, "").replace(/\s+/g, " ").trim();
export function neutralTitle(title: string, lang: string): string {
  const safe = clean(title);
  const theme = THEMES.find(([pattern]) => pattern.test(safe));
  return theme ? theme[lang === "es" ? 2 : 1] : lang === "es" ? "Preguntas sobre el proceso de fertilidad" : "Questions about the fertility process";
}
export function safeUrl(value: string): string | null {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u.hostname) || !u.hostname.includes(".")) return null;
    return u.href;
  } catch { return null; }
}
export function marketFields(text: string) {
  // Read descriptions transiently for structured signals ONLY. Never retain quotes, names, or narratives.
  const plain = clean(text);
  const treatments = ["IVF", "FIV", "ICSI", "IUI", "PGT", "ROPA"].filter(t => new RegExp(`\\b${t}\\b`, "i").test(plain));
  const countries = ["Spain", "España", "UK", "United Kingdom", "USA", "United States", "Canada"].filter(c => new RegExp(`\\b${c}\\b`, "i").test(plain));
  const prices: { amount: number; currency: string; country: string | null }[] = [];
  for (const m of plain.matchAll(/(€|£|\$|EUR|GBP|USD)\s*(\d{1,6}(?:[.,]\d{2})?)(?!\d)|\b(\d{1,6}(?:[.,]\d{2})?)\s*(EUR|GBP|USD|euros)\b/gi)) {
    const symbol = (m[1] ?? m[4]).toUpperCase();
    // A dollar symbol alone does not establish USD or a country.
    const currency = symbol === "€" || symbol === "EUROS" ? "EUR" : symbol === "£" ? "GBP" : symbol === "$" ? "unspecified dollar" : symbol;
    prices.push({ amount: Number((m[2] ?? m[3]).replace(",", ".")), currency, country: countries.length === 1 ? countries[0] : null });
  }
  return { treatments, prices: prices.slice(0, 5), geography: countries, sentiment: /worried|anxious|preocup|miedo/i.test(plain) ? "concern" : /hopeful|hope|esperanz/i.test(plain) ? "hope" : "unspecified" };
}
export function parseFeed(xml: string, lang: string) {
  const parsed = new XMLParser({ ignoreAttributes: false, processEntities: true }).parse(xml);
  const collection = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? [];
  const items = Array.isArray(collection) ? collection : [collection];
  return items.slice(0, 25).flatMap((item: Record<string, any>) => {
    const text = (v: any): string => typeof v === "string" ? v : String(v?.["#text"] ?? "");
    const linkValue = Array.isArray(item.link) ? item.link.find((l: any) => l["@_rel"] === "alternate") ?? item.link[0] : item.link;
    const url = safeUrl(text(linkValue) || linkValue?.["@_href"] || "");
    if (!url) return [];
    const date = new Date(text(item.pubDate ?? item.published ?? item.updated));
    const title = neutralTitle(text(item.title), lang);
    const metadata = marketFields(text(item.description ?? item.summary ?? item.content));
    return [{ title, url, snippet: lang === "es" ? `Consulta de foro sobre ${title.toLowerCase()}.` : `Forum discussion about ${title.toLowerCase()}.`, created_utc: Number.isNaN(date.getTime()) ? null : date.toISOString(), market_data: metadata }];
  });
}
export function supportedTopics<T extends { signal_ids: string[]; source_forum: string; source_lang: string }>(topics: T[], signals: { id: string; source_name: string; lang: string }[]): T[] {
  const used = new Set<string>();
  return topics.filter(t => {
    const ids = [...new Set(t.signal_ids)];
    if (ids.length < MIN_MENTIONS || ids.some(id => used.has(id) || !signals.some(s => s.id === id && s.source_name === t.source_forum && s.lang === t.source_lang))) return false;
    ids.forEach(id => used.add(id));
    t.signal_ids = ids;
    return true;
  });
}
