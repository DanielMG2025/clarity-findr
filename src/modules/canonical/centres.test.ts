import { describe, it, expect } from "vitest";
import { clinicToCentre, type ClinicRow } from "./centres";

const clinic: ClinicRow = {
  id: "c1", name: "Clinic 1", country: "Spain", city: "Valencia",
  treatments_available: ["ivf", "egg_donation"],
  base_price_ivf: 5000, base_price_egg_donation: 7000, base_price_freezing: 3000,
  medication_estimate: 1200, extras_estimate: 400, total_estimated_price: 6600,
  success_rate_estimate: 0.45, rating_score: 4.6,
  created_at: "2026-01-01T00:00:00Z", tier: "premium",
};

describe("clinicToCentre", () => {
  it("maps a clinic row to the canonical Centre", () => {
    expect(clinicToCentre(clinic)).toEqual({
      id: "c1", name: "Clinic 1", city: "Valencia", jurisdiction: "Spain",
      registration_number: null, authorised_units: ["ivf", "egg_donation"],
      verification: "unverified", verified_at: null, source_url: null, note: "tier=premium",
    });
  });

  it("handles null treatments, tier, city and country", () => {
    const c = clinicToCentre({ ...clinic, treatments_available: null, tier: null, city: null, country: null });
    expect(c.authorised_units).toEqual([]);
    expect(c.note).toBeNull();
    expect(c.city).toBeNull();
    expect(c.jurisdiction).toBeNull();
  });

  it("carries no price fields and no rating/score fields", () => {
    const keys = Object.keys(clinicToCentre(clinic));
    for (const k of keys) expect(k).not.toMatch(/price|estimate|rating|score|success/);
  });
});
