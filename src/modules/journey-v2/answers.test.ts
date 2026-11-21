import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

const db = vi.hoisted(() => ({ row: null as null | Record<string, unknown>, upserts: [] as Record<string, unknown>[] }));
vi.mock("@/integrations/supabase/client", () => {
  const q = { select: () => q, eq: () => q, maybeSingle: () => Promise.resolve({ data: db.row, error: null }) };
  return { supabase: { from: () => ({ ...q, upsert: (v: Record<string, unknown>) => { db.upserts.push(v); return Promise.resolve({ error: null }); } }) } };
});

import { useBasics } from "./basics";
import { useMasterRecord } from "@/modules/master-record/store";
import { useExampleCaseStore } from "@/modules/master-record/exampleCase";
import { ANSWERED_AT_KEY, BASICS_FIELDS, bandOf, bindAnswers, clearAllAnswers, firstMissingStep, localSnapshot, planAccountSync, readAnsweredAt, type AnswersSnapshot } from "./answers";
import { reconcile } from "./accountSync";

let unbind: () => void = () => {};
beforeEach(() => { localStorage.clear(); useBasics.getState().reset(); useMasterRecord.getState().reset(); useExampleCaseStore.getState().setKey(null); db.row = null; db.upserts = []; unbind = bindAnswers(); });
afterEach(() => { unbind(); localStorage.clear(); });

describe("one store for the answers: «lo básico» ↔ the case", () => {
  it("an answer in «lo básico» reaches the case (country, treatment, goal)", () => {
    useBasics.getState().patch({ residence: "ES", treatment: "ovodonacion", reason: "preservar" });
    const s = useMasterRecord.getState();
    expect(s.identity.country_of_residence).toBe("ES");
    expect(s.intent.treatment_interest).toBe("egg_donation");
    expect(s.intent.goal).toBe("preserve");
  });
  it("an exact age typed in Preparar sets the band in «lo básico»; the band never becomes an exact age", () => {
    useBasics.getState().patch({ age: "30-34" });
    expect(useMasterRecord.getState().identity.age).toBeUndefined();
    useMasterRecord.getState().patchIdentity({ age: 39 });
    expect(useBasics.getState().age).toBe("38-40");
  });
  it("changing the treatment in the case updates «lo básico»", () => {
    useBasics.getState().patch({ treatment: "fiv" });
    useMasterRecord.getState().patchIntent({ treatment_interest: "social_freezing" });
    expect(useBasics.getState().treatment).toBe("preservacion");
  });
  it("an example case on screen never flows into «lo básico»", () => {
    useBasics.getState().patch({ residence: "ES" });
    useExampleCaseStore.getState().setKey("any");
    useMasterRecord.getState().patchIdentity({ country_of_residence: "PT", age: 44 });
    expect(useBasics.getState().residence).toBe("ES");
    expect(useBasics.getState().age).toBeUndefined();
  });
  it("bands map exact ages at the edges", () => {
    expect([29, 30, 34, 35, 37, 38, 40, 41, 42, 43].map(bandOf)).toEqual(["lt30", "30-34", "30-34", "35-37", "35-37", "38-40", "38-40", "41-42", "41-42", "43plus"]);
  });
  it("the first missing core question is where «lo básico» resumes", () => {
    expect(firstMissingStep({})).toBe(1);
    expect(firstMissingStep({ who: "mujer", age: "35-37" })).toBe(3);
    expect(firstMissingStep({ who: "mujer", age: "35-37", reason: "entender" })).toBe(4);
    expect(firstMissingStep({ who: "mujer", age: "35-37", reason: "entender", residence: "ES" })).toBeNull();
  });
});

describe("persistence", () => {
  it("answers survive a reload (read back from the browser)", async () => {
    useBasics.getState().patch({ who: "pareja", age: "35-37", residence: "ES" });
    const saved = localStorage.getItem("fc:basics-v2")!;
    expect(JSON.parse(saved).state).toMatchObject({ who: "pareja", age: "35-37", residence: "ES" });
    // Simulate a fresh page: wipe memory, keep storage, rehydrate.
    useBasics.setState(Object.fromEntries(BASICS_FIELDS.map((k) => [k, undefined])));
    localStorage.setItem("fc:basics-v2", saved);
    await useBasics.persist.rehydrate();
    expect(useBasics.getState()).toMatchObject({ who: "pareja", age: "35-37", residence: "ES" });
  });
  it("every answer stamps when it was given; «Empezar de cero» clears both stores", () => {
    useBasics.getState().patch({ residence: "ES" });
    expect(readAnsweredAt()).toBeGreaterThan(0);
    clearAllAnswers();
    expect(useBasics.getState().residence).toBeUndefined();
    expect(useMasterRecord.getState().identity.country_of_residence).toBeUndefined();
    expect(localStorage.getItem(ANSWERED_AT_KEY)).toBeTruthy();
  });
});

const snap = (basics: AnswersSnapshot["basics"], at: number): AnswersSnapshot => ({ basics, case_record: {}, answered_at: at });

describe("browser → account", () => {
  it("plan: empty account keeps the browser's answers; empty browser loads the account's; most recent wins with a notice", () => {
    expect(planAccountSync(snap({ residence: "ES" }, 10), null)).toEqual({ action: "push", notice: null });
    expect(planAccountSync(snap({}, 0), snap({ residence: "ES" }, 10))).toEqual({ action: "pull", notice: null });
    expect(planAccountSync(snap({ residence: "ES" }, 20), snap({ residence: "PT" }, 10))).toEqual({ action: "push", notice: "used-browser" });
    expect(planAccountSync(snap({ residence: "ES" }, 10), snap({ residence: "PT" }, 20))).toEqual({ action: "pull", notice: "used-account" });
    expect(planAccountSync(snap({ residence: "ES" }, 10), snap({ residence: "ES" }, 20))).toEqual({ action: "none", notice: null });
  });
  it("signing in with a new account saves the browser's answers to it, losing nothing", async () => {
    useBasics.getState().patch({ who: "mujer", age: "38-40", residence: "ES", treatment: "fiv" });
    useMasterRecord.getState().patchClinical({ amh: 1.2 });
    expect(await reconcile("u1")).toBeNull();
    expect(db.upserts).toHaveLength(1);
    expect(db.upserts[0].user_id).toBe("u1");
    expect(db.upserts[0].basics).toMatchObject({ who: "mujer", age: "38-40", residence: "ES", treatment: "fiv" });
    expect((db.upserts[0].case_record as { clinical: { amh: number } }).clinical.amh).toBe(1.2);
  });
  it("the account has more recent, different answers: they are loaded and a notice is returned", async () => {
    useBasics.getState().patch({ residence: "ES" });
    db.row = { basics: { residence: "PT", age: "30-34" }, case_record: { identity: { country_of_residence: "PT" } }, answered_at: new Date(Date.now() + 60_000).toISOString() };
    expect(await reconcile("u1")).toBe("used-account");
    expect(useBasics.getState()).toMatchObject({ residence: "PT", age: "30-34" });
    expect(useMasterRecord.getState().identity.country_of_residence).toBe("PT");
    expect(db.upserts).toHaveLength(0);
    expect(localSnapshot().basics.residence).toBe("PT");
  });
});
