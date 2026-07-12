import { describe, it, expect } from "vitest";
import {
  ALL_ARTICLES,
  GLOSSARY,
  GLOSSARY_EXTRA,
  TREATMENTS,
  JOURNEYS,
  ECONOMICS,
  CONTENT_DISCLAIMER,
  getArticle,
  toVideoScript,
} from "./contentLibrary";
import { articleForTerm, findTerms } from "./glossaryIndex";

const KINDS = new Set(["glosario", "tratamiento", "journey", "negocio"]);

describe("content library", () => {
  it("aggregates every section with unique slugs", () => {
    expect(ALL_ARTICLES.length).toBe(
      GLOSSARY.length + GLOSSARY_EXTRA.length + TREATMENTS.length + JOURNEYS.length + ECONOMICS.length,
    );
    const slugs = ALL_ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("GUARDRAILS: every article is disclaimed, sourced and well-formed", () => {
    for (const a of ALL_ARTICLES) {
      expect(a.disclaimer).toBe(CONTENT_DISCLAIMER);
      expect(a.sources.length).toBeGreaterThan(0);
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.hook.length).toBeGreaterThan(0);
      expect(a.summary.length).toBeGreaterThan(0);
      expect(KINDS.has(a.kind)).toBe(true);
    }
  });
});

describe("getArticle", () => {
  it("finds by slug and returns undefined for unknowns", () => {
    expect(getArticle("ivf-step-by-step")?.title).toBe("IVF, step by step");
    expect(getArticle("does-not-exist")).toBeUndefined();
  });
});

describe("toVideoScript", () => {
  it("builds a scene per summary + step + difference and keeps disclaimer/sources", () => {
    const a = getArticle("ivf-step-by-step")!;
    const v = toVideoScript(a);
    // 1 (summary) + steps + differences
    expect(v.scenes.length).toBe(1 + (a.steps?.length ?? 0) + (a.differences?.length ?? 0));
    expect(v.hook).toBe(a.hook);
    expect(v.cta.length).toBeGreaterThan(0);
    expect(v.disclaimer).toBe(CONTENT_DISCLAIMER);
    expect(v.sources).toEqual(a.sources);
  });

  it("handles articles with no steps/differences (summary-only scene)", () => {
    const v = toVideoScript(getArticle("what-is-amh")!);
    expect(v.scenes).toHaveLength(1);
  });
});

describe("glossary index", () => {
  it("resolves aliases (case-insensitive) to their article", () => {
    expect(articleForTerm("IVF")?.slug).toBe("what-is-ivf");
    expect(articleForTerm("icsi")?.slug).toBe("what-is-icsi");
    expect(articleForTerm("antral follicle count")?.slug).toBe("what-is-afc");
    expect(articleForTerm("nonsense")).toBeUndefined();
  });

  it("detects terms, longest-first and one per concept", () => {
    const ms = findTerms("An IVF cycle may add ICSI or PGT-A; a second IVF is common.");
    const slugs = ms.map((m) => m.entry.slug);
    expect(slugs).toContain("what-is-ivf");
    expect(slugs).toContain("what-is-icsi");
    expect(slugs).toContain("what-is-pgt-a");
    expect(slugs.filter((s) => s === "what-is-ivf")).toHaveLength(1); // deduped
    expect(ms.find((m) => m.entry.slug === "what-is-pgt-a")!.text).toBe("PGT-A"); // wins over PGT
  });

  it("returns matches in order, non-overlapping", () => {
    const ms = findTerms("blastocyst and AMH");
    expect(ms.map((m) => m.text)).toEqual(["blastocyst", "AMH"]);
  });
});
