/**
 * Cross-pillar bridge: maps a patient's country and treatment to the reference
 * sections (regulation, evidence). Presentation-only links — never re-shows engine data.
 */
import { FINDINGS, type Finding } from "./science";

export type CaseRef = { regCountryEn: string | null; findingIds: string[] };

export const COUNTRY_TO_REG: Record<string, string> = {
  ES: "Spain", PT: "Portugal", UK: "United Kingdom", FR: "France", IT: "Italy", DE: "Germany",
  CZ: "Czech Republic", GR: "Greece", CY: "Cyprus (South · EU)", PL: "Poland", TR: "Turkey",
};

export const TREATMENT_TO_FINDINGS: Record<string, string[]> = {
  ivf: ["edad", "acumulada", "addons", "pgta", "eset"],
  icsi: ["icsi", "addons", "edad", "eset"],
  egg_donation: ["donante", "addons", "eset"],
  iui: ["edad", "estilo"],
  social_freezing: ["congelacion", "edad", "amh"],
  unsure: ["edad", "amh", "addons"],
};

export function caseReferences(args: { country?: string; treatment_interest?: string; goal?: string } = {}): CaseRef {
  const country = typeof args?.country === "string" ? args.country.toUpperCase() : "";
  const regCountryEn = Object.prototype.hasOwnProperty.call(COUNTRY_TO_REG, country) ? COUNTRY_TO_REG[country] : null;
  const t = args?.treatment_interest;
  let findingIds: string[];
  if (t && Object.prototype.hasOwnProperty.call(TREATMENT_TO_FINDINGS, t)) findingIds = [...TREATMENT_TO_FINDINGS[t]];
  else if (args?.goal === "preserve") findingIds = ["congelacion", "edad", "amh"];
  else findingIds = ["edad", "addons"];
  return { regCountryEn, findingIds };
}

/** Resolve ids to FINDINGS entries, preserving the id order. */
export function findingsByIds(ids: string[]): Finding[] {
  return ids.map((id) => FINDINGS.find((f) => f.id === id)).filter((f): f is Finding => !!f);
}
