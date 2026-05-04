import { useEffect, useMemo } from "react";
import { buildScenarios } from "../logic/scenarios";
import type { PricingProfile, ScenarioBundle, TreatmentKey } from "../logic/types";
import { useJourneyState } from "@/hooks/useJourneyState";
import { useProfileStore } from "@/modules/profile/store";
import { usePricingStore } from "@/modules/pricing/store";

export interface PricingConfiguratorState extends PricingProfile {}

const VALID_TREATMENTS: TreatmentKey[] = ["ivf", "icsi", "donor", "freezing", "iui", "study"];

function defaultsFromProfile(): PricingConfiguratorState {
  const p = useProfileStore.getState();
  const px = usePricingStore.getState();
  const treatment: TreatmentKey =
    p.treatment && VALID_TREATMENTS.includes(p.treatment as TreatmentKey)
      ? (p.treatment as TreatmentKey)
      : "ivf";
  return {
    treatment,
    age: p.age ?? 34,
    country: p.country ?? "Spain",
    needs_icsi: px.needs_icsi,
    needs_pgt: px.needs_pgt,
    needs_vitrification: px.needs_vitrification,
    storage_years: px.storage_years ?? 1,
    prior_failed_cycles: p.priorFailedCycles ?? 0,
  };
}

/**
 * Persistent hook for the pricing configurator. Seeds from the profile store
 * (so Explorer answers carry over), persists step state via useJourneyState,
 * and writes the last computed profile back to the pricing store so Navigator
 * can pick it up.
 */
export function usePricingConfigurator() {
  const { data, patch, reset } = useJourneyState<PricingConfiguratorState>(
    { key: "pricing-lab", path: "/pricing-lab", label: "Pricing Lab", totalSteps: 1 },
    defaultsFromProfile(),
    0,
  );

  const bundle: ScenarioBundle = useMemo(() => buildScenarios(data), [data]);

  // Mirror the active profile + extras into the pricing store for cross-page handoff.
  const writePricing = usePricingStore((s) => s.patch);
  useEffect(() => {
    writePricing({
      lastProfile: data,
      needs_icsi: !!data.needs_icsi,
      needs_pgt: !!data.needs_pgt,
      needs_vitrification: !!data.needs_vitrification,
      storage_years: data.storage_years ?? 1,
    });
  }, [data, writePricing]);

  return { profile: data, patch, reset, bundle };
}
