// One source of truth for what the person has told us.
//  - "Lo básico" (useBasics) and the case (useMasterRecord) stay two stores, but
//    every shared answer is mirrored both ways here, so a screen never asks
//    again for something already answered on another one.
//  - Shared answers: country of residence, treatment, and age (an exact age in
//    the case sets the band in "lo básico"; a band is never turned into an
//    exact age, because that would invent a number).
//  - An example case loaded into the live record never flows into "lo básico".
//  - `fc:answers-at` records when the person last changed an answer, so the
//    browser and the account can be reconciled (most recent wins).
import type { MasterPatientRecord, TreatmentInterest } from "@/modules/master-record/types";
import { useMasterRecord } from "@/modules/master-record/store";
import { emptyRecord } from "@/modules/master-record/types";
import { useExampleCaseStore, useOwnRecordStore } from "@/modules/master-record/exampleCase";
import { reasonById, useBasics, type AgeBandV2, type Basics } from "./basics";
import { isCaseCountry } from "./countries";
import { TREATMENTS_V2, type TreatmentId } from "./treatments";

export const ANSWERED_AT_KEY = "fc:answers-at";
export const BASICS_FIELDS = ["who", "residence", "destination", "age", "reason", "treatment", "treatmentFromReason"] as const;

/** Step of "lo básico" (?paso=N) that asks each answer. */
export const STEP_OF = { who: 1, age: 2, reason: 3, residence: 4, destination: 4, treatment: 5 } as const;

export function bandOf(age: number): AgeBandV2 {
  if (age < 30) return "lt30";
  if (age <= 34) return "30-34";
  if (age <= 37) return "35-37";
  if (age <= 40) return "38-40";
  if (age <= 42) return "41-42";
  return "43plus";
}

export const treatmentForInterest = (i?: TreatmentInterest): TreatmentId | "unsure" | undefined =>
  i === "unsure" ? "unsure" : TREATMENTS_V2.find((t) => t.interest && t.interest === i)?.id;

export function pickBasics(s: Basics): Basics {
  const out: Basics = {};
  for (const k of BASICS_FIELDS) if (s[k] !== undefined) (out as Record<string, unknown>)[k] = s[k];
  return out;
}

/** The four answers every personalised screen relies on. */
export const basicsComplete = (b: Basics) => !!(b.who && b.age && b.reason && b.residence);
export const hasAnyAnswer = (b: Basics) => BASICS_FIELDS.some((k) => k !== "treatmentFromReason" && b[k] !== undefined);
/** First unanswered step (1-based), or null when the four core answers are there. */
export function firstMissingStep(b: Basics): number | null {
  if (!b.who) return 1;
  if (!b.age) return 2;
  if (!b.reason) return 3;
  if (!b.residence) return 4;
  return null;
}

/** Copy the answers the case also asks for into the case. Age bands are never copied (the case asks for an exact age). */
export function syncBasicsToCase(b: Basics) {
  const { patchIdentity, patchIntent } = useMasterRecord.getState();
  if (b.residence && isCaseCountry(b.residence)) patchIdentity({ country_of_residence: b.residence });
  const t = TREATMENTS_V2.find((x) => x.id === b.treatment);
  if (t?.interest) patchIntent({ treatment_interest: t.interest });
  else if (b.treatment === "unsure") patchIntent({ treatment_interest: "unsure" });
  // "What brings you here" is the latest explicit answer, so it sets the case goal.
  const reason = reasonById(b.reason);
  if (reason) patchIntent({ goal: reason.goal });
}

/** What "lo básico" should take from the case: only fields that differ, and only where the case has a value. */
export function caseToBasics(r: Pick<MasterPatientRecord, "identity" | "intent">, b: Basics): Partial<Basics> {
  const out: Partial<Basics> = {};
  const c = r.identity.country_of_residence;
  if (c && c !== b.residence) out.residence = c;
  const age = r.identity.age;
  if (typeof age === "number" && age > 0 && bandOf(age) !== b.age) out.age = bandOf(age);
  const i = r.intent.treatment_interest;
  const own = TREATMENTS_V2.find((t) => t.id === b.treatment)?.interest ?? (b.treatment === "unsure" ? "unsure" : undefined);
  const t = treatmentForInterest(i);
  if (i && t && own !== i) { out.treatment = t; out.treatmentFromReason = false; }
  return out;
}

const exampleOnScreen = () => !!useExampleCaseStore.getState().key;

let quiet = 0;
/** Apply changes without counting them as the person answering (e.g. loading from the account). */
export function quietly(fn: () => void) { quiet++; try { fn(); } finally { quiet--; } }

export function readAnsweredAt(): number {
  try { return Number(localStorage.getItem(ANSWERED_AT_KEY)) || 0; } catch { return 0; }
}
export function writeAnsweredAt(t: number) {
  try { if (t) localStorage.setItem(ANSWERED_AT_KEY, String(t)); else localStorage.removeItem(ANSWERED_AT_KEY); } catch { /* storage off */ }
}
function touch() { if (!quiet) writeAnsweredAt(Date.now()); }

const sharedCase = (s: MasterPatientRecord) => [s.identity.country_of_residence, s.identity.age, s.intent.treatment_interest].join("|");

/**
 * Keep both stores aligned for the rest of the session. Returns an unsubscribe.
 * Only the fields that changed are propagated, so neither store overwrites the other with stale values.
 */
export function bindAnswers(): () => void {
  let syncing = false;
  // Initial alignment: "lo básico" fills the case, then the case fills gaps in "lo básico".
  if (!exampleOnScreen()) {
    syncing = true;
    try {
      const b = pickBasics(useBasics.getState());
      syncBasicsToCase(b);
      const back = caseToBasics(useMasterRecord.getState(), b);
      for (const k of Object.keys(back) as (keyof Basics)[]) if (b[k] !== undefined) delete back[k];
      if (Object.keys(back).length) useBasics.setState(back);
    } finally { syncing = false; }
  }
  const offBasics = useBasics.subscribe((s, prev) => {
    if (syncing) return;
    const changed = BASICS_FIELDS.some((k) => s[k] !== prev[k]);
    if (!changed) return;
    touch();
    if (exampleOnScreen()) return;
    syncing = true;
    try { syncBasicsToCase(pickBasics(s)); } finally { syncing = false; }
  });
  const offCase = useMasterRecord.subscribe((s, prev) => {
    if (syncing || exampleOnScreen()) return;
    if (s.identity === prev.identity && s.intent === prev.intent && s.clinical === prev.clinical && s.history === prev.history
      && s.documents === prev.documents && s.shared_quotes === prev.shared_quotes) return;
    touch();
    if (sharedCase(s) === sharedCase(prev)) return;
    const patch = caseToBasics(s, useBasics.getState());
    // Only follow fields the person changed in the case.
    if (s.identity.country_of_residence === prev.identity.country_of_residence) delete patch.residence;
    if (s.identity.age === prev.identity.age) delete patch.age;
    if (s.intent.treatment_interest === prev.intent.treatment_interest) { delete patch.treatment; delete patch.treatmentFromReason; }
    if (!Object.keys(patch).length) return;
    syncing = true;
    try { useBasics.setState(patch); } finally { syncing = false; }
  });
  return () => { offBasics(); offCase(); };
}

/** The person's own case (never an example case on screen). */
export function ownRecord(): MasterPatientRecord {
  if (exampleOnScreen()) return { ...emptyRecord(), ...(useOwnRecordStore.getState().saved ?? {}) };
  const s = useMasterRecord.getState();
  const out = emptyRecord();
  for (const k of Object.keys(out) as (keyof MasterPatientRecord)[]) (out as unknown as Record<string, unknown>)[k] = structuredClone(s[k]);
  return out;
}

/** "Empezar de cero": every answer, in "lo básico" and in the case, is cleared. */
export function clearAllAnswers() {
  useBasics.getState().reset();
  useMasterRecord.getState().reset();
  useOwnRecordStore.getState().setSaved(null);
  useExampleCaseStore.getState().setKey(null);
  writeAnsweredAt(Date.now());
}

// ---- browser ↔ account ---------------------------------------------------

export interface AnswersSnapshot { basics: Basics; case_record: Partial<MasterPatientRecord>; answered_at: number }

const meaningfulCase = (r: Partial<MasterPatientRecord>) =>
  !!(r.identity && Object.values(r.identity).some((v) => v !== undefined))
  || !!(r.intent && Object.values(r.intent).some((v) => v !== undefined))
  || !!(r.clinical && Object.values(r.clinical).some((v) => v !== undefined && !(Array.isArray(v) && !v.length)))
  || !!(r.history?.length || r.documents?.length || r.shared_quotes?.length);

export const snapshotHasData = (s: AnswersSnapshot | null) => !!s && (hasAnyAnswer(s.basics) || meaningfulCase(s.case_record));

const stable = (v: unknown): string => JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).filter(([, y]) => y !== undefined).sort(([a], [b]) => a.localeCompare(b))) : x));
export const sameAnswers = (a: AnswersSnapshot, b: AnswersSnapshot) =>
  stable(a.basics) === stable(b.basics) && stable(a.case_record) === stable(b.case_record);

export type SyncPlan = { action: "push" | "pull" | "none"; notice: null | "used-browser" | "used-account" };

/**
 * Signing in: what to do with the browser's answers and the account's.
 *  - nothing in the account → keep the browser's and save them to the account;
 *  - nothing in the browser → load the account's;
 *  - both, different → the most recently answered wins, with a one-line notice.
 */
export function planAccountSync(local: AnswersSnapshot, remote: AnswersSnapshot | null): SyncPlan {
  const l = snapshotHasData(local);
  const r = snapshotHasData(remote);
  if (!r) return { action: l || remote ? "push" : "none", notice: null };
  if (!l && local.answered_at <= (remote?.answered_at ?? 0)) return { action: "pull", notice: null };
  if (!l) return { action: "push", notice: null }; // "Empezar de cero" after the account's last save
  if (sameAnswers(local, remote!)) return { action: "none", notice: null };
  return local.answered_at >= remote!.answered_at ? { action: "push", notice: "used-browser" } : { action: "pull", notice: "used-account" };
}

export function localSnapshot(): AnswersSnapshot {
  const rec = ownRecord() as Partial<MasterPatientRecord>;
  return { basics: pickBasics(useBasics.getState()), case_record: rec, answered_at: readAnsweredAt() };
}

/** Load the account's answers into the browser (without counting it as a new answer). */
export function applySnapshot(s: AnswersSnapshot) {
  quietly(() => {
    const blank: Partial<Basics> = {};
    for (const k of BASICS_FIELDS) (blank as Record<string, unknown>)[k] = undefined;
    useBasics.setState({ ...blank, ...s.basics });
    const rec = { ...emptyRecord(), ...s.case_record } as MasterPatientRecord;
    if (exampleOnScreen()) useOwnRecordStore.getState().setSaved(rec);
    else useMasterRecord.setState(rec);
  });
  writeAnsweredAt(s.answered_at);
}
