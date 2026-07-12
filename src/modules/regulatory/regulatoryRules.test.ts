import { describe, it, expect } from "vitest";
import {
  byCode,
  regulatoryOrientation,
  COUNTRIES,
  REG_DISCLAIMER,
} from "./regulatoryRules";

describe("data integrity", () => {
  it("has unique country codes and an as_of on each", () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(COUNTRIES.every((c) => !!c.as_of)).toBe(true);
    expect(byCode("ES")?.label).toBe("Spain");
    expect(byCode("XX")).toBeUndefined();
  });
});

describe("regulatoryOrientation", () => {
  it("returns null for an unknown home country", () => {
    expect(regulatoryOrientation("XX", "hetero_couple", ["ivf_own_eggs"])).toBeNull();
  });

  it("blocks single women in Italy and points to the friendliest alternatives first", () => {
    const r = regulatoryOrientation("IT", "single_woman", ["ivf_own_eggs"])!;
    expect(r.results[0].verdict).toBe("not_allowed");
    expect(r.needs_to_travel).toBe(true);
    // sorted by atlas_score desc → Belgium (89.5) leads
    expect(r.results[0].alternatives[0].code).toBe("BE");
    expect(r.headline).toMatch(/out of your reach/i);
    expect(r.disclaimer).toBe(REG_DISCLAIMER);
  });

  it("clears a female couple in Spain with no need to travel", () => {
    const r = regulatoryOrientation("ES", "female_couple", ["egg_donation", "ivf_own_eggs"])!;
    expect(r.needs_to_travel).toBe(false);
    expect(r.results.every((x) => x.verdict === "allowed")).toBe(true);
    expect(r.viable_countries).toContain("ES");
  });

  it("flags Germany's egg-donation ban and offers alternatives", () => {
    const r = regulatoryOrientation("DE", "hetero_couple", ["egg_donation"])!;
    expect(r.results[0].verdict).toBe("not_allowed");
    expect(r.results[0].alternatives.map((a) => a.code)).toContain("ES");
  });

  it("restricts viable countries for a male couple needing egg donation", () => {
    const r = regulatoryOrientation("UK", "male_couple", ["egg_donation"])!;
    // only UK / BE / NL allow male_couple egg donation
    expect(r.viable_countries.sort()).toEqual(["BE", "NL", "UK"]);
    expect(r.viable_countries).not.toContain("ES");
  });

  it("carries funding and anonymity notes", () => {
    const r = regulatoryOrientation("ES", "hetero_couple", ["ivf_own_eggs"])!;
    expect(r.funding_note).toMatch(/public funding/i);
    expect(r.anonymity_note.length).toBeGreaterThan(0);
  });
});
