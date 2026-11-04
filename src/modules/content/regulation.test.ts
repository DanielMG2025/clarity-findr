import { describe, expect, it } from "vitest";
import { CONFIDENCE_LABEL, EU_SOHO, REGION_LABEL, REGULATION } from "./regulation";

describe("regulation dataset", () => {
  it("keeps exactly the 12 European rows in order", () => {
    expect(REGULATION.filter((r) => r.region === "europe").map((r) => r.country_en)).toEqual([
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
  it("every row has a friendly summary in both languages", () => {
    for (const r of REGULATION) {
      expect(r.summary_es.trim().length).toBeGreaterThan(0);
      expect(r.summary_en.trim().length).toBeGreaterThan(0);
    }
  });

  it("adds the 8 Latin America rows and the US context row", () => {
    expect(REGULATION.filter((r) => r.region === "latam").map((r) => r.country_en)).toEqual([
      "Argentina", "Uruguay", "Mexico", "Brazil", "Chile", "Colombia", "Peru", "Costa Rica",
    ]);
    expect(REGULATION.filter((r) => r.region === "other").map((r) => r.country_en)).toEqual(["United States (context)"]);
    expect(REGULATION).toHaveLength(21);
    expect(new Set(REGULATION.map((r) => r.country_en)).size).toBe(21);
  });

  it("every row has a region with a label in both languages", () => {
    for (const r of REGULATION) {
      expect(REGION_LABEL[r.region].es.length).toBeGreaterThan(0);
      expect(REGION_LABEL[r.region].en.length).toBeGreaterThan(0);
      expect(CONFIDENCE_LABEL[r.confidence]).toBeDefined();
    }
  });

  it("uses the exact given sources and confidence for the new rows", () => {
    const by = (c: string) => REGULATION.find((r) => r.country_en === c)!;
    expect(by("Argentina").source_url).toBe("https://www.argentina.gob.ar/normativa/nacional/217628/texto");
    expect(by("Argentina").confidence).toBe("alta");
    expect(by("Uruguay").source_url).toBe("https://oig.cepal.org/sites/default/files/2013_ley19.167_ury.pdf");
    expect(by("Mexico").confidence).toBe("media");
    expect(by("Brazil").legal_basis).toBe("Resolución CFM 2.320/2022");
    expect(by("Chile").source_url).toBe("https://www.chileatiende.gob.cl/fichas/23778");
    expect(by("Colombia").confidence).toBe("baja");
    expect(by("Peru").confidence).toBe("baja");
    expect(by("Costa Rica").source_url).toBe("https://www.corteidh.or.cr/tablas/fichas/artaviamurillo.pdf");
    expect(by("Costa Rica").confidence).toBe("baja");
    expect(by("United States (context)").source_url).toBe("https://www.cdc.gov/art/");
  });

  it("flags unconfirmed points as 'to be verified' in the summary, in both languages", () => {
    for (const r of REGULATION.filter((x) => x.region !== "europe")) {
      const cells = [r.access_es, r.egg_es, r.sperm_es, r.surrogacy_es, r.anonymity_es, r.confidence_note_es ?? ""].join(" ").toLowerCase();
      if (r.confidence === "baja" || cells.includes("por verificar")) {
        expect(r.summary_es).toContain("(por verificar)");
        expect(r.summary_en).toContain("(to be verified)");
      }
    }
  });

  it("new rows are dated Nov 2026", () => {
    for (const r of REGULATION.filter((x) => x.region !== "europe")) {
      expect(r.updated_es).toBe("nov 2026");
      expect(r.updated_en).toBe("Nov 2026");
    }
  });
});
