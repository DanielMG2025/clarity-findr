import { describe, it, expect } from "vitest";
import { DEMO_PATIENTS } from "./demoPatients";
import { findSimilarCases } from "./similarCases";

describe("findSimilarCases", () => {
  it("preserve route returns only egg-freezing cases, at most 3", () => {
    const r = findSimilarCases(DEMO_PATIENTS, { goal: "preserve", ageBand: "32_35" });
    expect(r.length).toBe(3);
    expect(r.every((c) => c.goal === "preserve")).toBe(true);
  });
  it("nearest age comes first", () => {
    expect(findSimilarCases(DEMO_PATIENTS, { goal: "preserve", ageBand: "36_39" })[0].key).toBe("beatriz_38_preserve_low");
    expect(findSimilarCases(DEMO_PATIENTS, { goal: "treatment", ageBand: "40_plus" })[0].age).toBe(42);
  });
  it("family structure wins over age when given", () => {
    const r = findSimilarCases(DEMO_PATIENTS, { goal: "treatment", ageBand: "under_32", family: "female_couple" });
    expect(r[0].family_structure).toBe("female_couple");
  });
  it("there are at least 2 preservation cases and every case has a route", () => {
    expect(DEMO_PATIENTS.filter((c) => c.goal === "preserve").length).toBeGreaterThanOrEqual(2);
    expect(DEMO_PATIENTS.every((c) => c.goal)).toBe(true);
  });
});
