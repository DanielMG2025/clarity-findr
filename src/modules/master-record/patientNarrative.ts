import { citation, ownEggCitationForAge } from "@/modules/evidence/citations";
import { byCode, type FamilyStructure } from "@/modules/regulatory";
import type { MasterPatientRecord, TreatmentInterest } from "./types";
import type { Journey } from "./runDemo";
import { translate, type Language } from "@/i18n/translate";
import { needWithArticleEs } from "@/i18n/journey.es";

export const FAMILY_PHRASE: Record<FamilyStructure, string> = {
  hetero_couple: "part of a heterosexual couple",
  female_couple: "part of a female couple",
  single_woman: "a single woman",
  male_couple: "part of a male couple",
  single_man: "a single man",
};

export const TREATMENT_PHRASE: Record<TreatmentInterest, string> = {
  ivf: "IVF with your own eggs",
  icsi: "IVF with ICSI, where one sperm is placed directly into an egg",
  egg_donation: "treatment with donor eggs",
  social_freezing: "egg freezing",
  iui: "intrauterine insemination (IUI)",
  unsure: "which fertility treatment may fit you",
};

export const FAMILY_PHRASE_ES: Record<FamilyStructure, string> = {
  hetero_couple: "estás en pareja heterosexual",
  female_couple: "formas parte de una pareja de mujeres",
  single_woman: "afrontas esto como mujer sola",
  male_couple: "formas parte de una pareja de hombres",
  single_man: "afrontas esto como hombre solo",
};

export const TREATMENT_PHRASE_ES: Record<TreatmentInterest, string> = {
  ivf: "la FIV con tus propios óvulos",
  icsi: "la FIV con ICSI, en la que se introduce un espermatozoide directamente en el óvulo",
  egg_donation: "un tratamiento con óvulos de donante",
  social_freezing: "la congelación de óvulos",
  iui: "la inseminación intrauterina (IA)",
  unsure: "qué tratamiento de fertilidad puede encajarte",
};

export function joinNaturally(parts: string[], language: Language = "en") {
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} ${language === "es" ? "y" : "and"} ${parts.at(-1)}`;
}

/** Shared read-only prose for the compact and detailed patient reports. */
export function patientNarrative(mpr: MasterPatientRecord, journey: Journey, language: Language = "en"): string[] {
  if (language === "es") return patientNarrativeEs(mpr, journey);
  const age = mpr.identity.age;
  const country = mpr.identity.country_of_residence ? byCode(mpr.identity.country_of_residence)?.label : undefined;
  const treatment = mpr.intent.treatment_interest;
  const family = mpr.identity.family_structure;
  const ageEvidence = age != null && age >= 18 && age <= 44 ? citation(ownEggCitationForAge(age)) : undefined;
  const blockedResult = journey.step0_regulatory?.results.find((result) => result.verdict === "not_allowed");

  const travelBlocked = journey.step0_regulatory?.needs_to_travel ? blockedResult : undefined;
  const orientation = journey.step2_orientation;
  const favorable = orientation.factors.filter((factor) => factor.kind === "favorable");
  const attention = orientation.factors.filter((factor) => factor.kind === "attention");
  const missing = orientation.factors.filter((factor) => factor.kind === "missing");
  const options = journey.step4_costs;
  const lowerFirst = (text: string) => /^[A-Z]{2}/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
  const titles = (factors: typeof orientation.factors) => joinNaturally(factors.map((factor) => lowerFirst(factor.title)));
  const lead = joinNaturally(
    [
      age != null ? `you’re ${age}` : undefined,
      country ? `living in ${country}` : undefined,
      family ? FAMILY_PHRASE[family] : undefined,
      treatment ? `thinking about ${TREATMENT_PHRASE[treatment]}` : "still working out which direction may suit you",
    ].filter((part): part is string => Boolean(part)),
  );
  const factorSentences = [
    favorable.length > 0 ? `There are things working in your favour: ${titles(favorable)}. ${favorable.find((factor) => factor.title !== "You've started informing yourself early")?.why ?? favorable[0]?.why ?? ""}` : "",
    attention.length > 0 ? `Alongside that, ${titles(attention)} ${attention.length === 1 ? "is worth" : "are worth"} talking through with a specialist. ${attention.slice(0, 2).map((factor) => factor.why).join(" ")}` : "",
    missing.length > 0 ? `To make this more specific to you, we still need your ${titles(missing)}. These gaps leave part of the picture open; they are not findings about your health.` : "",
    missing.length === 0 && orientation.confidence_reason ? orientation.confidence_reason : "",
  ].filter(Boolean);

  return [
    `Right now ${lead}. ${treatment === "social_freezing" ? "For you, this conversation is about preserving eggs for a possible future treatment, rather than starting a pregnancy now." : treatment === "egg_donation" ? "Considering donor eggs brings its own questions, including how that path fits your medical history and what feels right to you." : attention.length > 0 ? `With ${titles(attention)} in your history, it makes sense to want an explanation that starts with your own situation.` : `You’re looking at ${treatment && treatment !== "unsure" ? TREATMENT_PHRASE[treatment] : "your fertility options"}, and the results you have shared give us a place to begin.`} Taking time to understand this is a meaningful step.`,
    factorSentences.join(" "),
    travelBlocked
      ? `One thing is worth understanding early, because it shapes the path more than anything else: ${travelBlocked.label} is not currently available to you in ${
          country ?? "your country"
        }. That is about the rules where you live, not about you or your health. It rarely closes the door — more often it moves it — so the options below include the places where that path is open, and you can weigh it calmly rather than stumble on it later.`
      : ageEvidence
        ? `At ${age}, the age-band figure gives you some context: ${ageEvidence.source.publisher} reports around ${ageEvidence.value}% pregnancies per fresh embryo transferred using patients’ own eggs (${ageEvidence.source.year}). That is a UK population average, not your personal probability, not a live-birth rate and not the chance per cycle started, because some cycles never reach transfer.${ageEvidence.pending_review ? " The citation is still pending review, so treat it as orientation rather than a settled personal estimate." : ""}${treatment === "egg_donation" ? " It describes own-egg treatment, not the donor-egg path you are considering." : treatment === "social_freezing" ? " It does not tell you the chance of having a baby from eggs you freeze now." : " Your own results and medical history still matter when a clinician discusses what it means for you."}`
        : `Without a published age-band figure that covers your profile, there is no percentage to attach to you here. ${missing.length > 0 ? `Completing your ${titles(missing)} would give a clinician a clearer starting point.` : "Your hormone results, the ultrasound count of small follicles in your ovaries and your medical history are the starting point for a more personal conversation."}`,
    options.length > 0
      ? `Given what you have shared, the options appearing here are ${joinNaturally(options.map((option) => option.estimate.plan_label))}. The first is ${options[0]?.estimate.plan_label}: ${lowerFirst(options[0]?.why_this_plan ?? "")}${travelBlocked ? ` For you, exploring these also means checking where ${travelBlocked.label} is legally available before planning treatment.` : ""} These are paths to explore with a clinician, not instructions or a promise that any one will fit.`
      : "There are no treatment options listed for your profile yet; a consultation can help clarify which paths are relevant before you compare costs.",
    "Below, you can look through the evidence, costs and next steps for your situation at your own pace.",
  ];
}

/** Spanish version of the same read-only prose (same inputs, same structure). */
function patientNarrativeEs(mpr: MasterPatientRecord, journey: Journey): string[] {
  const t = (text: string) => translate(text, "es");
  const age = mpr.identity.age;
  const countryEn = mpr.identity.country_of_residence ? byCode(mpr.identity.country_of_residence)?.label : undefined;
  const country = countryEn ? t(countryEn) : undefined;
  const treatment = mpr.intent.treatment_interest;
  const family = mpr.identity.family_structure;
  const ageEvidence = age != null && age >= 18 && age <= 44 ? citation(ownEggCitationForAge(age)) : undefined;
  const blockedResult = journey.step0_regulatory?.results.find((result) => result.verdict === "not_allowed");
  const travelBlocked = journey.step0_regulatory?.needs_to_travel ? blockedResult : undefined;
  const orientation = journey.step2_orientation;
  const favorable = orientation.factors.filter((factor) => factor.kind === "favorable");
  const attention = orientation.factors.filter((factor) => factor.kind === "attention");
  const missing = orientation.factors.filter((factor) => factor.kind === "missing");
  const options = journey.step4_costs;
  const lowerFirst = (text: string) => /^[A-Z]{2}/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
  const titles = (factors: typeof orientation.factors) => joinNaturally(factors.map((factor) => lowerFirst(t(factor.title))), "es");
  const join = (parts: string[]) => joinNaturally(parts, "es");
  const blockedLabel = travelBlocked ? needWithArticleEs(travelBlocked.label) : "";
  const lead = join(
    [
      age != null ? `tienes ${age} años` : undefined,
      country ? `vives en ${country}` : undefined,
      family ? FAMILY_PHRASE_ES[family] : undefined,
      treatment ? `estás valorando ${TREATMENT_PHRASE_ES[treatment]}` : "todavía estás viendo qué camino puede encajarte",
    ].filter((part): part is string => Boolean(part)),
  );
  const factorSentences = [
    favorable.length > 0 ? `Hay cosas que juegan a tu favor: ${titles(favorable)}. ${t(favorable.find((factor) => factor.title !== "You've started informing yourself early")?.why ?? favorable[0]?.why ?? "")}` : "",
    attention.length > 0 ? `Además, conviene hablar con un especialista sobre ${titles(attention)}. ${attention.slice(0, 2).map((factor) => t(factor.why)).join(" ")}` : "",
    missing.length > 0 ? `Para que esto se ajuste más a ti, todavía nos falta: ${titles(missing)}. Estos huecos dejan parte del cuadro abierto; no son hallazgos sobre tu salud.` : "",
    missing.length === 0 && orientation.confidence_reason ? t(orientation.confidence_reason) : "",
  ].filter(Boolean);

  return [
    `Ahora mismo ${lead}. ${treatment === "social_freezing" ? "En tu caso, la conversación trata de conservar óvulos para un posible tratamiento futuro, no de buscar un embarazo ahora." : treatment === "egg_donation" ? "Plantearse óvulos de donante trae sus propias preguntas, como encaja ese camino con tu historia médica y qué sientes que es lo adecuado para ti." : attention.length > 0 ? `Con ${titles(attention)} en tu historia, tiene sentido querer una explicación que parta de tu propia situación.` : `Estás valorando ${treatment && treatment !== "unsure" ? TREATMENT_PHRASE_ES[treatment] : "tus opciones de fertilidad"}, y los resultados que has compartido nos dan un punto de partida.`} Tomarte el tiempo de entender esto ya es un paso importante.`,
    factorSentences.join(" "),
    travelBlocked
      ? `Hay algo que conviene entender pronto, porque marca el camino más que cualquier otra cosa: ahora mismo ${blockedLabel} no está a tu alcance en ${country ?? "tu país"}. Se debe a las normas del lugar donde vives, no a ti ni a tu salud. Pocas veces cierra la puerta; lo habitual es que la cambie de sitio. Por eso las opciones de abajo incluyen los lugares donde ese camino sí está abierto, para que puedas valorarlo con calma en vez de encontrártelo más tarde.`
      : ageEvidence
        ? `Con ${age} años, la cifra de tu franja de edad te da algo de contexto: ${t(ageEvidence.source.publisher)} recoge alrededor de un ${ageEvidence.value} % de embarazos por embrión transferido en fresco con los óvulos de la propia paciente (${t(ageEvidence.source.year)}). Es una media de la población de Reino Unido, no tu probabilidad personal, ni una tasa de nacido vivo, ni la probabilidad por ciclo iniciado, porque algunos ciclos no llegan a la transferencia.${ageEvidence.pending_review ? " La cita aún está pendiente de revisión, así que tómala como orientación y no como una estimación personal cerrada." : ""}${treatment === "egg_donation" ? " Describe el tratamiento con óvulos propios, no el camino con óvulos de donante que estás valorando." : treatment === "social_freezing" ? " No indica la probabilidad de tener un bebé con los óvulos que congeles ahora." : " Tus propios resultados y tu historia médica siguen importando cuando un especialista comente qué significa para ti."}`
        : `Sin una cifra publicada para la franja de edad de tu perfil, aquí no hay ningún porcentaje que asociarte. ${missing.length > 0 ? `Completar ${titles(missing)} daría a un especialista un punto de partida más claro.` : "Tus análisis hormonales, el recuento ecográfico de folículos pequeños en los ovarios y tu historia médica son el punto de partida para una conversación más personal."}`,
    options.length > 0
      ? `Con lo que has compartido, las opciones que aparecen aquí son: ${join(options.map((option) => t(option.estimate.plan_label)))}. La primera es ${t(options[0]?.estimate.plan_label ?? "")}: ${lowerFirst(t(options[0]?.why_this_plan ?? ""))}${travelBlocked ? ` En tu caso, explorarlas también implica comprobar en qué países se permite ${blockedLabel} antes de planificar el tratamiento.` : ""} Son caminos para explorar con un especialista, no instrucciones ni la promesa de que alguno vaya a encajar.`
      : "Todavía no aparecen opciones de tratamiento para tu perfil; una consulta puede ayudarte a aclarar qué caminos son relevantes antes de comparar costes.",
    "A continuación puedes revisar la evidencia, los costes y los próximos pasos de tu situación, a tu ritmo.",
  ];
}
