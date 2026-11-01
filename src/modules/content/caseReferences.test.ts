import { describe, expect, it } from "vitest";
import { caseReferences, TREATMENT_TO_FINDINGS } from "./caseReferences";
import { FINDINGS } from "./science";
import { REGULATION } from "./regulation";

describe("caseReferences", () => {
  it("maps ES + ivf", () => {
    const r = caseReferences({ country: "ES", treatment_interest: "ivf" });
    expect(r.regCountryEn).toBe("Spain");
    expect(r.findingIds).toEqual(["edad", "acumulada", "addons", "pgta", "eset"]);
  });

  it("maps CY + egg_donation to the EU south row", () => {
    const r = caseReferences({ country: "CY", treatment_interest: "egg_donation" });
    expect(r.regCountryEn).toBe("Cyprus (South · EU)");
    expect(r.findingIds).toEqual(["donante", "addons", "eset"]);
  });

  it("unlisted country + preserve goal", () => {
    const r = caseReferences({ country: "CH", goal: "preserve" });
    expect(r.regCountryEn).toBeNull();
    expect(r.findingIds).toEqual(["congelacion", "edad", "amh"]);
  });

  it("empty args do not throw", () => {
    expect(caseReferences({})).toEqual({ regCountryEn: null, findingIds: ["edad", "addons"] });
  });

  it("has no dangling finding ids or countries", () => {
    const ids = new Set(FINDINGS.map((f) => f.id));
    for (const t of [...Object.keys(TREATMENT_TO_FINDINGS), undefined]) {
      for (const goal of ["preserve", "treatment", undefined]) {
        for (const id of caseReferences({ treatment_interest: t, goal }).findingIds) expect(ids.has(id)).toBe(true);
      }
    }
    const countries = new Set(REGULATION.map((r) => r.country_en));
    for (const c of ["ES", "PT", "UK", "FR", "IT", "DE", "CZ", "GR", "CY", "PL", "TR"]) {
      expect(countries.has(caseReferences({ country: c }).regCountryEn!)).toBe(true);
    }
  });
});
