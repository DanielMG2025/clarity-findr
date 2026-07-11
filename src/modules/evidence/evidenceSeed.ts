// Seed scientific evidence — verified snapshot (curated, NOT scraped)
// ---------------------------------------------------------------------------
// Real, referenced figures to replace the placeholders in scientificBase.ts,
// so the "Orientación de éxito" shows something true and traceable in the demo.
//
// IMPORTANT LABELLING: these are CLINICAL PREGNANCY RATES PER EMBRYO TRANSFER
// (orientative), not live-birth rates, and not per started cycle. The metric
// name says so explicitly. A clinical reviewer should confirm each figure
// against the cited table before any public launch. Everything here stays
// ORIENTATIVE — never a diagnosis or a personalised prognosis.

import type { Source, EvidenceObservation } from "@/modules/provenance/types";

export const EVIDENCE_AS_OF = "2025-2026";

export const EVIDENCE_SEED_SOURCES: Source[] = [
  {
    id: "sef_2025",
    kind: "scientific",
    label: "Spanish Fertility Society (SEF) — rates per transfer",
    url: "https://www.sefertilidad.net/",
    market: "ES",
    as_of: "2025",
    weight: 0.9,
    usage_note: "Clinical pregnancy rate per transfer. Cite as orientative.",
  },
  {
    id: "eshre_eim_2023",
    kind: "scientific",
    label: "ESHRE / EIM — ART in Europe (registry), 2023 data",
    url: "https://www.eshre.eu/",
    market: "EU",
    as_of: "2023",
    weight: 0.95,
    usage_note: "Aggregate PR per transfer, Europe. Don't reproduce text; cite the table.",
  },
];

// Real figures (clinical pregnancy per transfer), banded to the segments used
// by scientificBase.ts. Values expressed as fractions (0.34 = 34%).
export const EVIDENCE_SEED: EvidenceObservation[] = [
  // Own eggs, under 40 → SEF ~34–35% per transfer
  {
    id: "cpr_own_under35",
    metric: "clinical_pregnancy_per_transfer_own_eggs",
    segment: { age_band: "<35" },
    value_min: 0.34,
    value_max: 0.4,
    unit: "rate",
    source_id: "sef_2025",
    observed_at: "2025",
  },
  {
    id: "cpr_own_35_37",
    metric: "clinical_pregnancy_per_transfer_own_eggs",
    segment: { age_band: "35-37" },
    value_min: 0.3,
    value_max: 0.35,
    unit: "rate",
    source_id: "sef_2025",
    observed_at: "2025",
  },
  {
    id: "cpr_own_38_40",
    metric: "clinical_pregnancy_per_transfer_own_eggs",
    segment: { age_band: "38-40" },
    value_min: 0.25,
    value_max: 0.32,
    unit: "rate",
    source_id: "sef_2025",
    observed_at: "2025",
  },
  // Own eggs, over 40 → SEF ~24% per transfer
  {
    id: "cpr_own_41_42",
    metric: "clinical_pregnancy_per_transfer_own_eggs",
    segment: { age_band: "41-42" },
    value_min: 0.18,
    value_max: 0.24,
    unit: "rate",
    source_id: "sef_2025",
    observed_at: "2025",
  },
  {
    id: "cpr_own_over42",
    metric: "clinical_pregnancy_per_transfer_own_eggs",
    segment: { age_band: ">42" },
    value_min: 0.08,
    value_max: 0.15,
    unit: "rate",
    source_id: "sef_2025",
    observed_at: "2025",
  },
  // Donor eggs (any age) → SEF ~57% per transfer; ESHRE ~42% per thaw
  {
    id: "cpr_donor_any",
    metric: "clinical_pregnancy_per_transfer_donor_eggs",
    segment: { age_band: "any" },
    value_min: 0.42,
    value_max: 0.57,
    unit: "rate",
    source_id: "sef_2025",
    observed_at: "2025",
  },
  // Context: European average per transfer (FET/fresh) → ESHRE mid-30%
  {
    id: "cpr_eu_context",
    metric: "clinical_pregnancy_per_transfer_europe_context",
    segment: { age_band: "any" },
    value_min: 0.33,
    value_max: 0.36,
    unit: "rate",
    source_id: "eshre_eim_2023",
    observed_at: "2023",
  },
];

// Cumulative context (orientative, not per-transfer): under 35 cumulative live
// birth can approach ~70% after several cycles. Kept separate to avoid mixing
// per-transfer with cumulative figures.
export const EVIDENCE_CUMULATIVE_NOTE =
  "Context: the cumulative live-birth rate under 35 can approach ~70% after several cycles (European literature). It's cumulative, not per transfer.";
