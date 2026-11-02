/**
 * Curated, hand-verified comparison of fertility regulation across Europe.
 * Do NOT add countries, values, dates or URLs without verifying them first —
 * credibility depends on this data being exact.
 *
 * `legal_basis_en` is an optional English rendering of `legal_basis` for the
 * rows whose legal basis is written in Spanish (presentation only).
 */
export type RegConfidence = "alta" | "media" | "media-baja";

export type SourceTier = "primaria" | "oficial" | "secundaria";

export const SOURCE_TIER_LABEL: Record<"primaria"|"oficial"|"secundaria", { es: string; en: string }> = {
  primaria: { es: "Fuente primaria", en: "Primary source" },
  oficial: { es: "Fuente oficial", en: "Official source" },
  secundaria: { es: "Fuente secundaria", en: "Secondary source" },
};

export const SOURCE_TIER_HELP = {
  es: "Primaria = texto de la norma en el boletín oficial; Oficial = web del regulador o del gobierno; Secundaria = referencia profesional (p. ej. ESHRE).",
  en: "Primary = the law's text in the official gazette; Official = the regulator's or government's site; Secondary = a professional reference (e.g. ESHRE).",
};

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
  source_tier: SourceTier;
  updated_es: string;
  updated_en: string;
  confidence: RegConfidence;
  change_es?: string;
  change_en?: string;
  summary_es: string;
  summary_en: string;
};

export const REGULATION: RegRow[] = [
  {
    country_es: "España", country_en: "Spain",
    summary_es: "En España el acceso es amplio: parejas heterosexuales, mujeres solas y parejas de mujeres (método ROPA). La donación de óvulos y de semen está permitida y es anónima —ni la donante ni la receptora conocen la identidad de la otra—, aunque ese anonimato está hoy en debate. La gestación subrogada no está permitida.",
    summary_en: "In Spain access is broad: heterosexual couples, single women and female couples (the ROPA method). Egg and sperm donation are allowed and anonymous —neither donor nor recipient knows the other's identity— though that anonymity is currently under debate. Surrogacy is not allowed.",
    access_es: "Hetero, mujer sola y pareja de mujeres (ROPA)", access_en: "Heterosexual, single women, female couples (ROPA)",
    egg_es: "Permitida · anónima", egg_en: "Allowed · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "Prohibida", surrogacy_en: "Not allowed",
    anonymity_es: "Sí (en debate)", anonymity_en: "Yes (under debate)",
    legal_basis: "Ley 14/2006",
    source_label: "BOE", source_url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-9292", source_tier: "primaria",
    updated_es: "Ley 2006; anonimato en revisión", updated_en: "2006 law; anonymity under review",
    confidence: "alta",
    change_es: "El Comité de Bioética de España recomendó reconsiderar el anonimato del donante (2023).",
    change_en: "Spain's Bioethics Committee recommended reconsidering donor anonymity (2023).",
  },
  {
    country_es: "Portugal", country_en: "Portugal",
    summary_es: "Portugal da acceso amplio, incluidas mujeres solas y parejas de mujeres. La donación está permitida pero no es anónima: desde una sentencia de 2018, la persona nacida puede llegar a conocer la identidad del donante. La subrogación es muy restringida.",
    summary_en: "Portugal gives broad access, including single women and female couples. Donation is allowed but not anonymous: since a 2018 ruling, the person born can come to know the donor's identity. Surrogacy is very restricted.",
    access_es: "Hetero, mujer sola y pareja de mujeres", access_en: "Heterosexual, single women, female couples",
    egg_es: "Permitida · no anónima", egg_en: "Allowed · not anonymous",
    sperm_es: "Permitido · no anónimo", sperm_en: "Allowed · not anonymous",
    surrogacy_es: "Muy restringida (solo médica, gratuita)", surrogacy_en: "Very restricted (medical only, unpaid)",
    anonymity_es: "No (donante identificable)", anonymity_en: "No (donor identifiable)",
    legal_basis: "Lei 32/2006",
    source_label: "Diário da República", source_url: "https://diariodarepublica.pt/dr/detalhe/lei/32-2006-539239", source_tier: "primaria",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media",
    change_es: "Donante identificable desde el fallo del Tribunal Constitucional de 2018.",
    change_en: "Donor identifiable since the 2018 Constitutional Court ruling.",
  },
  {
    country_es: "Reino Unido", country_en: "United Kingdom",
    summary_es: "El Reino Unido abre el tratamiento a todas las estructuras familiares. La donación no es anónima: la persona nacida puede conocer al donante al cumplir los 18. La gestación subrogada altruista (no comercial) es legal.",
    summary_en: "The UK opens treatment to all family structures. Donation is not anonymous: the person born can learn the donor's identity at 18. Altruistic (non-commercial) surrogacy is legal.",
    access_es: "Todas las estructuras familiares", access_en: "All family structures",
    egg_es: "Permitida · no anónima (identificable a los 18)", egg_en: "Allowed · not anonymous (identifiable at 18)",
    sperm_es: "Permitido · no anónimo", sperm_en: "Allowed · not anonymous",
    surrogacy_es: "Altruista legal (no comercial)", surrogacy_en: "Altruistic legal (not commercial)",
    anonymity_es: "No", anonymity_en: "No",
    legal_basis: "HFE Act 1990/2008",
    source_label: "legislation.gov.uk", source_url: "https://www.legislation.gov.uk/ukpga/1990/37", source_tier: "primaria",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "alta",
  },
  {
    country_es: "Francia", country_en: "France",
    summary_es: "Desde la ley de bioética de 2021, Francia abrió el acceso a mujeres solas y parejas de mujeres. Desde esa reforma la donación es no anónima, y hay listas de espera. La subrogación está prohibida.",
    summary_en: "Since the 2021 bioethics law, France opened access to single women and female couples. Since that reform donation is non-anonymous, and there are waiting lists. Surrogacy is banned.",
    access_es: "Hetero, mujer sola y pareja de mujeres (desde 2021)", access_en: "Heterosexual, single women, female couples (since 2021)",
    egg_es: "Permitida · no anónima; listas de espera", egg_en: "Allowed · not anonymous; waiting lists",
    sperm_es: "Permitido · no anónimo", sperm_en: "Allowed · not anonymous",
    surrogacy_es: "Prohibida", surrogacy_en: "Not allowed",
    anonymity_es: "No (desde 2021)", anonymity_en: "No (since 2021)",
    legal_basis: "Loi 2021-1017 (bioéthique)",
    source_label: "Vie-publique", source_url: "https://www.vie-publique.fr/loi/268659-loi-bioethique-pma", source_tier: "oficial",
    updated_es: "Ley ago 2021", updated_en: "Aug 2021 law",
    confidence: "alta",
    change_es: "La ley de bioética de 2021 abrió la PMA a todas las mujeres y puso fin al anonimato del donante.",
    change_en: "The 2021 bioethics law opened MAR to all women and ended donor anonymity.",
  },
  {
    country_es: "Italia", country_en: "Italy",
    summary_es: "Italia limita el acceso a parejas heterosexuales. La donación se permite (desde 2014) y es anónima. La subrogación está prohibida y, desde finales de 2024, se persigue incluso cuando se realiza en el extranjero.",
    summary_en: "Italy limits access to heterosexual couples. Donation is allowed (since 2014) and anonymous. Surrogacy is banned and, since late 2024, prosecuted even when done abroad.",
    access_es: "Solo parejas hetero", access_en: "Heterosexual couples only",
    egg_es: "Permitida (desde 2014) · anónima", egg_en: "Allowed (since 2014) · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "Prohibida y perseguida incluso en el extranjero", surrogacy_en: "Banned and prosecuted even abroad",
    anonymity_es: "Sí", anonymity_en: "Yes",
    legal_basis: "Legge 40/2004 + ley 2024", legal_basis_en: "Legge 40/2004 + 2024 law",
    source_label: "Normattiva", source_url: "https://www.normattiva.it/eli/id/2024/11/18/24G00187/ORIGINAL", source_tier: "primaria",
    updated_es: "Ley oct–nov 2024", updated_en: "Oct–Nov 2024 law",
    confidence: "alta",
    change_es: "Desde finales de 2024 la subrogación es 'delito universal': perseguible aunque se realice fuera de Italia.",
    change_en: "Since late 2024 surrogacy is a 'universal crime': prosecutable even when carried out outside Italy.",
  },
  {
    country_es: "Alemania", country_en: "Germany",
    summary_es: "En Alemania la ovodonación está prohibida (una comisión recomendó legalizarla en 2024, pero aún no es ley); la donación de semen sí se permite, con registro de donantes. La subrogación está prohibida, así que muchos casos salen del país.",
    summary_en: "In Germany egg donation is banned (a commission recommended legalizing it in 2024, but it is not yet law); sperm donation is allowed, with a donor registry. Surrogacy is banned, so many cases go abroad.",
    access_es: "Parejas (acceso de mujer sola limitado)", access_en: "Couples (single-woman access limited)",
    egg_es: "Prohibida", egg_en: "Not allowed",
    sperm_es: "Permitido (registro de donantes)", sperm_en: "Allowed (donor registry)",
    surrogacy_es: "Prohibida", surrogacy_en: "Not allowed",
    anonymity_es: "Semen: no (registro)", anonymity_en: "Sperm: no (registry)",
    legal_basis: "Embryonenschutzgesetz 1990",
    source_label: "Gesetze im Internet", source_url: "https://www.gesetze-im-internet.de/eschg/", source_tier: "primaria",
    updated_es: "Estado nov 2026", updated_en: "As of Nov 2026",
    confidence: "alta",
    change_es: "La ovodonación sigue prohibida, pero una comisión federal recomendó legalizarla (2024); aún no es ley.",
    change_en: "Egg donation remains banned, but a federal commission recommended legalizing it (2024); not yet law.",
  },
  {
    country_es: "Chequia", country_en: "Czech Republic",
    summary_es: "Chequia da acceso a parejas hombre-mujer, no a mujeres solas ni a parejas de mujeres. La donación es anónima. La subrogación no está regulada (una zona gris legal).",
    summary_en: "Czechia gives access to opposite-sex couples, not to single women or female couples. Donation is anonymous. Surrogacy is unregulated (a legal grey area).",
    access_es: "Parejas hombre-mujer; no mujer sola ni pareja de mujeres", access_en: "Opposite-sex couples; not single women or female couples",
    egg_es: "Permitida · anónima", egg_en: "Allowed · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "No regulada (zona gris)", surrogacy_en: "Unregulated (grey area)",
    anonymity_es: "Sí", anonymity_en: "Yes",
    legal_basis: "Zákon 373/2011",
    source_label: "Zákon 373/2011", source_url: "https://www.zakonyprolidi.cz/cs/2011-373", source_tier: "secundaria",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media",
  },
  {
    country_es: "Grecia", country_en: "Greece",
    summary_es: "Grecia permite el tratamiento a mujeres solas y a parejas. La donación es anónima. Permite la gestación subrogada altruista con autorización judicial previa.",
    summary_en: "Greece allows treatment for single women and couples. Donation is anonymous. It allows altruistic surrogacy with prior court authorization.",
    access_es: "Mujer sola y parejas", access_en: "Single women and couples",
    egg_es: "Permitida · anónima", egg_en: "Allowed · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "Gestacional altruista (autorización judicial)", surrogacy_en: "Altruistic gestational (court authorization)",
    anonymity_es: "Sí", anonymity_en: "Yes",
    legal_basis: "Ley 3305/2005", legal_basis_en: "Law 3305/2005",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/", source_tier: "secundaria",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media",
  },
  {
    country_es: "Chipre (Sur · UE)", country_en: "Cyprus (South · EU)",
    summary_es: "La República de Chipre (el sur, miembro de la UE) aplica el marco europeo: acceso amplio y donación permitida. Conviene no confundirla con el norte de la isla.",
    summary_en: "The Republic of Cyprus (the south, an EU member) applies the European framework: broad access and donation allowed. Don't confuse it with the north of the island.",
    access_es: "Amplio", access_en: "Broad",
    egg_es: "Permitida", egg_en: "Allowed",
    sperm_es: "Permitido", sperm_en: "Allowed",
    surrogacy_es: "Regulada (marco de la República de Chipre)", surrogacy_en: "Regulated (Republic of Cyprus framework)",
    anonymity_es: "Variable", anonymity_en: "Varies",
    legal_basis: "Ley de reproducción asistida (República de Chipre)", legal_basis_en: "Assisted reproduction law (Republic of Cyprus)",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/", source_tier: "secundaria",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media-baja",
    change_es: "Estado miembro de la UE: aplica el marco regulador europeo.", change_en: "EU member state: the European regulatory framework applies.",
  },
  {
    country_es: "Chipre (Norte · TRNC)", country_en: "Cyprus (North · TRNC)",
    summary_es: "El norte de Chipre (TRNC) no pertenece a la UE y tiene un marco propio mucho más permisivo. Al ser menos regulado, conviene verificar cada detalle con la clínica.",
    summary_en: "Northern Cyprus (TRNC) is not part of the EU and has a much more permissive framework of its own. Being less regulated, it's worth checking every detail with the clinic.",
    access_es: "Muy amplio", access_en: "Very broad",
    egg_es: "Permitida (incl. donación)", egg_en: "Allowed (incl. donation)",
    sperm_es: "Permitido", sperm_en: "Allowed",
    surrogacy_es: "Disponible (marco propio)", surrogacy_en: "Available (own framework)",
    anonymity_es: "Anónima", anonymity_en: "Anonymous",
    legal_basis: "Marco propio del TRNC (fuera de la UE)", legal_basis_en: "TRNC's own framework (outside the EU)",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/", source_tier: "secundaria",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media-baja",
    change_es: "No pertenece a la UE; marco propio mucho más permisivo. Verificación por clínica recomendada.", change_en: "Not part of the EU; a much more permissive framework of its own. Per-clinic verification recommended.",
  },
  {
    country_es: "Polonia", country_en: "Poland",
    summary_es: "Polonia limita el acceso a parejas hombre-mujer. La donación es anónima. La subrogación no está reconocida legalmente.",
    summary_en: "Poland limits access to opposite-sex couples. Donation is anonymous. Surrogacy is not legally recognized.",
    access_es: "Solo parejas hombre-mujer; no mujer sola ni pareja de mujeres", access_en: "Opposite-sex couples only; not single women or female couples",
    egg_es: "Permitida · anónima", egg_en: "Allowed · anonymous",
    sperm_es: "Permitido · anónimo", sperm_en: "Allowed · anonymous",
    surrogacy_es: "No reconocida", surrogacy_en: "Not recognized",
    anonymity_es: "Sí", anonymity_en: "Yes",
    legal_basis: "Ley de infertilidad 2015", legal_basis_en: "2015 infertility act",
    source_label: "Dziennik Ustaw", source_url: "https://eli.gov.pl/eli/DU/2015/1087/ogl", source_tier: "primaria",
    updated_es: "rev. nov 2026", updated_en: "rev. Nov 2026",
    confidence: "media",
  },
  {
    country_es: "Turquía", country_en: "Turkey",
    summary_es: "Turquía solo permite el tratamiento a parejas heterosexuales casadas y con sus propios óvulos y semen; la donación de óvulos, semen o embriones está prohibida, por lo que muchos pacientes salen del país.",
    summary_en: "Turkey only allows treatment for married heterosexual couples using their own eggs and sperm; egg, sperm and embryo donation are banned, so many patients travel abroad.",
    access_es: "Solo parejas hetero casadas, con gametos propios", access_en: "Married heterosexual couples only, own gametes",
    egg_es: "Prohibida", egg_en: "Not allowed",
    sperm_es: "Prohibido", sperm_en: "Not allowed",
    surrogacy_es: "Prohibida", surrogacy_en: "Not allowed",
    anonymity_es: "N/A", anonymity_en: "N/A",
    legal_basis: "Reglamento ART 2014", legal_basis_en: "ART Regulation 2014",
    source_label: "T.C. Sağlık Bakanlığı", source_url: "https://www.saglik.gov.tr/", source_tier: "oficial",
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

/** Plain-language definitions of the comparison's dimensions, for people new to the topic. */
export const TERM_HELP = {
  access: { es: "Quién puede recibir tratamiento según la ley de ese país (según el tipo de pareja o la situación familiar).", en: "Who the law of that country allows to receive treatment (by type of couple or family situation)." },
  egg: { es: "Usar óvulos de una donante en lugar de los propios.", en: "Using a donor's eggs instead of your own." },
  sperm: { es: "Usar semen de un donante.", en: "Using donor sperm." },
  surrogacy: { es: "Que otra persona geste el embarazo por ti (gestación por sustitución).", en: "Another person carrying the pregnancy for you (surrogacy)." },
  anonymity: { es: "Si el donante es ANÓNIMO (su identidad no se conoce) o NO ANÓNIMO / identificable (la persona nacida puede llegar a conocerla, normalmente al cumplir 18 años).", en: "Whether the donor is ANONYMOUS (identity not disclosed) or NON-ANONYMOUS / identifiable (the person born can come to know it, usually at 18)." },
} as const;
