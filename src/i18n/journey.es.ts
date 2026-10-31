// Exact-copy (and patterned) Spanish dictionary for the patient journey that an
// example case — or a real profile — produces: orientation factors, plans,
// regulatory verdicts, citations, price sources and pricing notes.
// Keys are the exact English engine strings; engine outputs are never modified.

export const COUNTRY_ES: Record<string, string> = {
  Spain: "España",
  Italy: "Italia",
  France: "Francia",
  Portugal: "Portugal",
  Greece: "Grecia",
  "Czech Republic": "República Checa",
  Czechia: "Chequia",
  Denmark: "Dinamarca",
  Germany: "Alemania",
  Switzerland: "Suiza",
  Poland: "Polonia",
  "United Kingdom": "Reino Unido",
  Belgium: "Bélgica",
  Netherlands: "Países Bajos",
  Cyprus: "Chipre",
  Estonia: "Estonia",
  Finland: "Finlandia",
};

const NEED_ES: Record<string, string> = {
  "IVF with own eggs": "FIV con óvulos propios",
  "Treatment with donor sperm": "Tratamiento con semen de donante",
  "Egg donation": "Ovodonación",
  "Insemination with donor sperm": "Inseminación con semen de donante",
  "Embryo genetic testing (PGT)": "Test genético embrionario (PGT)",
  "Egg freezing": "Congelación de óvulos",
  "ROPA method (shared motherhood)": "Método ROPA (maternidad compartida)",
};

const FACTOR_TITLE_ES: Record<string, string> = {
  "Favorable age": "Edad favorable",
  "Ovarian reserve in range": "Reserva ovárica en rango",
  "No adverse factors identified": "Sin factores adversos identificados",
  "You've started informing yourself early": "Has empezado a informarte pronto",
  "Age to keep in mind": "Edad a tener en cuenta",
  "Advanced age for own eggs": "Edad avanzada para óvulos propios",
  "Low ovarian reserve": "Reserva ovárica baja",
  "Endometriosis": "Endometriosis",
  "Polycystic ovary syndrome (PCOS)": "Síndrome de ovario poliquístico (SOP)",
  "Male factor": "Factor masculino",
  "Tubal factor": "Factor tubárico",
  "AMH level": "Nivel de AMH",
  "Antral follicle count": "Recuento de folículos antrales",
  "Hormone panel (FSH, estradiol)": "Perfil hormonal (FSH, estradiol)",
  "Confirmed diagnosis": "Diagnóstico confirmado",
};

export const JOURNEY_ES: Record<string, string> = {
  ...NEED_ES,
  ...FACTOR_TITLE_ES,
  ...COUNTRY_ES,
  // Orientation factors (why)
  "Your markers (AMH and follicle count) don't suggest a diminished reserve.": "Tus marcadores (AMH y recuento de folículos) no apuntan a una reserva disminuida.",
  "No specific cause has been identified, which keeps more options open.": "No se ha identificado una causa concreta, lo que mantiene más opciones abiertas.",
  "Seeking orientation proactively helps you decide with more room to manoeuvre.": "Buscar orientación por iniciativa propia te ayuda a decidir con más margen.",
  "It can affect the outcome and needs specialist assessment.": "Puede influir en el resultado y necesita la valoración de un especialista.",
  "Often associated with irregular cycles and requires adjusting the stimulation protocol.": "Suele asociarse a ciclos irregulares y obliga a ajustar el protocolo de estimulación.",
  "ICSI is commonly considered in these cases; the specialist should assess it.": "En estos casos se suele plantear la ICSI; debe valorarlo el especialista.",
  "Often points toward IVF, since fertilisation wouldn't happen naturally.": "Suele orientar hacia la FIV, ya que la fecundación no se produciría de forma natural.",
  "A history of previous attempts is relevant information for rethinking the approach.": "Los intentos anteriores son información relevante para replantear el enfoque.",
  "Context: it may point toward moving to more complex techniques.": "Contexto: puede apuntar a pasar a técnicas más complejas.",
  "It's the main marker for estimating your ovarian reserve.": "Es el principal marcador para estimar tu reserva ovárica.",
  "It complements AMH to estimate the response to stimulation.": "Complementa a la AMH para estimar la respuesta a la estimulación.",
  "Helps complete the baseline hormonal assessment.": "Ayuda a completar la valoración hormonal basal.",
  "Without a diagnosis, the orientation is necessarily more generic.": "Sin diagnóstico, la orientación es necesariamente más genérica.",
  "Your profile is complete, so the orientation draws on all the relevant factors.": "Tu perfil está completo, así que la orientación tiene en cuenta todos los factores relevantes.",
  "This orientation is informational and does not constitute a diagnosis or replace a medical professional's judgement.":
    "Esta orientación es informativa: no es un diagnóstico ni sustituye el criterio de un profesional médico.",
  // Plans
  "IVF + ICSI": "FIV + ICSI",
  "IVF + ICSI + genetic test": "FIV + ICSI + test genético",
  "It appears because you've indicated an interest in preserving your fertility.": "Aparece porque has indicado que te interesa preservar tu fertilidad.",
  "It appears because your markers suggest a low reserve; the literature describes it as a common route in these cases.":
    "Aparece porque tus marcadores apuntan a una reserva baja; la literatura la describe como una vía habitual en estos casos.",
  "It appears because embryo genetic testing is often considered in profiles with advanced age or previous attempts.":
    "Aparece porque el test genético embrionario se suele plantear en perfiles con edad avanzada o intentos previos.",
  "It appears because male factor is usually addressed with ICSI.": "Aparece porque el factor masculino se suele abordar con ICSI.",
  "It appears because of your history of previous attempts.": "Aparece por tus intentos anteriores.",
  "It appears as the standard own-eggs route for your profile.": "Aparece como la vía estándar con óvulos propios para tu perfil.",
  "This range will refine automatically as we bring in real patient quotes and partner-clinic rate cards.":
    "Este rango se afinará automáticamente a medida que incorporemos presupuestos reales de pacientes y tarifas de clínicas colaboradoras.",
  "It's an orientative range, not a quote. Only the clinic can give you an exact price, based on your specific case.":
    "Es un rango orientativo, no un presupuesto. Solo la clínica puede darte un precio exacto según tu caso.",
  // Next steps
  "Review your detailed report with all cited sources.": "Revisa tu informe detallado con todas las fuentes citadas.",
  "Talk to a professional before making any decision.": "Habla con un profesional antes de tomar cualquier decisión.",
  // Reference clinics (anonymized)
  "Reference clinic — Barcelona": "Clínica de referencia — Barcelona",
  "Reference clinic — Madrid": "Clínica de referencia — Madrid",
  "Reference clinic — Madrid (donor programme)": "Clínica de referencia — Madrid (programa de donación)",
  "Reference clinic — Prague": "Clínica de referencia — Praga",
  "Broad own-egg and donor programmes": "Amplios programas con óvulos propios y de donante",
  "English-speaking coordination": "Coordinación en inglés",
  "Genetic testing on-site": "Test genético en el propio centro",
  "Premium-segment pricing": "Precios de gama alta",
  "Longer waits in peak season": "Esperas más largas en temporada alta",
  "Established egg-donation programme": "Programa de ovodonación consolidado",
  "Shorter donor-matching times": "Menos tiempo para asignar donante",
  "Solid clinical track record": "Trayectoria clínica sólida",
  "Transparent per-component pricing": "Precios transparentes por componente",
  "A physical-clinic quote may differ": "El presupuesto en la clínica puede ser distinto",
  "Lower price level than Spain": "Nivel de precios más bajo que en España",
  "Frequent international-patient support": "Atención habitual a pacientes internacionales",
  "Add travel and accommodation": "Suma viaje y alojamiento",
  "Heterosexual-couple access only (check eligibility first)": "Acceso solo para parejas heterosexuales (comprueba antes si puedes acceder)",
  "Clinic A": "Clínica A",
  "Clinic B": "Clínica B",
  "Clinic C": "Clínica C",
  "Clinic-reported": "Declarado por la clínica",
  // Regulatory framework
  "European Atlas of Fertility Treatment Policies 2024 — Fertility Europe & EPF": "Atlas Europeo de Políticas de Tratamientos de Fertilidad 2024 — Fertility Europe y EPF",
  "Public, citable data. Regulation changes: re-verify before each publication.": "Datos públicos y citables. La normativa cambia: se revisa antes de cada publicación.",
  "Orientative information about the legal framework, based on public sources and subject to change. It is not legal or medical advice: confirm it with the clinic and, where relevant, a legal professional.":
    "Información orientativa sobre el marco legal, basada en fuentes públicas y sujeta a cambios. No es asesoramiento legal ni médico: confírmalo con la clínica y, si procede, con un profesional del derecho.",
  "Donation is anonymous: you won't know the donor's identity, nor will the child be able to.": "La donación es anónima: no conocerás la identidad de la donante, ni tampoco podrá hacerlo el niño o la niña.",
  "Donation is NOT anonymous: the child will be able to know the donor's identity upon reaching adulthood.": "La donación NO es anónima: al llegar a la mayoría de edad, el hijo o la hija podrá conocer la identidad de la donante.",
  "There are anonymous and open-identity donors: you can choose.": "Hay donantes anónimos y de identidad abierta: puedes elegir.",
  "The donor anonymity regime must be confirmed with the clinic.": "El régimen de anonimato de la donación debe confirmarse con la clínica.",
  "Public funding is uneven across autonomous communities and the waiting list is long (>12 months).": "La financiación pública varía entre comunidades autónomas y la lista de espera es larga (más de 12 meses).",
  "Restrictive framework: single women and female couples have NO access. It's the largest exporter of patients abroad (45% have already been treated abroad).":
    "Marco restrictivo: las mujeres solas y las parejas de mujeres NO tienen acceso. Es el país que más pacientes envía al extranjero (el 45 % ya se ha tratado fuera).",
  "After the 2021 bioethics law: open access for single women and female couples, and NON-anonymous donation.": "Tras la ley de bioética de 2021: acceso abierto para mujeres solas y parejas de mujeres, y donación NO anónima.",
  "NON-anonymous donation. Long public waiting list (>12 months).": "Donación NO anónima. Lista de espera pública larga (más de 12 meses).",
  "Single women YES; female couples NO. Mixed donation (anonymous or open-identity).": "Mujeres solas SÍ; parejas de mujeres NO. Donación mixta (anónima o de identidad abierta).",
  "CHEAP BUT RESTRICTIVE: heterosexual couples only. Key warning before someone travels for price.": "BARATO PERO RESTRICTIVO: solo parejas heterosexuales. Un aviso clave antes de viajar por precio.",
  "Anonymous or open-identity donor, by choice. A European reference for sperm donation.": "Donante anónimo o de identidad abierta, a elegir. Una referencia europea en donación de semen.",
  "EGG DONATION PROHIBITED and a legal ban on most embryo freezing. That's why German patients travel: in the DACH region, legislation weighs MORE than cost as the reason.":
    "OVODONACIÓN PROHIBIDA y prohibición legal de congelar la mayoría de los embriones. Por eso las pacientes alemanas viajan: en la región DACH, la legislación pesa MÁS que el coste como motivo.",
  "Very restrictive: egg donation prohibited and no public funding.": "Muy restrictivo: ovodonación prohibida y sin financiación pública.",
  "Heterosexual couples only. Embryo donation is mandatory (leftovers must be donated).": "Solo parejas heterosexuales. La donación de embriones es obligatoria (los sobrantes deben donarse).",
  "NON-anonymous donation (identity disclosable at 18). Uneven funding by region.": "Donación NO anónima (la identidad puede conocerse a los 18 años). Financiación desigual según la región.",
  "The most favourable framework in Europe per the 2024 Atlas, alongside the Netherlands.": "El marco más favorable de Europa según el Atlas 2024, junto con Países Bajos.",
  "Single women YES; female couples NO. No public funding.": "Mujeres solas SÍ; parejas de mujeres NO. Sin financiación pública.",
  // Evidence: sources and citations
  "HFEA — Human Fertilisation and Embryology Authority (UK)": "HFEA — Autoridad de Fertilización y Embriología Humana (Reino Unido)",
  "HFEA (UK)": "HFEA (Reino Unido)",
  "ESHRE / European IVF-Monitoring Consortium · Human Reproduction 38(12)": "ESHRE / Consorcio Europeo de Monitorización de FIV · Human Reproduction 38(12)",
  "Fertility Europe & European Parliamentary Forum (EPF)": "Fertility Europe y Foro Parlamentario Europeo (EPF)",
  "2023 data, published 2025": "datos de 2023, publicados en 2025",
  "2022 data": "datos de 2022",
  "2019 data, published 2023": "datos de 2019, publicados en 2023",
  "Data extracted June 2024": "datos extraídos en junio de 2024",
  "Pregnancy rate with donor eggs": "Tasa de embarazo con óvulos de donante",
  "Pregnancy rate with a frozen embryo transfer": "Tasa de embarazo con transferencia de embrión congelado",
  "Pregnancy rate transferring a blastocyst (day 5–6) vs a day-3 embryo": "Tasa de embarazo al transferir un blastocisto (día 5–6) frente a un embrión de día 3",
  "Chance of a live birth across three complete cycles": "Probabilidad de nacido vivo tras tres ciclos completos",
  "Live birth rate with own eggs, all ages": "Tasa de nacido vivo con óvulos propios, todas las edades",
  "Fresh embryo transfer, patient's own eggs, UK, 2023": "Transferencia de embrión en fresco, óvulos propios, Reino Unido, 2023",
  "Fresh embryo transfer, patient's own eggs, UK, 2022": "Transferencia de embrión en fresco, óvulos propios, Reino Unido, 2022",
  "Fresh embryo transfer with donated oocytes, 40 European countries, 2019": "Transferencia de embrión en fresco con ovocitos donados, 40 países europeos, 2019",
  "Frozen embryo transfer, UK, 2023": "Transferencia de embrión congelado, Reino Unido, 2023",
  "Fresh IVF + ICSI cycles, Europe, 2019 (vs 26.5% for cleavage-stage)": "Ciclos en fresco de FIV + ICSI, Europa, 2019 (frente al 26,5 % en día 3)",
  "UK population-based study, 178,898 women, all ages": "Estudio poblacional en Reino Unido, 178.898 mujeres, todas las edades",
  "Figure 3 — IVF pregnancy rate using fresh embryo transfers, by patient age": "Figura 3 — tasa de embarazo en FIV con transferencias en fresco, según la edad de la paciente",
  "Figure 3 — rose from 24% (2013) to 34% (2023)": "Figura 3 — pasó del 24 % (2013) al 34 % (2023)",
  "Figure 3 — rose from 18% (2013) to 25% (2023)": "Figura 3 — pasó del 18 % (2013) al 25 % (2023)",
  "Figure 1 — rose from 10% (2012) to 16% (2022)": "Figura 1 — pasó del 10 % (2012) al 16 % (2022)",
  "Figure 3 — rose from 6% (2013) to 9% (2023)": "Figura 3 — pasó del 6 % (2013) al 9 % (2023)",
  "Figure 4 — IVF birth rate using fresh embryo transfers": "Figura 4 — tasa de nacimientos en FIV con transferencias en fresco",
  "Figure 4 — rose from 19% (2013) to 25% (2023)": "Figura 4 — pasó del 19 % (2013) al 25 % (2023)",
  "Results — 'the PR per fresh ET was 50.5% (49.6% in 2018)'": "Resultados — «la tasa de embarazo por transferencia en fresco fue del 50,5 % (49,6 % en 2018)»",
  "Trends and figures 2023 — frozen embryo transfers": "Tendencias y cifras 2023 — transferencias de embriones congelados",
  "Results — 'PRs for blastocyst transfers to be higher (39.4%) than for cleavage-stage embryos (26.5%)'": "Resultados — «tasas de embarazo más altas con blastocisto (39,4 %) que con embriones de día 3 (26,5 %)»",
  "Cumulative delivery rate discussion": "Discusión sobre la tasa acumulada de partos",
  "This is a UK population average per embryo transferred — not your personal probability, and not your chance per cycle started. HFEA itself notes that birth rates from 2019–2023 are likely underestimated while clinic data is still being validated.":
    "Es una media de la población de Reino Unido por embrión transferido: no es tu probabilidad personal ni tu probabilidad por ciclo iniciado. La propia HFEA advierte de que las tasas de nacimiento de 2019–2023 probablemente estén infraestimadas mientras se validan los datos de las clínicas.",
  "This is a UK population average per embryo transferred — not your personal probability, and not your chance per cycle started. HFEA itself notes that birth rates from 2019–2023 are likely underestimated while clinic data is still being validated. This band is taken from the 2022 report, which breaks it out explicitly.":
    "Es una media de la población de Reino Unido por embrión transferido: no es tu probabilidad personal ni tu probabilidad por ciclo iniciado. La propia HFEA advierte de que las tasas de nacimiento de 2019–2023 probablemente estén infraestimadas mientras se validan los datos de las clínicas. Esta franja procede del informe de 2022, que la desglosa expresamente.",
  "This is a UK population average per embryo transferred — not your personal probability, and not your chance per cycle started. HFEA itself notes that birth rates from 2019–2023 are likely underestimated while clinic data is still being validated. At this age most clinics discuss donor eggs, which are not subject to the same age-related decline.":
    "Es una media de la población de Reino Unido por embrión transferido: no es tu probabilidad personal ni tu probabilidad por ciclo iniciado. La propia HFEA advierte de que las tasas de nacimiento de 2019–2023 probablemente estén infraestimadas mientras se validan los datos de las clínicas. A esta edad la mayoría de las clínicas plantean óvulos de donante, que no sufren el mismo descenso por edad.",
  "This is the number that best reflects a real fertility journey: most patients need more than one cycle. Do not compare it against a single-cycle figure.":
    "Es la cifra que mejor refleja un recorrido real de fertilidad: la mayoría de las pacientes necesitan más de un ciclo. No la compares con una cifra de un solo ciclo.",
  "Donor-egg outcomes are largely independent of the recipient's age — ESHRE found recipient age had little influence. That is why this figure is so much higher, not because the clinic is better.":
    "Los resultados con óvulos de donante dependen poco de la edad de la receptora: ESHRE vio que la edad de la receptora apenas influía. Por eso esta cifra es mucho más alta, no porque la clínica sea mejor.",
  "Frozen transfers look better than fresh partly because they select for patients who already produced embryos worth freezing. It is not a like-for-like comparison.":
    "Las transferencias de congelados parecen mejores que las de fresco en parte porque seleccionan a pacientes que ya produjeron embriones aptos para congelar. No es una comparación equivalente.",
  "Blastocyst transfer yields a higher rate per transfer, but fewer embryos survive to that stage — so you may end up with fewer transfers overall. The per-transfer number flatters it.":
    "La transferencia de blastocisto da una tasa más alta por transferencia, pero menos embriones llegan a esa fase, así que puedes acabar con menos transferencias en total. La cifra por transferencia la favorece.",
  // Price sources
  "Public market guides": "Guías públicas de mercado",
  "OVU — Fertility cost guide (Western/Eastern Europe), 2026": "OVU — Guía de costes de fertilidad (Europa occidental y oriental), 2026",
  "EggDonationFriends — Egg donation costs worldwide, 2026": "EggDonationFriends — Costes de la ovodonación en el mundo, 2026",
  "FertilityClinicsAbroad — Cheapest IVF in Europe, 2026": "FertilityClinicsAbroad — La FIV más barata de Europa, 2026",
  "FertilityRoad — IVF cost explained, 2026": "FertilityRoad — El coste de la FIV, explicado, 2026",
  "Fertility Consultancy — Donor egg IVF costs worldwide, 2026": "Fertility Consultancy — Costes de la FIV con óvulos de donante en el mundo, 2026",
  "Spanish Fertility Society (SEF) / The Local ES, 2025": "Sociedad Española de Fertilidad (SEF) / The Local ES, 2025",
  "FIV Valencia — published price list (clinic primary source), 2026": "FIV Valencia — tarifas publicadas (fuente primaria de clínica), 2026",
  "Spanish Fertility Society (SEF) — rates per transfer": "Sociedad Española de Fertilidad (SEF) — tasas por transferencia",
  "ESHRE / EIM — ART in Europe (registry), 2023 data": "ESHRE / EIM — Reproducción asistida en Europa (registro), datos de 2023",
  // Pricing notes
  "We've widened the range because patients in your age bracket more often need extra tests or a second attempt.":
    "Hemos ampliado el rango porque en tu franja de edad es más habitual necesitar pruebas extra o un segundo intento.",
  "With previous failed cycles, guarantee programs may offset the extra cost.": "Con ciclos previos sin éxito, los programas de garantía pueden compensar el coste extra.",
  "Since you flagged interest in genetic testing (PGT-A), we've included it in the premium scenario.": "Como te interesa el test genético (PGT-A), lo hemos incluido en el escenario premium.",
  "We've added ICSI to the scenarios where it applies.": "Hemos añadido la ICSI en los escenarios en los que aplica.",
  "These estimates are indicative and don't replace an official clinic quote. They are not medical advice.":
    "Estas estimaciones son orientativas y no sustituyen el presupuesto oficial de una clínica. No son consejo médico.",
  "Almost always EXCLUDED from the clinic's advertised price.": "Casi siempre EXCLUIDA del precio anunciado por la clínica.",
  "The cost depends on how many embryos are analysed.": "El coste depende de cuántos embriones se analicen.",
  "Subscription-like model: paid while you keep the material.": "Modelo tipo suscripción: se paga mientras conservas el material.",
  "Guarantee (live-birth) programmes can exceed €15,000.": "Los programas de garantía (de nacido vivo) pueden superar los 15.000 €.",
  "European low end; frequent treatment destination.": "Gama baja europea; destino de tratamiento frecuente.",
  "Sparse data; to validate.": "Datos escasos; pendiente de validar.",
  "Regulation varies by area.": "La normativa varía según la zona.",
  "Ovarian stimulation guideline": "Guía de estimulación ovárica",
  "Oocyte donation guidance": "Recomendaciones sobre donación de ovocitos",
  "Diagnostic evaluation of infertility": "Evaluación diagnóstica de la infertilidad",
  "Missing": "Falta",
  // Raw treatment values shown in the orientation snapshot
  "egg donation": "ovodonación",
  "social freezing": "congelación de óvulos",
  "ivf": "FIV",
  "icsi": "ICSI",
  "iui": "IA",
  "unsure": "aún sin decidir",
  "Estimated range from prices published on clinic websites, reports and accessible studies.": "Rango estimado a partir de precios publicados en webs de clínicas, informes y estudios accesibles.",
};

const TREATMENT_KEY_ES: Record<string, string> = {
  IVF: "FIV", ICSI: "ICSI", DONOR: "DONACIÓN", FREEZING: "CONGELACIÓN", ROPA: "ROPA", IUI: "IA", PGT: "PGT",
};

const lookup = (text: string) => JOURNEY_ES[text] ?? text;
const country = (label: string) => COUNTRY_ES[label] ?? label;
/** Need labels (lower-cased in regulatory "why" sentences), with their Spanish article. */
const NEED_WITH_ARTICLE: Record<string, string> = {
  "ivf with own eggs": "la FIV con óvulos propios",
  "treatment with donor sperm": "el tratamiento con semen de donante",
  "egg donation": "la ovodonación",
  "insemination with donor sperm": "la inseminación con semen de donante",
  "embryo genetic testing (pgt)": "el test genético embrionario (PGT)",
  "egg freezing": "la congelación de óvulos",
  "ropa method (shared motherhood)": "el método ROPA (maternidad compartida)",
};
const need = (lower: string) => NEED_WITH_ARTICLE[lower] ?? lower;
/** "Egg donation" → "la ovodonación" — for Spanish prose built around a need label. */
export const needWithArticleEs = (label: string) => need(label.toLowerCase());
const plural = (n: string, one: string, many: string) => (n === "1" ? one : many);

type Rule = [RegExp, (...m: string[]) => string];

const RULES: Rule[] = [
  [/^At (\d+), age is on your side: it's the factor that most influences outcomes\.$/, (a) => `Con ${a} años, la edad juega a tu favor: es el factor que más influye en los resultados.`],
  [/^At (\d+), per-transfer rates decline compared with younger ages\.$/, (a) => `Con ${a} años, las tasas por transferencia bajan respecto a edades más jóvenes.`],
  [/^At (\d+), options with your own eggs narrow and egg donation often enters the conversation\.$/, (a) => `Con ${a} años, las opciones con óvulos propios se reducen y la ovodonación suele entrar en la conversación.`],
  [/^Your markers \((.+)\) suggest a diminished reserve, which may affect the number of eggs per cycle\.$/, (b) =>
    `Tus marcadores (${b.replace("antral follicle count", "recuento de folículos antrales")}) apuntan a una reserva disminuida, lo que puede afectar al número de óvulos por ciclo.`],
  [/^(\d+) previous IVF cycle\(s\) without success$/, (n) => `${n} ${plural(n, "FIV previa sin éxito", "FIV previas sin éxito")}`],
  [/^(\d+) previous insemination\(s\)$/, (n) => `${n} ${plural(n, "inseminación previa", "inseminaciones previas")}`],
  [/^(\d+) relevant data point\(s\) are missing\. The more you complete, the more accurate your orientation\.$/, (n) =>
    `${plural(n, "Falta 1 dato relevante", `Faltan ${n} datos relevantes`)}. Cuanto más completes, más precisa será tu orientación.`],
  [/^Complete (\d+) data point\(s\) to refine your orientation: (.+)\.$/, (n, list) =>
    `Completa ${plural(n, "1 dato", `${n} datos`)} para afinar tu orientación: ${list.split(", ").map(lookup).join(", ")}.`],
  [/^It appears because of your age \((.+)\), a scenario where it often enters the conversation\.$/, (a) => `Aparece por tu edad (${a}), un escenario en el que suele entrar en la conversación.`],
  [/^In (.+?), (.+) is available for your situation\.$/, (c, n) => `En ${country(c)}, ${need(n)} está disponible para tu situación.`],
  [/^In (.+?), (.+) is not available for your situation under the current legal framework\.$/, (c, n) => `En ${country(c)}, ${need(n)} no está disponible para tu situación con el marco legal actual.`],
  [/^We haven't confirmed the legal framework for (.+) in (.+)\.$/, (n, c) => `No hemos confirmado el marco legal de ${need(n).replace(/^(la|el) /, (a) => a === "el " ? "del " : "de la ")} en ${country(c)}.`],
  [/^In (.+) there are (\d+) option\(s\) out of your reach\. We show you where they would be available\.$/, (c, n) =>
    `En ${country(c)} ${plural(n, "hay 1 opción fuera de tu alcance", `hay ${n} opciones fuera de tu alcance`)}. Te mostramos dónde ${plural(n, "estaría disponible", "estarían disponibles")}.`],
  [/^In (.+), all the options you're looking for are available for your situation\.$/, (c) => `En ${country(c)}, todas las opciones que buscas están disponibles para tu situación.`],
  [/^There is (public|partial public|no public) funding in (.+?)(, with waiting lists of more than 12 months|, with waiting lists of 6 to 12 months|, with waiting lists of under 6 months|, with no notable waiting list)?\.(.*) Confirm it with your health system: access conditions vary\.$/, (kind, c, wait, extra) => {
    const f = kind === "public" ? "Hay financiación pública" : kind === "partial public" ? "Hay financiación pública parcial" : "No hay financiación pública";
    const w = !wait ? "" : wait.includes("more than 12") ? ", con listas de espera de más de 12 meses" : wait.includes("6 to 12") ? ", con listas de espera de 6 a 12 meses" : wait.includes("under 6") ? ", con listas de espera de menos de 6 meses" : ", sin listas de espera destacables";
    return `${f} en ${country(c)}${w}.${extra ? " " + lookup(extra.trim()) : ""} Confírmalo con tu sistema de salud: las condiciones de acceso varían.`;
  }],
  [/^For your case, we started from typical prices in (.+) for a (.+) treatment, then adjusted the range based on your age \((\d+)\)\.$/, (c, tr, a) =>
    `Para tu caso, partimos de los precios habituales en ${country(c)} para un tratamiento de ${TREATMENT_KEY_ES[tr] ?? tr} y ajustamos el rango según tu edad (${a}).`],
  [/^Prices in (.+) are typically 20–35% lower than in Spain, but you should add travel and accommodation\.$/, (c) => `Los precios en ${country(c)} suelen ser un 20–35 % más bajos que en España, pero hay que sumar viaje y alojamiento.`],
  [/^Estimated by (.+)'s price level \(index (.+)\)\.$/, (c, i) => `Estimado según el nivel de precios de ${country(c)} (índice ${i}).`],
  [/^(.+\.) Estimated by (.+)'s price level \(index (.+)\)\.$/, (note, c, i) => `${lookup(note)} Estimado según el nivel de precios de ${country(c)} (índice ${i}).`],
  [/^(.+) Range computed (for Spain|for (.+), adjusted by its price level relative to Spain), summing (\d+) treatment components \((.+)\)\.$/, (blurb, geo, c, n, tier) =>
    `${lookup(blurb)} Rango calculado ${c ? `para ${country(c)}, ajustado por su nivel de precios respecto a España` : "para España"}, sumando ${n} componentes del tratamiento (${lookup(tier.charAt(0).toUpperCase() + tier.slice(1)).toLowerCase()}).`],
  [/^Pregnancy rate with own eggs, ages (.+)$/, (b) => `Tasa de embarazo con óvulos propios, edades ${b}`],
  [/^Live birth rate with own eggs, ages (.+)$/, (b) => `Tasa de nacido vivo con óvulos propios, edades ${b}`],
  // Lists of countries ("Belgium, Netherlands and France")
  [/^((?:[A-Z][A-Za-z ]+, )*[A-Z][A-Za-z ]+) and ([A-Z][A-Za-z ]+)$/, (head, last) => {
    const items = [...head.split(", "), last];
    return items.every((x) => COUNTRY_ES[x]) ? `${items.slice(0, -1).map(country).join(", ")} y ${country(last)}` : "";
  }],
];

/** Patterned engine sentences (with ages, counts, countries). Returns undefined if no rule matches. */
export function translateJourneyPattern(text: string): string | undefined {
  for (const [re, fn] of RULES) {
    const m = text.match(re);
    if (m) {
      const out = fn(...m.slice(1).map((x) => x ?? ""));
      if (out) return out;
    }
  }
  return undefined;
}
