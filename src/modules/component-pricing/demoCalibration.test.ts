import { describe, it, expect } from "vitest";
import { DEMO_BANDS_ES, DEMO_CALIBRATION, demoEstimate } from "./demoCalibration";

describe("demo calibration bands", () => {
  it("has 8 packages with unique keys and sane ranges", () => {
    expect(DEMO_BANDS_ES).toHaveLength(8);
    const keys = DEMO_BANDS_ES.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(DEMO_BANDS_ES.every((b) => b.min <= b.mid && b.mid <= b.max)).toBe(true);
  });
});

describe("demoEstimate", () => {
  it("returns the Spanish band with its explainability for ES", () => {
    const e = demoEstimate("ivf_own", "ES")!;
    expect(e.min).toBe(4960);
    expect(e.tier).toBe("T0_demo");
    expect(e.confidence).toBe("low");
    expect(e.explanation).toMatch(/for Spain/);
  });

  it("scales by the market index for other markets", () => {
    const es = demoEstimate("ivf_own", "ES")!;
    const cz = demoEstimate("ivf_own", "CZ")!;
    expect(cz.max).toBeLessThan(es.max); // CZ index 0.65
    expect(cz.explanation).toMatch(/for CZ/);
  });

  it("returns null for an unknown package", () => {
    // @ts-expect-error intentional bad key
    expect(demoEstimate("nope", "ES")).toBeNull();
  });

  it("GUARDRAIL: every demo estimate carries the required demo disclaimer + T0 tier", () => {
    for (const b of DEMO_BANDS_ES) {
      const e = demoEstimate(b.key, "ES")!;
      expect(e.disclaimer).toBe(DEMO_CALIBRATION.required_disclaimer);
      expect(e.tier).toBe("T0_demo");
    }
    expect(DEMO_CALIBRATION.required_disclaimer.length).toBeGreaterThan(0);
  });
});
