// Countries offered in "the basics". Only names and links between existing
// datasets: which regulation row (by its English name, as /descubre/regulacion
// deep links expect) and which price market (seed ranges) belong to each code.
// A missing link means "en preparación", never a borrowed country.

import type { Localized } from "@/modules/content/types";
import { byCode } from "@/modules/regulatory";

export interface CountryOption {
  code: string;
  name: Localized;
  /** `country_en` of the matching REGULATION row, if any. */
  regulation?: string;
  /** Market code in SEED_PRICES, if any. */
  priceMarket?: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "ES", name: { en: "Spain", es: "España" }, regulation: "Spain", priceMarket: "ES" },
  { code: "PT", name: { en: "Portugal", es: "Portugal" }, regulation: "Portugal", priceMarket: "PT" },
  { code: "UK", name: { en: "United Kingdom", es: "Reino Unido" }, regulation: "United Kingdom" },
  { code: "FR", name: { en: "France", es: "Francia" }, regulation: "France" },
  { code: "IT", name: { en: "Italy", es: "Italia" }, regulation: "Italy" },
  { code: "DE", name: { en: "Germany", es: "Alemania" }, regulation: "Germany" },
  { code: "GR", name: { en: "Greece", es: "Grecia" }, regulation: "Greece", priceMarket: "GR" },
  { code: "CZ", name: { en: "Czech Republic", es: "Chequia" }, regulation: "Czech Republic", priceMarket: "CZ" },
  { code: "MX", name: { en: "Mexico", es: "México" }, regulation: "Mexico" },
  { code: "AR", name: { en: "Argentina", es: "Argentina" }, regulation: "Argentina" },
  { code: "CY", name: { en: "Cyprus", es: "Chipre" }, regulation: "Cyprus (South · EU)", priceMarket: "CY" },
  { code: "DK", name: { en: "Denmark", es: "Dinamarca" }, priceMarket: "DK" },
  { code: "PL", name: { en: "Poland", es: "Polonia" }, regulation: "Poland" },
  { code: "TR", name: { en: "Turkey", es: "Turquía" }, regulation: "Turkey" },
  { code: "BE", name: { en: "Belgium", es: "Bélgica" } },
  { code: "NL", name: { en: "Netherlands", es: "Países Bajos" } },
  { code: "CH", name: { en: "Switzerland", es: "Suiza" } },
  { code: "EE", name: { en: "Estonia", es: "Estonia" } },
  { code: "FI", name: { en: "Finland", es: "Finlandia" } },
  { code: "UY", name: { en: "Uruguay", es: "Uruguay" }, regulation: "Uruguay" },
  { code: "BR", name: { en: "Brazil", es: "Brasil" }, regulation: "Brazil" },
  { code: "CL", name: { en: "Chile", es: "Chile" }, regulation: "Chile" },
  { code: "CO", name: { en: "Colombia", es: "Colombia" }, regulation: "Colombia" },
  { code: "PE", name: { en: "Peru", es: "Perú" }, regulation: "Peru" },
  { code: "CR", name: { en: "Costa Rica", es: "Costa Rica" }, regulation: "Costa Rica" },
];

/** Shown first as tiles; the rest open under "Otro país". */
export const FEATURED_COUNTRIES = ["ES", "PT", "UK", "FR", "IT", "DE", "GR", "CZ", "MX", "AR"];

export const countryOption = (code?: string | null) => COUNTRY_OPTIONS.find((c) => c.code === code);

/** True when the case engines (pricing, regulation gate, clinics) know this code; only those are copied into the case. */
export const isCaseCountry = (code: string) => !!byCode(code);

const LANGUAGE_COUNTRY: Record<string, string> = { es: "ES", pt: "PT", fr: "FR", de: "DE", it: "IT", el: "GR", cs: "CZ", da: "DK", pl: "PL", tr: "TR", nl: "NL", fi: "FI", et: "EE" };

/** A suggestion from the browser's languages (region first, e.g. es-MX → MX). Nothing is saved until confirmed. */
export function suggestCountry(languages: readonly string[]): string | undefined {
  const known = new Set(COUNTRY_OPTIONS.map((c) => c.code));
  for (const tag of languages) {
    const region = tag.split("-")[1]?.toUpperCase();
    const code = region === "GB" ? "UK" : region;
    if (code && known.has(code)) return code;
  }
  for (const tag of languages) {
    const code = LANGUAGE_COUNTRY[tag.split("-")[0].toLowerCase()];
    if (code) return code;
  }
  return undefined;
}
