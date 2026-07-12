import { describe, it, expect } from "vitest";
import { DEMO_PATIENTS } from "./demoPatients";
import { runDemo, MEDICAL_DISCLAIMER } from "./runDemo";
import { getArticle } from "@/modules/education";

const byKey = (k: string) => DEMO_PATIENTS.find((p) => p.key === k)!;

describe("runDemo", () => {
  it("produces every step for a favorable patient", () => {
    const r = runDemo(byKey("ana_31_favorable"));
    expect(r.step1_profile.completeness).toBeGreaterThan(0);
    expect(r.step2_orientation.factors.some((f) => f.kind === "favorable")).toBe(true);
    expect(r.step2_orientation.disclaimer).toBe(MEDICAL_DISCLAIMER);
    expect(r.step4_costs.length).toBeGreaterThan(0);
    expect(r.step4_costs[0].estimate.total_max).toBeGreaterThan(0);
    expect(r.step6_next.at(-1)).toMatch(/talk to a professional/i);
    expect(r.improvement_path.length).toBeGreaterThan(0);
  });

  it("only highlights learn slugs that actually exist", () => {
    for (const p of DEMO_PATIENTS) {
      for (const slug of runDemo(p).step3_learn) {
        expect(getArticle(slug), `missing article: ${slug}`).toBeDefined();
      }
    }
  });

  it("surfaces egg donation for an older, low-reserve, donor-leaning patient", () => {
    const r = runDemo(byKey("rosa_45_donante"));
    expect(r.step4_costs.map((c) => c.estimate.plan)).toContain("egg_donation");
  });

  it("flags missing data and stays low-confidence for a sparse profile", () => {
    const r = runDemo(byKey("sofia_34_pocos_datos"));
    expect(r.step2_orientation.factors.some((f) => f.kind === "missing")).toBe(true);
    expect(r.step2_orientation.confidence).toBe("low");
  });

  it("runs the legal gate as step 0", () => {
    const r = runDemo(byKey("rosa_45_donante")); // female_couple, egg donation, ES
    expect(r.step0_regulatory).not.toBeNull();
    // Spain allows egg donation for female couples → no travel needed
    expect(r.step0_regulatory!.needs_to_travel).toBe(false);
    expect(r.step0_regulatory!.results.some((x) => x.need === "egg_donation")).toBe(true);
  });

  it("derives a donor-sperm need for single women / female couples", () => {
    const r = runDemo(byKey("julia_27_minima")); // single_woman, ivf intent
    expect(r.step0_regulatory!.results.map((x) => x.need)).toContain("sperm_donation");
  });

  it("never invents a personalised success percentage (orientation only)", () => {
    const r = runDemo(byKey("marta_38_reserva_baja"));
    for (const f of r.step2_orientation.factors) {
      expect(f.why).not.toMatch(/\d+\s*%/); // no "34%" style claims in factor copy
    }
  });
});
