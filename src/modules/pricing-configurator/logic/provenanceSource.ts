// Client data-access for the provenance estimate.
//
// Per the spec, raw price_observations are NEVER shipped to the browser (the
// table is RLS-locked to the service role). The client only asks the server-side
// `price-estimate` edge function for an already-aggregated PriceEstimate.
// Any failure (function not deployed, network, empty data) resolves to null so
// the configurator falls back to its formula.

import { supabase } from "@/integrations/supabase/client";
import type { PriceEstimate, TreatmentKey } from "@/modules/provenance";

export async function fetchProvenanceEstimate(
  treatment: TreatmentKey,
  market: string,
): Promise<PriceEstimate | null> {
  try {
    const { data, error } = await supabase.functions.invoke("price-estimate", {
      body: { treatment, market },
    });
    if (error || !data) return null;
    const estimate = data as PriceEstimate;
    return estimate.empty ? null : estimate;
  } catch {
    return null;
  }
}
