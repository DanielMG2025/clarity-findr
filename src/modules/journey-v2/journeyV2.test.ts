import { describe, expect, it, beforeEach } from "vitest";
import { getArticle } from "@/modules/education";
import { PILLS } from "@/modules/content/pills";
import { AGE_BANDS, FINDINGS } from "@/modules/content/science";
import { REGULATION } from "@/modules/content/regulation";
import { SEED_PRICES } from "@/modules/provenance/seedPrices";
import { useMasterRecord } from "@/modules/master-record";
import { isJourneyPath } from "./paths";
import { COUNTRY_OPTIONS, suggestCountry } from "./countries";
import { TREATMENTS_V2, treatmentById } from "./treatments";
import { HFEA_ROWS_FOR_BAND, ageBlock, guideSources, priceLines, regulationFor } from "./guide";
import { PREPARE_STEPS, prepareSections } from "./prepare";
import { depthSection } from "./depth";
import { syncBasicsToCase } from "@/pages/v2/Basics";

const t = (id: string) => treatmentById(id)!;

describe("journey v2 · open paths", () => {
  it("opens the journey without an account but never admin or account pages", () => {
    for (const p of ["/", "/empezar", "/empezar/lo-basico", "/empezar/que-necesitas", "/guia/fiv", "/tu-tratamiento", "/biblioteca", "/aprende/what-is-ivf"]) expect(isJourneyPath(p), p).toBe(true);
    for (const p of ["/admin", "/admin/feedback", "/account", "/cuenta", "/guia/", "/clinic/dashboard"]) expect(isJourneyPath(p), p).toBe(false);
  });
});

describe("journey v2 · every link points at existing content (nothing invented)", () => {
  it("treatment guides, findings and pills exist", () => {
    for (const tr of TREATMENTS_V2) {
      if (tr.what) expect(getArticle(tr.what), tr.what).toBeDefined();
      for (const g of tr.guides) expect(getArticle(g), g).toBeDefined();
      for (const f of tr.findings) expect(FINDINGS.some((x) => x.id === f), f).toBe(true);
      if (tr.age?.kind === "finding") expect(FINDINGS.some((x) => x.id === (tr.age as { id: string }).id)).toBe(true);
      for (const p of tr.pills) expect(PILLS.some((x) => x.id === p), p).toBe(true);
    }
  });
  it("embryo adoption has no guide, price or age content, so it renders 'en preparación'", () => {
    const a = t("adopcion-embriones");
    expect([a.what, a.price, a.age, a.interest]).toEqual([null, null, null, null]);
    expect(a.guides).toEqual([]);
  });
  it("country links match real regulation rows and price markets", () => {
    for (const c of COUNTRY_OPTIONS) {
      if (c.regulation) expect(REGULATION.some((r) => r.country_en === c.regulation), c.code).toBe(true);
      if (c.priceMarket) expect(SEED_PRICES.some((p) => p.market === c.priceMarket), c.code).toBe(true);
    }
  });
  it("every age band maps to rows of the HFEA table", () => {
    for (const rows of Object.values(HFEA_ROWS_FOR_BAND)) for (const r of rows) expect(AGE_BANDS.some((x) => x.band === r), r).toBe(true);
  });
  it("every prepare subsection exists in both languages", () => {
    const treatments = ["fiv", "preservacion", "inseminacion", "ovodonacion", undefined] as const;
    for (const step of ["clinica", "financiacion", "despues", "consulta"] as const)
      for (const tr of treatments)
        for (const ref of prepareSections(step, tr)) {
          const s = depthSection(ref);
          expect(s, `${ref.slug} · ${ref.heading}`).not.toBeNull();
          expect(s!.paragraphs.en.length).toBeGreaterThan(0);
          expect(s!.paragraphs.es.length).toBe(s!.paragraphs.en.length);
        }
    expect(PREPARE_STEPS).toEqual(["preguntas", "clinica", "financiacion", "viaje", "despues", "consulta", "informe"]);
  });
});

describe("journey v2 · what each block shows", () => {
  it("38–40 shows both HFEA rows it spans; under 30 uses the 18–34 row", () => {
    const b = ageBlock(t("fiv"), "38-40");
    expect(b?.kind === "hfea-table" && b.rows.map((r) => r.band)).toEqual(["38–39", "40–42"]);
    const y = ageBlock(t("fiv"), "lt30");
    expect(y?.kind === "hfea-table" && y.rows.map((r) => r.rate)).toEqual(["35%"]);
  });
  it("age block is omitted without an age or without sourced content (insemination)", () => {
    expect(ageBlock(t("fiv"), undefined)).toBeNull();
    expect(ageBlock(t("inseminacion"), "35-37")).toBeNull();
  });
  it("IVF in Spain shows the seed range; the UK has no price yet; ICSI has none anywhere", () => {
    const [es] = priceLines(t("fiv"), { residence: "ES" });
    expect([es.price?.min, es.price?.max]).toEqual([4000, 6000]);
    expect(priceLines(t("fiv"), { residence: "UK" })[0].price).toBeNull();
    expect(priceLines(t("icsi"), { residence: "ES" })[0].price).toBeNull();
  });
  it("treatment abroad shows both countries", () => {
    const lines = priceLines(t("ovodonacion"), { residence: "ES", destination: "CZ" });
    expect(lines.map((l) => [l.country, l.price?.min])).toEqual([["ES", 6000], ["CZ", 4200]]);
    expect(priceLines(t("fiv"), { residence: "ES", destination: "same" })).toHaveLength(1);
  });
  it("rules come from the matching row or none", () => {
    expect(regulationFor("ES")?.country_en).toBe("Spain");
    expect(regulationFor("CY")?.country_en).toBe("Cyprus (South · EU)");
    expect(regulationFor("DK")).toBeNull();
  });
  it("sources are listed once each", () => {
    const s = guideSources(t("fiv"), { residence: "ES", age: "35-37" });
    const keys = s.map((x) => `${x.label}|${x.url ?? ""}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(s.length).toBeGreaterThan(3);
  });
  it("suggests a country from the browser language", () => {
    expect(suggestCountry(["es-MX", "es"])).toBe("MX");
    expect(suggestCountry(["es"])).toBe("ES");
    expect(suggestCountry(["en-GB"])).toBe("UK");
    expect(suggestCountry(["ja-JP"])).toBeUndefined();
  });
});

describe("journey v2 · basics → case", () => {
  beforeEach(() => useMasterRecord.getState().reset?.());
  it("copies country and treatment, never the age band, and never a country the case engines don't know", () => {
    syncBasicsToCase({ residence: "ES", age: "35-37", treatment: "ovodonacion", reason: "preservar" });
    let s = useMasterRecord.getState();
    expect(s.identity.country_of_residence).toBe("ES");
    expect(s.identity.age).toBeUndefined();
    expect(s.intent.treatment_interest).toBe("egg_donation");
    expect(s.intent.goal).toBe("preserve");
    syncBasicsToCase({ residence: "MX" });
    s = useMasterRecord.getState();
    expect(s.identity.country_of_residence).toBe("ES");
  });
});
