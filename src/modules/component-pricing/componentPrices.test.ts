import { describe, it, expect } from "vitest";
import {
  market,
  componentIn,
  estimate,
  COMPONENTS_ES,
  MARKETS,
  PLAN_BASKET,
} from "./componentPrices";

describe("markets", () => {
  it("returns Spain at index 1 and falls back to Spain for unknowns", () => {
    expect(market("ES").index).toBe(1);
    expect(market("ZZ").code).toBe("ES");
  });
});

describe("componentIn", () => {
  it("returns the anchored range unchanged for Spain", () => {
    const es = componentIn("ivf_base", "ES")!;
    const base = COMPONENTS_ES.find((c) => c.key === "ivf_base")!;
    expect(es.min).toBe(base.min);
    expect(es.max).toBe(base.max);
  });

  it("scales by the market index for other markets and annotates the note", () => {
    const cz = componentIn("ivf_base", "CZ")!;
    const base = COMPONENTS_ES.find((c) => c.key === "ivf_base")!;
    expect(cz.min).toBeLessThan(base.min); // CZ index 0.65
    expect(cz.max).toBeLessThan(base.max);
    expect(cz.note).toMatch(/index 0\.65/);
  });

  it("returns undefined for an unknown component", () => {
    // @ts-expect-error intentional bad key
    expect(componentIn("nope", "ES")).toBeUndefined();
  });
});

describe("estimate", () => {
  it("sums one-off components for an IVF plan in Spain", () => {
    const e = estimate("ivf", "ES");
    // consultation + ivf_base + medication
    expect(e.total_min).toBe(150 + 3500 + 900);
    expect(e.total_max).toBe(400 + 4800 + 2200);
    expect(e.recurring_min).toBe(0);
    expect(e.lines).toHaveLength(PLAN_BASKET.ivf.components.length);
    expect(e.explanation).toMatch(/for Spain/);
    expect(e.caveat).toMatch(/not a quote/i);
  });

  it("keeps recurring storage out of the one-off total and multiplies by years", () => {
    const e = estimate("egg_freezing", "ES", { storageYears: 2 });
    expect(e.recurring_min).toBe(200 * 2);
    expect(e.recurring_max).toBe(500 * 2);
    // storage is not in the one-off total
    expect(e.total_min).toBe(150 + 2300 + 900);
  });

  it("never reports high confidence from public data alone", () => {
    for (const m of MARKETS) {
      expect(estimate("ivf", m.code).confidence).not.toBe("high");
    }
  });
});
