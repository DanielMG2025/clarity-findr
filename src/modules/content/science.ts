/**
 * Curated, hand-verified evidence findings ("Qué dice la evidencia").
 * Do NOT add findings, numbers, sources or URLs without verifying them first.
 */
export type EvidenceStrength = "alta" | "media" | "limitada";

export type Finding = {
  id: string;
  theme_es: string;
  theme_en: string;
  title_es: string;
  title_en: string;
  summary_es: string;
  summary_en: string;
  means_es: string;
  means_en: string;
  evidence_type_es: string;
  evidence_type_en: string;
  strength: EvidenceStrength;
  source_label: string;
  source_url: string;
  source_year: string;
  is_addons?: boolean;
  library_slug?: string;
};

export type AddonRating = "green" | "yellow" | "grey" | "black" | "red";
export type Addon = { name_es: string; name_en: string; rating: AddonRating };

type Bi = { es: string; en: string };

export const STRENGTH_LABEL: Record<EvidenceStrength, Bi> = {
  alta: { es: "Alta", en: "High" },
  media: { es: "Media", en: "Medium" },
  limitada: { es: "Limitada", en: "Limited" },
};

export const STRENGTH_HELP: Bi = {
  es: "La fuerza refleja el tipo y la calidad de los estudios tras el dato: registros nacionales y ensayos aleatorizados pesan más que estudios observacionales.",
  en: "Strength reflects the type and quality of studies behind the finding: national registries and randomized trials weigh more than observational studies.",
};

export const ADDON_RATING_LABEL: Record<AddonRating, Bi> = {
  green: { es: "Verde", en: "Green" },
  yellow: { es: "Amarillo", en: "Yellow" },
  grey: { es: "Gris", en: "Grey" },
  black: { es: "Negro", en: "Black" },
  red: { es: "Rojo", en: "Red" },
};

export const ADDON_RATING_MEANING: Record<AddonRating, Bi> = {
  green: { es: "Evidencia de alta calidad de que funciona (hoy ningún add-on lo tiene).", en: "High-quality evidence that it works (no add-on currently has this)." },
  yellow: { es: "No está claro si funciona; los estudios se contradicen.", en: "Unclear whether it works; studies conflict." },
  grey: { es: "No hay evidencia suficiente para puntuarlo.", en: "Not enough evidence to rate it." },
  black: { es: "Evidencia de calidad de que NO tiene efecto en los resultados.", en: "Good-quality evidence that it has NO effect on outcomes." },
  red: { es: "Posible riesgo de seguridad y/o puede reducir la efectividad.", en: "Possible safety risk and/or may reduce effectiveness." },
};

/** Official HFEA add-on ratings. */
export const ADDONS: Addon[] = [
  { name_es: "Suplementación con andrógenos", name_en: "Androgen supplementation", rating: "grey" },
  { name_es: "Eclosión asistida (hatching)", name_en: "Assisted hatching", rating: "grey" },
  { name_es: "Congelación electiva de todos los embriones (freeze-all)", name_en: "Elective freeze-all cycles", rating: "yellow" },
  { name_es: "Test de receptividad endometrial (ERA)", name_en: "Endometrial receptivity testing", rating: "red" },
  { name_es: "Scratching endometrial", name_en: "Endometrial scratching", rating: "yellow" },
  { name_es: "Medio con hialuronato (EmbryoGlue)", name_en: "Hyaluronate-enriched medium (EmbryoGlue)", rating: "yellow" },
  { name_es: "Inmunología: Intralipid", name_en: "Immunological: Intralipids", rating: "grey" },
  { name_es: "Inmunología: inmunoglobulinas (IVIG)", name_en: "Immunological: IVIG", rating: "red" },
  { name_es: "Inmunología: corticoides", name_en: "Immunological: steroids", rating: "red" },
  { name_es: "IMSI", name_en: "IMSI", rating: "grey" },
  { name_es: "Cultivo intrauterino", name_en: "Intrauterine culture", rating: "grey" },
  { name_es: "Test de microbioma", name_en: "Microbiome testing", rating: "grey" },
  { name_es: "PICSI (factor masculino)", name_en: "PICSI (male factor)", rating: "black" },
  { name_es: "Plasma rico en plaquetas (PRP)", name_en: "Platelet-rich plasma (PRP)", rating: "red" },
  { name_es: "PGT-A (test genético de aneuploidías)", name_en: "PGT-A (preimplantation genetic testing for aneuploidy)", rating: "red" },
  { name_es: "Time-lapse (incubación con imagen continua)", name_en: "Time-lapse imaging and incubation", rating: "black" },
  { name_es: "Fragmentación del ADN espermático", name_en: "Sperm DNA fragmentation", rating: "grey" },
];

export const AGE_BANDS: { band: string; rate: string }[] = [
  { band: "18–34", rate: "35%" },
  { band: "35–37", rate: "26%" },
  { band: "38–39", rate: "18%" },
  { band: "40–42", rate: "10%" },
  { band: "43–44", rate: "5%" },
];
export const AGE_BANDS_CAPTION = { es: "Nacido vivo por embrión transferido, óvulos propios (HFEA, 2022, datos preliminares)", en: "Live birth per embryo transferred, own eggs (HFEA, 2022, preliminary)" };
export const AGE_BANDS_NOTE = { es: "A partir de los 45 la tasa es muy baja.", en: "From age 45 the rate is very low." };

const AGE = { theme_es: "Probabilidades y edad", theme_en: "Odds and age" };
const RESERVE = { theme_es: "Reserva ovárica y pruebas", theme_en: "Ovarian reserve and tests" };
const TECH = { theme_es: "Técnicas y 'extras' (add-ons)", theme_en: "Techniques and 'add-ons'" };
const TRANSFER = { theme_es: "La transferencia", theme_en: "The transfer" };
const PRESERVE = { theme_es: "Preservar la fertilidad", theme_en: "Preserving fertility" };
const LIFE = { theme_es: "Estilo de vida", theme_en: "Lifestyle" };

export const FINDINGS: Finding[] = [
  {
    id: "edad", ...AGE,
    title_es: "La edad es el factor que más pesa", title_en: "Age matters more than anything else",
    summary_es: "Con óvulos propios, la probabilidad de nacido vivo por embrión transferido cae de forma marcada con la edad. La media de todas las edades ronda el 25%.",
    summary_en: "With your own eggs, the live-birth rate per embryo transferred drops markedly with age. Across all ages the average is about 25%.",
    means_es: "Tu edad al usar tus óvulos es el mayor predictor. Congelar antes, o valorar la ovodonación, cambia mucho el pronóstico.",
    means_en: "Your age when using your own eggs is the strongest predictor. Freezing earlier, or considering egg donation, changes the outlook a lot.",
    evidence_type_es: "Registro nacional (HFEA)", evidence_type_en: "National registry (HFEA)",
    strength: "alta",
    source_label: "HFEA — Fertility treatment 2023",
    source_url: "https://www.hfea.gov.uk/about-us/publications/research-and-data/fertility-treatment-2023-trends-and-figures/",
    source_year: "2022 (prelim.)",
  },
  {
    id: "donante", library_slug: "what-is-egg-donation", ...AGE,
    title_es: "Con óvulos de donante, la edad de la receptora pesa mucho menos", title_en: "With donor eggs, the recipient's age matters far less",
    summary_es: "El éxito con ovodonación depende sobre todo de la edad (joven) de la donante, no de la de la receptora.",
    summary_en: "Success with donor eggs depends mostly on the donor's (young) age, not the recipient's.",
    means_es: "Si el problema es la reserva ovárica o la edad, la ovodonación acerca el pronóstico al de una donante joven.",
    means_en: "If the issue is ovarian reserve or age, donor eggs bring the outlook close to that of a young donor.",
    evidence_type_es: "Consenso de sociedades (ESHRE/ASRM)", evidence_type_en: "Society consensus (ESHRE/ASRM)",
    strength: "alta",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/", source_year: "guías vigentes",
  },
  {
    id: "acumulada", ...AGE,
    title_es: "Mira la tasa acumulada, no la de un solo ciclo", title_en: "Look at the cumulative rate, not a single cycle",
    summary_es: "La probabilidad sumada de varios ciclos es bastante mayor que la de uno solo; mucha gente que lo consigue necesita más de un intento.",
    summary_en: "The combined chance across several cycles is considerably higher than a single one; many who succeed need more than one attempt.",
    means_es: "Un 'no' en el primer ciclo no es el final. Pide siempre la tasa acumulada, no solo la de un ciclo.",
    means_en: "A 'no' on the first cycle isn't the end. Always ask for the cumulative rate, not just one cycle's.",
    evidence_type_es: "Estudios de registro (ESHRE EIM)", evidence_type_en: "Registry studies (ESHRE EIM)",
    strength: "media",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/", source_year: "—",
  },
  {
    id: "amh", library_slug: "what-is-amh", ...RESERVE,
    title_es: "El AMH predice la respuesta al tratamiento, no si concebirás de forma natural", title_en: "AMH predicts treatment response, not whether you'll conceive naturally",
    summary_es: "La hormona antimülleriana (AMH) y el recuento de folículos estiman cómo responderán los ovarios a la estimulación, no tu fertilidad natural.",
    summary_en: "Anti-Müllerian hormone (AMH) and antral follicle count estimate how the ovaries will respond to stimulation, not your natural fertility.",
    means_es: "Un AMH bajo orienta la dosis del tratamiento; no significa que no puedas quedarte embarazada.",
    means_en: "A low AMH guides the treatment dose; it doesn't mean you can't get pregnant.",
    evidence_type_es: "Consenso de sociedades (ASRM/ESHRE)", evidence_type_en: "Society consensus (ASRM/ESHRE)",
    strength: "alta",
    source_label: "ASRM", source_url: "https://www.asrm.org/", source_year: "guías vigentes",
  },
  {
    id: "addons", ...TECH, is_addons: true,
    title_es: "Los 'extras' de laboratorio: qué dice la evidencia (clasificación HFEA)", title_en: "Lab 'add-ons': what the evidence says (HFEA ratings)",
    summary_es: "El regulador británico (HFEA) puntúa cada 'extra' que ofrecen las clínicas según la evidencia. Hoy ninguno está en verde (evidencia de alta calidad de que mejore tu probabilidad de bebé en casa); varios están en rojo (posible riesgo o menor efectividad).",
    summary_en: "The UK regulator (HFEA) rates each clinic 'add-on' by the evidence. Today none is green (high-quality evidence it improves your chance of a baby at home); several are red (possible risk or reduced effectiveness).",
    means_es: "Si te ofrecen un 'extra' con coste, pregunta en qué color está y por qué te lo recomiendan a ti en concreto.",
    means_en: "If you're offered a paid add-on, ask which colour it's rated and why it's being recommended for you specifically.",
    evidence_type_es: "Regulador oficial (HFEA)", evidence_type_en: "Official regulator (HFEA)",
    strength: "alta",
    source_label: "HFEA — Treatment add-ons", source_url: "https://www.hfea.gov.uk/treatments/treatment-add-ons/", source_year: "2023, rev. 2026",
  },
  {
    id: "pgta", library_slug: "what-is-pgt-a", ...TECH,
    title_es: "El PGT-A no mejora la tasa de nacido vivo en la población general", title_en: "PGT-A doesn't improve live-birth rates in the general population",
    summary_es: "Los ensayos aleatorizados no muestran más bebés en casa al usar PGT-A de rutina; la HFEA lo clasifica en rojo.",
    summary_en: "Randomized trials show no more babies at home when PGT-A is used routinely; the HFEA rates it red.",
    means_es: "Puede tener sentido en casos concretos (abortos de repetición, algunos casos de edad avanzada), no como rutina para todo el mundo.",
    means_en: "It can make sense in specific cases (recurrent miscarriage, some older-age cases), not as a routine for everyone.",
    evidence_type_es: "Ensayos aleatorizados + regulador (HFEA)", evidence_type_en: "Randomized trials + regulator (HFEA)",
    strength: "alta",
    source_label: "HFEA — Treatment add-ons", source_url: "https://www.hfea.gov.uk/treatments/treatment-add-ons/", source_year: "2023",
  },
  {
    id: "icsi", library_slug: "what-is-icsi", ...TECH,
    title_es: "La ICSI solo aporta cuando hay factor masculino", title_en: "ICSI only helps when there's a male factor",
    summary_es: "Sin un problema en el semen, inyectar el espermatozoide (ICSI) no mejora los resultados frente a la FIV convencional y encarece el ciclo.",
    summary_en: "Without a sperm problem, injecting the sperm (ICSI) doesn't improve results over conventional IVF and adds cost.",
    means_es: "Pregunta si tu indicación es realmente factor masculino antes de pagar por ICSI.",
    means_en: "Ask whether your indication is truly male factor before paying for ICSI.",
    evidence_type_es: "Revisiones y consenso (Cochrane/ASRM)", evidence_type_en: "Reviews and consensus (Cochrane/ASRM)",
    strength: "media",
    source_label: "ASRM", source_url: "https://www.asrm.org/", source_year: "guías vigentes",
  },
  {
    id: "eset", ...TRANSFER,
    title_es: "Transferir un solo embrión evita gemelos sin bajar tu probabilidad acumulada", title_en: "Transferring a single embryo avoids twins without lowering your cumulative chance",
    summary_es: "Transferir un embrión cada vez reduce mucho el riesgo de embarazo múltiple, con una tasa acumulada de nacido vivo similar a transferir dos.",
    summary_en: "Transferring one embryo at a time greatly cuts multiple-pregnancy risk, with a cumulative live-birth rate similar to transferring two.",
    means_es: "'Dos embriones' no es 'el doble de posibilidades'; el embarazo múltiple es el mayor riesgo evitable para ti y el bebé.",
    means_en: "'Two embryos' isn't 'double the odds'; multiple pregnancy is the biggest avoidable risk for you and the baby.",
    evidence_type_es: "Consenso de sociedades (ESHRE/ASRM/HFEA)", evidence_type_en: "Society consensus (ESHRE/ASRM/HFEA)",
    strength: "alta",
    source_label: "ESHRE", source_url: "https://www.eshre.eu/", source_year: "guías vigentes",
  },
  {
    id: "congelacion", library_slug: "egg-freezing-step-by-step", ...PRESERVE,
    title_es: "Para congelar óvulos, la edad y el número mandan", title_en: "For egg freezing, age and number are what count",
    summary_es: "Cuanto más joven se congela, mejor: la probabilidad por óvulo descongelado baja con la edad al congelar, y hace falta un número suficiente de óvulos maduros (del orden de 15–20 para una probabilidad razonable, más cuanto mayor la edad).",
    summary_en: "The younger you freeze, the better: the chance per thawed egg falls with age at freezing, and you need enough mature eggs (roughly 15–20 for a reasonable chance, more at older ages).",
    means_es: "Congelar antes de los 35 y entender cuántos óvulos hacen falta evita falsas expectativas.",
    means_en: "Freezing before 35 and understanding how many eggs are needed avoids false expectations.",
    evidence_type_es: "Cohortes grandes + guías (Cobo/ASRM)", evidence_type_en: "Large cohorts + guidelines (Cobo/ASRM)",
    strength: "media",
    source_label: "ASRM", source_url: "https://www.asrm.org/", source_year: "guías vigentes",
  },
  {
    id: "estilo", ...LIFE,
    title_es: "Tabaco y peso extremo reducen el éxito; el efecto es real pero modesto", title_en: "Smoking and extreme weight reduce success; the effect is real but modest",
    summary_es: "Dejar de fumar y acercar el peso a un rango saludable mejoran algo los resultados; es un efecto real pero no suele ser la causa principal.",
    summary_en: "Quitting smoking and moving weight toward a healthy range improve results somewhat; the effect is real but usually not the main cause.",
    means_es: "Ayuda cuidarlo, pero cuidado con culpabilizarse: en la mayoría de casos no es el factor decisivo.",
    means_en: "It helps to address it, but be wary of self-blame: in most cases it isn't the deciding factor.",
    evidence_type_es: "Observacional + guías (NICE/ASRM)", evidence_type_en: "Observational + guidelines (NICE/ASRM)",
    strength: "media",
    source_label: "NICE", source_url: "https://www.nice.org.uk/", source_year: "guías vigentes",
  },
];

/** Plain one-line definition of each add-on, keyed by `name_en`. */
export const ADDON_WHAT: Record<string, { es: string; en: string }> = {
  "Androgen supplementation": { es: "Andrógenos (p. ej. DHEA o testosterona) antes de la estimulación, para intentar mejorar la respuesta ovárica.", en: "Androgens (e.g. DHEA or testosterone) before stimulation, to try to improve ovarian response." },
  "Assisted hatching": { es: "Abrir o adelgazar la capa externa del embrión para 'ayudarle a salir' e implantar.", en: "Opening or thinning the embryo's outer shell to 'help it hatch' and implant." },
  "Elective freeze-all cycles": { es: "Congelar todos los embriones y transferirlos en un ciclo posterior, en vez de en fresco.", en: "Freezing all embryos and transferring them in a later cycle, instead of fresh." },
  "Endometrial receptivity testing": { es: "Una biopsia del endometrio (test ERA) para estimar la 'ventana' en la que estaría más receptivo a la transferencia.", en: "An endometrial biopsy (ERA test) to estimate the 'window' when the lining would be most receptive to transfer." },
  "Endometrial scratching": { es: "Un pequeño rascado del endometrio en el ciclo previo, con la idea de favorecer la implantación.", en: "A small scratch of the endometrial lining in the prior cycle, intended to aid implantation." },
  "Hyaluronate-enriched medium (EmbryoGlue)": { es: "Un medio de cultivo con hialuronato en el que se coloca el embrión antes de transferirlo, por si mejora la adherencia.", en: "A culture medium with hyaluronate the embryo is placed in before transfer, in case it helps it stick." },
  "Immunological: Intralipids": { es: "Una infusión de lípidos por vía intravenosa usada como 'tratamiento inmunológico' para favorecer la implantación.", en: "An intravenous lipid infusion used as an 'immune treatment' to aid implantation." },
  "Immunological: IVIG": { es: "Inmunoglobulinas por vía intravenosa, otro 'tratamiento inmunológico' para supuestos fallos de implantación.", en: "Intravenous immunoglobulins, another 'immune treatment' for presumed implantation failure." },
  "Immunological: steroids": { es: "Corticoides para 'modular el sistema inmune' durante el tratamiento.", en: "Corticosteroids to 'modulate the immune system' during treatment." },
  "IMSI": { es: "Una ICSI con un microscopio de muchos más aumentos para elegir el espermatozoide por su aspecto.", en: "An ICSI using a much higher-magnification microscope to pick the sperm by its appearance." },
  "Intrauterine culture": { es: "Un dispositivo que incuba óvulos/embriones dentro del útero unas horas, en lugar de solo en el laboratorio.", en: "A device that incubates eggs/embryos inside the uterus for a few hours, instead of only in the lab." },
  "Microbiome testing": { es: "Analizar las bacterias del endometrio para ver si influyen en la implantación.", en: "Testing the bacteria of the endometrial lining to see if they affect implantation." },
  "PICSI (male factor)": { es: "Una variante de ICSI que selecciona el espermatozoide por su capacidad de unirse al ácido hialurónico.", en: "A variant of ICSI that selects the sperm by its ability to bind hyaluronic acid." },
  "Platelet-rich plasma (PRP)": { es: "Plasma rico en plaquetas de la propia paciente, inyectado en el ovario o el endometrio para 'rejuvenecerlo'.", en: "The patient's own platelet-rich plasma, injected into the ovary or lining to 'rejuvenate' it." },
  "PGT-A (preimplantation genetic testing for aneuploidy)": { es: "Un test genético que cuenta los cromosomas del embrión (biopsia de día 5–6) para transferir los que tienen el número correcto.", en: "A genetic test that counts the embryo's chromosomes (day 5–6 biopsy) to transfer those with the right number." },
  "Time-lapse imaging and incubation": { es: "Una incubadora con cámara que fotografía el embrión de forma continua, para observarlo sin sacarlo del incubador.", en: "An incubator with a camera that films the embryo continuously, so it can be watched without taking it out." },
  "Sperm DNA fragmentation": { es: "Una prueba que mide el daño en el ADN de los espermatozoides.", en: "A test that measures damage in the sperm's DNA." },
};

/** Neutral framing shown above the add-ons traffic-light. */
export const ADDONS_FRAMING = {
  es: "Qué mide este semáforo: la evidencia de que cada 'extra' mejore tu probabilidad de bebé en casa para la mayoría de pacientes — no si la técnica funciona en sí misma. Un color bajo no significa que sea inútil o dañino para todo el mundo: algunos tienen indicaciones concretas, y la práctica varía por país (en España, por ejemplo, el PGT-A es muy habitual y el time-lapse se ofrece como opción premium). Lo útil es preguntar en tu clínica por qué te lo recomiendan a ti en concreto y qué cuesta.",
  en: "What this traffic-light rates: the evidence that each 'add-on' improves your chance of a baby at home for most patients — not whether the technique works in itself. A low colour does not mean it is useless or harmful for everyone: some have specific indications, and practice varies by country (in Spain, for example, PGT-A is very common and time-lapse is offered as a premium option). The useful move is to ask your clinic why it is being recommended for you specifically, and what it costs.",
};
