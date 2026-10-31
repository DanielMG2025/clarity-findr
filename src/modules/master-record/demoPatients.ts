// Demo patients — hardcoded seed for the demonstrator
// ---------------------------------------------------------------------------
// ~24 example patients across the typologies the product must handle, with varying
// data completeness so the demo can show "more data → higher confidence".
// These feed the same engines as real users (via the Master Patient Record).
//
// In the demo UI: load any of these OR let the presenter enter a patient by
// hand — both paths produce the same record shape.

import {
  emptyRecord,
  type MasterPatientRecord,
  type TryingDuration,
  type TreatmentInterest,
  type Diagnosis,
  type DonorOpenness,
  type Goal,
} from "@/modules/master-record/types";
import type { FamilyStructure } from "@/modules/regulatory";

export interface DemoPatientSeed {
  key: string;
  label: string; // one-line typology description for the demo picker
  /** Spanish version of the label for the patient-facing Example cases page. */
  label_es: string;
  /** Short clinical story shown on the case card (EN / ES). */
  story: string;
  story_es: string;
  /** Route this case illustrates; drives "find a case like me". */
  goal: Goal;
  data_level: "high" | "medium" | "low"; // how complete the profile is
  name: string;
  age: number;
  country: string;
  /** Drives the regulatory gate. Defaults to hetero_couple when unset. */
  family_structure?: FamilyStructure;
  trying_duration?: TryingDuration;
  treatment_interest?: TreatmentInterest;
  budget_eur?: number;
  donor_openness?: DonorOpenness;
  // clinical (may be absent → lower confidence)
  amh?: number;
  afc?: number;
  fsh?: number;
  diagnosis?: Diagnosis[];
  prior_ivf?: number;
  prior_iui?: number;
}

// Treatments the engine does not model separately (ROPA, tandem, embryo
// donation, surrogacy) are mapped to the closest valid treatment_interest and
// explained in the story, so every seed stays inside the engine's vocabulary.
export const DEMO_PATIENTS: DemoPatientSeed[] = [
  // --- Treatment · Spain (permissive framework) -----------------------------
  {
    key: "ana_31_favorable",
    label: "31 · IVF with own eggs, good prognosis",
    label_es: "31 · FIV con óvulos propios, buen pronóstico",
    story: "Trying for 9 months with her partner. Tests are normal and no cause has been found, so the clinic suggested IVF.",
    story_es: "Lleva 9 meses buscando embarazo con su pareja. Las pruebas salen normales y no hay una causa clara, así que la clínica le propuso FIV.",
    goal: "treatment",
    data_level: "high",
    name: "Ana", age: 31, country: "ES", family_structure: "hetero_couple", trying_duration: "6_12m",
    treatment_interest: "ivf", budget_eur: 6000,
    amh: 2.8, afc: 14, fsh: 6.5, diagnosis: ["unexplained"], prior_ivf: 0,
  },
  {
    key: "marta_38_reserva_baja",
    label: "38 · low reserve + endometriosis, one failed IUI",
    label_es: "38 · reserva baja + endometriosis, una IA sin éxito",
    story: "Diagnosed with endometriosis years ago. One insemination did not work and her AMH has dropped; she is unsure whether to try IVF or consider donor eggs.",
    story_es: "Le diagnosticaron endometriosis hace años. Una inseminación no funcionó y su AMH ha bajado; duda entre intentar FIV o valorar óvulos de donante.",
    goal: "treatment",
    data_level: "high",
    name: "Marta", age: 38, country: "ES", family_structure: "hetero_couple", trying_duration: "1_2y",
    treatment_interest: "unsure", budget_eur: 9000, donor_openness: "maybe",
    amh: 0.8, afc: 6, fsh: 11, diagnosis: ["low_ovarian_reserve", "endometriosis"], prior_iui: 1,
  },
  {
    key: "elena_36_factor_masc",
    label: "36 · severe male factor → ICSI",
    label_es: "36 · factor masculino severo → ICSI",
    story: "Her own results are good, but her partner's semen analysis shows very few motile sperm. The urologist mentioned ICSI.",
    story_es: "Sus resultados son buenos, pero el seminograma de su pareja muestra muy pocos espermatozoides móviles. El urólogo les habló de ICSI.",
    goal: "treatment",
    data_level: "high",
    name: "Elena", age: 36, country: "ES", family_structure: "hetero_couple", trying_duration: "1_2y",
    treatment_interest: "icsi", budget_eur: 7000,
    amh: 2.1, afc: 12, fsh: 7.2, diagnosis: ["male_factor"], prior_ivf: 0,
  },
  {
    key: "laura_sara_33_ropa",
    label: "33 · female couple, reciprocal IVF (ROPA)",
    label_es: "33 · pareja de mujeres, FIV recíproca (ROPA)",
    story: "Laura will provide the eggs and Sara will carry the pregnancy, with donor sperm. No fertility problem is known; they want to understand the steps and costs.",
    story_es: "Laura aportará los óvulos y Sara gestará, con semen de donante. No tienen ningún problema de fertilidad conocido; quieren entender los pasos y los costes.",
    goal: "treatment",
    data_level: "high",
    name: "Laura & Sara", age: 33, country: "ES", family_structure: "female_couple", trying_duration: "under_6m",
    treatment_interest: "ivf", budget_eur: 7500,
    amh: 2.6, afc: 14, fsh: 6.8, diagnosis: ["other"], prior_ivf: 0,
  },
  {
    key: "rosa_45_donante",
    label: "45 · female couple, very low reserve, donor eggs",
    label_es: "45 · pareja de mujeres, reserva muy baja, óvulos de donante",
    story: "Rosa and her partner tried one IVF with Rosa's eggs and got no embryos. At 45 the clinic now talks about egg donation.",
    story_es: "Rosa y su pareja hicieron una FIV con los óvulos de Rosa y no obtuvieron embriones. A los 45, la clínica ya les habla de ovodonación.",
    goal: "treatment",
    data_level: "high",
    name: "Rosa", age: 45, country: "ES", family_structure: "female_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 11000, donor_openness: "yes",
    amh: 0.2, afc: 3, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
  {
    key: "isabel_44_embryo_donation",
    label: "44 · single woman, two failed IVF, embryo donation",
    label_es: "44 · mujer sola, dos FIV sin éxito, donación de embriones",
    story: "After two IVF cycles with her own eggs and donor sperm, she is looking at donated embryos. The closest route modelled here is the donor-egg path.",
    story_es: "Tras dos FIV con sus óvulos y semen de donante, se plantea la donación de embriones (embriones donados). La ruta más parecida que modelamos aquí es la de óvulos de donante.",
    goal: "treatment",
    data_level: "medium",
    name: "Isabel", age: 44, country: "ES", family_structure: "single_woman", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 4500, donor_openness: "yes",
    amh: 0.3, prior_ivf: 2,
  },
  {
    key: "tomas_41_single_man",
    label: "41 · single man, wants to be a father",
    label_es: "41 · hombre solo, quiere ser padre",
    story: "He would need donor eggs and a gestational carrier. Surrogacy is prohibited in Spain, so the legal map matters more than anything else in his case.",
    story_es: "Necesitaría óvulos de donante y una gestante. La gestación subrogada está prohibida en España, así que en su caso el marco legal pesa más que nada.",
    goal: "treatment",
    data_level: "low",
    name: "Tomás", age: 41, country: "ES", family_structure: "single_man",
    treatment_interest: "egg_donation", budget_eur: 30000,
  },
  // --- Treatment · other countries -------------------------------------------
  {
    key: "sofia_34_pocos_datos",
    label: "34 · just starting, barely any data",
    label_es: "34 · empezando, casi sin datos",
    story: "Lives in France and has been trying for under a year. She has no tests yet, so the orientation can only be very general.",
    story_es: "Vive en Francia y lleva menos de un año buscando embarazo. Aún no tiene pruebas, así que la orientación solo puede ser muy general.",
    goal: "treatment",
    data_level: "low",
    name: "Sofía", age: 34, country: "FR", trying_duration: "6_12m",
  },
  {
    key: "nadia_40_tubarico",
    label: "40 · blocked tubes, two failed IVF",
    label_es: "40 · trompas obstruidas, dos FIV sin éxito",
    story: "Lives in the UK. Both tubes are blocked and two IVF cycles ended without a pregnancy; she wants to know what to change before a third.",
    story_es: "Vive en Reino Unido. Tiene las dos trompas obstruidas y dos FIV terminaron sin embarazo; quiere saber qué cambiar antes de un tercer intento.",
    goal: "treatment",
    data_level: "high",
    name: "Nadia", age: 40, country: "UK", family_structure: "hetero_couple", trying_duration: "over_2y",
    treatment_interest: "ivf", budget_eur: 8000, donor_openness: "maybe",
    amh: 1.0, afc: 7, diagnosis: ["tubal_factor"], prior_ivf: 2,
  },
  {
    key: "lucia_42_donante",
    label: "42 · very few own eggs, open-identity donation",
    label_es: "42 · muy pocos óvulos propios, donación no anónima",
    story: "Lives in Portugal. One IVF gave a single poor-quality embryo. Egg donation is legal there, but donors are not anonymous.",
    story_es: "Vive en Portugal. Una FIV dio un único embrión de mala calidad. Allí la ovodonación es legal, pero la donación no es anónima.",
    goal: "treatment",
    data_level: "high",
    name: "Lucía", age: 42, country: "PT", family_structure: "hetero_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 10000, donor_openness: "yes",
    amh: 0.4, afc: 4, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
  {
    key: "katerina_41_tandem",
    label: "41 · tandem cycle (own + donor eggs)",
    label_es: "41 · ciclo tándem (óvulos propios + de donante)",
    story: "Lives in Czechia. She wants one last try with her own eggs, backed by donor eggs in the same cycle. The route modelled here is egg donation.",
    story_es: "Vive en Chequia. Quiere un último intento con sus óvulos, respaldado por óvulos de donante en el mismo ciclo. La ruta modelada aquí es la ovodonación.",
    goal: "treatment",
    data_level: "high",
    name: "Kateřina", age: 41, country: "CZ", family_structure: "hetero_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 7000, donor_openness: "maybe",
    amh: 0.7, afc: 5, fsh: 12.5, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
  {
    key: "maria_36_cyprus_single",
    label: "36 · single woman, IVF with donor sperm",
    label_es: "36 · mujer sola, FIV con semen de donante",
    story: "Lives in Cyprus, where single women can access treatment with donor sperm. Her AMH is in range and she wants to start this year.",
    story_es: "Vive en Chipre, donde las mujeres solas pueden acceder a tratamiento con semen de donante. Su AMH está en rango y quiere empezar este año.",
    goal: "treatment",
    data_level: "medium",
    name: "Maria", age: 36, country: "CY", family_structure: "single_woman", trying_duration: "not_trying",
    treatment_interest: "ivf", budget_eur: 5500,
    amh: 1.9, afc: 10,
  },
  {
    key: "james_oliver_38_uk",
    label: "38 · male couple, donor eggs + surrogacy",
    label_es: "38 · pareja de hombres, óvulos de donante + gestación subrogada",
    story: "Live in the UK, where donor eggs are open to male couples and altruistic surrogacy is legal. They have no clinical data yet.",
    story_es: "Viven en Reino Unido, donde la ovodonación está abierta a parejas de hombres y la gestación subrogada altruista es legal. Aún no tienen datos clínicos.",
    goal: "treatment",
    data_level: "low",
    name: "James & Oliver", age: 38, country: "UK", family_structure: "male_couple", trying_duration: "not_trying",
    treatment_interest: "egg_donation", budget_eur: 45000,
  },
  // --- Treatment · restrictive frameworks (legal cases) -----------------------
  {
    key: "giulia_34_italy_single",
    label: "34 · single woman in Italy (no access at home)",
    label_es: "34 · mujer sola en Italia (sin acceso en casa)",
    story: "Italian law does not allow single women to use donor sperm, so she would need to be treated abroad.",
    story_es: "La ley italiana no permite a las mujeres solas usar semen de donante, así que tendría que tratarse en otro país.",
    goal: "treatment",
    data_level: "medium",
    name: "Giulia", age: 34, country: "IT", family_structure: "single_woman", trying_duration: "1_2y",
    treatment_interest: "ivf", budget_eur: 6000,
    amh: 1.8, afc: 11,
  },
  {
    key: "chiara_35_italy_female_couple",
    label: "35 · female couple in Italy, want ROPA",
    label_es: "35 · pareja de mujeres en Italia, quieren ROPA",
    story: "They would like reciprocal IVF, but in Italy female couples have no access to assisted reproduction.",
    story_es: "Les gustaría hacer FIV recíproca, pero en Italia las parejas de mujeres no tienen acceso a la reproducción asistida.",
    goal: "treatment",
    data_level: "medium",
    name: "Chiara & Giorgia", age: 35, country: "IT", family_structure: "female_couple", trying_duration: "1_2y",
    treatment_interest: "ivf", budget_eur: 7000,
    amh: 2.2, afc: 13,
  },
  {
    key: "lena_39_germany_donor",
    label: "39 · needs egg donation in Germany (prohibited)",
    label_es: "39 · necesita ovodonación en Alemania (prohibida)",
    story: "Her reserve is very low after one IVF. Egg donation is prohibited in Germany, so she is weighing clinics abroad.",
    story_es: "Su reserva es muy baja tras una FIV. La ovodonación está prohibida en Alemania, así que valora clínicas en el extranjero.",
    goal: "treatment",
    data_level: "high",
    name: "Lena", age: 39, country: "DE", family_structure: "hetero_couple", trying_duration: "over_2y",
    treatment_interest: "egg_donation", budget_eur: 9000, donor_openness: "yes",
    amh: 0.5, afc: 5, diagnosis: ["low_ovarian_reserve"], prior_ivf: 1,
  },
  {
    key: "hannah_36_switzerland_single",
    label: "36 · single woman in Switzerland (no donor sperm)",
    label_es: "36 · mujer sola en Suiza (sin semen de donante)",
    story: "Swiss law limits donor sperm to couples, so as a single woman she cannot be treated at home.",
    story_es: "La ley suiza limita el semen de donante a las parejas, así que como mujer sola no puede tratarse en su país.",
    goal: "treatment",
    data_level: "medium",
    name: "Hannah", age: 36, country: "CH", family_structure: "single_woman", trying_duration: "not_trying",
    treatment_interest: "ivf", budget_eur: 9000,
    amh: 1.5, afc: 9,
  },
  {
    key: "anna_37_poland_single",
    label: "37 · single woman in Poland, wants IUI",
    label_es: "37 · mujer sola en Polonia, quiere IA",
    story: "She would start with insemination with donor sperm, but Polish law only allows treatment for heterosexual couples.",
    story_es: "Empezaría por una inseminación con semen de donante, pero la ley polaca solo permite el tratamiento a parejas heterosexuales.",
    goal: "treatment",
    data_level: "medium",
    name: "Anna", age: 37, country: "PL", family_structure: "single_woman", trying_duration: "6_12m",
    treatment_interest: "iui", budget_eur: 3000,
    amh: 1.3,
  },
  {
    key: "eleni_daphne_32_greece",
    label: "32 · female couple in Greece (no access at home)",
    label_es: "32 · pareja de mujeres en Grecia (sin acceso en casa)",
    story: "Greece opens treatment to single women but not to female couples, so they are looking at countries where they can be treated together.",
    story_es: "Grecia permite el tratamiento a mujeres solas pero no a parejas de mujeres, así que buscan países donde puedan tratarse juntas.",
    goal: "treatment",
    data_level: "low",
    name: "Eleni & Daphne", age: 32, country: "GR", family_structure: "female_couple", trying_duration: "under_6m",
    treatment_interest: "ivf",
  },
  // --- Fertility preservation (egg freezing) ---------------------------------
  {
    key: "irene_30_preserve_high",
    label: "30 · planning ahead, freezing eggs, complete profile",
    label_es: "30 · planificando, congelar óvulos, perfil completo",
    story: "No plans for a baby yet. She did a full check-up and wants to freeze eggs while her markers are good.",
    story_es: "Aún no tiene planes de ser madre. Se hizo un chequeo completo y quiere congelar óvulos mientras sus marcadores son buenos.",
    goal: "preserve",
    data_level: "high",
    name: "Irene", age: 30, country: "ES", family_structure: "single_woman", trying_duration: "not_trying",
    treatment_interest: "social_freezing", budget_eur: 4000,
    amh: 3.1, afc: 16, fsh: 6.2, diagnosis: ["unexplained"], prior_ivf: 0,
  },
  {
    key: "paula_33_freezing",
    label: "33 · no partner, freezing eggs (planning)",
    label_es: "33 · sin pareja, congelar óvulos (planificando)",
    story: "Focused on her career and without a partner, she wants to keep options open. She has an AMH test and a scan.",
    story_es: "Centrada en su carrera y sin pareja, quiere mantener abiertas sus opciones. Tiene una AMH y una ecografía.",
    goal: "preserve",
    data_level: "medium",
    name: "Paula", age: 33, country: "ES", family_structure: "single_woman",
    treatment_interest: "social_freezing", budget_eur: 3500,
    amh: 1.9, afc: 10,
  },
  {
    key: "klara_35_germany_preserve",
    label: "35 · wants to freeze eggs in Germany",
    label_es: "35 · quiere congelar óvulos en Alemania",
    story: "Her AMH is a little low for her age. In the framework we use, social egg freezing is not listed as available in Germany, so she is comparing options abroad.",
    story_es: "Su AMH es algo baja para su edad. En el marco que usamos, la congelación social de óvulos no figura como disponible en Alemania, así que compara opciones en otros países.",
    goal: "preserve",
    data_level: "medium",
    name: "Klara", age: 35, country: "DE", family_structure: "single_woman", trying_duration: "not_trying",
    treatment_interest: "social_freezing", budget_eur: 4500,
    amh: 1.2, afc: 8,
  },
  {
    key: "charlotte_36_france_preserve",
    label: "36 · freezing eggs in France, complete profile",
    label_es: "36 · congelar óvulos en Francia, perfil completo",
    story: "Since the 2021 law, egg freezing without a medical reason is allowed in France. She has full results and wants to compare costs.",
    story_es: "Desde la ley de 2021, en Francia se puede congelar óvulos sin motivo médico. Tiene resultados completos y quiere comparar costes.",
    goal: "preserve",
    data_level: "high",
    name: "Charlotte", age: 36, country: "FR", family_structure: "single_woman", trying_duration: "not_trying",
    treatment_interest: "social_freezing", budget_eur: 5000,
    amh: 1.7, afc: 11, fsh: 7.5, diagnosis: ["unexplained"], prior_ivf: 0,
  },
  {
    key: "beatriz_38_preserve_low",
    label: "38 · thinking about freezing, barely any data",
    label_es: "38 · pensando en congelar, casi sin datos",
    story: "She is starting to think about freezing her eggs but has no tests yet. With so little data, the orientation stays general.",
    story_es: "Empieza a pensar en congelar óvulos, pero aún no tiene pruebas. Con tan pocos datos, la orientación es general.",
    goal: "preserve",
    data_level: "low",
    name: "Beatriz", age: 38, country: "ES", family_structure: "single_woman",
    treatment_interest: "social_freezing",
  },
];

/** Build a Master Patient Record fragment from a demo seed. */
export function buildDemoRecord(seed: DemoPatientSeed): MasterPatientRecord {
  const r = emptyRecord();
  r.status = "anonymous";
  r.identity = { ...r.identity, age: seed.age, country_of_residence: seed.country };
  r.intent = {
    ...r.intent,
    goal: seed.goal,
    trying_duration: seed.trying_duration,
    treatment_interest: seed.treatment_interest,
    budget_eur: seed.budget_eur,
    donor_openness: seed.donor_openness,
  };
  r.clinical = {
    ...r.clinical,
    amh: seed.amh,
    afc: seed.afc,
    fsh: seed.fsh,
    diagnosis: seed.diagnosis,
  };
  const hist = [];
  for (let i = 0; i < (seed.prior_ivf ?? 0); i++) hist.push({ id: `d_ivf_${i}`, treatment: "ivf", outcome: "none" as const });
  for (let i = 0; i < (seed.prior_iui ?? 0); i++) hist.push({ id: `d_iui_${i}`, treatment: "iui", outcome: "none" as const });
  r.history = hist;
  r.derived = { ...r.derived, completion_score: completeness(seed) };
  return r;
}

/** Rough profile-completeness score (0-100) — drives the confidence demo. */
export function completeness(seed: DemoPatientSeed): number {
  const fields = [
    seed.age != null,
    !!seed.trying_duration,
    !!seed.treatment_interest,
    seed.budget_eur != null,
    seed.amh != null,
    seed.afc != null,
    seed.fsh != null,
    !!(seed.diagnosis && seed.diagnosis.length),
    seed.prior_ivf != null || seed.prior_iui != null,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
