// Scientific evidence base
// ---------------------------------------------------------------------------
// The "science motor" behind the Orientación de éxito (step 2). It does NOT
// scrape papers. It uses a CURATED, versioned catalogue of openly published
// datasets and guidelines, maps them to the patient's factors, and returns
// EvidenceStatements that are cited and orientative — never a diagnosis.
//
// Legal/ethical posture: we cite published statistics (which is legitimate);
// we do not reproduce copyrighted paper text, and we never give prescriptive
// medical advice. Traceability is precisely what keeps us on the right side of
// the line: we show public evidence, not a black-box verdict.

import {
  toEvidenceStatement,
  type Source,
  type EvidenceObservation,
  type EvidenceStatement,
} from "@/modules/provenance/types";

// ---------------------------------------------------------------------------
// 1) Source catalogue — curated, versioned, human-reviewed
// ---------------------------------------------------------------------------
// Each entry is an openly published dataset or guideline. `weight` is high
// because these are authoritative, but confidence of a STATEMENT still depends
// on how well the patient matches the source's segment (see mapping below).
//
// NOTE: the numeric values embedded further down are PLACEHOLDERS with the
// right shape. Before launch, a clinical reviewer must fill them from the cited
// tables and record the exact locator. Do not ship invented figures.

export const EVIDENCE_SOURCES: Source[] = [
  {
    id: "hfea_trends",
    kind: "scientific",
    label: "HFEA — Fertility treatment: trends and figures",
    url: "https://www.hfea.gov.uk/about-us/publications/research-and-data/",
    market: "UK",
    as_of: "2024",
    weight: 0.95,
    usage_note: "Open aggregate statistics (UK). Cite table + year; do not reproduce prose.",
  },
  {
    id: "cdc_art",
    kind: "scientific",
    label: "CDC — ART Success Rates (National Summary)",
    url: "https://www.cdc.gov/art/",
    market: "US",
    as_of: "2023",
    weight: 0.95,
    usage_note: "Open aggregate statistics (US). Age-banded success rates.",
  },
  {
    id: "eshre_guidelines",
    kind: "scientific",
    label: "ESHRE — Clinical guidelines",
    url: "https://www.eshre.eu/Guidelines-and-Legal",
    market: "EU",
    as_of: "current",
    weight: 0.9,
    usage_note: "Guideline recommendations. Use for 'typical routes', not prescriptions.",
  },
  {
    id: "asrm_guidance",
    kind: "scientific",
    label: "ASRM — Practice committee documents",
    url: "https://www.asrm.org/practice-guidance/practice-committee-documents/",
    market: "US",
    as_of: "current",
    weight: 0.9,
    usage_note: "Guidance documents. Orientative framing only.",
  },
];

export const EVIDENCE_SOURCE_MAP = new Map(EVIDENCE_SOURCES.map((s) => [s.id, s]));

// ---------------------------------------------------------------------------
// 2) Patient segmentation — how we bucket a patient to look up evidence
// ---------------------------------------------------------------------------

export type AgeBand = "<35" | "35-37" | "38-40" | "41-42" | ">42";
export type ReserveBand = "low" | "normal" | "high" | "unknown";

export function ageBand(age?: number): AgeBand {
  if (age == null) return "35-37";
  if (age < 35) return "<35";
  if (age <= 37) return "35-37";
  if (age <= 40) return "38-40";
  if (age <= 42) return "41-42";
  return ">42";
}

/** Reserve proxy from AMH (ng/mL) and/or antral follicle count. */
export function reserveBand(amh?: number, afc?: number): ReserveBand {
  if (amh == null && afc == null) return "unknown";
  const lowAmh = amh != null && amh < 1.1;
  const lowAfc = afc != null && afc < 7;
  if (lowAmh || lowAfc) return "low";
  const highAmh = amh != null && amh > 3.5;
  if (highAmh) return "high";
  return "normal";
}

// ---------------------------------------------------------------------------
// 3) Evidence observations — curated rows keyed by (metric, segment)
// ---------------------------------------------------------------------------
// PLACEHOLDER VALUES — shape is correct, numbers must be filled by a clinical
// reviewer from the cited source tables before launch.

export const EVIDENCE_OBSERVATIONS: EvidenceObservation[] = [
  {
    id: "lbr_own_35-37",
    metric: "live_birth_rate_per_cycle_own_eggs",
    segment: { age_band: "35-37", reserve: "any" },
    value_min: 0.0, // TODO reviewer: fill from HFEA/CDC table
    value_max: 0.0,
    unit: "rate",
    source_id: "hfea_trends",
  },
  {
    id: "lbr_own_38-40",
    metric: "live_birth_rate_per_cycle_own_eggs",
    segment: { age_band: "38-40", reserve: "any" },
    value_min: 0.0,
    value_max: 0.0,
    unit: "rate",
    source_id: "hfea_trends",
  },
  {
    id: "lbr_donor_any",
    metric: "live_birth_rate_per_cycle_donor_eggs",
    segment: { age_band: "any", reserve: "any" },
    value_min: 0.0,
    value_max: 0.0,
    unit: "rate",
    source_id: "cdc_art",
  },
];

// ---------------------------------------------------------------------------
// 4) Route hints — "typical routes literature describes" (NOT recommendations)
// ---------------------------------------------------------------------------

export interface RouteHint {
  route: "ivf_own" | "ivf_donor" | "icsi" | "further_testing";
  /** When this route is commonly discussed in the literature for this segment. */
  applies: (seg: { age: AgeBand; reserve: ReserveBand }) => boolean;
  source_id: string;
  locator: string;
}

export const ROUTE_HINTS: RouteHint[] = [
  {
    route: "ivf_own",
    applies: (s) => s.age !== ">42",
    source_id: "eshre_guidelines",
    locator: "Ovarian stimulation guideline",
  },
  {
    route: "ivf_donor",
    applies: (s) => s.age === "41-42" || s.age === ">42" || s.reserve === "low",
    source_id: "eshre_guidelines",
    locator: "Oocyte donation guidance",
  },
  {
    route: "further_testing",
    applies: (s) => s.reserve === "unknown",
    source_id: "asrm_guidance",
    locator: "Diagnostic evaluation of infertility",
  },
];

// ---------------------------------------------------------------------------
// 5) The engine — patient factors → cited, orientative statements
// ---------------------------------------------------------------------------

export interface EvidenceQuery {
  age?: number;
  amh?: number;
  afc?: number;
  prior_cycles?: number;
}

export interface EvidenceResult {
  segment: { age: AgeBand; reserve: ReserveBand };
  statements: EvidenceStatement[];
  routes: Array<{ route: RouteHint["route"]; citation: { label: string; url?: string; locator: string } }>;
  /** Text for the detailed, fully-referenced report the patient can open. */
  report_intro: string;
}

export function buildEvidence(q: EvidenceQuery): EvidenceResult {
  const seg = { age: ageBand(q.age), reserve: reserveBand(q.amh, q.afc) };

  // pick observations whose segment is compatible with the patient
  const matched = EVIDENCE_OBSERVATIONS.filter((o) => {
    const ab = o.segment.age_band;
    return ab === "any" || ab === seg.age;
  });

  const statements = matched.map((o) =>
    toEvidenceStatement(o, EVIDENCE_SOURCE_MAP, localeLocator(o)),
  );

  const routes = ROUTE_HINTS.filter((h) => h.applies(seg)).map((h) => {
    const s = EVIDENCE_SOURCE_MAP.get(h.source_id);
    return {
      route: h.route,
      citation: { label: s?.label ?? h.source_id, url: s?.url, locator: h.locator },
    };
  });

  return {
    segment: seg,
    statements,
    routes,
    report_intro:
      `Este resumen es orientativo y educativo — no es un diagnóstico ni sustituye el criterio de un profesional. ` +
      `Se basa en estadísticas publicadas y guías que puedes consultar directamente en las fuentes citadas. ` +
      `Tu perfil se ha situado en el grupo de edad ${seg.age} y reserva ${translateReserve(seg.reserve)}.`,
  };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function localeLocator(o: EvidenceObservation): string {
  return `metric: ${o.metric} · segmento: ${Object.values(o.segment).join(", ")}`;
}

function translateReserve(r: ReserveBand): string {
  return { low: "baja", normal: "normal", high: "alta", unknown: "sin determinar" }[r];
}
