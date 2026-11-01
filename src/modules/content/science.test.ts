import { describe, expect, it } from "vitest";
import { ADDONS, FINDINGS } from "./science";

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
});
