import { describe, it, expect } from "vitest";
import {
  aggregatePrices,
  explainPrice,
  normalizeTreatment,
  normalizeMarket,
  convertToEur,
  fromScrapedRow,
  observationWeight,
  splitOutliers,
  dedupeObservations,
  type PriceObservation,
  type SourceKind,
} from "./index";
import { inertFetcher, runSourcePipeline, SourceNotAllowlistedError } from "./pipeline";
import type { Source } from "./types";
import type { ScrapedPricingRow } from "@/lib/engines/types";

const NOW = "2026-07-01T00:00:00.000Z";

function obs(partial: Partial<PriceObservation> = {}): PriceObservation {
  return {
    treatment: "ivf",
    market: "Spain",
    amount_eur: 5000,
    currency_original: "EUR",
    source_id: partial.source_id ?? "src-1",
    source_kind: (partial.source_kind ?? "scraped_web") as SourceKind,
    parse_confidence: 0.8,
    inclusions: "unknown",
    observed_at: NOW,
    ...partial,
  };
}

describe("taxonomy", () => {
  it("maps multilingual treatment synonyms to canonical keys", () => {
    expect(normalizeTreatment("FIV")).toBe("ivf");
    expect(normalizeTreatment("In Vitro Fertilization")).toBe("ivf");
    expect(normalizeTreatment("Ovodonación")).toBe("donor");
    expect(normalizeTreatment("vitrificación")).toBe("freezing");
    expect(normalizeTreatment("ICSI")).toBe("icsi");
    expect(normalizeTreatment("inseminación artificial")).toBe("iui");
    expect(normalizeTreatment("totally unknown thing")).toBeNull();
  });

  it("canonicalizes markets", () => {
    expect(normalizeMarket("españa")).toBe("Spain");
    expect(normalizeMarket("Republica Checa")).toBe("Czech Republic");
    expect(normalizeMarket("")).toBe("Unknown");
  });
});

describe("currency", () => {
  it("converts with a dated table and flags unknown currencies", () => {
    const eur = convertToEur(1000, "EUR");
    expect(eur.amount_eur).toBe(1000);
    expect(eur.fallback).toBe(false);

    const czk = convertToEur(100000, "CZK");
    expect(czk.amount_eur).toBeCloseTo(4000, 0);

    const weird = convertToEur(1000, "XYZ");
    expect(weird.fallback).toBe(true);
    expect(weird.amount_eur).toBe(1000);
  });
});

describe("fromScrapedRow", () => {
  const row: ScrapedPricingRow = {
    clinic_name: "IVI Madrid",
    treatment_type: "FIV",
    scraped_price: 6000,
    currency: "EUR",
    source_url: "https://example.test/precios",
    source_domain: "example.test",
    parse_confidence: 0.9,
    scraped_at: NOW,
  };

  it("adapts a scraped row into a canonical observation", () => {
    const o = fromScrapedRow(row, { source_id: "src-x", market: "Spain" });
    expect(o).not.toBeNull();
    expect(o!.treatment).toBe("ivf");
    expect(o!.market).toBe("Spain");
    expect(o!.amount_eur).toBe(6000);
    expect(o!.source_kind).toBe("scraped_web");
  });

  it("returns null for an unmappable treatment", () => {
    expect(fromScrapedRow({ ...row, treatment_type: "??" }, { source_id: "s" })).toBeNull();
  });

  it("dampens confidence when the currency is unknown", () => {
    const o = fromScrapedRow({ ...row, currency: "XYZ" }, { source_id: "s" });
    expect(o!.parse_confidence).toBeLessThan(0.9);
  });
});

describe("aggregatePrices", () => {
  it("returns an empty estimate with no observations", () => {
    const est = aggregatePrices([]);
    expect(est.empty).toBe(true);
    expect(est.confidence).toBe("low");
    expect(est.citations).toHaveLength(0);
  });

  it("produces a range, expected value and citations", () => {
    const est = aggregatePrices(
      [
        obs({ source_id: "a", amount_eur: 4000 }),
        obs({ source_id: "b", amount_eur: 5000 }),
        obs({ source_id: "c", amount_eur: 6000 }),
      ],
      { now: NOW },
    );
    expect(est.empty).toBe(false);
    expect(est.range_min).toBe(4000);
    expect(est.range_max).toBe(6000);
    expect(est.expected).toBeGreaterThanOrEqual(4000);
    expect(est.expected).toBeLessThanOrEqual(6000);
    expect(est.citations.length).toBe(3);
  });

  it("keeps scraped-only cold-start at low confidence", () => {
    const est = aggregatePrices([obs({ source_id: "a" }), obs({ source_id: "b" })], { now: NOW });
    expect(est.confidence).toBe("low");
  });

  it("lifts confidence when B2B rate cards are present", () => {
    const est = aggregatePrices(
      [obs({ source_id: "a" }), obs({ source_id: "b", source_kind: "b2b" })],
      { now: NOW },
    );
    expect(est.confidence).toBe("high");
  });

  it("quarantines outliers out of the range", () => {
    const est = aggregatePrices(
      [
        obs({ source_id: "a", amount_eur: 4800 }),
        obs({ source_id: "b", amount_eur: 5000 }),
        obs({ source_id: "c", amount_eur: 5200 }),
        obs({ source_id: "d", amount_eur: 90000 }), // absurd → quarantined
      ],
      { now: NOW },
    );
    expect(est.range_max).toBeLessThan(90000);
    expect(est.sample_size).toBe(3);
  });

  it("weights recent observations above stale ones", () => {
    const recent = observationWeight(obs({ observed_at: NOW }), NOW, 365);
    const old = observationWeight(
      obs({ observed_at: "2024-07-01T00:00:00.000Z" }),
      NOW,
      365,
    );
    expect(recent).toBeGreaterThan(old);
  });

  it("dedupes same source+treatment+market within a window, keeping the latest", () => {
    const deduped = dedupeObservations(
      [
        obs({ source_id: "a", amount_eur: 4000, observed_at: "2026-06-01T00:00:00.000Z" }),
        obs({ source_id: "a", amount_eur: 4200, observed_at: "2026-06-20T00:00:00.000Z" }),
      ],
      90,
    );
    expect(deduped).toHaveLength(1);
    expect(deduped[0].amount_eur).toBe(4200);
  });
});

describe("explainPrice", () => {
  it("describes an empty estimate honestly", () => {
    expect(explainPrice(aggregatePrices([]))).toMatch(/don't have enough public price data/i);
  });

  it("names the source basis and keeps the medical disclaimer", () => {
    const est = aggregatePrices([obs({ source_id: "a" }), obs({ source_id: "b" })], { now: NOW });
    const text = explainPrice(est);
    expect(text).toMatch(/clinic websites/i);
    expect(text).toMatch(/orientation, not a quote/i);
    expect(text).toMatch(/doesn't replace a medical consultation/i);
  });
});

describe("pipeline guardrails", () => {
  const source: Source = {
    id: "src-1",
    kind: "scraped_web",
    label: "Example clinic",
    allowlisted: false,
    weight: 0.3,
  };

  it("refuses to run against a non-allowlisted source", async () => {
    await expect(
      runSourcePipeline(source, ["/precios"], {
        fetcher: inertFetcher,
        parser: { parse: () => [] },
        normalizer: { normalize: () => null },
        validator: { validate: () => ({ ok: true }) },
        store: { save: async () => 0 },
      }),
    ).rejects.toBeInstanceOf(SourceNotAllowlistedError);
  });

  it("has an inert fetcher that never touches the network", async () => {
    await expect(inertFetcher.fetch(source, "/precios")).rejects.toThrow(/no fetcher is implemented/i);
  });
});
