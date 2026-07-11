// Pricing Configurator — domain types
export type TreatmentKey =
  | "ivf"
  | "icsi"
  | "donor"
  | "freezing"
  | "iui"
  | "study";

export type ScenarioKey = "basic" | "premium" | "guarantee";

export interface PricingProfile {
  treatment: TreatmentKey;
  age: number;
  country: string;
  /** Optional enrichers, all default false */
  needs_icsi?: boolean;
  needs_pgt?: boolean;
  needs_vitrification?: boolean;
  storage_years?: number;
  prior_failed_cycles?: number;
}

export interface CostComponent {
  key: string;
  label: string;
  /** human helper for the WhatIsThis tooltip */
  hint?: string;
  min: number;
  max: number;
}

export interface Scenario {
  key: ScenarioKey;
  label: string;
  shortDesc: string;
  riskLabel: "Low risk" | "Medium risk" | "Higher risk";
  riskHint: string;
  components: CostComponent[];
  total_min: number;
  total_max: number;
  /** color tone for visuals */
  tone: "emerald" | "blue" | "violet";
}

export type Confidence = "low" | "medium" | "high";

import type { Citation, PriceEstimate } from "@/modules/provenance";

export interface ScenarioBundle {
  profile: PricingProfile;
  scenarios: Scenario[];
  confidence: Confidence;
  notes: string[];
  /** Server-provided provenance estimate when available; null/absent in cold-start. */
  estimate?: PriceEstimate | null;
  /** Citations behind the provenance estimate, surfaced in the data-sources panel. */
  citations?: Citation[];
}
