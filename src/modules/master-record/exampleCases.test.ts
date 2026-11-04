import { describe, it, expect, beforeEach } from "vitest";
import { DEMO_PATIENTS } from "./demoPatients";
import { runDemo } from "./runDemo";
import { SITUATION_TAGS, TREATMENT_TAGS, deriveExampleTags, filterExampleCases } from "./exampleCaseTags";
import { useMasterRecord } from "./store";
import { activeExampleCase, openExampleCase, restoreOwnCase, startOwnCase, useExampleCaseStore, useOwnRecordStore } from "./exampleCase";

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
  beforeEach(() => { useMasterRecord.getState().reset(); useExampleCaseStore.getState().setKey(null); useOwnRecordStore.getState().setSaved(null); });

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

  it("returning to your own case after an example brings back only your own data", () => {
    useMasterRecord.getState().patchIdentity({ name: "Me", age: 38 });
    useMasterRecord.getState().patchIntent({ goal: "treatment" });
    openExampleCase(byKey("irene_30_preserve_high"));
    openExampleCase(byKey("ana_31_favorable"));
    restoreOwnCase();
    const s = useMasterRecord.getState();
    expect(s.identity.name).toBe("Me");
    expect(s.identity.age).toBe(38);
    expect(s.intent.goal).toBe("treatment");
    expect(useExampleCaseStore.getState().key).toBeNull();
  });

  it("with no own data, returning after an example starts empty", () => {
    openExampleCase(byKey("irene_30_preserve_high"));
    restoreOwnCase();
    const s = useMasterRecord.getState();
    expect(s.identity.name).toBeUndefined();
    expect(s.intent.goal).toBeUndefined();
    expect(s.history).toHaveLength(0);
  });

  it("restoring without an open example leaves your own data untouched", () => {
    useMasterRecord.getState().patchIdentity({ name: "Me" });
    restoreOwnCase();
    expect(useMasterRecord.getState().identity.name).toBe("Me");
  });
});

describe("example case tags and filters", () => {
  const keys = (xs: { key: string }[]) => xs.map((x) => x.key).sort();

  it("every treatment tag and situation tag in the vocabulary is used by at least one case", () => {
    for (const t of TREATMENT_TAGS) expect(DEMO_PATIENTS.some((p) => p.treatment_tag === t), t).toBe(true);
    for (const s of SITUATION_TAGS) expect(DEMO_PATIENTS.some((p) => p.situation_tags?.includes(s)), s).toBe(true);
  });

  it("no case uses a tag outside the vocabulary", () => {
    for (const p of DEMO_PATIENTS) {
      if (p.treatment_tag) expect(TREATMENT_TAGS, p.key).toContain(p.treatment_tag);
      for (const s of p.situation_tags ?? []) expect(SITUATION_TAGS, p.key).toContain(s);
    }
  });

  it("each case's tags follow the stated rule", () => {
    for (const p of DEMO_PATIENTS) {
      const d = deriveExampleTags(p);
      expect(p.treatment_tag, p.key).toBe(d.treatment_tag);
      expect([...(p.situation_tags ?? [])].sort(), p.key).toEqual([...d.situation_tags].sort());
    }
  });

  it("ROPA/surrogacy and cross-border are exactly the curated cases", () => {
    expect(keys(DEMO_PATIENTS.filter((p) => p.situation_tags?.includes("ropa_surrogacy"))))
      .toEqual(["chiara_35_italy_female_couple", "james_oliver_38_uk", "laura_sara_33_ropa", "tomas_41_single_man"]);
    expect(keys(DEMO_PATIENTS.filter((p) => p.situation_tags?.includes("cross_border"))))
      .toEqual(["anna_37_poland_single", "chiara_35_italy_female_couple", "eleni_daphne_32_greece", "giulia_34_italy_single", "hannah_36_switzerland_single", "klara_35_germany_preserve", "lena_39_germany_donor", "tomas_41_single_man"]);
  });

  it("cross-border + egg donation gives Lena and Tomás", () => {
    expect(keys(filterExampleCases(DEMO_PATIENTS, { situation: "cross_border", treatment: "donation" })))
      .toEqual(["lena_39_germany_donor", "tomas_41_single_man"]);
  });

  it("egg freezing + rest of Europe gives Klara and Charlotte", () => {
    expect(keys(filterExampleCases(DEMO_PATIENTS, { treatment: "freezing", geo: "rest_of_europe" })))
      .toEqual(["charlotte_36_france_preserve", "klara_35_germany_preserve"]);
  });

  it("ROPA/surrogacy in Spain gives Laura & Sara and Tomás", () => {
    expect(keys(filterExampleCases(DEMO_PATIENTS, { treatment: "ropa_surrogacy", geo: "spain" })))
      .toEqual(["laura_sara_33_ropa", "tomas_41_single_man"]);
  });

  it("age band and family combine with the other filters; no filters returns every case", () => {
    expect(keys(filterExampleCases(DEMO_PATIENTS, { treatment: "own_ivf", ageBand: "36_39", family: "single_woman" })))
      .toEqual(["hannah_36_switzerland_single", "maria_36_cyprus_single"]);
    expect(filterExampleCases(DEMO_PATIENTS, {})).toHaveLength(DEMO_PATIENTS.length);
    expect(filterExampleCases(DEMO_PATIENTS, { situation: "male_factor", geo: "rest_of_europe" })).toHaveLength(0);
  });
});
