/**
 * Curated, hand-verified comparison of fertility regulation by country
 * (grouped by `region`: Europe, Latin America, other context rows).
 * Do NOT add countries, values, dates or URLs without verifying them first —
 * credibility depends on this data being exact.
 *
 * `legal_basis_en` is an optional English rendering of `legal_basis` for the
 * rows whose legal basis is written in Spanish (presentation only).
 */
export type RegConfidence = "alta" | "media" | "media-baja" | "baja";

export type RegRegion = "europe" | "latam" | "other";

export const REGION_ORDER: RegRegion[] = ["europe", "latam", "other"];

export const REGION_LABEL: Record<RegRegion, { es: string; en: string }> = {
  europe: { es: "Europa", en: "Europe" },
  latam: { es: "América Latina", en: "Latin America" },
  other: { es: "Otros", en: "Other" },
};

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
  region: RegRegion;
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
  /** Optional second tier when the cited source is mixed (e.g. primary/official). */
  source_tier_alt?: SourceTier;
  /** Optional qualifier shown after the tier (e.g. "case law", "context"). */
  source_tier_note_es?: string;
  source_tier_note_en?: string;
  updated_es: string;
  updated_en: string;
  confidence: RegConfidence;
  /** Optional qualifier shown next to the confidence badge. */
  confidence_note_es?: string;
  confidence_note_en?: string;
  change_es?: string;
  change_en?: string;
  summary_es: string;
  summary_en: string;
};

export const REGULATION: RegRow[] = [
  {
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
    region: "europe",
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
  // ——— América Latina (base v1, nov 2026) ———
  {
    region: "latam",
    country_es: "Argentina", country_en: "Argentina",
    summary_es: "El marco más desarrollado y liberal de la región; cobertura pública universal y obligatoria (hasta 4 tratamientos de baja complejidad al año y 3 de alta).",
    summary_en: "The most developed and liberal framework in the region; universal, mandatory public coverage (up to 4 low-complexity treatments a year and 3 high-complexity ones).",
    access_es: "Toda persona mayor de edad, sin discriminación por orientación sexual ni estado civil (mujeres solas y parejas del mismo sexo)",
    access_en: "Any adult, without discrimination by sexual orientation or marital status (single women and same-sex couples)",
    egg_es: "Permitida · no lucrativa · bancos registrados", egg_en: "Allowed · non-profit · registered banks",
    sperm_es: "Igual que la ovodonación (no lucrativo)", sperm_en: "Same as egg donation (non-profit)",
    surrogacy_es: "Vacío legal: ni prohibida ni regulada; autorización judicial caso a caso (altruista)", surrogacy_en: "Legal gap: neither banned nor regulated; court authorization case by case (altruistic)",
    anonymity_es: "Relativo (datos médicos accesibles; identidad por orden judicial, CCyC)", anonymity_en: "Relative (medical data accessible; identity by court order, Civil and Commercial Code)",
    legal_basis: "Ley 26.862 (2013) y Decreto 956/2013", legal_basis_en: "Law 26.862 (2013) and Decree 956/2013",
    source_label: "argentina.gob.ar", source_url: "https://www.argentina.gob.ar/normativa/nacional/217628/texto", source_tier: "primaria", source_tier_alt: "oficial",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "alta", confidence_note_es: "media en subrogación, por el vacío legal", confidence_note_en: "medium for surrogacy, due to the legal gap",
    change_es: "Ley especial del embrión pendiente; subrogación en debate parlamentario.",
    change_en: "A specific embryo law is pending; surrogacy is under parliamentary debate.",
  },
  {
    region: "latam",
    country_es: "Uruguay", country_en: "Uruguay",
    summary_es: "Ley integral con cobertura pública (SNIS en baja complejidad; FNR en alta, hasta 3 intentos); marco restrictivo en subrogación.",
    summary_en: "A comprehensive law with public coverage (SNIS for low complexity; FNR for high complexity, up to 3 attempts); a restrictive framework on surrogacy.",
    access_es: "Adultos menores de 60 años, cualquier estado civil, mujeres solas", access_en: "Adults under 60, any marital status, single women",
    egg_es: "Anónima y altruista", egg_en: "Anonymous and altruistic",
    sperm_es: "Anónimo y altruista", sperm_en: "Anonymous and altruistic",
    surrogacy_es: "Contratos nulos salvo una excepción altruista (pariente de 2º grado)", surrogacy_en: "Contracts void except one altruistic exception (2nd-degree relative)",
    anonymity_es: "Anónima (identidad solo por orden judicial)", anonymity_en: "Anonymous (identity only by court order)",
    legal_basis: "Ley 19.167 (2013) y Decreto 84/015", legal_basis_en: "Law 19.167 (2013) and Decree 84/015",
    source_label: "CEPAL · OIG", source_url: "https://oig.cepal.org/sites/default/files/2013_ley19.167_ury.pdf", source_tier: "primaria",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "alta",
  },
  {
    region: "latam",
    country_es: "México", country_en: "Mexico",
    summary_es: "Regulación fragmentada y estatal; destino relevante de subrogación y ovodonación para extranjeros. La práctica de la ovodonación y del anonimato es de facto (por verificar).",
    summary_en: "Fragmented, state-level regulation; a significant destination for surrogacy and egg donation for foreigners. Egg-donation and anonymity practice is de facto (to be verified).",
    access_es: "Sin ley federal; práctica privada amplia, varía por estado", access_en: "No federal law; broad private practice, varies by state",
    egg_es: "Sin regulación federal; de facto anónima y altruista (por verificar)", egg_en: "No federal regulation; de facto anonymous and altruistic (to be verified)",
    sperm_es: "De facto", sperm_en: "De facto",
    surrogacy_es: "Regulada a nivel estatal (Tabasco, Sinaloa); la SCJN la validó e invalidó el requisito de nacionalidad mexicana, abriéndola a extranjeros", surrogacy_en: "Regulated at state level (Tabasco, Sinaloa); the Supreme Court (SCJN) upheld it and struck down the Mexican-nationality requirement, opening it to foreigners",
    anonymity_es: "De facto (por verificar)", anonymity_en: "De facto (to be verified)",
    legal_basis: "Regulación estatal; SCJN Amparo 129/2019 (2021)", legal_basis_en: "State regulation; SCJN Amparo 129/2019 (2021)",
    source_label: "SCJN", source_url: "https://www.internet2.scjn.gob.mx/red2/comunicados/noticia.asp?id=6468", source_tier: "oficial",
    source_tier_note_es: "jurisprudencia", source_tier_note_en: "case law",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "media",
    change_es: "Marco estatal en evolución.", change_en: "State-level framework still evolving.",
  },
  {
    region: "latam",
    country_es: "Brasil", country_en: "Brazil",
    summary_es: "Sin ley; se rige por la Resolución CFM 2.320/2022 (norma ética del consejo médico, no ley).",
    summary_en: "No law; governed by CFM Resolution 2.320/2022 (an ethical rule of the medical council, not a law).",
    access_es: "Sin distinción de estado civil ni orientación; edad máxima 50 años", access_en: "No distinction by marital status or orientation; maximum age 50",
    egg_es: "Anónima (salvo familiar hasta 4º grado) y altruista; edad máxima del donante: mujer 37, varón 45", egg_en: "Anonymous (except a relative up to 4th degree) and altruistic; donor age limits: women 37, men 45",
    sperm_es: "Anónimo y altruista", sperm_en: "Anonymous and altruistic",
    surrogacy_es: "Solo altruista; gestante pariente consanguíneo hasta 4º grado", surrogacy_en: "Altruistic only; the carrier must be a blood relative up to 4th degree",
    anonymity_es: "Anónima", anonymity_en: "Anonymous",
    legal_basis: "Resolución CFM 2.320/2022", legal_basis_en: "CFM Resolution 2.320/2022",
    source_label: "CFM", source_url: "https://portal.cfm.org.br/noticias/conselho-federal-estabelece-novas-normas-para-reproducao-assistida/", source_tier: "oficial", source_tier_alt: "secundaria",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "media",
  },
  {
    region: "latam",
    country_es: "Chile", country_en: "Chile",
    summary_es: "Sin ley integral de reproducción asistida; la Ley 20.120 (2006) protege el embrión; FONASA ofrece un programa de fertilización asistida con cupos. El anonimato de facto está por verificar (por verificar).",
    summary_en: "No comprehensive assisted-reproduction law; Law 20.120 (2006) protects the embryo; FONASA offers an assisted-fertilization programme with limited places. De facto anonymity is unconfirmed (to be verified).",
    access_es: "Práctica amplia; acceso creciente de mujeres solas y parejas del mismo sexo", access_en: "Broad practice; growing access for single women and same-sex couples",
    egg_es: "De facto anónima; sin estatuto integral", egg_en: "De facto anonymous; no comprehensive statute",
    sperm_es: "De facto", sperm_en: "De facto",
    surrogacy_es: "No regulada ni reconocida (filiación por el parto)", surrogacy_en: "Neither regulated nor recognized (parentage follows birth)",
    anonymity_es: "De facto (por verificar)", anonymity_en: "De facto (to be verified)",
    legal_basis: "Ley 20.120 (2006); programa FONASA", legal_basis_en: "Law 20.120 (2006); FONASA programme",
    source_label: "ChileAtiende", source_url: "https://www.chileatiende.gob.cl/fichas/23778", source_tier: "oficial",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "media", confidence_note_es: "por verificar", confidence_note_en: "to be verified",
  },
  {
    region: "latam",
    country_es: "Colombia", country_en: "Colombia",
    summary_es: "Sin ley; el marco lo construye la jurisprudencia de la Corte Constitucional; cobertura frecuentemente por tutela, caso a caso (por verificar).",
    summary_en: "No law; the framework is built by Constitutional Court case law; coverage is often obtained through a tutela (constitutional claim), case by case (to be verified).",
    access_es: "Práctica privada amplia; matrimonio y adopción igualitarios reconocidos", access_en: "Broad private practice; equal marriage and adoption recognized",
    egg_es: "Sin regulación estatutaria; de facto", egg_en: "No statutory regulation; de facto",
    sperm_es: "De facto", sperm_en: "De facto",
    surrogacy_es: "Vacío legal; se practica de forma comercial; la Sentencia T-968/2009 fijó criterios; en 2026 hay debate para regularla o penalizarla", surrogacy_en: "Legal gap; practised commercially; Ruling T-968/2009 set criteria; in 2026 there is debate on regulating or criminalizing it",
    anonymity_es: "De facto", anonymity_en: "De facto",
    legal_basis: "Jurisprudencia de la Corte Constitucional (T-968/2009)", legal_basis_en: "Constitutional Court case law (T-968/2009)",
    source_label: "Asuntos Legales", source_url: "https://www.asuntoslegales.com.co/consumidor/maternidad-subrogada-un-panorama-legal-que-todavia-se-encuentra-en-construccion-3990761", source_tier: "secundaria",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "baja", confidence_note_es: "por verificar", confidence_note_en: "to be verified",
    change_es: "Debate legislativo en 2026.", change_en: "Legislative debate in 2026.",
  },
  {
    region: "latam",
    country_es: "Perú", country_en: "Peru",
    summary_es: "Sin ley específica; marco condicionado por la Ley General de Salud y resuelto caso a caso por los tribunales (por verificar).",
    summary_en: "No specific law; a framework conditioned by the General Health Law and resolved case by case by the courts (to be verified).",
    access_es: "Práctica privada; la Ley General de Salud 26842 (1997), art. 7, condiciona las técnicas a que la madre genética y la gestante sean la misma persona (por verificar texto literal)", access_en: "Private practice; General Health Law 26842 (1997), art. 7, makes the techniques conditional on the genetic mother and the carrier being the same person (exact wording to be verified)",
    egg_es: "Se practica pese a la tensión con el art. 7", egg_en: "Practised despite the tension with art. 7",
    sperm_es: "Por verificar", sperm_en: "To be verified",
    surrogacy_es: "Sin ley expresa; se practica; el Tribunal Constitucional resolvió un caso (Exp. 00882-2023, 2023)", surrogacy_en: "No express law; practised; the Constitutional Court ruled on a case (File 00882-2023, 2023)",
    anonymity_es: "Ambiguo (por verificar)", anonymity_en: "Ambiguous (to be verified)",
    legal_basis: "Ley 26842 (1997), art. 7; TC Exp. 00882-2023 (2023)", legal_basis_en: "Law 26842 (1997), art. 7; Constitutional Court File 00882-2023 (2023)",
    source_label: "LP Derecho", source_url: "https://lpderecho.pe/gestacion-por-sustitucion-e-interes-superior-del-nino-primeras-impresiones-sobre-la-sentencia-del-tribunal-constitucional-peruano/", source_tier: "secundaria", source_tier_alt: "oficial",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "baja", confidence_note_es: "por verificar", confidence_note_en: "to be verified",
  },
  {
    region: "latam",
    country_es: "Costa Rica", country_en: "Costa Rica",
    summary_es: "La FIV, prohibida en 2000, fue re-autorizada tras la sentencia de la Corte Interamericana (Artavia Murillo vs. Costa Rica, 2012) e incorporada al sistema público (CCSS); detalles de acceso (por verificar).",
    summary_en: "IVF, banned in 2000, was re-authorized after the Inter-American Court ruling (Artavia Murillo v. Costa Rica, 2012) and incorporated into the public system (CCSS); access details (to be verified).",
    access_es: "Por verificar", access_en: "To be verified",
    egg_es: "Por verificar", egg_en: "To be verified",
    sperm_es: "Por verificar", sperm_en: "To be verified",
    surrogacy_es: "No regulada ni reconocida", surrogacy_en: "Neither regulated nor recognized",
    anonymity_es: "Por verificar", anonymity_en: "To be verified",
    legal_basis: "Corte IDH, Artavia Murillo (2012); Decreto 39210-MP-S (2015)", legal_basis_en: "Inter-American Court of Human Rights, Artavia Murillo (2012); Decree 39210-MP-S (2015)",
    source_label: "Corte IDH", source_url: "https://www.corteidh.or.cr/tablas/fichas/artaviamurillo.pdf", source_tier: "oficial",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "baja", confidence_note_es: "por verificar", confidence_note_en: "to be verified",
  },
  // ——— Otros (contexto) ———
  {
    region: "other",
    country_es: "Estados Unidos (contexto)", country_en: "United States (context)",
    summary_es: "Sistema federal y fragmentado; la intervención federal es acotada (reporte de tasas de éxito al CDC por la ley de 1992; FDA en donantes); no comparable con una ley nacional única. Cifras (por verificar).",
    summary_en: "A federal, fragmented system; federal involvement is limited (success-rate reporting to the CDC under the 1992 law; FDA for donors); not comparable to a single national law. Figures (to be verified).",
    access_es: "Sin ley federal única; se decide estado por estado", access_en: "No single federal law; decided state by state",
    egg_es: "La FDA regula el tamizaje de donantes; los mandatos de cobertura por seguro varían por estado", egg_en: "The FDA regulates donor screening; insurance coverage mandates vary by state",
    sperm_es: "FDA (tamizaje)", sperm_en: "FDA (screening)",
    surrogacy_es: "Varía por estado, de muy permisivo (p. ej. California) a restrictivo", surrogacy_en: "Varies by state, from very permissive (e.g. California) to restrictive",
    anonymity_es: "Varía por estado", anonymity_en: "Varies by state",
    legal_basis: "Marco federal mínimo (Fertility Clinic Success Rate and Certification Act, 1992; FDA) + regulación estatal", legal_basis_en: "Minimal federal framework (Fertility Clinic Success Rate and Certification Act, 1992; FDA) + state regulation",
    source_label: "CDC", source_url: "https://www.cdc.gov/art/", source_tier: "secundaria",
    source_tier_note_es: "contexto", source_tier_note_en: "context",
    updated_es: "nov 2026", updated_en: "Nov 2026",
    confidence: "media", confidence_note_es: "contexto; cifras por verificar", confidence_note_en: "context; figures to be verified",
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
  baja: { es: "Baja", en: "Low" },
};

/** Plain-language definitions of the comparison's dimensions, for people new to the topic. */
export const TERM_HELP = {
  access: { es: "Quién puede recibir tratamiento según la ley de ese país (según el tipo de pareja o la situación familiar).", en: "Who the law of that country allows to receive treatment (by type of couple or family situation)." },
  egg: { es: "Usar óvulos de una donante en lugar de los propios.", en: "Using a donor's eggs instead of your own." },
  sperm: { es: "Usar semen de un donante.", en: "Using donor sperm." },
  surrogacy: { es: "Que otra persona geste el embarazo por ti (gestación por sustitución).", en: "Another person carrying the pregnancy for you (surrogacy)." },
  anonymity: { es: "Si el donante es ANÓNIMO (su identidad no se conoce) o NO ANÓNIMO / identificable (la persona nacida puede llegar a conocerla, normalmente al cumplir 18 años).", en: "Whether the donor is ANONYMOUS (identity not disclosed) or NON-ANONYMOUS / identifiable (the person born can come to know it, usually at 18)." },
} as const;
