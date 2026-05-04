// Build the 3 cost scenarios (basic / premium / guarantee) for a given profile.
// Numbers are based on real European market ranges, then adjusted by profile.
import type { CostComponent, PricingProfile, Scenario, ScenarioBundle, TreatmentKey } from "./types";

interface BaseSpec {
  base: [number, number];
  meds: [number, number];
  workup: [number, number];
  lab: [number, number];
  transfer: [number, number];
  vitrification: [number, number];
  storage_year: [number, number];
}

const BASE_BY_TREATMENT: Record<TreatmentKey, BaseSpec> = {
  ivf:      { base: [4200, 6200], meds: [1200, 2600], workup: [250, 600], lab: [400, 900],  transfer: [500, 900],  vitrification: [350, 700], storage_year: [250, 450] },
  icsi:     { base: [4800, 6900], meds: [1300, 2800], workup: [250, 600], lab: [500, 1000], transfer: [500, 900],  vitrification: [350, 700], storage_year: [250, 450] },
  donor:    { base: [6500, 9500], meds: [600, 1200],  workup: [200, 500], lab: [400, 900],  transfer: [600, 1000], vitrification: [350, 700], storage_year: [250, 450] },
  freezing: { base: [2200, 3500], meds: [900, 1800],  workup: [200, 500], lab: [300, 700],  transfer: [0, 0],      vitrification: [400, 800], storage_year: [250, 450] },
  iui:      { base: [600, 1200],  meds: [200, 600],   workup: [150, 400], lab: [0, 0],      transfer: [0, 0],      vitrification: [0, 0],     storage_year: [0, 0] },
  study:    { base: [200, 600],   meds: [0, 0],       workup: [150, 400], lab: [100, 300],  transfer: [0, 0],      vitrification: [0, 0],     storage_year: [0, 0] },
};

// Country multipliers (approximate market signals)
const COUNTRY_MULT: Record<string, number> = {
  Spain: 1.0,
  "Czech Republic": 0.78,
  Portugal: 0.92,
  Greece: 0.85,
  UK: 1.45,
  Germany: 1.25,
  France: 1.15,
  Italy: 1.1,
  Other: 1.0,
};

const r = (v: number) => Math.round(v / 50) * 50;

function comp(key: string, label: string, range: [number, number], hint?: string): CostComponent {
  return { key, label, hint, min: r(range[0]), max: r(range[1]) };
}

function ageFactor(age: number): number {
  if (age < 30) return 0.95;
  if (age < 35) return 1.0;
  if (age < 38) return 1.05;
  if (age < 41) return 1.12;
  return 1.18;
}

function scaleRange(range: [number, number], mult: number): [number, number] {
  return [range[0] * mult, range[1] * mult];
}

export function buildScenarios(profile: PricingProfile): ScenarioBundle {
  const spec = BASE_BY_TREATMENT[profile.treatment];
  const cMult = COUNTRY_MULT[profile.country] ?? 1.0;
  const aMult = ageFactor(profile.age);
  const baseMult = cMult * aMult;

  const storageYears = profile.storage_years ?? 1;

  // Build common components, then assemble per-scenario variants.
  const baseTreatment    = comp("base",     "Tratamiento base",         scaleRange(spec.base, baseMult), "Coste de la estimulación, punción y procedimiento estándar.");
  const meds             = comp("meds",     "Medicación",               scaleRange(spec.meds, baseMult), "Hormonas y fármacos para estimular la producción ovárica. Suele facturarse aparte.");
  const workup           = comp("workup",   "Pruebas previas",          scaleRange(spec.workup, cMult), "Analíticas, ecografías y consultas iniciales antes de empezar el ciclo.");
  const lab              = comp("lab",      "Laboratorio",              scaleRange(spec.lab, baseMult), "Cultivo embrionario y técnicas de laboratorio.");
  const transfer         = comp("transfer", "Transferencia",            scaleRange(spec.transfer, baseMult), "Transferencia del embrión al útero.");
  const vitrification    = comp("vitrif",   "Vitrificación",            scaleRange(spec.vitrification, baseMult), "Congelación de embriones u óvulos para usarlos en el futuro.");
  const storage          = comp("storage",  `Mantenimiento (${storageYears} año${storageYears > 1 ? "s" : ""})`, scaleRange([spec.storage_year[0] * storageYears, spec.storage_year[1] * storageYears], 1), "Custodia anual de óvulos o embriones congelados.");

  const icsi = profile.needs_icsi || profile.treatment === "icsi"
    ? comp("icsi", "ICSI", scaleRange([900, 1500], baseMult), "Microinyección espermática. Se suma cuando el factor masculino lo aconseja.")
    : null;
  const pgt = profile.needs_pgt
    ? comp("pgt", "Test genético (PGT-A)", scaleRange([2200, 4200], baseMult), "Análisis genético de embriones. Suele añadirse en pacientes >38 o con fallos previos.")
    : null;

  // BASIC — minimum viable cycle, no extras
  const basicComponents: CostComponent[] = [baseTreatment, meds, workup, lab, transfer].filter(c => c.max > 0);
  const basic: Scenario = {
    key: "basic",
    label: "Escenario básico",
    shortDesc: "Un ciclo completo sin extras opcionales. Lo más habitual cuando todo va según lo previsto.",
    riskLabel: "Medium risk",
    riskHint: "Si el primer ciclo no funciona, el coste de un segundo ciclo se asume entero.",
    components: basicComponents,
    total_min: 0, total_max: 0,
    tone: "emerald",
  };

  // PREMIUM — todo el confort + extras frecuentes
  const premiumComponents: CostComponent[] = [
    baseTreatment, meds, workup, lab, transfer,
    vitrification.max > 0 ? vitrification : null,
    icsi,
    pgt,
    storage.max > 0 ? storage : null,
  ].filter(Boolean) as CostComponent[];
  const premium: Scenario = {
    key: "premium",
    label: "Escenario premium",
    shortDesc: "Ciclo con técnicas avanzadas (ICSI, PGT-A, vitrificación) y mantenimiento incluido.",
    riskLabel: "Low risk",
    riskHint: "Más caro inicialmente, pero reduce variabilidad y reintervenciones.",
    components: premiumComponents,
    total_min: 0, total_max: 0,
    tone: "blue",
  };

  // GUARANTEE — programa multiciclo / reembolso
  const multiplier = 1.85; // típico recargo vs. ciclo único en programas de garantía
  const guaranteeBase = comp("guarantee_pkg", "Programa garantía (hasta 3 intentos)",
    [baseTreatment.min * multiplier, baseTreatment.max * multiplier],
    "Pagas un precio cerrado por varios intentos. Si no hay embarazo, hay reembolso parcial o total según el plan."
  );
  const guaranteeComponents: CostComponent[] = [
    guaranteeBase,
    { ...meds, min: meds.min * 2, max: meds.max * 2.5, label: "Medicación (varios ciclos)" },
    workup,
    icsi ? { ...icsi, min: icsi.min, max: icsi.max * 1.5 } : null,
    pgt ? { ...pgt, min: pgt.min, max: pgt.max * 1.4 } : null,
  ].filter(Boolean) as CostComponent[];
  const guarantee: Scenario = {
    key: "guarantee",
    label: "Escenario garantía",
    shortDesc: "Programa multiciclo con reembolso si no hay embarazo. Coste predecible.",
    riskLabel: "Low risk",
    riskHint: "Mayor coste inicial, pero protege frente a varios intentos.",
    components: guaranteeComponents,
    total_min: 0, total_max: 0,
    tone: "violet",
  };

  // Totalize
  for (const s of [basic, premium, guarantee]) {
    s.total_min = r(s.components.reduce((acc, c) => acc + c.min, 0));
    s.total_max = r(s.components.reduce((acc, c) => acc + c.max, 0));
  }

  // Confidence — proxy: more enrichers = higher
  const enrichers = [profile.needs_icsi, profile.needs_pgt, profile.needs_vitrification, !!profile.country, !!profile.age].filter(Boolean).length;
  const confidence = enrichers >= 4 ? "high" : enrichers >= 2 ? "medium" : "low";

  const notes: string[] = [];
  if (profile.age >= 38) notes.push("Hemos ampliado el rango porque pacientes en tu franja de edad suelen requerir más pruebas o un segundo intento.");
  if (profile.country === "Czech Republic" || profile.country === "Greece") notes.push(`Los precios en ${profile.country} suelen ser un 20–35% más bajos que en España, pero conviene sumar viaje y alojamiento.`);
  if (profile.prior_failed_cycles && profile.prior_failed_cycles > 0) notes.push("Con ciclos previos sin éxito, los programas con garantía pueden compensar el coste extra.");

  return {
    profile,
    scenarios: [basic, premium, guarantee],
    confidence,
    notes,
  };
}
