import {
  CITATIONS,
  SOURCES,
  DENOMINATOR_EXPLAINER,
  citation,
  ownEggCitationForAge,
  formatValue,
  type Citation,
  type Denominator,
} from "./citations";

describe("citations — data integrity", () => {
  it("has unique citation ids", () => {
    const ids = CITATIONS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every citation resolves to a known source", () => {
    for (const c of CITATIONS) {
      expect(SOURCES[c.source_id], `missing source for ${c.id}`).toBeDefined();
    }
  });

  it("every source's id matches its map key", () => {
    for (const [key, s] of Object.entries(SOURCES)) {
      expect(s.id).toBe(key);
    }
  });

  it("every denominator in use has an explainer", () => {
    for (const c of CITATIONS) {
      expect(DENOMINATOR_EXPLAINER[c.denominator], `no explainer for ${c.denominator}`).toBeTruthy();
    }
  });

  it("percent figures sit in a plausible 0–100 range", () => {
    for (const c of CITATIONS) {
      expect(c.value).toBeGreaterThanOrEqual(0);
      expect(c.value).toBeLessThanOrEqual(100);
      if (c.value_max != null) expect(c.value_max).toBeGreaterThanOrEqual(c.value);
    }
  });

  it("every figure carries a caveat (the honest field)", () => {
    for (const c of CITATIONS) {
      expect(c.caveat.length, `empty caveat on ${c.id}`).toBeGreaterThan(0);
    }
  });

  it("all figures are still pending clinical review", () => {
    // Guard: no figure should silently flip to final without a reviewer editing this.
    expect(CITATIONS.every((c) => c.pending_review)).toBe(true);
  });
});

describe("citation() lookup", () => {
  it("merges the resolved source", () => {
    const c = citation("pr_donor");
    expect(c).toBeDefined();
    expect(c!.source.id).toBe("eshre_eim_2019");
    expect(c!.source.publisher).toContain("ESHRE");
  });

  it("returns undefined for an unknown id", () => {
    expect(citation("does_not_exist")).toBeUndefined();
  });
});

describe("ownEggCitationForAge", () => {
  const cases: Array<[number, string]> = [
    [30, "pr_own_18_34"],
    [34, "pr_own_18_34"],
    [35, "pr_own_35_37"],
    [37, "pr_own_35_37"],
    [38, "pr_own_38_39"],
    [39, "pr_own_38_39"],
    [40, "pr_own_40_42"],
    [42, "pr_own_40_42"],
    [43, "pr_own_43_44"],
    [46, "pr_own_43_44"],
  ];

  it.each(cases)("age %i → %s", (age, expected) => {
    expect(ownEggCitationForAge(age)).toBe(expected);
  });

  it("always maps to an existing citation", () => {
    for (const [age] of cases) {
      expect(citation(ownEggCitationForAge(age))).toBeDefined();
    }
  });
});

describe("formatValue", () => {
  const single = { value: 41, unit: "percent" } as Citation;
  const band = { value: 24, value_max: 34, unit: "percent" } as Citation;

  it("formats a single value", () => {
    expect(formatValue(single)).toBe("41%");
  });

  it("formats a band", () => {
    expect(formatValue(band)).toBe("24–34%");
  });
});

describe("DENOMINATOR_EXPLAINER", () => {
  it("covers every denominator variant", () => {
    const keys: Denominator[] = [
      "per_embryo_transferred",
      "per_cycle_started",
      "per_egg_collection",
      "cumulative_after_3_cycles",
    ];
    for (const k of keys) expect(DENOMINATOR_EXPLAINER[k]).toBeTruthy();
  });
});
