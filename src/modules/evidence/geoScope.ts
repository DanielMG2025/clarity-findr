// Geographic scope of evidence — presentation labelling only.
// Says whether a figure comes from one country's registry or is a multi-country
// / generic reference, and orders items so the case's own country comes first.
// Never changes figures or sources.

export type GeoScope =
  | { kind: "country"; code: string }
  | { kind: "regional"; region: "EU" }
  | { kind: "per_country" }
  | { kind: "generic" };

/** Market codes used on sources ("UK", "ES", "US", "EU"…) → scope. */
export function scopeFromMarket(market?: string | null): GeoScope {
  if (!market) return { kind: "generic" };
  const m = market.toUpperCase();
  if (m === "EU" || m === "EUROPE") return { kind: "regional", region: "EU" };
  if (m === "GLOBAL" || m === "INTL") return { kind: "generic" };
  return { kind: "country", code: m === "GB" ? "UK" : m };
}

/** Scope of the rich-citation sources in `citations.ts` (keyed by source id). */
export const CITATION_SOURCE_SCOPE: Record<string, GeoScope> = {
  hfea_2023: { kind: "country", code: "UK" },
  hfea_2022: { kind: "country", code: "UK" },
  eshre_eim_2019: { kind: "regional", region: "EU" },
  atlas_2024: { kind: "per_country" },
};

export function citationScope(sourceId: string): GeoScope {
  return CITATION_SOURCE_SCOPE[sourceId] ?? { kind: "generic" };
}

const COUNTRY_NAME: Record<string, { en: string; es: string }> = {
  UK: { en: "United Kingdom", es: "Reino Unido" },
  ES: { en: "Spain", es: "España" },
  US: { en: "United States", es: "Estados Unidos" },
};

function countryName(code: string, lang: "en" | "es"): string {
  return COUNTRY_NAME[code]?.[lang] ?? code;
}

/** Short badge text, e.g. "Specific to United Kingdom" / "European data (several countries)". */
export function scopeLabel(scope: GeoScope, lang: "en" | "es"): string {
  const es = lang === "es";
  switch (scope.kind) {
    case "country":
      return es ? `Específico de ${countryName(scope.code, lang)}` : `Specific to ${countryName(scope.code, lang)}`;
    case "regional":
      return es ? "Datos europeos (varios países)" : "European data (several countries)";
    case "per_country":
      return es ? "Datos país por país" : "Country-by-country data";
    default:
      return es ? "Referencia general" : "General reference";
  }
}

/** 0 = from the case's own country, 1 = multi-country/generic, 2 = another country. */
export function countryRank(scope: GeoScope, userCountry?: string | null): number {
  if (scope.kind !== "country") return 1;
  if (!userCountry) return 1;
  const own = scopeFromMarket(userCountry);
  return own.kind === "country" && scope.code === own.code ? 0 : 2;
}

/** True when the figure is from a single country that is not the case's country. */
export function isOtherCountry(scope: GeoScope, userCountry?: string | null): boolean {
  return countryRank(scope, userCountry) === 2;
}

/** Stable sort: own-country evidence first. Returns a new array. */
export function prioritizeByCountry<T>(items: T[], scopeOf: (item: T) => GeoScope, userCountry?: string | null): T[] {
  return items
    .map((item, i) => ({ item, i, r: countryRank(scopeOf(item), userCountry) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.item);
}
