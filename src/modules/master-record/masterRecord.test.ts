import { describe, it, expect } from "vitest";
import { emptyRecord } from "./types";
import {
  DEMO_PATIENTS,
  buildDemoRecord,
  completeness,
  type DemoPatientSeed,
} from "./demoPatients";

describe("emptyRecord", () => {
  it("has every sub-object present so callers can spread-patch", () => {
    const r = emptyRecord();
    expect(r.status).toBe("anonymous");
    expect(r.identity).toEqual({});
    expect(r.intent).toEqual({});
    expect(r.clinical).toEqual({});
    expect(r.history).toEqual([]);
    expect(r.derived).toEqual({});
  });
});

describe("DEMO_PATIENTS", () => {
  it("provides 13 patients with unique keys", () => {
    expect(DEMO_PATIENTS).toHaveLength(13);
    expect(new Set(DEMO_PATIENTS.map((p) => p.key)).size).toBe(13);
  });

  it("covers the required data levels", () => {
    const levels = new Set(DEMO_PATIENTS.map((p) => p.data_level));
    expect(levels).toContain("high");
    expect(levels).toContain("medium");
    expect(levels).toContain("low");
  });
});

describe("buildDemoRecord", () => {
  it("maps a seed into a Master Patient Record", () => {
    const ana = DEMO_PATIENTS.find((p) => p.key === "ana_31_favorable")!;
    const r = buildDemoRecord(ana);
    expect(r.identity.age).toBe(31);
    expect(r.identity.country_of_residence).toBe("ES");
    expect(r.intent.treatment_interest).toBe("ivf");
    expect(r.clinical.amh).toBe(2.8);
    expect(r.derived.completion_score).toBeGreaterThan(0);
  });

  it("expands prior cycle counts into history items", () => {
    const nadia = DEMO_PATIENTS.find((p) => p.key === "nadia_40_tubarico")!; // prior_ivf: 2
    const r = buildDemoRecord(nadia);
    expect(r.history.filter((h) => h.treatment === "ivf")).toHaveLength(2);
    expect(r.history.every((h) => h.outcome === "none")).toBe(true);
  });

  it("leaves history empty when there are no prior cycles", () => {
    const sofia = DEMO_PATIENTS.find((p) => p.key === "sofia_34_pocos_datos")!;
    expect(buildDemoRecord(sofia).history).toHaveLength(0);
  });
});

describe("completeness", () => {
  it("scores richer profiles higher than sparse ones", () => {
    const high = DEMO_PATIENTS.find((p) => p.data_level === "high")!;
    const low = DEMO_PATIENTS.find((p) => p.data_level === "low")!;
    expect(completeness(high)).toBeGreaterThan(completeness(low));
  });

  it("returns 0..100", () => {
    for (const p of DEMO_PATIENTS) {
      const c = completeness(p);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(100);
    }
  });

  it("counts an all-empty seed as low completeness", () => {
    const bare = { key: "x", label: "x", data_level: "low", name: "x", age: 30, country: "ES" } as DemoPatientSeed;
    // only age filled → 1/9
    expect(completeness(bare)).toBeLessThan(20);
  });
});
