/**
 * Curated, hand-verified comparison of fertility regulation across Europe.
 * Do NOT add countries, values, dates or URLs without verifying them first —
 * credibility depends on this data being exact.
 *
 * `legal_basis_en` is an optional English rendering of `legal_basis` for the
 * rows whose legal basis is written in Spanish (presentation only).
 */
export type RegConfidence = "alta" | "media" | "media-baja";

export type RegRow = {
  country_es: string;
  country_en: string;
  access_es: string;
  access_en: string;
  egg_es: string;
  egg_en: string;
  sperm_es: string;
  sperm_en: string;
  surrogacy_es: string;
  surrogacy_en: string;
  anonymity_es: string;
  anonymity_en: string;
  legal_basis: string;
  legal_basis_en?: string;
  source_label: string;
  source_url: string;
  updated_es: string;
  updated_en: string;
  confidence: RegConfidence;
  change_es?: string;
  change_en?: string;
};

export const REGULATION: RegRow[] = [
  {
    country_es: "España", country_en: "Spain",
    access_es: "Hetero, mujer sola y pareja de mujeres (ROPA)", access_en: "Heterosexual, single women, female couples (ROPA)",
    egg_es: "Permitida · anónima", egg_en: "Allowed · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "Prohibida", surrogacy_en: "Not allowed",
    anonymity_es: "Sí (en debate)", anonymity_en: "Yes (under debate)",
    legal_basis: "Ley 14/2006",
    source_label: "BOE", source_url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-9292",
    updated_es: "Ley 2006; anonimato en revisión", updated_en: "2006 law; anonymity under review",
    confidence: "alta",
    change_es: "El Comité de Bioética de España recomendó reconsiderar el anonimato del donante (2023).",
    change_en: "Spain's Bioethics Committee recommended reconsidering donor anonymity (2023).",
  },
  {
    country_es: "Portugal", country_en: "Portugal",
    access_es: "Hetero, mujer sola y pareja de mujeres", access_en: "Heterosexual, single women, female couples",
    egg_es: "Permitida · no anónima", egg_en: "Allowed · not anonymous",
    sperm_es: "Permitido · no anónimo", sperm_en: "Allowed · not anonymous",
    surrogacy_es: "Muy restringida (solo médica, gratuita)", surrogacy_en: "Very restricted (medical only, unpaid)",
    anonymity_es: "No (donante identificable)", anonymity_en: "No (donor identifiable)",
    legal_basis: "Lei 32/2006",
    source_label: "CNPMA", source_url: "https://www.cnpma.org.pt/",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media",
    change_es: "Donante identificable desde el fallo del Tribunal Constitucional de 2018.",
    change_en: "Donor identifiable since the 2018 Constitutional Court ruling.",
  },
  {
    country_es: "Reino Unido", country_en: "United Kingdom",
    access_es: "Todas las estructuras familiares", access_en: "All family structures",
    egg_es: "Permitida · no anónima (identificable a los 18)", egg_en: "Allowed · not anonymous (identifiable at 18)",
    sperm_es: "Permitido · no anónimo", sperm_en: "Allowed · not anonymous",
    surrogacy_es: "Altruista legal (no comercial)", surrogacy_en: "Altruistic legal (not commercial)",
    anonymity_es: "No", anonymity_en: "No",
    legal_basis: "HFE Act 1990/2008",
    source_label: "HFEA", source_url: "https://www.hfea.gov.uk/",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "alta",
  },
  {
    country_es: "Francia", country_en: "France",
    access_es: "Hetero, mujer sola y pareja de mujeres (desde 2021)", access_en: "Heterosexual, single women, female couples (since 2021)",
    egg_es: "Permitida · no anónima; listas de espera", egg_en: "Allowed · not anonymous; waiting lists",
    sperm_es: "Permitido · no anónimo", sperm_en: "Allowed · not anonymous",
    surrogacy_es: "Prohibida", surrogacy_en: "Not allowed",
    anonymity_es: "No (desde 2021)", anonymity_en: "No (since 2021)",
    legal_basis: "Loi 2021-1017 (bioéthique)",
    source_label: "Légifrance", source_url: "https://www.legifrance.gouv.fr/",
    updated_es: "Ley ago 2021", updated_en: "Aug 2021 law",
    confidence: "alta",
    change_es: "La ley de bioética de 2021 abrió la PMA a todas las mujeres y puso fin al anonimato del donante.",
    change_en: "The 2021 bioethics law opened MAR to all women and ended donor anonymity.",
  },
  {
    country_es: "Italia", country_en: "Italy",
    access_es: "Solo parejas hetero", access_en: "Heterosexual couples only",
    egg_es: "Permitida (desde 2014) · anónima", egg_en: "Allowed (since 2014) · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "Prohibida y perseguida incluso en el extranjero", surrogacy_en: "Banned and prosecuted even abroad",
    anonymity_es: "Sí", anonymity_en: "Yes",
    legal_basis: "Legge 40/2004 + ley 2024", legal_basis_en: "Legge 40/2004 + 2024 law",
    source_label: "Gazzetta Ufficiale", source_url: "https://www.gazzettaufficiale.it/",
    updated_es: "Ley oct–nov 2024", updated_en: "Oct–Nov 2024 law",
    confidence: "alta",
    change_es: "Desde finales de 2024 la subrogación es 'delito universal': perseguible aunque se realice fuera de Italia.",
    change_en: "Since late 2024 surrogacy is a 'universal crime': prosecutable even when carried out outside Italy.",
  },
  {
    country_es: "Alemania", country_en: "Germany",
    access_es: "Parejas (acceso de mujer sola limitado)", access_en: "Couples (single-woman access limited)",
    egg_es: "Prohibida", egg_en: "Not allowed",
    sperm_es: "Permitido (registro de donantes)", sperm_en: "Allowed (donor registry)",
    surrogacy_es: "Prohibida", surrogacy_en: "Not allowed",
    anonymity_es: "Semen: no (registro)", anonymity_en: "Sperm: no (registry)",
    legal_basis: "Embryonenschutzgesetz 1990",
    source_label: "Gesetze im Internet", source_url: "https://www.gesetze-im-internet.de/eschg/",
    updated_es: "Estado nov 2026", updated_en: "As of Nov 2026",
    confidence: "alta",
    change_es: "La ovodonación sigue prohibida, pero una comisión federal recomendó legalizarla (2024); aún no es ley.",
    change_en: "Egg donation remains banned, but a federal commission recommended legalizing it (2024); not yet law.",
  },
  {
    country_es: "Chequia", country_en: "Czech Republic",
    access_es: "Parejas hombre-mujer; no mujer sola ni pareja de mujeres", access_en: "Opposite-sex couples; not single women or female couples",
    egg_es: "Permitida · anónima", egg_en: "Allowed · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "No regulada (zona gris)", surrogacy_en: "Unregulated (grey area)",
    anonymity_es: "Sí", anonymity_en: "Yes",
    legal_basis: "Zákon 373/2011",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media",
  },
  {
    country_es: "Grecia", country_en: "Greece",
    access_es: "Mujer sola y parejas", access_en: "Single women and couples",
    egg_es: "Permitida · anónima", egg_en: "Allowed · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "Gestacional altruista (autorización judicial)", surrogacy_en: "Altruistic gestational (court authorization)",
    anonymity_es: "Sí", anonymity_en: "Yes",
    legal_basis: "Ley 3305/2005", legal_basis_en: "Law 3305/2005",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media",
  },
  {
    country_es: "Chipre", country_en: "Cyprus",
    access_es: "Amplio", access_en: "Broad",
    egg_es: "Permitida", egg_en: "Allowed",
    sperm_es: "Permitido", sperm_en: "Allowed",
    surrogacy_es: "Variable según jurisdicción", surrogacy_en: "Varies by jurisdiction",
    anonymity_es: "Variable", anonymity_en: "Varies",
    legal_basis: "Dos jurisdicciones (Sur UE / Norte TRNC)", legal_basis_en: "Two jurisdictions (EU South / TRNC North)",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media-baja",
    change_es: "Dos marcos distintos: la República de Chipre (UE) y el norte (TRNC), mucho más permisivo.",
    change_en: "Two different frameworks: the Republic of Cyprus (EU) and the north (TRNC), far more permissive.",
  },
  {
    country_es: "Polonia", country_en: "Poland",
    access_es: "Solo parejas hombre-mujer; no mujer sola ni pareja de mujeres", access_en: "Opposite-sex couples only; not single women or female couples",
    egg_es: "Permitida · anónima", egg_en: "Allowed · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "No reconocida", surrogacy_en: "Not recognized",
    anonymity_es: "Sí", anonymity_en: "Yes",
    legal_basis: "Ley de infertilidad 2015", legal_basis_en: "2015 infertility act",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media",
  },
  {
    country_es: "Turquía", country_en: "Turkey",
    access_es: "Solo parejas hetero casadas, con gametos propios", access_en: "Married heterosexual couples only, own gametes",
    egg_es: "Prohibida", egg_en: "Not allowed",
    sperm_es: "Prohibido", sperm_en: "Not allowed",
    surrogacy_es: "Prohibida", surrogacy_en: "Not allowed",
    anonymity_es: "N/A", anonymity_en: "N/A",
    legal_basis: "Reglamento ART 2014", legal_basis_en: "ART Regulation 2014",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/",
    updated_es: "verif. nov 2026", updated_en: "verified Nov 2026",
    confidence: "alta",
    change_es: "Solo gametos propios de la pareja casada; la donación de óvulos, semen o embriones está prohibida. Los pacientes suelen salir del país.",
    change_en: "Only the married couple's own gametes; egg, sperm and embryo donation are banned. Patients typically travel abroad.",
  },
];

export const EU_SOHO = {
  title_es: "Marco UE transversal",
  title_en: "EU-wide framework",
  body_es:
    "Reglamento (UE) 2024/1938 sobre sustancias de origen humano (SoHO): en vigor desde 2024, aplicación prevista ~2027. Sube los estándares de calidad, seguridad y trazabilidad de gametos y embriones en toda la UE.",
  body_en:
    "Regulation (EU) 2024/1938 on substances of human origin (SoHO): in force since 2024, expected to apply ~2027. Raises quality, safety and traceability standards for gametes and embryos across the EU.",
  source_label: "EUR-Lex",
  source_url: "https://eur-lex.europa.eu/eli/reg/2024/1938/oj",
} as const;

export const CONFIDENCE_LABEL: Record<RegConfidence, { es: string; en: string }> = {
  alta: { es: "Alta", en: "High" },
  media: { es: "Media", en: "Medium" },
  "media-baja": { es: "Media-baja", en: "Medium-low" },
};
