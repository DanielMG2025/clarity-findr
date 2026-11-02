import { describe, it, expect } from "vitest";
import {
  aggregatedToPriceRecord,
  scrapedToPriceRecord,
  userQuoteToPriceRecord,
  canonicalProcedureId,
  type AggregatedPricingRow,
  type ScrapedPricingRow,
  type UserSubmittedQuoteRow,
} from "./pricing";

const agg: AggregatedPricingRow = {
  id: "a1", clinic_name: "Clinic A", treatment_type: "ivf", avg_price: 5000,
  min_price: 4000, max_price: 6500, sample_size: 20, updated_at: "2026-10-01T00:00:00Z",
  price_volatility: 0.1,
};

const scraped: ScrapedPricingRow = {
  id: "s1", clinic_name: "Clinic B", treatment_type: "egg_donation", scraped_price: 7000,
  currency: "EUR", source_url: "https://example.org/precios", source_domain: "example.org",
  parse_confidence: 0.9, scraped_at: "2026-09-15T10:00:00Z", notes: "from price page",
  raw_text: null, raw_price: null, pricing_type: "base", detected_keywords: [],
  base_price: 6000, medication_estimate: 800, extras_estimate: 200,
  normalization_rule: null, country: "Spain",
};

const quote: UserSubmittedQuoteRow = {
  id: "q1", clinic_name: "Clinic C", country: "Portugal", treatment_type: "ivf",
  base_price: 4500, medication_cost: 1200, extras_cost: 300, total_price: 6000,
  date_received: "2026-08-20", notes: "quote by email", created_at: "2026-08-21T00:00:00Z",
  user_id: null, is_verified: true,
};

describe("canonicalProcedureId", () => {
  it("is identity for now", () => {
    expect(canonicalProcedureId("ivf")).toBe("ivf");
  });
});

describe("aggregatedToPriceRecord", () => {
  it("maps fields to canonical shape", () => {
    const r = aggregatedToPriceRecord(agg);
    expect(r).toMatchObject({
      id: "a1", procedure_id: "ivf", jurisdiction: null, centre_id: null,
      centre_name: "Clinic A", amount_min: 4000, amount_max: 6500, currency: "EUR",
      alcance_declarado: "no_especificado", iva_declarado: false, iva_rate: null,
      unit_model: "per_cycle", source_name: "aggregated", source_url: null,
      captured_at: "2026-10-01T00:00:00Z", note: "n=20", components: [],
    });
  });
  it("sample_size 20 → medium, 3 → low", () => {
    expect(aggregatedToPriceRecord(agg).confidence).toBe("medium");
    expect(aggregatedToPriceRecord({ ...agg, sample_size: 3 }).confidence).toBe("low");
  });
  it("null sample_size → low confidence and null note", () => {
    const r = aggregatedToPriceRecord({ ...agg, sample_size: null });
    expect(r.confidence).toBe("low");
    expect(r.note).toBeNull();
  });
});

describe("scrapedToPriceRecord", () => {
  it("maps fields to canonical shape", () => {
    const r = scrapedToPriceRecord(scraped);
    expect(r).toMatchObject({
      id: "s1", procedure_id: "egg_donation", jurisdiction: "Spain", centre_name: "Clinic B",
      amount_min: 6000, amount_max: 7000, currency: "EUR", alcance_declarado: "no_especificado",
      iva_declarado: false, unit_model: "per_cycle", source_name: "example.org",
      source_url: "https://example.org/precios", captured_at: "2026-09-15T10:00:00Z",
      note: "from price page",
    });
  });
  it("parse_confidence 0.9 → high, 0.6 → medium, 0.3 → low", () => {
    expect(scrapedToPriceRecord({ ...scraped, parse_confidence: 0.9 }).confidence).toBe("high");
    expect(scrapedToPriceRecord({ ...scraped, parse_confidence: 0.6 }).confidence).toBe("medium");
    expect(scrapedToPriceRecord({ ...scraped, parse_confidence: 0.3 }).confidence).toBe("low");
  });
  it("builds components with correct is_included", () => {
    expect(scrapedToPriceRecord(scraped).components).toEqual([
      { component_name: "base", amount: 6000, is_included: true },
      { component_name: "medication", amount: 800, is_included: false },
      { component_name: "extras", amount: 200, is_included: false },
    ]);
  });
  it("omits null components and falls back for missing values", () => {
    const r = scrapedToPriceRecord({
      ...scraped, base_price: null, medication_estimate: null, extras_estimate: null,
      source_domain: null, country: null, currency: null,
    });
    expect(r.components).toEqual([]);
    expect(r.amount_min).toBe(7000);
    expect(r.source_name).toBe("scraped");
    expect(r.jurisdiction).toBeNull();
    expect(r.currency).toBe("EUR");
  });
});

describe("userQuoteToPriceRecord", () => {
  it("maps fields to canonical shape", () => {
    const r = userQuoteToPriceRecord(quote);
    expect(r).toMatchObject({
      id: "q1", procedure_id: "ivf", jurisdiction: "Portugal", centre_name: "Clinic C",
      amount_min: 6000, amount_max: 6000, currency: "EUR", alcance_declarado: "no_especificado",
      iva_declarado: false, unit_model: "per_cycle", source_name: "patient-submitted",
      source_url: null, captured_at: "2026-08-20", note: "quote by email",
    });
  });
  it("is_verified true → high, false → low", () => {
    expect(userQuoteToPriceRecord(quote).confidence).toBe("high");
    expect(userQuoteToPriceRecord({ ...quote, is_verified: false }).confidence).toBe("low");
  });
  it("builds components and omits null ones", () => {
    expect(userQuoteToPriceRecord(quote).components).toEqual([
      { component_name: "base", amount: 4500, is_included: true },
      { component_name: "medication", amount: 1200, is_included: false },
      { component_name: "extras", amount: 300, is_included: false },
    ]);
    expect(
      userQuoteToPriceRecord({ ...quote, medication_cost: null, extras_cost: null }).components,
    ).toEqual([{ component_name: "base", amount: 4500, is_included: true }]);
  });
});
