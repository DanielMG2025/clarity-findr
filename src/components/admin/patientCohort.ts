import type { AdminPatient, FunnelStage, PatientCohort } from "@/lib/adminMocks";

export const COHORTS: PatientCohort[] = ["demo", "beta", "real"];
export const COHORT_LABEL: Record<PatientCohort, string> = { demo: "Demo", beta: "Beta", real: "Real" };

export interface PatientFilters { stage: FunnelStage | "all"; cohort: PatientCohort | "all"; q: string }

export function filterPatients(patients: AdminPatient[], f: PatientFilters): AdminPatient[] {
  const q = f.q.toLowerCase();
  return patients.filter((p) => {
    if (f.stage !== "all" && p.funnel_stage !== f.stage) return false;
    if (f.cohort !== "all" && p.cohort !== f.cohort) return false;
    if (q && !`${p.ref} ${p.country} ${p.treatment}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function countByCohort(patients: AdminPatient[]): Record<PatientCohort, number> {
  const out: Record<PatientCohort, number> = { demo: 0, beta: 0, real: 0 };
  for (const p of patients) out[p.cohort] += 1;
  return out;
}
