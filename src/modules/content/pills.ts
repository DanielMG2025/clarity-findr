import type { Pill } from "./types";

/** Seed pills — content supplied by the founder. Do not add invented figures or sources. */
export const PILLS: Pill[] = [
  {
    id: "freeze-age", date: "2026-10-20", mold: "stat", audiences: ["planners"],
    title: { en: "Your age when you freeze beats your age when you use them.", es: "Cuenta más tu edad al congelar que tu edad al usarlos." },
    body: {
      en: "With egg freezing, the single biggest factor in your odds later is how old you are when you freeze — not when you come back to use them. Freezing earlier usually means more, healthier eggs to work with.",
      es: "Al congelar óvulos, lo que más influye en tus opciones futuras es la edad que tienes al congelarlos, no cuando vuelves a usarlos. Congelar antes suele significar más óvulos, y más sanos, con los que trabajar.",
    },
    source: { name: "HFEA", url: "https://www.hfea.gov.uk", date: "2024", confidence: "high", note: { en: "UK fertility regulator.", es: "Regulador británico de fertilidad." } },
  },
  {
    id: "pill-myth", date: "2026-10-19", mold: "myth", audiences: ["first-steps"],
    title: { en: "Myth: the pill makes you infertile.", es: "Mito: la píldora te deja infértil." },
    body: {
      en: "It doesn't. Your fertility goes back to your own baseline soon after you stop. What the pill can do is hide changes that were coming anyway — so a check-up is useful if you're planning ahead.",
      es: "No es así. Tu fertilidad vuelve a su punto de partida poco después de dejarla. Lo que sí puede hacer la píldora es ocultar cambios que llegarían de todos modos; por eso, si estás planificando, conviene hacerse una revisión.",
    },
    source: { name: "ASRM — reproductivefacts.org", url: "https://www.reproductivefacts.org", date: "2024", confidence: "high", note: { en: "US medical society.", es: "Sociedad médica de EE. UU." } },
  },
  {
    id: "spain-1-in-10", date: "2026-10-18", mold: "stat", audiences: ["first-steps", "planners"],
    title: { en: "In Spain, about 1 in 10 babies is now born through assisted reproduction.", es: "En España, cerca de 1 de cada 10 bebés nace ya gracias a la reproducción asistida." },
    body: {
      en: "This path has quietly become ordinary. If you're starting, you're in very large company.",
      es: "Este camino se ha vuelto, sin hacer ruido, algo habitual. Si estás empezando, vas muy bien acompañada.",
    },
    source: { name: "Registro SEF (vía prensa)", url: "https://www.sefertilidad.net", date: "2025", confidence: "medium", note: { en: "National registry, reported in the press.", es: "Registro nacional, recogido en prensa." } },
  },
  {
    id: "sperm-debate", date: "2026-10-17", mold: "deep-dive", audiences: ["men"],
    title: { en: "Is sperm count really falling? The honest answer: it's debated.", es: "¿De verdad está bajando el recuento de espermatozoides? La respuesta honesta: hay debate." },
    body: {
      en: "Some large reviews report a decline over decades; others say the data is steadier than the headlines suggest. The useful part isn't panic — it's that sperm health is measurable, and often improvable.",
      es: "Algunas grandes revisiones hablan de un descenso a lo largo de décadas; otras dicen que los datos son más estables de lo que sugieren los titulares. Lo útil no es alarmarse, sino saber que la salud del esperma se puede medir y, a menudo, mejorar.",
    },
    source: { name: "Scientific debate (Levine et al. vs Cleveland Clinic)", url: "https://consultqd.clevelandclinic.org/no-cause-for-panic-as-sperm-counts-found-to-be-steady", date: "2025", confidence: "medium", note: { en: "Active scientific debate — we show both sides.", es: "Debate científico abierto — mostramos las dos caras." } },
  },
  {
    id: "seminogram", date: "2026-10-16", mold: "glossary", audiences: ["men"],
    title: { en: "Term of the day: seminogram (semen analysis).", es: "Término del día: seminograma (análisis de semen)." },
    body: {
      en: "The basic test of male fertility. It looks at how many sperm there are, how well they move and their shape. It's quick, and often the first thing worth checking — male factor is involved in roughly half of cases.",
      es: "La prueba básica de la fertilidad masculina. Mira cuántos espermatozoides hay, cómo se mueven y su forma. Es rápida y, a menudo, lo primero que merece la pena revisar: el factor masculino está presente en aproximadamente la mitad de los casos.",
    },
    source: { name: "ASRM — reproductivefacts.org", url: "https://www.reproductivefacts.org", date: "2024", confidence: "high" },
  },
  {
    id: "amh-myth", date: "2026-10-15", mold: "myth", audiences: ["planners"],
    title: { en: "Myth: AMH tells you whether you can get pregnant.", es: "Mito: la AMH te dice si puedes quedarte embarazada." },
    body: {
      en: "AMH is a rough gauge of how many eggs you have left — a 'how many', not a 'can I'. A low number doesn't mean you can't; a high one isn't a promise. Useful context, not a verdict.",
      es: "La AMH es una medida aproximada de cuántos óvulos te quedan: un «cuántos», no un «puedo». Un valor bajo no significa que no puedas; uno alto no es una promesa. Es contexto útil, no un veredicto.",
    },
    source: { name: "ASRM / ESHRE", url: "https://www.eshre.eu", date: "2024", confidence: "high" },
  },
  {
    id: "uk-1-in-32", date: "2026-10-14", mold: "stat", audiences: ["first-steps", "planners", "men"],
    title: { en: "In the UK, 1 in 32 children is now born via IVF.", es: "En el Reino Unido, 1 de cada 32 niños nace ya gracias a la FIV." },
    body: { en: "One more sign of how common all of this has become.", es: "Una señal más de lo habitual que se ha vuelto todo esto." },
    source: { name: "HFEA", url: "https://www.hfea.gov.uk", date: "2024", confidence: "high" },
  },
  {
    id: "fdu-pick", date: "2026-10-13", mold: "pick", audiences: ["first-steps", "men"],
    title: { en: "Worth a look: 'Fertility Docs Uncensored'.", es: "Para ver: «Fertility Docs Uncensored»." },
    body: {
      en: "A no-nonsense Q&A podcast by several fertility doctors — good for plain answers to the things you google at 2am.",
      es: "Un pódcast de preguntas y respuestas, sin rodeos, con varios médicos de fertilidad. Ideal para respuestas claras a lo que buscas en Google a las dos de la mañana.",
    },
    source: { name: "Fertility Docs Uncensored (YouTube/podcast)", url: "https://www.youtube.com/@fertilitydocsuncensored/videos", date: "2025", confidence: "medium", note: { en: "Hosts are practising clinicians — treat clinic tips with the usual care.", es: "Los presentadores ejercen en clínica — toma sus consejos de clínica con la cautela habitual." } },
  },
];

/** Newest first. */
export const sortedPills = () => [...PILLS].sort((a, b) => b.date.localeCompare(a.date));
