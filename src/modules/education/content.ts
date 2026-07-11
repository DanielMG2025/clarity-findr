// Educational content library — "Aprende" / puerta de entrada divulgativa
// ---------------------------------------------------------------------------
// Purpose: give someone who knows NOTHING about fertility a simple, step-by-step
// understanding — what each treatment is, how it differs, and what the patient /
// donor / freezing journeys look like end to end.
//
// Two hard rules baked into the data:
//   1. ORIENTATIVE, never a medical guide. Every article carries `disclaimer`.
//   2. SOURCED. Every article lists `sources` it was composed from.
//
// Structure-first on purpose: the SAME objects render in the app, export to a
// blog/SEO, and convert into VIDEO SCRIPTS (see toVideoScript at the bottom) for
// YouTube/Instagram — the social top-of-funnel — without rewriting anything.

export const CONTENT_DISCLAIMER =
  "Contenido informativo y divulgativo. No es consejo médico ni sustituye la valoración de un profesional. Las cifras son orientativas y varían según cada caso.";

export interface Source {
  label: string;
  url?: string;
}

export interface Step {
  title: string;
  detail: string;
  typical_duration?: string;
}

export interface Article {
  slug: string;
  kind: "glosario" | "tratamiento" | "journey" | "negocio";
  title: string;
  hook: string; // one-line, plain-language, for cards and video intros
  summary: string; // 2–3 sentences
  reading_time_min: number;
  body?: string[]; // short paragraphs (plain language)
  steps?: Step[]; // for treatments / journeys
  differences?: { vs: string; note: string }[]; // "how it differs from X"
  faqs?: { q: string; a: string }[];
  disclaimer: string;
  sources: Source[];
  tags: string[];
}

// Shared sources (composed from concordant clinical/educational materials)
const S = {
  eshre: { label: "ESHRE — información al paciente", url: "https://www.eshre.eu/" },
  hfea: { label: "HFEA — treatments and processes", url: "https://www.hfea.gov.uk/" },
  urmc: { label: "URMC Strong Fertility — IVF step by step", url: "https://www.urmc.rochester.edu/" },
  ccrm: { label: "CCRM — IVF process day by day", url: "https://www.ccrmivf.com/" },
  monash: { label: "Monash IVF — the IVF process", url: "https://monashivf.com/" },
  sef: { label: "Sociedad Española de Fertilidad (SEF)", url: "https://www.sefertilidad.net/" },
};

// ---------------------------------------------------------------------------
// 1) GLOSARIO — respuestas de 20 segundos ("¿qué es un ICSI?")
// ---------------------------------------------------------------------------
export const GLOSSARY: Article[] = [
  {
    slug: "que-es-fiv",
    kind: "glosario",
    title: "¿Qué es la FIV?",
    hook: "Unir óvulo y espermatozoide en el laboratorio, no en el cuerpo.",
    summary:
      "La fecundación in vitro (FIV) consiste en extraer óvulos, fecundarlos en el laboratorio y transferir el embrión resultante al útero. Es el tratamiento de reproducción asistida más habitual.",
    reading_time_min: 1,
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.monash],
    tags: ["fiv", "básico"],
  },
  {
    slug: "que-es-icsi",
    kind: "glosario",
    title: "¿Qué es la ICSI?",
    hook: "Una FIV en la que se inyecta un solo espermatozoide dentro del óvulo.",
    summary:
      "La ICSI (inyección intracitoplasmática) es una variante de la FIV en la que el embriólogo inyecta un único espermatozoide directamente en cada óvulo maduro. Se suele usar cuando hay factor masculino o fallos de fecundación previos.",
    reading_time_min: 1,
    differences: [{ vs: "FIV convencional", note: "En la FIV clásica se dejan óvulos y espermatozoides juntos; en la ICSI se inyecta uno seleccionado." }],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.urmc, S.ccrm],
    tags: ["icsi", "factor-masculino"],
  },
  {
    slug: "que-es-iui",
    kind: "glosario",
    title: "¿Qué es la IUI (inseminación)?",
    hook: "Depositar semen preparado dentro del útero en el momento de ovular.",
    summary:
      "La inseminación intrauterina (IUI) es un tratamiento más sencillo y menos invasivo que la FIV: se introduce el semen preparado en el útero coincidiendo con la ovulación. Suele ser un primer paso en casos leves.",
    reading_time_min: 1,
    differences: [{ vs: "FIV", note: "En la IUI la fecundación ocurre dentro del cuerpo; no hay laboratorio de embriones." }],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.monash],
    tags: ["iui", "básico"],
  },
  {
    slug: "que-es-pgt-a",
    kind: "glosario",
    title: "¿Qué es el PGT-A (test genético del embrión)?",
    hook: "Analizar los cromosomas del embrión antes de transferirlo.",
    summary:
      "El PGT-A (test genético preimplantacional para aneuploidías) analiza si el embrión tiene el número correcto de cromosomas. Se toman unas células del embrión en día 5–6, que se congela mientras llega el resultado.",
    reading_time_min: 1,
    differences: [{ vs: "PGT-M", note: "El PGT-A mira el número de cromosomas; el PGT-M busca una mutación concreta que los padres puedan portar." }],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.ccrm, S.urmc],
    tags: ["pgt", "genética"],
  },
  {
    slug: "que-es-ovodonacion",
    kind: "glosario",
    title: "¿Qué es la ovodonación?",
    hook: "Una FIV con óvulos de una donante en lugar de los propios.",
    summary:
      "En la ovodonación se usan óvulos de una donante anónima (en España) para crear los embriones. Es una opción habitual cuando la reserva ovárica es muy baja o por edad avanzada.",
    reading_time_min: 1,
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.sef, S.eshre],
    tags: ["ovodonacion", "donante"],
  },
  {
    slug: "que-es-vitrificacion",
    kind: "glosario",
    title: "¿Qué es la vitrificación (congelación)?",
    hook: "Congelar muy rápido óvulos o embriones para usarlos más adelante.",
    summary:
      "La vitrificación es una congelación ultrarrápida que preserva óvulos o embriones sin dañarlos. Permite conservar la fertilidad o guardar embriones sobrantes de un ciclo.",
    reading_time_min: 1,
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.sef],
    tags: ["congelacion", "vitrificacion"],
  },
];

// ---------------------------------------------------------------------------
// 2) TRATAMIENTOS — el paso a paso
// ---------------------------------------------------------------------------
export const TREATMENTS: Article[] = [
  {
    slug: "fiv-paso-a-paso",
    kind: "tratamiento",
    title: "La FIV, paso a paso",
    hook: "De la primera consulta al embrión en el útero, explicado sencillo.",
    summary:
      "Un ciclo de FIV sigue casi siempre los mismos pasos. Aquí tienes el recorrido típico y cuánto suele durar cada fase — orientativo, tu clínica lo adapta a tu caso.",
    reading_time_min: 3,
    steps: [
      { title: "1. Estudio y plan", detail: "Pruebas iniciales (hormonas, ecografía, seminograma) y diseño del protocolo.", typical_duration: "1–2 semanas" },
      { title: "2. Estimulación ovárica", detail: "Inyecciones diarias para que maduren varios óvulos, con controles ecográficos.", typical_duration: "8–12 días" },
      { title: "3. Punción folicular", detail: "Extracción de los óvulos con sedación, procedimiento corto.", typical_duration: "1 día" },
      { title: "4. Fecundación en el laboratorio", detail: "Los óvulos se fecundan con FIV clásica o ICSI. Al día siguiente se confirma cuántos han fecundado.", typical_duration: "1 día" },
      { title: "5. Cultivo del embrión", detail: "Los embriones crecen en incubadora hasta día 3 o hasta blastocisto (día 5–6).", typical_duration: "3–6 días" },
      { title: "6. Transferencia", detail: "Se coloca un embrión en el útero con un catéter fino, sin sedación. El resto puede vitrificarse.", typical_duration: "1 día" },
      { title: "7. Espera y prueba de embarazo", detail: "Prueba de embarazo a los ~10–14 días.", typical_duration: "10–14 días" },
    ],
    differences: [
      { vs: "IUI", note: "La FIV trabaja los embriones en el laboratorio; la IUI no." },
      { vs: "Ovodonación", note: "La FIV usa óvulos propios; la ovodonación, de donante." },
    ],
    faqs: [
      { q: "¿Duele?", a: "La punción se hace con sedación; la transferencia no suele necesitarla." },
      { q: "¿Cuántos embriones se transfieren?", a: "La práctica actual tiende a transferir uno para evitar embarazos múltiples." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.urmc, S.ccrm, S.monash],
    tags: ["fiv", "journey"],
  },
  {
    slug: "congelacion-ovulos-paso-a-paso",
    kind: "tratamiento",
    title: "Congelar óvulos, paso a paso",
    hook: "Preservar tu fertilidad hoy para tener opciones mañana.",
    summary:
      "La congelación (vitrificación) de óvulos comparte el inicio con la FIV, pero se detiene tras extraer los óvulos: en lugar de fecundarlos, se congelan.",
    reading_time_min: 2,
    steps: [
      { title: "1. Valoración de reserva", detail: "Analítica (AMH) y ecografía (recuento de folículos) para estimar cuántos óvulos podrías obtener.", typical_duration: "1 semana" },
      { title: "2. Estimulación ovárica", detail: "Igual que en la FIV: inyecciones y controles.", typical_duration: "8–12 días" },
      { title: "3. Punción", detail: "Extracción de los óvulos con sedación.", typical_duration: "1 día" },
      { title: "4. Vitrificación", detail: "Los óvulos maduros se congelan ultrarrápido y se almacenan.", typical_duration: "1 día" },
      { title: "5. Almacenamiento", detail: "Se conservan hasta que decidas usarlos; hay un coste anual de almacenamiento.", typical_duration: "años" },
    ],
    faqs: [
      { q: "¿Cuál es la mejor edad?", a: "Cuanto antes, mejor: congelar antes de los 35 suele ofrecer más posibilidades." },
      { q: "¿Garantiza un embarazo?", a: "No. Aumenta las opciones futuras, pero no es una garantía." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.sef],
    tags: ["congelacion", "journey"],
  },
];

// ---------------------------------------------------------------------------
// 3) JOURNEYS — paciente, donante, congelación (recorrido completo)
// ---------------------------------------------------------------------------
export const JOURNEYS: Article[] = [
  {
    slug: "patient-journey",
    kind: "journey",
    title: "El recorrido del paciente",
    hook: "Qué pasa desde que llegas a la clínica hasta el resultado.",
    summary:
      "Una visión de conjunto de las etapas por las que pasa cualquier paciente de reproducción asistida, para saber qué esperar.",
    reading_time_min: 3,
    steps: [
      { title: "Primera consulta", detail: "Historia clínica, dudas y pruebas iniciales para ambos miembros de la pareja si la hay." },
      { title: "Diagnóstico", detail: "Con los resultados se identifica la causa (o se etiqueta como no explicada) y se propone un plan." },
      { title: "Elección de tratamiento", detail: "IUI, FIV/ICSI, ovodonación… según edad, diagnóstico y preferencias." },
      { title: "Tratamiento", detail: "El ciclo elegido, con sus controles y procedimientos." },
      { title: "Resultado y siguientes pasos", detail: "Prueba de embarazo; si no hay éxito, se revisa el plan (nuevo ciclo, cambio de enfoque)." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.hfea, S.sef],
    tags: ["journey", "paciente"],
  },
  {
    slug: "donor-journey",
    kind: "journey",
    title: "El recorrido de la donante de óvulos",
    hook: "Qué implica ser donante: pasos, requisitos y qué NO implica.",
    summary:
      "Ser donante de óvulos es un proceso regulado y altruista. Aquí se explica el recorrido y qué supone realmente, sin tecnicismos.",
    reading_time_min: 3,
    steps: [
      { title: "Requisitos y screening", detail: "Edad, buen estado de salud y una batería de pruebas médicas y genéticas." },
      { title: "Estimulación", detail: "Igual que una paciente de FIV: medicación y controles durante ~10 días." },
      { title: "Donación (punción)", detail: "Extracción de los óvulos con sedación." },
      { title: "Compensación", detail: "En España la donación es altruista y anónima; existe una compensación económica regulada por las molestias." },
    ],
    faqs: [
      { q: "¿Es anónima?", a: "En España, sí: la donante y la receptora no conocen su identidad mutua." },
      { q: "¿Afecta a mi fertilidad futura?", a: "Es una pregunta médica; debe responderla la clínica en tu valoración." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.sef, S.eshre],
    tags: ["journey", "donante"],
  },
  {
    slug: "freezing-journey",
    kind: "journey",
    title: "El recorrido de la congelación",
    hook: "Preservar la fertilidad: cuándo tiene sentido y cómo es.",
    summary:
      "Para quién puede tener sentido congelar óvulos, en qué momento y cómo encaja en la vida — una decisión de planificación, no de urgencia médica.",
    reading_time_min: 2,
    steps: [
      { title: "¿Es para mí?", detail: "Motivos frecuentes: posponer la maternidad, antes de un tratamiento médico, o baja reserva detectada." },
      { title: "Valoración", detail: "Analítica y ecografía para estimar el rendimiento esperable." },
      { title: "Ciclo de congelación", detail: "Estimulación, punción y vitrificación (ver 'Congelar óvulos, paso a paso')." },
      { title: "Uso futuro", detail: "Cuando decidas, los óvulos se descongelan y se fecundan mediante ICSI." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.sef],
    tags: ["journey", "congelacion"],
  },
];

// ---------------------------------------------------------------------------
// 4) CÓMO FUNCIONA ECONÓMICAMENTE (para el paciente / la donante)
// Explica el MODELO que vive el paciente, no cómo monetizamos nosotros.
// Rangos orientativos por mercado y, en donación, el matiz legal clave.
// ---------------------------------------------------------------------------
const Ssrc = {
  seen: { label: "Seen Fertility — Egg freezing in Spain (costes y almacenamiento)", url: "https://seenfertility.com/" },
  freeze: { label: "Freeze.health — Egg freezing Spain (single cycle, storage)", url: "https://freeze.health/" },
  placid: { label: "PlacidWay — Cost of egg donation in Spain 2025", url: "https://www.placidway.com/" },
  ivi: { label: "IVI — Cómo funciona la donación de óvulos en España", url: "https://ivi-fertility.com/" },
  boe: { label: "BOE — Ley 14/2006 sobre técnicas de reproducción humana asistida" },
};

export const ECONOMICS: Article[] = [
  {
    slug: "como-se-paga-congelacion",
    kind: "negocio",
    title: "Cómo se paga una congelación de óvulos",
    hook: "Un pago por el ciclo + una cuota anual para mantenerlos guardados.",
    summary:
      "El modelo económico de la congelación tiene dos partes: el ciclo (estimulación, punción, vitrificación) que se paga una vez, y el almacenamiento, que funciona como una suscripción anual mientras conservas los óvulos.",
    reading_time_min: 2,
    body: [
      "Piénsalo en dos bloques. Primero, el ciclo en sí: es un pago único que cubre la estimulación, la extracción y la congelación de los óvulos.",
      "Segundo, el almacenamiento: una cuota anual para mantener tus óvulos conservados, año tras año, hasta que decidas usarlos. Este es el componente tipo suscripción, y es fácil olvidarlo al comparar precios.",
      "Muchos paquetes incluyen los primeros 1–5 años de almacenamiento; después se paga la cuota anual. Y ojo: la medicación (~€1.000–1.400) suele ir aparte del precio anunciado.",
    ],
    steps: [
      { title: "Ciclo (pago único)", detail: "Estimulación + punción + vitrificación.", typical_duration: "una vez" },
      { title: "Almacenamiento (recurrente)", detail: "Cuota anual por mantener los óvulos guardados.", typical_duration: "cada año" },
      { title: "Uso futuro (si lo hay)", detail: "Descongelación + fecundación (ICSI) + transferencia, con su propio coste.", typical_duration: "cuando decidas" },
    ],
    faqs: [
      { q: "¿Rango orientativo en España?", a: "El ciclo ronda ~€2.300–3.500 (sin medicación); el almacenamiento anual, ~€200–500/año. Cifras aproximadas por mercado y clínica." },
      { q: "¿Y si no llego a usarlos?", a: "Seguirás pagando la cuota anual mientras los conserves, salvo que decidas dejarlos de almacenar." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [Ssrc.seen, Ssrc.freeze],
    tags: ["congelacion", "economia", "suscripcion"],
  },
  {
    slug: "compensacion-donante-ovulos",
    kind: "negocio",
    title: "Ser donante: la compensación, explicada bien",
    hook: "No te pagan por los óvulos —está prohibido—; se compensan las molestias.",
    summary:
      "Este es el punto que más se malentiende. En España (y en la práctica en toda la UE) está legalmente prohibido pagar por los óvulos: sería comercializar gametos. Lo que existe es una compensación económica por las molestias, el tiempo y los desplazamientos.",
    reading_time_min: 2,
    body: [
      "La donación debe ser, por ley, altruista, anónima y voluntaria (Ley 14/2006 en España). No es una venta.",
      "Por eso no se habla de 'precio por óvulo', sino de una compensación fija y regulada que reconoce las molestias: la medicación, los desplazamientos, el tiempo (el proceso lleva unos 12–15 días con varias visitas) y las posibles ausencias del trabajo.",
      "En España esa compensación suele situarse en el entorno de ~€800–1.100 por ciclo, un importe regulado, no negociable ni proporcional al número de óvulos.",
    ],
    differences: [
      { vs: "un pago por óvulos", note: "Prohibido: convertiría la donación en comercio de gametos. La compensación es por las molestias, no por el material biológico." },
    ],
    faqs: [
      { q: "¿Es anónima?", a: "En España, sí: donante y receptora no conocen su identidad mutua, y la paciente que da a luz es la madre legal." },
      { q: "¿Puedo donar por dinero?", a: "No como tal. La ley lo plantea como acto altruista; la compensación cubre molestias, no es un salario." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [Ssrc.ivi, Ssrc.placid, Ssrc.boe],
    tags: ["donante", "ovodonacion", "economia", "legal"],
  },
  {
    slug: "como-se-financia-un-tratamiento",
    kind: "negocio",
    title: "Cómo se financia un tratamiento",
    hook: "Pago por fases, paquetes multiciclo y financiación a plazos.",
    summary:
      "Los tratamientos rara vez se pagan de golpe. Conviene entender las modalidades habituales para comparar de verdad y evitar sorpresas.",
    reading_time_min: 2,
    body: [
      "Pago por fases: muchas clínicas cobran en hitos (al iniciar, antes de la transferencia…), no todo por adelantado.",
      "Paquetes multiciclo y programas con garantía/reembolso: pagas por adelantado varios intentos, a veces con devolución parcial o total si no hay recién nacido vivo. Bajan la incertidumbre a cambio de un desembolso mayor.",
      "Financiación a plazos: algunas clínicas trabajan con financieras externas para repartir el coste en cuotas. Es un préstamo, con sus intereses; conviene mirar el coste total, no solo la cuota.",
    ],
    faqs: [
      { q: "¿Qué suele quedar fuera del precio 'de cabecera'?", a: "Medicación, primera consulta, PGT-A, y la congelación/almacenamiento de embriones sobrantes. Pide siempre el desglose." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [Ssrc.placid, Ssrc.seen],
    tags: ["financiacion", "economia"],
  },
];

// ---------------------------------------------------------------------------
// Glosario ampliado (términos que aparecen sin explicar en toda clínica)
// ---------------------------------------------------------------------------
export const GLOSSARY_EXTRA: Article[] = [
  { slug: "reserva-ovarica", kind: "glosario", title: "¿Qué es la reserva ovárica?", hook: "La 'cantidad' de óvulos que te quedan, a grandes rasgos.", summary: "La reserva ovárica es una estimación de la cantidad de óvulos disponibles. Se valora sobre todo con la AMH y el recuento de folículos antrales, y desciende con la edad.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.eshre, S.sef], tags: ["reserva", "básico"] },
  { slug: "amh", kind: "glosario", title: "¿Qué es la AMH?", hook: "Un análisis de sangre que orienta sobre tu reserva ovárica.", summary: "La hormona antimülleriana (AMH) es un marcador en sangre que ayuda a estimar la reserva ovárica. Valores bajos sugieren menos óvulos disponibles, pero no predicen por sí solos el éxito.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.sef, S.eshre], tags: ["amh", "reserva"] },
  { slug: "recuento-folicular", kind: "glosario", title: "¿Qué es el recuento de folículos antrales (AFC)?", hook: "Contar por ecografía los folículos pequeños de tus ovarios.", summary: "El AFC es el número de folículos antrales que se ven por ecografía al inicio del ciclo. Junto con la AMH, ayuda a estimar cómo podrías responder a la estimulación.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.eshre], tags: ["afc", "reserva"] },
  { slug: "blastocisto", kind: "glosario", title: "¿Qué es un blastocisto?", hook: "El embrión en día 5–6, con más opciones de implantar.", summary: "Un blastocisto es el estadio que alcanza el embrión hacia el día 5–6 de cultivo. Suele tener más posibilidades de implantación y es el momento habitual de la transferencia o del test genético.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.ccrm, S.urmc], tags: ["embrion", "laboratorio"] },
  { slug: "transferencia-fresco-congelado", kind: "glosario", title: "Transferencia en fresco vs. congelado", hook: "Transferir el embrión en el mismo ciclo o descongelarlo después.", summary: "En la transferencia en fresco el embrión se coloca en el mismo ciclo; en la congelada (FET) se vitrifica y se transfiere en un ciclo posterior, preparando el útero. Ambas son habituales.", reading_time_min: 1, differences: [{ vs: "entre sí", note: "Fresco = mismo ciclo; congelado = ciclo posterior con endometrio preparado." }], disclaimer: CONTENT_DISCLAIMER, sources: [S.ccrm, S.monash], tags: ["transferencia", "fet"] },
  { slug: "estimulacion-ovarica", kind: "glosario", title: "¿Qué es la estimulación ovárica?", hook: "Medicación para que maduren varios óvulos en un ciclo.", summary: "Son unos días de inyecciones hormonales para que los ovarios produzcan varios óvulos a la vez (en lugar de uno), con controles ecográficos. Es la primera fase de una FIV o una congelación.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.urmc, S.monash], tags: ["estimulacion", "fiv"] },
  { slug: "puncion-folicular", kind: "glosario", title: "¿Qué es la punción folicular?", hook: "La extracción de los óvulos, con sedación y en poco tiempo.", summary: "La punción es el procedimiento por el que se recogen los óvulos de los ovarios, guiado por ecografía y con sedación. Es corto y ambulatorio.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.urmc, S.ccrm], tags: ["puncion", "fiv"] },
  { slug: "ropa", kind: "glosario", title: "¿Qué es el método ROPA?", hook: "Maternidad compartida: una pone el óvulo y la otra gesta.", summary: "El método ROPA (Recepción de Óvulos de la Pareja) permite a una pareja de mujeres compartir la maternidad: una aporta los óvulos y la otra gesta el embarazo. Está regulado en España.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.sef], tags: ["ropa", "legal"] },
  { slug: "ovodonacion-anonima", kind: "glosario", title: "¿Qué significa donación anónima?", hook: "Donante y receptora no conocen su identidad mutua.", summary: "En España la donación de óvulos es anónima por ley: ni la donante ni la receptora conocen su identidad, y solo se comparten datos como grupo sanguíneo y edad. En otros países la regulación difiere.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.sef, Ssrc.ivi], tags: ["donante", "legal"] },
];

export const ALL_ARTICLES: Article[] = [...GLOSSARY, ...GLOSSARY_EXTRA, ...TREATMENTS, ...JOURNEYS, ...ECONOMICS];

export function getArticle(slug: string): Article | undefined {
  return ALL_ARTICLES.find((a) => a.slug === slug);
}

// ---------------------------------------------------------------------------
// Video-script generator — reuses the SAME content for YouTube/Instagram
// ---------------------------------------------------------------------------
export interface VideoScript {
  title: string;
  hook: string; // first 3 seconds
  scenes: { voiceover: string; on_screen: string }[];
  cta: string;
  disclaimer: string;
  sources: Source[];
}

/** Turn any article into a short vertical-video script (social top-of-funnel). */
export function toVideoScript(a: Article): VideoScript {
  const scenes: { voiceover: string; on_screen: string }[] = [
    { voiceover: a.summary, on_screen: a.title },
  ];
  (a.steps ?? []).forEach((s) =>
    scenes.push({ voiceover: `${s.title}: ${s.detail}`, on_screen: s.title + (s.typical_duration ? ` · ${s.typical_duration}` : "") }),
  );
  (a.differences ?? []).forEach((d) =>
    scenes.push({ voiceover: `Diferencia con ${d.vs}: ${d.note}`, on_screen: `vs ${d.vs}` }),
  );
  return {
    title: a.title,
    hook: a.hook,
    scenes,
    cta: "Descúbrelo con tu situación en Fertility Compass.",
    disclaimer: a.disclaimer,
    sources: a.sources,
  };
}
