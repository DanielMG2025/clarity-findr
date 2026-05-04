import { useEffect, useMemo } from "react";
import { buildScenarios } from "../logic/scenarios";
import type { PricingProfile, ScenarioBundle, TreatmentKey } from "../logic/types";
import { useProfileStore } from "@/modules/profile/store";
import { usePricingStore } from "@/modules/pricing/store";

const VALID_TREATMENTS: TreatmentKey[] = ["ivf", "icsi", "donor", "freezing", "iui", "study"];

/**
 * Pricing configurator hook. Reads ALL inputs live from the patient profile —
 * the profile is the single source of truth — and mirrors the resulting
 * profile snapshot back to the pricing store for cross-page handoff.
 */
export function usePricingConfigurator() {
  const profile = useProfileStore();
  const pricing = usePricingStore();

  const data: PricingProfile = useMemo(() => {
    const treatment: TreatmentKey =
      profile.treatment && VALID_TREATMENTS.includes(profile.treatment as TreatmentKey)
        ? (profile.treatment as TreatmentKey)
        : "ivf";
    return {
      treatment,
      age: profile.age ?? 34,
      country: profile.country ?? "Spain",
      needs_icsi: pricing.needs_icsi,
      needs_pgt: pricing.needs_pgt,
      needs_vitrification: pricing.needs_vitrification,
      storage_years: pricing.storage_years ?? 1,
      prior_failed_cycles: profile.priorFailedCycles ?? 0,
    };
  }, [
    profile.treatment,
    profile.age,
    profile.country,
    profile.priorFailedCycles,
    pricing.needs_icsi,
    pricing.needs_pgt,
    pricing.needs_vitrification,
    pricing.storage_years,
  ]);

  const bundle: ScenarioBundle = useMemo(() => buildScenarios(data), [data]);

  // Patch helper: writes profile-level fields to the profile store and
  // pricing-extras to the pricing store so they remain the single sources of truth.
  const patch = (partial: Partial<PricingProfile>) => {
    const profilePatch: Partial<{
      age: number;
      country: string;
      treatment: PricingProfile["treatment"];
      priorFailedCycles: number;
    }> = {};
    if (partial.age !== undefined) profilePatch.age = partial.age;
    if (partial.country !== undefined) profilePatch.country = partial.country;
    if (partial.treatment !== undefined) profilePatch.treatment = partial.treatment;
    if (partial.prior_failed_cycles !== undefined) profilePatch.priorFailedCycles = partial.prior_failed_cycles;
    if (Object.keys(profilePatch).length) profile.patch(profilePatch as never);

    const pricingPatch: Partial<{
      needs_icsi: boolean;
      needs_pgt: boolean;
      needs_vitrification: boolean;
      storage_years: number;
    }> = {};
    if (partial.needs_icsi !== undefined) pricingPatch.needs_icsi = !!partial.needs_icsi;
    if (partial.needs_pgt !== undefined) pricingPatch.needs_pgt = !!partial.needs_pgt;
    if (partial.needs_vitrification !== undefined) pricingPatch.needs_vitrification = !!partial.needs_vitrification;
    if (partial.storage_years !== undefined) pricingPatch.storage_years = partial.storage_years;
    if (Object.keys(pricingPatch).length) pricing.patch(pricingPatch);
  };

  // Mirror the active profile snapshot for other modules.
  const writePricing = usePricingStore((s) => s.patch);
  useEffect(() => {
    writePricing({ lastProfile: data });
  }, [data, writePricing]);

  return { profile: data, patch, bundle };
}
