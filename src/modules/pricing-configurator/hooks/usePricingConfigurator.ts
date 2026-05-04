import { useMemo } from "react";
import { buildScenarios } from "../logic/scenarios";
import type { PricingProfile, ScenarioBundle } from "../logic/types";
import { useJourneyState } from "@/hooks/useJourneyState";

export interface PricingConfiguratorState extends PricingProfile {}

const DEFAULTS: PricingConfiguratorState = {
  treatment: "ivf",
  age: 34,
  country: "Spain",
  needs_icsi: false,
  needs_pgt: false,
  needs_vitrification: true,
  storage_years: 1,
  prior_failed_cycles: 0,
};

/**
 * Persistent hook for the pricing configurator. Reuses the journey state engine
 * so users can leave and resume with their inputs intact.
 */
export function usePricingConfigurator() {
  const { data, patch, reset } = useJourneyState<PricingConfiguratorState>(
    { key: "pricing-lab", path: "/pricing-lab", label: "Pricing Lab", totalSteps: 1 },
    DEFAULTS,
    0,
  );

  const bundle: ScenarioBundle = useMemo(() => buildScenarios(data), [data]);

  return { profile: data, patch, reset, bundle };
}
