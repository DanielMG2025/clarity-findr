import { useEffect, useState } from "react";
import type { PriceEstimate } from "@/modules/provenance";
import type { PricingProfile } from "../logic/types";
import { fetchProvenanceEstimate } from "../logic/provenanceSource";

// Dormant by default. Flip VITE_ENABLE_PROVENANCE_PRICING=true once the
// price-estimate edge function is deployed and price_observations has data.
// While off, no network call is made and the configurator uses its formula.
const ENABLED = import.meta.env.VITE_ENABLE_PROVENANCE_PRICING === "true";

/**
 * Loads the server-side provenance estimate for the current profile.
 * Returns null while disabled, loading, on error, or when there's no data.
 */
export function useProvenanceEstimate(profile: PricingProfile): PriceEstimate | null {
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null);

  useEffect(() => {
    if (!ENABLED) {
      setEstimate(null);
      return;
    }
    let cancelled = false;
    fetchProvenanceEstimate(profile.treatment, profile.country)
      .then((e) => {
        if (!cancelled) setEstimate(e);
      })
      .catch(() => {
        if (!cancelled) setEstimate(null);
      });
    return () => {
      cancelled = true;
    };
  }, [profile.treatment, profile.country]);

  return estimate;
}
