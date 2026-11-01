import { describe, expect, it } from "vitest";
import { ADDONS, AGE_BANDS, FINDINGS } from "./science";
import { getArticle } from "@/modules/education/contentLibrary";

describe("science dataset", () => {
  it("has the 10 findings in order", () => {
    expect(FINDINGS.map((f) => f.id)).toEqual([
      "edad", "donante", "acumulada", "amh", "addons", "pgta", "icsi", "eset", "congelacion", "estilo",
    ]);
  });

  it("has exactly one add-ons finding, id 'addons'", () => {
    const a = FINDINGS.filter((f) => f.is_addons === true);
    expect(a).toHaveLength(1);
    expect(a[0].id).toBe("addons");
  });

  it("every finding cites an https source with a year", () => {
    for (const f of FINDINGS) {
      expect(f.source_url.startsWith("https://")).toBe(true);
      expect(f.source_year.length).toBeGreaterThan(0);
    }
  });

  it("keeps the 17 HFEA add-on ratings", () => {
    expect(ADDONS).toHaveLength(17);
    for (const a of ADDONS) expect(["green", "yellow", "grey", "black", "red"]).toContain(a.rating);
    expect(ADDONS.find((a) => a.name_en.includes("PGT-A"))?.rating).toBe("red");
    expect(ADDONS.find((a) => a.name_en.includes("Time-lapse"))?.rating).toBe("black");
  });

  it("keeps the 5 HFEA age bands", () => {
    expect(AGE_BANDS).toHaveLength(5);
    expect(AGE_BANDS[0]).toEqual({ band: "18–34", rate: "35%" });
    expect(AGE_BANDS).toContainEqual({ band: "38–39", rate: "18%" });
  });

  it("links the expected findings to their guide", () => {
    const slugs = Object.fromEntries(FINDINGS.map((f) => [f.id, f.library_slug]));
    expect(slugs).toEqual({
      edad: undefined, donante: "what-is-egg-donation", acumulada: undefined, amh: "what-is-amh",
      addons: undefined, pgta: "what-is-pgt-a", icsi: "what-is-icsi", eset: undefined,
      congelacion: "egg-freezing-step-by-step", estilo: undefined,
    });
  });

  it("every library_slug resolves to a real article", () => {
    for (const f of FINDINGS) if (f.library_slug) expect(getArticle(f.library_slug)).toBeDefined();
  });
});
