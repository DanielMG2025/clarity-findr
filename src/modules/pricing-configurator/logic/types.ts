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
import type { Estimate as ComponentEstimate } from "@/modules/component-pricing";

export interface ScenarioBundle {
  profile: PricingProfile;
  scenarios: Scenario[];
  confidence: Confidence;
  notes: string[];
  /**
   * Component-level sourced estimate — the configurator's explainable base
   * (Spain-anchored ranges adjusted by market). Null for treatments the engine
   * doesn't cover (iui/study).
   */
  component?: ComponentEstimate | null;
  /** Legacy provenance estimate (server/observations path); unused by the base UI. */
  estimate?: PriceEstimate | null;
  citations?: Citation[];
}
