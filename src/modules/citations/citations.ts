// Rich citations — attribution is not evidence
// ---------------------------------------------------------------------------
// The old model was { label, url } pointing at an institution's homepage. That is
// NAME-DROPPING: we hand the patient a respectable logo and the homework.
//
// A citation must carry the substance:
//   · the figure itself, with its unit
//   · WHO it applies to (cohort, n)
//   · HOW it was measured  ← the single most misunderstood thing in fertility
//   · WHERE exactly it comes from (report, year, figure/table)
//   · WHAT IT DOES NOT SAY  ← the honest caveat
//   · and only then, a deep link
//
// The caveat is the most valuable field in this file. Telling a patient
// "this is per embryo transferred, not per cycle started — the per-cycle number
// is lower" is exactly what no clinic and no comparator will ever tell them.
// 49% of patients don't trust clinic-published success rates. This is why.
//
// ⚠️ PENDING CLINICAL REVIEW. Figures are transcribed from public primary
// sources (see `locator`), but a clinical reviewer must sign off before launch.

export type SourceKind = "registry" | "guideline" | "survey" | "policy_dataset";

/** How a rate was measured. In fertility this changes the number enormously. */
export type Denominator =
  | "per_embryo_transferred"
  | "per_cycle_started"
  | "per_egg_collection"
  | "cumulative_after_3_cycles";

export const DENOMINATOR_EXPLAINER: Record<Denominator, string> = {
  per_embryo_transferred:
    "Measured per embryo transferred. This is the most flattering way to count: it excludes cycles that never reached transfer (no eggs collected, failed fertilisation, no viable embryo). Your chance per cycle started is lower.",
  per_cycle_started:
    "Measured per cycle started — the most honest measure, because it includes cycles that never reached an embryo transfer.",
  per_egg_collection:
    "Measured per egg collection. Includes cycles where no embryo was suitable for transfer, so it sits below the per-transfer figure.",
  cumulative_after_3_cycles:
    "Cumulative across three complete cycles, not a single attempt. Not comparable to a per-cycle figure.",
};

export interface Source {
  id: string;
  kind: SourceKind;
  /** Full, precise name — not just the institution. */
  title: string;
  publisher: string;
  year: string;
  /** Deep link to the report itself, not the homepage. */
  url?: string;
  /** What the dataset actually covers. */
  scope: string;
}

export interface Citation {
  id: string;
  source_id: string;
  /** The claim, in plain language. */
  claim: string;
  /** The figure. Use value_max for a band. */
  value: number;
  value_max?: number;
  unit: "percent";
  denominator: Denominator;
  /** Who this applies to. */
  cohort: string;
  /** Where exactly inside the source. */
  locator: string;
  /** What this figure does NOT tell you. The honest part. */
  caveat: string;
  /** true → needs clinical sign-off before it can be shown as final. */
  pending_review: boolean;
}

// ---------------------------------------------------------------------------
// Sources — precise, with scope
// ---------------------------------------------------------------------------
export const SOURCES: Record<string, Source> = {
  hfea_2023: {
    id: "hfea_2023",
    kind: "registry",
    title: "Fertility treatment 2023: trends and figures",
    publisher: "HFEA — Human Fertilisation and Embryology Authority (UK)",
    year: "2023 data, published 2025",
    url: "https://www.hfea.gov.uk/about-us/publications/research-and-data/fertility-treatment-2023-trends-and-figures/",
    scope:
      "Statutory registry covering every licensed fertility clinic in the UK. The most complete public dataset in Europe for age-banded outcomes.",
  },
  hfea_2022: {
    id: "hfea_2022",
    kind: "registry",
    title: "Fertility treatment 2022: preliminary trends and figures",
    publisher: "HFEA (UK)",
    year: "2022 data",
    url: "https://www.hfea.gov.uk/about-us/publications/research-and-data/fertility-treatment-2022-preliminary-trends-and-figures/",
    scope: "UK statutory registry. Used where the 2023 report does not break out a band.",
  },
  eshre_eim_2019: {
    id: "eshre_eim_2019",
    kind: "registry",
    title: "ART in Europe, 2019: results generated from European registries by ESHRE",
    publisher: "ESHRE / European IVF-Monitoring Consortium · Human Reproduction 38(12)",
    year: "2019 data, published 2023",
    url: "https://doi.org/10.1093/humrep/dead197",
    scope:
      "1,077,813 treatment cycles reported by 1,488 clinics across 40 European countries. The largest ART dataset in Europe.",
  },
  atlas_2024: {
    id: "atlas_2024",
    kind: "policy_dataset",
    title: "European Atlas of Fertility Treatment Policies 2024",
    publisher: "Fertility Europe & European Parliamentary Forum (EPF)",
    year: "Data extracted June 2024",
    url: "https://fertilityeurope.eu/atlas2024/",
    scope:
      "Country-by-country legal framework: who can access which treatment, donor anonymity, PGT, public funding. Built on the ESHRE EIM survey.",
  },
};

// ---------------------------------------------------------------------------
// Citations — real figures, transcribed from the primary sources above
// ---------------------------------------------------------------------------
const HFEA_TRANSFER_CAVEAT =
  "This is a UK population average per embryo transferred — not your personal probability, and not your chance per cycle started. HFEA itself notes that birth rates from 2019–2023 are likely underestimated while clinic data is still being validated.";

export const CITATIONS: Citation[] = [
  // --- Own eggs, fresh transfer, by age band (HFEA)
  {
    id: "pr_own_18_34",
    source_id: "hfea_2023",
    claim: "Pregnancy rate with own eggs, ages 18–34",
    value: 41,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh embryo transfer, patient's own eggs, UK, 2023",
    locator: "Figure 3 — IVF pregnancy rate using fresh embryo transfers, by patient age",
    caveat: HFEA_TRANSFER_CAVEAT,
    pending_review: true,
  },
  {
    id: "pr_own_35_37",
    source_id: "hfea_2023",
    claim: "Pregnancy rate with own eggs, ages 35–37",
    value: 34,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh embryo transfer, patient's own eggs, UK, 2023",
    locator: "Figure 3 — rose from 24% (2013) to 34% (2023)",
    caveat: HFEA_TRANSFER_CAVEAT,
    pending_review: true,
  },
  {
    id: "pr_own_38_39",
    source_id: "hfea_2023",
    claim: "Pregnancy rate with own eggs, ages 38–39",
    value: 25,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh embryo transfer, patient's own eggs, UK, 2023",
    locator: "Figure 3 — rose from 18% (2013) to 25% (2023)",
    caveat: HFEA_TRANSFER_CAVEAT,
    pending_review: true,
  },
  {
    id: "pr_own_40_42",
    source_id: "hfea_2022",
    claim: "Pregnancy rate with own eggs, ages 40–42",
    value: 16,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh embryo transfer, patient's own eggs, UK, 2022",
    locator: "Figure 1 — rose from 10% (2012) to 16% (2022)",
    caveat:
      HFEA_TRANSFER_CAVEAT + " This band is taken from the 2022 report, which breaks it out explicitly.",
    pending_review: true,
  },
  {
    id: "pr_own_43_44",
    source_id: "hfea_2023",
    claim: "Pregnancy rate with own eggs, ages 43–44",
    value: 9,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh embryo transfer, patient's own eggs, UK, 2023",
    locator: "Figure 3 — rose from 6% (2013) to 9% (2023)",
    caveat:
      HFEA_TRANSFER_CAVEAT +
      " At this age most clinics discuss donor eggs, which are not subject to the same age-related decline.",
    pending_review: true,
  },

  // --- Birth rate (the number patients actually care about)
  {
    id: "br_own_18_34",
    source_id: "hfea_2023",
    claim: "Live birth rate with own eggs, ages 18–34",
    value: 35,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh embryo transfer, patient's own eggs, UK, 2023",
    locator: "Figure 4 — IVF birth rate using fresh embryo transfers",
    caveat:
      "Birth rate is what matters, but HFEA advises using pregnancy rates as the better recent indicator: birth rates from 2019–2023 are currently underestimated while data validation with clinics continues.",
    pending_review: true,
  },
  {
    id: "br_own_avg",
    source_id: "hfea_2023",
    claim: "Live birth rate with own eggs, all ages",
    value: 25,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh embryo transfer, patient's own eggs, UK, 2023",
    locator: "Figure 4 — rose from 19% (2013) to 25% (2023)",
    caveat: HFEA_TRANSFER_CAVEAT,
    pending_review: true,
  },

  // --- Donor eggs (ESHRE — the European figure)
  {
    id: "pr_donor",
    source_id: "eshre_eim_2019",
    claim: "Pregnancy rate with donor eggs",
    value: 50.5,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh embryo transfer with donated oocytes, 40 European countries, 2019",
    locator: "Results — 'the PR per fresh ET was 50.5% (49.6% in 2018)'",
    caveat:
      "Donor-egg outcomes are largely independent of the recipient's age — ESHRE found recipient age had little influence. That is why this figure is so much higher, not because the clinic is better.",
    pending_review: true,
  },

  // --- Frozen transfer
  {
    id: "pr_fet",
    source_id: "hfea_2023",
    claim: "Pregnancy rate with a frozen embryo transfer",
    value: 39,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Frozen embryo transfer, UK, 2023",
    locator: "Trends and figures 2023 — frozen embryo transfers",
    caveat:
      "Frozen transfers look better than fresh partly because they select for patients who already produced embryos worth freezing. It is not a like-for-like comparison.",
    pending_review: true,
  },

  // --- Blastocyst vs cleavage (ESHRE)
  {
    id: "pr_blastocyst",
    source_id: "eshre_eim_2019",
    claim: "Pregnancy rate transferring a blastocyst (day 5–6) vs a day-3 embryo",
    value: 39.4,
    unit: "percent",
    denominator: "per_embryo_transferred",
    cohort: "Fresh IVF + ICSI cycles, Europe, 2019 (vs 26.5% for cleavage-stage)",
    locator: "Results — 'PRs for blastocyst transfers to be higher (39.4%) than for cleavage-stage embryos (26.5%)'",
    caveat:
      "Blastocyst transfer yields a higher rate per transfer, but fewer embryos survive to that stage — so you may end up with fewer transfers overall. The per-transfer number flatters it.",
    pending_review: true,
  },

  // --- Cumulative (the honest framing)
  {
    id: "cumulative_3_cycles",
    source_id: "eshre_eim_2019",
    claim: "Chance of a live birth across three complete cycles",
    value: 42,
    unit: "percent",
    denominator: "cumulative_after_3_cycles",
    cohort: "UK population-based study, 178,898 women, all ages",
    locator: "Cumulative delivery rate discussion",
    caveat:
      "This is the number that best reflects a real fertility journey: most patients need more than one cycle. Do not compare it against a single-cycle figure.",
    pending_review: true,
  },
];

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------
export function citation(id: string): (Citation & { source: Source }) | undefined {
  const c = CITATIONS.find((x) => x.id === id);
  if (!c) return undefined;
  const source = SOURCES[c.source_id];
  return source ? { ...c, source } : undefined;
}

/** Pick the age-banded own-egg pregnancy citation for a given age. */
export function ownEggCitationForAge(age: number): string {
  if (age < 35) return "pr_own_18_34";
  if (age <= 37) return "pr_own_35_37";
  if (age <= 39) return "pr_own_38_39";
  if (age <= 42) return "pr_own_40_42";
  return "pr_own_43_44";
}

/** Format the figure for display. */
export function formatValue(c: Citation): string {
  return c.value_max != null ? `${c.value}–${c.value_max}%` : `${c.value}%`;
}
