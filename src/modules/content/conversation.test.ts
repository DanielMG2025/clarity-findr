import { describe, it, expect } from "vitest";
import { topKeywords } from "./conversation";
describe("topKeywords", () => {
  it("counts a word once per post and drops stop words", () => {
    const r = topKeywords(["IVF ivf transfer and the", "transfer failed", "embryo transfer"]);
    expect(r[0]).toEqual({ word: "transfer", count: 3 });
    expect(r.find((k) => k.word === "ivf")?.count).toBe(1);
    expect(r.find((k) => k.word === "the")).toBeUndefined();
  });
});

import { filterTopics, platformFamily, groupPlatforms } from "./conversation";
describe("filterTopics", () => {
  const base = { treatment_en: "", answer_en: "", answer_es: "", geography: null as string | null, audiences: ["men"] };
  const rows = [
    { ...base, period: "week", source_platform: "Reddit r/DOR", treatment: "PGT-A", question_en: "a", question_es: "Ovodonación" },
    { ...base, period: "3m", source_platform: "Mumsnet", treatment: "cross-border", question_en: "b", question_es: "b", geography: "Chequia", audiences: ["lgbt"] },
  ];
  const f = { query: "", period: "week" as const, platform: null, audience: null, treatment: null };
  it("week shows only week; 3m shows both", () => {
    expect(filterTopics(rows, f)).toHaveLength(1);
    expect(filterTopics(rows, { ...f, period: "3m" })).toHaveLength(2);
  });
  it("search is accent-insensitive and covers geography", () => {
    expect(filterTopics(rows, { ...f, query: "ovodonacion" })).toHaveLength(1);
    expect(filterTopics(rows, { ...f, period: "3m", query: "chequia" })).toHaveLength(1);
  });
  it("a non-empty search ignores the period filter", () => {
    expect(filterTopics(rows, { ...f, query: "chequia" })).toHaveLength(1);
    expect(filterTopics(rows, { ...f, query: "  " })).toHaveLength(1);
  });
  it("forum and audience filters", () => {
    expect(filterTopics(rows, { ...f, period: "3m", platform: "Mumsnet" })).toHaveLength(1);
    expect(filterTopics(rows, { ...f, period: "3m", audience: "lgbt" })[0].source_platform).toBe("Mumsnet");
  });
  it("platform family", () => {
    expect(platformFamily("Reddit r/DOR")).toBe("Reddit");
    expect(platformFamily("HealthUnlocked / Fertility Network UK")).toBe("HealthUnlocked");
    expect(platformFamily("Reproducción Asistida ORG")).toBe("Reproducción Asistida");
  });
  it("forum dropdown groups Reddit subforums under one Reddit family", () => {
    const g = groupPlatforms(["Reddit r/IVF", "Mumsnet", "Reddit r/DOR", "Reddit r/IVF"]);
    expect(g.map((x) => x.family)).toEqual(["Mumsnet", "Reddit"]);
    expect(g[1].items).toEqual([{ value: "Reddit r/DOR", label: "r/DOR" }, { value: "Reddit r/IVF", label: "r/IVF" }]);
    expect(g[0].items[0]).toEqual({ value: "Mumsnet", label: "Mumsnet" });
  });
});
