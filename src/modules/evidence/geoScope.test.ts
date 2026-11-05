import { describe, expect, it } from "vitest";
import { CITATIONS, SOURCES } from "./citations";
import { CITATION_SOURCE_SCOPE, citationScope, prioritizeByCountry, scopeFromMarket, scopeLabel } from "./geoScope";

describe("evidence geographic scope", () => {
  it("every citation source has an explicit scope", () => {
    for (const id of Object.keys(SOURCES)) expect(CITATION_SOURCE_SCOPE[id]).toBeDefined();
    for (const c of CITATIONS) expect(CITATION_SOURCE_SCOPE[c.source_id]).toBeDefined();
  });

  it("HFEA figures are UK-specific, ESHRE EIM is European", () => {
    expect(citationScope("hfea_2023")).toEqual({ kind: "country", code: "UK" });
    expect(citationScope("eshre_eim_2019")).toEqual({ kind: "regional", region: "EU" });
    expect(scopeLabel(citationScope("hfea_2023"), "es")).toBe("Específico de Reino Unido");
  });

  it("puts the case's own country first, then multi-country, then others", () => {
    const items = [{ m: "US" }, { m: "EU" }, { m: "ES" }, { m: "UK" }];
    const out = prioritizeByCountry(items, (x) => scopeFromMarket(x.m), "ES").map((x) => x.m);
    expect(out).toEqual(["ES", "EU", "US", "UK"]);
  });

  it("keeps the original order when no country is known", () => {
    const items = [{ m: "US" }, { m: "ES" }];
    expect(prioritizeByCountry(items, (x) => scopeFromMarket(x.m), undefined)).toEqual(items);
  });
});
