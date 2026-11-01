import { describe, expect, it } from "vitest";
import { EU_SOHO, REGULATION } from "./regulation";

describe("regulation dataset", () => {
  it("contains exactly the 12 verified rows in order", () => {
    expect(REGULATION.map((r) => r.country_en)).toEqual([
      "Spain", "Portugal", "United Kingdom", "France", "Italy", "Germany",
      "Czech Republic", "Greece", "Cyprus (South · EU)", "Cyprus (North · TRNC)", "Poland", "Turkey",
    ]);
  });

  it("every row cites an https source and a date in both languages", () => {
    for (const r of REGULATION) {
      expect(r.source_url.startsWith("https://")).toBe(true);
      expect(r.updated_es.length).toBeGreaterThan(0);
      expect(r.updated_en.length).toBeGreaterThan(0);
    }
  });

  it("keeps the given confidence levels", () => {
    expect(REGULATION.find((r) => r.country_en === "Cyprus (South · EU)")?.confidence).toBe("media-baja");
    expect(REGULATION.find((r) => r.country_en === "Spain")?.confidence).toBe("alta");
    expect(REGULATION.find((r) => r.country_en === "Portugal")?.confidence).toBe("media");
  });

  it("every row has a valid source tier and https url", () => {
    for (const r of REGULATION) {
      expect(["primaria", "oficial", "secundaria"]).toContain(r.source_tier);
      expect(r.source_url.startsWith("https://")).toBe(true);
    }
  });

  it("cites the SoHO regulation on EUR-Lex", () => {
    expect(EU_SOHO.source_url).toBe("https://eur-lex.europa.eu/eli/reg/2024/1938/oj");
  });
});
