// Demonstrator engine — walks a patient through the 7 steps, end-to-end
// ---------------------------------------------------------------------------
// Takes a patient (one of the 10 demo seeds or entered by hand) and produces
// the EXPLAINABLE output of each golden-path step. It's the heart of the
// demonstrator: one call -> everything to render.
//
// Golden rule throughout: no diagnosis, no personalised success percentages,
// no "you should do X". Orientation + sources + the honest acknowledgement of
// what we do NOT know.

import { estimate, IMPROVEMENT_PATH, type Plan, type Estimate } from "@/modules/component-pricing";
import { buildEvidence, reserveBand, type EvidenceResult } from "@/modules/evidence";
import { type DemoPatientSeed, completeness } from "./demoPatients";

export const MEDICAL_DISCLAIMER =
  "This orientation is informational and does not constitute a diagnosis or replace a medical professional's judgement.";

// --- Step 2: Orientation ----------------------------------------------------
export type FactorKind = "favorable" | "attention" | "missing";

export interface Factor {
  kind: FactorKind;
  title: string;
  why: string; // the "why this shows up"
  needs_professional?: boolean;
}

export interface Orientation {
  factors: Factor[];
  evidence: EvidenceResult;
  completeness: number; // 0-100
  confidence: "low" | "medium" | "high";
  confidence_reason: string;
  disclaimer: string;
}

function buildOrientation(p: DemoPatientSeed): Orientation {
  const factors: Factor[] = [];
  const age = p.age;
  const reserve = reserveBand(p.amh, p.afc);

  // --- favorable
  if (age < 35) {
    factors.push({ kind: "favorable", title: "Favorable age", why: `At ${age}, age is on your side: it's the factor that most influences outcomes.` });
  }
  if (reserve === "normal" || reserve === "high") {
    factors.push({ kind: "favorable", title: "Ovarian reserve in range", why: "Your markers (AMH and follicle count) don't suggest a diminished reserve." });
  }
  if (p.diagnosis?.includes("unexplained") && (p.prior_ivf ?? 0) === 0) {
    factors.push({ kind: "favorable", title: "No adverse factors identified", why: "No specific cause has been identified, which keeps more options open." });
  }
  factors.push({ kind: "favorable", title: "You've started informing yourself early", why: "Seeking orientation proactively helps you decide with more room to manoeuvre." });

  // --- to keep in mind
  if (age >= 38 && age <= 40) {
    factors.push({ kind: "attention", title: "Age to keep in mind", why: `At ${age}, per-transfer rates decline compared with younger ages.`, needs_professional: true });
  }
  if (age > 40) {
    factors.push({ kind: "attention", title: "Advanced age for own eggs", why: `At ${age}, options with your own eggs narrow and egg donation often enters the conversation.`, needs_professional: true });
  }
  if (reserve === "low") {
    const bits = [p.amh != null ? `AMH ${p.amh} ng/mL` : null, p.afc != null ? `antral follicle count ${p.afc}` : null].filter(Boolean).join(", ");
    factors.push({ kind: "attention", title: "Low ovarian reserve", why: `Your markers (${bits}) suggest a diminished reserve, which may affect the number of eggs per cycle.`, needs_professional: true });
  }
  if (p.diagnosis?.includes("endometriosis")) {
    factors.push({ kind: "attention", title: "Endometriosis", why: "It can affect the outcome and needs specialist assessment.", needs_professional: true });
  }
  if (p.diagnosis?.includes("pcos")) {
    factors.push({ kind: "attention", title: "Polycystic ovary syndrome (PCOS)", why: "Often associated with irregular cycles and requires adjusting the stimulation protocol.", needs_professional: true });
  }
  if (p.diagnosis?.includes("male_factor")) {
    factors.push({ kind: "attention", title: "Male factor", why: "ICSI is commonly considered in these cases; the specialist should assess it.", needs_professional: true });
  }
  if (p.diagnosis?.includes("tubal_factor")) {
    factors.push({ kind: "attention", title: "Tubal factor", why: "Often points toward IVF, since fertilisation wouldn't happen naturally.", needs_professional: true });
  }
  if ((p.prior_ivf ?? 0) > 0) {
    factors.push({ kind: "attention", title: `${p.prior_ivf} previous IVF cycle(s) without success`, why: "A history of previous attempts is relevant information for rethinking the approach.", needs_professional: true });
  }
  if ((p.prior_iui ?? 0) > 0) {
    factors.push({ kind: "attention", title: `${p.prior_iui} previous insemination(s)`, why: "Context: it may point toward moving to more complex techniques." });
  }

  // --- what's missing (key to confidence)
  if (p.amh == null) factors.push({ kind: "missing", title: "AMH level", why: "It's the main marker for estimating your ovarian reserve." });
  if (p.afc == null) factors.push({ kind: "missing", title: "Antral follicle count", why: "It complements AMH to estimate the response to stimulation." });
  if (p.fsh == null) factors.push({ kind: "missing", title: "Hormone panel (FSH, estradiol)", why: "Helps complete the baseline hormonal assessment." });
  if (!p.diagnosis?.length) factors.push({ kind: "missing", title: "Confirmed diagnosis", why: "Without a diagnosis, the orientation is necessarily more generic." });

  const c = completeness(p);
  const confidence = c >= 75 ? "high" : c >= 45 ? "medium" : "low";
  const missing = factors.filter((f) => f.kind === "missing").length;
  const confidence_reason =
    missing === 0
      ? "Your profile is complete, so the orientation draws on all the relevant factors."
      : `${missing} relevant data point(s) are missing. The more you complete, the more accurate your orientation.`;

  return {
    factors,
    evidence: buildEvidence({ age: p.age, amh: p.amh, afc: p.afc, prior_cycles: p.prior_ivf }),
    completeness: c,
    confidence,
    confidence_reason,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

// --- Steps 3/4: routes and costs -------------------------------------------
/** Plans to explore (NEVER a recommendation: they're cited options). */
function suggestPlans(p: DemoPatientSeed): Plan[] {
  const reserve = reserveBand(p.amh, p.afc);
  const plans: Plan[] = [];

  if (p.treatment_interest === "social_freezing") return ["egg_freezing"];
  if (p.treatment_interest === "egg_donation") return ["egg_donation", "ivf_icsi"];

  if (p.age <= 42 && reserve !== "low") plans.push("ivf");
  if (p.diagnosis?.includes("male_factor") || (p.prior_ivf ?? 0) > 0) plans.push("ivf_icsi");
  if (p.age >= 38 || (p.prior_ivf ?? 0) >= 2) plans.push("ivf_icsi_pgt");
  if (p.age >= 41 || reserve === "low") plans.push("egg_donation");

  if (!plans.length) plans.push("ivf");
  return [...new Set(plans)].slice(0, 3);
}

export interface CostScenario {
  estimate: Estimate;
  why_this_plan: string;
}

// --- Step 5: clinics (explained fit, no opaque ranking) --------------------
export interface ClinicFit {
  name: string;
  market: string;
  fit_reasons: string[];
  tradeoffs: string[];
  commercial_agreement: boolean;
}

// --- Full result ------------------------------------------------------------
export interface DemoRun {
  patient: DemoPatientSeed;
  step1_profile: { completeness: number; summary: string };
  step2_orientation: Orientation;
  step3_learn: string[]; // slugs from the education library to highlight
  step4_costs: CostScenario[];
  step5_clinics: ClinicFit[];
  step6_next: string[];
  improvement_path: string;
}

/** Run the full golden path for a patient. */
export function runDemo(p: DemoPatientSeed, marketCode = "ES"): DemoRun {
  const orientation = buildOrientation(p);
  const plans = suggestPlans(p);

  const costs: CostScenario[] = plans.map((plan) => ({
    estimate: estimate(plan, marketCode, { storageYears: 1 }),
    why_this_plan: whyPlan(plan, p),
  }));

  return {
    patient: p,
    step1_profile: {
      completeness: orientation.completeness,
      summary: `${p.name}, ${p.age}. ${p.diagnosis?.length ? "Diagnosis: " + p.diagnosis.join(", ") + "." : "No confirmed diagnosis."} Profile ${orientation.completeness}% complete.`,
    },
    step2_orientation: orientation,
    step3_learn: learnFor(p, plans),
    step4_costs: costs,
    step5_clinics: [], // the demonstrator injects these from its clinic seed
    step6_next: nextSteps(orientation),
    improvement_path: IMPROVEMENT_PATH,
  };
}

function whyPlan(plan: Plan, p: DemoPatientSeed): string {
  const reserve = reserveBand(p.amh, p.afc);
  switch (plan) {
    case "egg_freezing":
      return "It appears because you've indicated an interest in preserving your fertility.";
    case "egg_donation":
      return reserve === "low"
        ? "It appears because your markers suggest a low reserve; the literature describes it as a common route in these cases."
        : `It appears because of your age (${p.age}), a scenario where it often enters the conversation.`;
    case "ivf_icsi_pgt":
      return "It appears because embryo genetic testing is often considered in profiles with advanced age or previous attempts.";
    case "ivf_icsi":
      return p.diagnosis?.includes("male_factor")
        ? "It appears because male factor is usually addressed with ICSI."
        : "It appears because of your history of previous attempts.";
    default:
      return "It appears as the standard own-eggs route for your profile.";
  }
}

function learnFor(p: DemoPatientSeed, plans: Plan[]): string[] {
  const s = new Set<string>(["patient-journey"]);
  if (plans.includes("egg_freezing")) { s.add("egg-freezing-step-by-step"); s.add("how-egg-freezing-is-paid"); }
  if (plans.includes("egg_donation")) { s.add("what-is-egg-donation"); s.add("anonymous-donation"); }
  if (plans.some((x) => x.includes("icsi"))) s.add("what-is-icsi");
  if (plans.includes("ivf_icsi_pgt")) s.add("what-is-pgt-a");
  if (p.amh != null || p.afc != null) s.add("what-is-ovarian-reserve");
  s.add("ivf-step-by-step");
  return [...s];
}

function nextSteps(o: Orientation): string[] {
  const out: string[] = [];
  const missing = o.factors.filter((f) => f.kind === "missing");
  if (missing.length) out.push(`Complete ${missing.length} data point(s) to refine your orientation: ${missing.map((m) => m.title).join(", ")}.`);
  out.push("Review your detailed report with all cited sources.");
  out.push("Talk to a professional before making any decision.");
  return out;
}
