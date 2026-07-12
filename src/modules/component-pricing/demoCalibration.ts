// Price calibration — DEMO MODE
// ---------------------------------------------------------------------------
// ⚠️ READ THIS BEFORE TOUCHING ANYTHING ⚠️
//
// These bands are CALIBRATED against reference prices from the premium segment
// of the Spanish market (Barcelona area), but they are:
//   · ANONYMIZED — no figure is attributed to any specific clinic
//   · AGGREGATED — they're market bands, not tariffs
//   · LABELLED   — always shown as "market estimate · demo mode"
//
// They are NOT tariffs provided by clinics. They must NOT be presented as such,
// nor by naming clinics, nor in public materials. Their only purpose is to let
// the demonstrator show realistic ranges instead of invented figures.
//
// When real B2B tariffs (with a signed agreement) or patient quotes arrive, this
// layer is automatically displaced by the provenance engine: its tier is DEMO,
// the lowest of all.

import type { Confidence } from "@/modules/provenance/types";

export const DEMO_CALIBRATION = {
  tier: "T0_demo" as const,
  label: "Market estimate (demo)",
  blurb:
    "Orientative range calibrated against reference prices from the Spanish market. It's a demonstration estimate: these are not tariffs provided by clinics, and only the clinic can give you the real price.",
  confidence: "low" as Confidence,
  as_of: "2026-05",
  market: "ES",
  /** Must be shown alongside any figure from this layer. */
  required_disclaimer:
    "Market estimate for demonstration purposes · not official tariffs from any clinic",
};

/**
 * Bands by PACKAGE as marketed by the premium Spanish market.
 * Note: unlike the earlier seed (which excluded medication), these packages
 * usually INCLUDE medication and the donor's compensation, plus blastocyst
 * culture. That's an important difference when comparing.
 */
export type DemoPackage =
  | "ivf_own"
  | "ivf_donor_sperm"
  | "egg_donation"
  | "ropa"
  | "insemination"
  | "vitrification"
  | "guarantee_1_blast"
  | "guarantee_2_blasts";

export interface DemoBand {
  key: DemoPackage;
  label: string;
  min: number;
  mid: number;
  max: number;
  includes: string;
  note?: string;
}

export const DEMO_BANDS_ES: DemoBand[] = [
  {
    key: "ivf_own",
    label: "IVF with own eggs",
    min: 4960, mid: 5300, max: 5900,
    includes: "Full cycle. In the premium segment it usually includes medication and blastocyst culture.",
  },
  {
    key: "ivf_donor_sperm",
    label: "IVF with donor sperm",
    min: 5500, mid: 6300, max: 7100,
    includes: "Cycle with donor sperm, including blastocyst culture.",
  },
  {
    key: "egg_donation",
    label: "Egg donation",
    min: 7190, mid: 7400, max: 7700,
    includes: "Donor eggs, the donor's regulated compensation, culture and transfer.",
    note: "Guarantee programmes raise the price substantially (see the guarantee bands).",
  },
  {
    key: "ropa",
    label: "ROPA method (shared motherhood)",
    min: 4040, mid: 5800, max: 6820,
    includes: "One provides the egg, the other carries. Wide spread across centres.",
    note: "Only legal in some countries — always check the regulatory framework first.",
  },
  {
    key: "insemination",
    label: "Artificial insemination",
    min: 840, mid: 1200, max: 1770,
    includes: "Insemination procedure. Medication may be separate.",
  },
  {
    key: "vitrification",
    label: "Vitrification / freezing",
    min: 2690, mid: 2800, max: 2990,
    includes: "Freezing cycle. Annual storage is separate (recurring cost).",
  },
  {
    key: "guarantee_1_blast",
    label: "Guarantee programme (1 blastocyst)",
    min: 5490, mid: 6300, max: 7100,
    includes: "Programme guaranteeing at least 1 blastocyst.",
  },
  {
    key: "guarantee_2_blasts",
    label: "Guarantee programme (2 blastocysts)",
    min: 7120, mid: 8500, max: 9590,
    includes: "Programme guaranteeing at least 2 blastocysts.",
    note: "Reduces uncertainty in exchange for a larger upfront outlay.",
  },
];

/** Per-market price-level index, anchored at Spain = 1.00 (see componentPrices). */
export const MARKET_INDEX: Record<string, number> = {
  ES: 1.0, CZ: 0.65, GR: 0.75, PT: 0.88, DK: 0.98, CY: 0.65,
};

export interface DemoEstimate {
  package: DemoPackage;
  label: string;
  market: string;
  min: number;
  mid: number;
  max: number;
  includes: string;
  note?: string;
  tier: typeof DEMO_CALIBRATION.tier;
  confidence: Confidence;
  explanation: string;
  disclaimer: string;
}

/** Demo estimate for a package and market, with its explainability built in. */
export function demoEstimate(pkg: DemoPackage, market = "ES"): DemoEstimate | null {
  const band = DEMO_BANDS_ES.find((b) => b.key === pkg);
  if (!band) return null;
  const idx = MARKET_INDEX[market] ?? 1.0;
  const r = (n: number) => Math.round((n * idx) / 10) * 10;

  const geo =
    market === "ES"
      ? "for Spain"
      : `for ${market}, adjusted by its price level relative to Spain`;

  return {
    package: pkg,
    label: band.label,
    market,
    min: r(band.min),
    mid: r(band.mid),
    max: r(band.max),
    includes: band.includes,
    note: band.note,
    tier: DEMO_CALIBRATION.tier,
    confidence: "low",
    explanation: `${DEMO_CALIBRATION.blurb} Range ${geo}.`,
    disclaimer: DEMO_CALIBRATION.required_disclaimer,
  };
}
