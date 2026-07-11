import { describe, it, expect } from "vitest";
import {
  ageBand,
  reserveBand,
  buildEvidence,
  EVIDENCE_OBSERVATIONS,
} from "./evidenceBase";

describe("segmentation", () => {
  it("buckets age into bands (and defaults when unknown)", () => {
    expect(ageBand(undefined)).toBe("35-37");
    expect(ageBand(30)).toBe("<35");
    expect(ageBand(36)).toBe("35-37");
    expect(ageBand(39)).toBe("38-40");
    expect(ageBand(42)).toBe("41-42");
    expect(ageBand(45)).toBe(">42");
  });

  it("derives a reserve band from AMH/AFC", () => {
    expect(reserveBand(undefined, undefined)).toBe("unknown");
    expect(reserveBand(0.8)).toBe("low");
    expect(reserveBand(undefined, 5)).toBe("low");
    expect(reserveBand(4.0)).toBe("high");
    expect(reserveBand(2.0, 12)).toBe("normal");
  });
});

describe("buildEvidence", () => {
  it("matches observations to the patient's age band (plus 'any')", () => {
    const r = buildEvidence({ age: 36 });
    expect(r.segment.age).toBe("35-37");
    const metrics = r.statements.map((s) => s.segment.age_band);
    expect(metrics).toContain("35-37");
    expect(metrics).toContain("any"); // donor row applies to any age
    expect(metrics).not.toContain("38-40");
  });

  it("keeps every statement cited with a locator", () => {
    const r = buildEvidence({ age: 36 });
    for (const s of r.statements) {
      expect(s.citation.label.length).toBeGreaterThan(0);
      expect(s.citation.locator.length).toBeGreaterThan(0);
      expect(s.disclaimer).toMatch(/not a diagnosis/i);
    }
  });

  it("GUARDRAIL: placeholder figures are all flagged provisional (no invented numbers shipped)", () => {
    // Every seeded observation is a 0.0 placeholder until a reviewer fills it.
    expect(EVIDENCE_OBSERVATIONS.every((o) => o.value_max === 0)).toBe(true);
    const r = buildEvidence({ age: 39 });
    expect(r.statements.length).toBeGreaterThan(0);
    expect(r.statements.every((s) => s.provisional)).toBe(true);
  });

  it("surfaces donor + further-testing routes for an older, unassessed patient", () => {
    const r = buildEvidence({ age: 43 }); // >42, reserve unknown
    const routes = r.routes.map((x) => x.route);
    expect(routes).toContain("ivf_donor");
    expect(routes).toContain("further_testing");
    expect(routes).not.toContain("ivf_own");
  });

  it("surfaces own-egg IVF for a younger patient with normal reserve", () => {
    const r = buildEvidence({ age: 30, amh: 2.0 });
    const routes = r.routes.map((x) => x.route);
    expect(routes).toContain("ivf_own");
    expect(routes).not.toContain("ivf_donor");
    expect(routes).not.toContain("further_testing");
  });

  it("writes an orientative intro naming the segment", () => {
    const r = buildEvidence({ age: 30, amh: 2.0 });
    expect(r.report_intro).toMatch(/orientativo/i);
    expect(r.report_intro).toContain("<35");
    expect(r.report_intro).toContain("normal");
  });
});
