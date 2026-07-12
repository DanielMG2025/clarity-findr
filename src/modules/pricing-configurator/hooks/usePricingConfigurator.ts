import { useMemo } from "react";
import { buildScenarios } from "../logic/scenarios";
import type { PricingProfile, ScenarioBundle, TreatmentKey } from "../logic/types";
import { componentEstimateForProfile } from "@/modules/component-pricing";
import { useMasterRecord, type TreatmentInterest } from "@/modules/master-record";
import { byCode, COUNTRIES } from "@/modules/regulatory";

// --- Boundary adapters ------------------------------------------------------
// The MPR speaks the canonical vocabulary (egg_donation / social_freezing) and
// stores the country as an ISO-ish code (ES). The pricing engine speaks its own
// TreatmentKey (donor / freezing) and a country NAME (Spain). Translate at the
// boundary; the MPR stays the single source of truth.
const TREATMENT_TO_KEY: Record<TreatmentInterest, TreatmentKey> = {
  ivf: "ivf",
  icsi: "icsi",
  egg_donation: "donor",
  social_freezing: "freezing",
  iui: "iui",
  unsure: "ivf",
};
const KEY_TO_TREATMENT: Record<TreatmentKey, TreatmentInterest> = {
  ivf: "ivf",
  icsi: "icsi",
  donor: "egg_donation",
  freezing: "social_freezing",
  iui: "iui",
  study: "unsure",
};

const codeToName = (code?: string) => (code ? byCode(code)?.label ?? "Spain" : "Spain");
const nameToCode = (name: string) => COUNTRIES.find((c) => c.label === name)?.code;

/**
 * Pricing configurator hook. Reads ALL inputs live from the Master Patient
 * Record — the MPR is the single source of truth — translating its canonical
 * vocabulary to the pricing engine's at the boundary.
 */
export function usePricingConfigurator() {
  const mpr = useMasterRecord();
  const patchIdentity = useMasterRecord((s) => s.patchIdentity);
  const patchIntent = useMasterRecord((s) => s.patchIntent);

  const priorFailed = mpr.history.filter((h) => /ivf|icsi/i.test(h.treatment)).length;

  const data: PricingProfile = useMemo(() => {
    const interest = mpr.intent.treatment_interest;
    const treatment: TreatmentKey = interest ? TREATMENT_TO_KEY[interest] : "ivf";
    return {
      treatment,
      age: mpr.identity.age ?? 34,
      country: codeToName(mpr.identity.country_of_residence),
      needs_icsi: mpr.intent.needs_icsi,
      needs_pgt: mpr.intent.needs_pgt,
      needs_vitrification: mpr.intent.needs_vitrification,
      storage_years: mpr.intent.storage_years ?? 1,
      prior_failed_cycles: priorFailed,
    };
  }, [
    mpr.intent.treatment_interest,
    mpr.identity.age,
    mpr.identity.country_of_residence,
    mpr.intent.needs_icsi,
    mpr.intent.needs_pgt,
    mpr.intent.needs_vitrification,
    mpr.intent.storage_years,
    priorFailed,
  ]);

  // Component-level sourced estimate — the configurator's explainable base.
  const component = useMemo(
    () =>
      componentEstimateForProfile({
        treatment: data.treatment,
        country: data.country,
        needs_icsi: data.needs_icsi,
        needs_pgt: data.needs_pgt,
        storageYears: data.storage_years,
      }),
    [data.treatment, data.country, data.needs_icsi, data.needs_pgt, data.storage_years],
  );

  const bundle: ScenarioBundle = useMemo(() => {
    const base = buildScenarios(data);
    // When the engine covers this treatment, it drives the headline confidence.
    return component
      ? { ...base, component, confidence: component.confidence }
      : { ...base, component: null };
  }, [data, component]);

  // Patch helper: writes back to the MPR (canonical vocabulary), so the record
  // stays the single source of truth across every page.
  const patch = (partial: Partial<PricingProfile>) => {
    if (partial.age !== undefined) patchIdentity({ age: partial.age });
    if (partial.country !== undefined) {
      const code = nameToCode(partial.country);
      if (code) patchIdentity({ country_of_residence: code });
    }
    if (partial.treatment !== undefined) patchIntent({ treatment_interest: KEY_TO_TREATMENT[partial.treatment] });
    if (partial.needs_icsi !== undefined) patchIntent({ needs_icsi: !!partial.needs_icsi });
    if (partial.needs_pgt !== undefined) patchIntent({ needs_pgt: !!partial.needs_pgt });
    if (partial.needs_vitrification !== undefined) patchIntent({ needs_vitrification: !!partial.needs_vitrification });
    if (partial.storage_years !== undefined) patchIntent({ storage_years: partial.storage_years });
  };

  return { profile: data, patch, bundle };
}
