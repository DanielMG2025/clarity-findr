import { describe, expect, it } from "vitest";
import { PATIENTS, type AdminPatient } from "@/lib/adminMocks";
import { countByCohort, filterPatients } from "./patientCohort";

const base = PATIENTS[0];
const rows: AdminPatient[] = [
  { ...base, ref: "A", cohort: "demo", funnel_stage: "advanced" },
  { ...base, ref: "B", cohort: "beta", funnel_stage: "advanced" },
  { ...base, ref: "C", cohort: "real", funnel_stage: "full_access" },
];

describe("patient cohorts", () => {
  it("every sample row is marked demo", () => {
    expect(PATIENTS.length).toBeGreaterThan(0);
    expect(PATIENTS.every((p) => p.cohort === "demo")).toBe(true);
  });
  it("cohort filter combines with stage and search", () => {
    expect(filterPatients(rows, { stage: "all", cohort: "all", q: "" }).map((p) => p.ref)).toEqual(["A", "B", "C"]);
    expect(filterPatients(rows, { stage: "advanced", cohort: "beta", q: "" }).map((p) => p.ref)).toEqual(["B"]);
    expect(filterPatients(rows, { stage: "all", cohort: "real", q: "c" }).map((p) => p.ref)).toEqual(["C"]);
    expect(filterPatients(rows, { stage: "advanced", cohort: "real", q: "" })).toEqual([]);
  });
  it("counts the breakdown by cohort", () => {
    expect(countByCohort(rows)).toEqual({ demo: 1, beta: 1, real: 1 });
  });
});
