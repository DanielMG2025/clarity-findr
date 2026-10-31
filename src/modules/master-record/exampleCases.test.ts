import { describe, it, expect, beforeEach } from "vitest";
import { DEMO_PATIENTS } from "./demoPatients";
import { runDemo } from "./runDemo";
import { useMasterRecord } from "./store";
import { activeExampleCase, openExampleCase, startOwnCase, useExampleCaseStore } from "./exampleCase";

const byKey = (k: string) => DEMO_PATIENTS.find((p) => p.key === k)!;

describe("example cases", () => {
  it("every case runs through the engines with plans, factors and a legal verdict", () => {
    for (const p of DEMO_PATIENTS) {
      const r = runDemo(p);
      expect(r.step4_costs.length, p.key).toBeGreaterThan(0);
      expect(r.step2_orientation.factors.length, p.key).toBeGreaterThan(0);
      expect(r.step0_regulatory, p.key).not.toBeNull();
    }
  });

  it("the data level shown on each card matches the engine's confidence", () => {
    for (const p of DEMO_PATIENTS) expect(runDemo(p).step2_orientation.confidence, p.key).toBe(p.data_level);
  });

  it("spreads routes, families and data levels", () => {
    expect(DEMO_PATIENTS.filter((p) => p.goal === "preserve").length).toBeGreaterThanOrEqual(4);
    const fams = new Set(DEMO_PATIENTS.map((p) => p.family_structure ?? "hetero_couple"));
    for (const f of ["hetero_couple", "single_woman", "female_couple", "male_couple", "single_man"]) expect(fams).toContain(f);
    for (const c of ["ES", "UK", "IT", "DE", "CZ", "CY", "GR", "PT", "FR", "CH", "PL"]) expect(DEMO_PATIENTS.some((p) => p.country === c), c).toBe(true);
  });

  it("restrictive frameworks become legal cases; permissive ones don't", () => {
    for (const k of ["giulia_34_italy_single", "chiara_35_italy_female_couple", "lena_39_germany_donor", "hannah_36_switzerland_single", "anna_37_poland_single", "eleni_daphne_32_greece", "klara_35_germany_preserve", "tomas_41_single_man"]) {
      expect(runDemo(byKey(k)).step0_regulatory!.needs_to_travel, k).toBe(true);
    }
    for (const k of ["ana_31_favorable", "laura_sara_33_ropa", "maria_36_cyprus_single", "james_oliver_38_uk", "charlotte_36_france_preserve"]) {
      expect(runDemo(byKey(k)).step0_regulatory!.needs_to_travel, k).toBe(false);
    }
  });

  it("every case has a story in both languages", () => {
    for (const p of DEMO_PATIENTS) {
      expect(p.story.length, p.key).toBeGreaterThan(20);
      expect(p.story_es.length, p.key).toBeGreaterThan(20);
      expect(p.label_es.length, p.key).toBeGreaterThan(0);
    }
  });
});

describe("leaving an example for your own case", () => {
  beforeEach(() => { useMasterRecord.getState().reset(); useExampleCaseStore.getState().setKey(null); });

  it("opening a case marks it active while the record still matches it", () => {
    openExampleCase(byKey("ana_31_favorable"));
    expect(activeExampleCase(useExampleCaseStore.getState().key, useMasterRecord.getState().identity.name)?.key).toBe("ana_31_favorable");
    expect(activeExampleCase("ana_31_favorable", "Someone else")).toBeNull();
  });

  it("starting your own case clears the example data and the route question comes back", () => {
    openExampleCase(byKey("irene_30_preserve_high"));
    expect(useMasterRecord.getState().intent.goal).toBe("preserve");
    startOwnCase();
    const s = useMasterRecord.getState();
    expect(s.intent.goal).toBeUndefined();
    expect(s.identity.name).toBeUndefined();
    expect(useExampleCaseStore.getState().key).toBeNull();
  });
});
