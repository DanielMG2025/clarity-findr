// Blend a server-provided provenance PriceEstimate into the formula-built bundle.
//
// Cold-start philosophy: the hardcoded formula is the fallback. When (and only
// when) real observations produce a non-empty estimate, we let it drive the
// bundle's confidence and surface its explanation + citations. With no data the
// bundle is returned untouched (formula stands) — so the patient never sees a
// worse experience than before, only a better-sourced one as data arrives.

import { explainPrice, type PriceEstimate } from "@/modules/provenance";
import type { ScenarioBundle } from "./types";

export function blendProvenance(
  bundle: ScenarioBundle,
  estimate: PriceEstimate | null | undefined,
): ScenarioBundle {
  if (!estimate || estimate.empty) {
    return { ...bundle, estimate: null, citations: [] };
  }
  return {
    ...bundle,
    // A real, sourced estimate is more honest than the formula proxy.
    confidence: estimate.confidence,
    estimate,
    citations: estimate.citations,
    // Lead the notes with the patient-facing provenance sentence.
    notes: [explainPrice(estimate), ...bundle.notes],
  };
}
