import { describe, expect, it } from "vitest";
import { ALL_ARTICLES } from "@/modules/education";
import { translate } from "./translate";

// Rule: when the site is in Spanish, every Basics guide renders in Spanish.
function articleStrings() {
  return ALL_ARTICLES.flatMap((a) => [
    a.title, a.hook, a.summary, a.disclaimer,
    ...(a.body ?? []),
    ...(a.steps ?? []).flatMap((s) => [s.title, s.detail, s.typical_duration ?? ""]),
    ...(a.differences ?? []).flatMap((d) => [d.vs, d.note]),
    ...(a.faqs ?? []).flatMap((f) => [f.q, f.a]),
    ...a.sources.map((s) => s.label).filter((l) => !/^(ESHRE|HFEA|URMC|CCRM|Monash)$/.test(l)),
  ]).filter(Boolean);
}

describe("Basics guides in Spanish", () => {
  it("translates every guide title, hook, summary, body, step, difference and FAQ", () => {
    const missing = articleStrings().filter((s) => translate(s, "es") === s);
    expect(missing).toEqual([]);
  });

  it("keeps English unchanged", () => {
    expect(translate("What is IVF?", "en")).toBe("What is IVF?");
    expect(translate("What is IVF?", "es")).toBe("¿Qué es la FIV?");
  });
});
