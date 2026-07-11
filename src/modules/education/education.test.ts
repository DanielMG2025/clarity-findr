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
} from "./content";

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
    expect(getArticle("fiv-paso-a-paso")?.title).toBe("IVF, step by step");
    expect(getArticle("does-not-exist")).toBeUndefined();
  });
});

describe("toVideoScript", () => {
  it("builds a scene per summary + step + difference and keeps disclaimer/sources", () => {
    const a = getArticle("fiv-paso-a-paso")!;
    const v = toVideoScript(a);
    // 1 (summary) + steps + differences
    expect(v.scenes.length).toBe(1 + (a.steps?.length ?? 0) + (a.differences?.length ?? 0));
    expect(v.hook).toBe(a.hook);
    expect(v.cta.length).toBeGreaterThan(0);
    expect(v.disclaimer).toBe(CONTENT_DISCLAIMER);
    expect(v.sources).toEqual(a.sources);
  });

  it("handles articles with no steps/differences (summary-only scene)", () => {
    const v = toVideoScript(getArticle("amh")!);
    expect(v.scenes).toHaveLength(1);
  });
});
