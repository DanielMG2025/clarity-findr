// Aggregation — turn a bag of PriceObservations into one explainable PriceEstimate.
//
// Weighting = source trust × parse quality × time-decay × inclusions certainty.
// Old, low-confidence, unknown-inclusion or dubious-source prices pull the range
// less. Outliers are quarantined out of the range. The output carries citations
// so explainPrice() can tell the patient where the number comes from.

import {
  SOURCE_WEIGHT,
  type Citation,
  type EstimateConfidence,
  type Inclusions,
  type PriceEstimate,
  type PriceObservation,
  type SourceKind,
  type TreatmentKey,
} from "./types";

export interface AggregateOptions {
  /** ISO "now" for deterministic time-decay (defaults to current time). */
  now?: string;
  /** Half-life of an observation's weight, in days. Default 365. */
  halfLifeDays?: number;
  /** Dedup window: same source+treatment+market within this many days collapses. Default 90. */
  dedupWindowDays?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.abs(a - b) / DAY_MS;
}

/** Exponential decay in (0,1]: 1 at capture, 0.5 after one half-life. */
export function timeDecay(observedAt: string, now: string, halfLifeDays: number): number {
  const age = daysBetween(observedAt, now);
  return Math.pow(0.5, age / halfLifeDays);
}

/** Unknown inclusions are honest but worth less — they aren't comparable. */
export function inclusionsFactor(inclusions: Inclusions): number {
  return inclusions === "unknown" ? 0.7 : 1;
}

/** Composite weight of a single observation. */
export function observationWeight(
  obs: PriceObservation,
  now: string,
  halfLifeDays: number,
): number {
  const kindWeight = SOURCE_WEIGHT[obs.source_kind] ?? 0.3;
  const parse = Math.max(0, Math.min(1, obs.parse_confidence));
  return kindWeight * parse * timeDecay(obs.observed_at, now, halfLifeDays) * inclusionsFactor(obs.inclusions);
}

/**
 * Collapse near-duplicate observations: within each source+treatment+market
 * group, any observation that falls within `windowDays` of a more recent kept
 * one is dropped. Uses a rolling window (not epoch-aligned buckets) so two dates
 * inside the window always collapse regardless of where boundaries fall.
 */
export function dedupeObservations(
  observations: PriceObservation[],
  windowDays: number,
): PriceObservation[] {
  const groups = new Map<string, PriceObservation[]>();
  for (const o of observations) {
    const key = `${o.source_id}|${o.treatment}|${o.market}`;
    const list = groups.get(key);
    if (list) list.push(o);
    else groups.set(key, [o]);
  }

  const windowMs = windowDays * DAY_MS;
  const out: PriceObservation[] = [];
  for (const list of groups.values()) {
    const sorted = [...list].sort(
      (a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime(),
    );
    const kept: PriceObservation[] = [];
    for (const o of sorted) {
      const t = new Date(o.observed_at).getTime();
      const isDup = kept.some((k) => Math.abs(new Date(k.observed_at).getTime() - t) <= windowMs);
      if (!isDup) kept.push(o);
    }
    out.push(...kept);
  }
  return out;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Split observations into inliers and quarantined outliers. With fewer than 4
 * points there isn't enough signal to call outliers, so all are kept.
 */
export function splitOutliers(observations: PriceObservation[]): {
  inliers: PriceObservation[];
  outliers: PriceObservation[];
} {
  if (observations.length < 4) return { inliers: observations, outliers: [] };
  const m = median(observations.map((o) => o.amount_eur));
  if (m <= 0) return { inliers: observations, outliers: [] };
  const low = m * 0.35;
  const high = m * 2.75;
  const inliers: PriceObservation[] = [];
  const outliers: PriceObservation[] = [];
  for (const o of observations) {
    (o.amount_eur >= low && o.amount_eur <= high ? inliers : outliers).push(o);
  }
  return { inliers, outliers };
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}

function decideConfidence(inliers: PriceObservation[]): EstimateConfidence {
  const kinds = new Set<SourceKind>(inliers.map((o) => o.source_kind));
  const crowd = inliers.filter((o) => o.source_kind === "crowd").length;
  const n = inliers.length;
  if (kinds.has("b2b") || crowd >= 5 || (kinds.has("public_report") && n >= 4)) return "high";
  if (n >= 3 && (kinds.has("crowd") || kinds.has("public_report"))) return "medium";
  if (n >= 5) return "medium";
  return "low";
}

function emptyEstimate(treatment: TreatmentKey, market: string): PriceEstimate {
  return {
    treatment,
    market,
    range_min: 0,
    range_max: 0,
    expected: 0,
    confidence: "low",
    sample_size: 0,
    citations: [],
    empty: true,
  };
}

/**
 * Aggregate observations (assumed already scoped to one treatment+market) into
 * an explainable estimate. Returns an `empty` estimate when nothing is usable.
 */
export function aggregatePrices(
  observations: PriceObservation[],
  opts: AggregateOptions = {},
): PriceEstimate {
  const now = opts.now ?? new Date().toISOString();
  const halfLifeDays = opts.halfLifeDays ?? 365;
  const dedupWindowDays = opts.dedupWindowDays ?? 90;

  const treatment = observations[0]?.treatment ?? "ivf";
  const market = observations[0]?.market ?? "Unknown";

  const usable = observations.filter((o) => o.amount_eur > 0);
  if (usable.length === 0) return emptyEstimate(treatment, market);

  const deduped = dedupeObservations(usable, dedupWindowDays);
  const { inliers } = splitOutliers(deduped);
  if (inliers.length === 0) return emptyEstimate(treatment, market);

  const weighted = inliers
    .map((o) => ({ o, w: observationWeight(o, now, halfLifeDays) }))
    .filter((x) => x.w > 0);
  if (weighted.length === 0) return emptyEstimate(treatment, market);

  const totalW = weighted.reduce((acc, x) => acc + x.w, 0);
  const expected = weighted.reduce((acc, x) => acc + x.o.amount_eur * x.w, 0) / totalW;

  const amounts = weighted.map((x) => x.o.amount_eur);
  const range_min = Math.min(...amounts);
  const range_max = Math.max(...amounts);

  const citations: Citation[] = weighted
    .slice()
    .sort((a, b) => b.w - a.w)
    .slice(0, 6)
    .map(({ o, w }) => ({
      source_id: o.source_id,
      source_kind: o.source_kind,
      observed_at: o.observed_at,
      amount_eur: o.amount_eur,
      weight: Math.round((w / totalW) * 1000) / 1000,
    }));

  return {
    treatment,
    market,
    range_min: round10(range_min),
    range_max: round10(range_max),
    expected: round10(expected),
    confidence: decideConfidence(weighted.map((x) => x.o)),
    sample_size: weighted.length,
    citations,
    empty: false,
  };
}

const TREATMENT_LABEL: Record<TreatmentKey, string> = {
  ivf: "IVF",
  icsi: "ICSI",
  donor: "egg donation",
  freezing: "egg or embryo freezing",
  iui: "IUI",
  study: "fertility work-up",
};

const KIND_PHRASE: Record<SourceKind, string> = {
  scraped_web: "prices published on clinic websites",
  aggregator: "public price comparators",
  public_report: "public market reports",
  crowd: "prices shared by patients",
  b2b: "clinic rate cards",
  scientific: "reviewed scientific sources",
};

/**
 * The patient-facing sentence. Built from the estimate's own citations, so it
 * enriches itself automatically as better sources arrive.
 */
export function explainPrice(estimate: PriceEstimate): string {
  const treatment = TREATMENT_LABEL[estimate.treatment];
  if (estimate.empty) {
    return `We don't have enough public price data yet to estimate ${treatment} in ${estimate.market}.`;
  }
  // Distinct source kinds, ordered by total weight, described in plain language.
  const weightByKind = new Map<SourceKind, number>();
  for (const c of estimate.citations) {
    weightByKind.set(c.source_kind, (weightByKind.get(c.source_kind) ?? 0) + c.weight);
  }
  const phrases = [...weightByKind.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([kind]) => KIND_PHRASE[kind]);

  let basis: string;
  if (phrases.length === 1) basis = phrases[0];
  else if (phrases.length === 2) basis = `${phrases[0]} and ${phrases[1]}`;
  else basis = `${phrases.slice(0, -1).join(", ")} and ${phrases[phrases.length - 1]}`;

  const n = estimate.sample_size;
  const obs = `${n} observation${n === 1 ? "" : "s"}`;
  return `Estimated range for ${treatment} in ${estimate.market}, based on ${basis} (${obs}). This is orientation, not a quote — it doesn't replace a medical consultation.`;
}
