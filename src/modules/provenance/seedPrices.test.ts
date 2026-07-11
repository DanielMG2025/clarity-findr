import { describe, it, expect } from "vitest";
import {
  SEED_PRICES,
  SEED_PRICE_SOURCES,
  toPriceObservations,
  seedRange,
  seedEstimate,
} from "./seedPrices";
import { aggregatePrices } from "./aggregate";
import { TREATMENT_KEYS } from "./taxonomy";

describe("seed price data", () => {
  it("covers 3 treatments x 6 markets in EUR", () => {
    expect(SEED_PRICES).toHaveLength(18);
    expect(SEED_PRICES.every((r) => r.currency === "EUR")).toBe(true);
    expect(SEED_PRICES.every((r) => r.min <= r.mid && r.mid <= r.max)).toBe(true);
  });

  it("references only sources that exist (referential integrity)", () => {
    const known = new Set(SEED_PRICE_SOURCES.map((s) => s.id));
    for (const r of SEED_PRICES) {
      expect(r.source_ids.length).toBeGreaterThan(0);
      for (const id of r.source_ids) expect(known.has(id)).toBe(true);
    }
  });
});

describe("toPriceObservations", () => {
  it("emits 3 canonical observations per row with required fields", () => {
    const obs = toPriceObservations();
    expect(obs).toHaveLength(18 * 3);
    for (const o of obs) {
      expect(TREATMENT_KEYS).toContain(o.treatment);
      expect(o.currency_original).toBe("EUR");
      expect(o.inclusions).toBe("unknown");
      expect(o.source_kind).toBe("public_report");
      expect(o.amount_eur).toBeGreaterThan(0);
    }
  });

  it("DOCUMENTS the dedup collapse: same-source min/mid/max fold to one point", () => {
    // All three carry the same source_id/treatment/market, so aggregatePrices
    // dedupes them — which is exactly why seedEstimate() exists.
    const esIvf = toPriceObservations(SEED_PRICES.filter((r) => r.treatment === "ivf" && r.market === "ES"));
    const est = aggregatePrices(esIvf, { now: "2026-06-01T00:00:00.000Z" });
    expect(est.sample_size).toBe(1);
  });
});

describe("seedEstimate", () => {
  it("builds a proper range straight from the seed row, with citations", () => {
    const est = seedEstimate("ivf", "ES")!;
    expect(est.empty).toBe(false);
    expect(est.range_min).toBe(4000);
    expect(est.range_max).toBe(6000);
    expect(est.expected).toBe(4900);
    expect(est.confidence).toBe("medium");
    expect(est.sample_size).toBe(3); // three cited guides
    expect(est.citations).toHaveLength(3);
    expect(est.citations[0].label.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown treatment/market", () => {
    expect(seedEstimate("ivf", "ZZ")).toBeNull();
  });
});
