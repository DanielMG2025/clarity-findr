// Public entry point — re-exports the modular decision engines
// (pricingEngine + matchingEngine + insightsEngine + orchestrator) and
// keeps the assessment constants + localStorage helper used across the app.

export * from "./engines";
import { runDecisionPipeline } from "./engines";
import type { AssessmentData, BudgetRange } from "./engines/types";

// ---- Backwards-compatible alias (older imports use `runMatching`) ----
export const runMatching = runDecisionPipeline;

// ---- Assessment constants & defaults ----
export const DEFAULT_ASSESSMENT: AssessmentData = {
  age: 32,
  gender: "",
  trying_duration: "",
  previous_treatments: [],
  diagnosis: [],
  treatment_interest: "",
  budget_range: "",
  country_preference: "Spain",
};

export const PREVIOUS_TREATMENTS = ["IUI", "IVF", "Egg Donation", "ICSI", "None", "Other"];
export const DIAGNOSES = [
  "Unexplained",
  "Low ovarian reserve",
  "Endometriosis",
  "PCOS",
  "Male factor",
  "Tubal factor",
  "Other",
];
export const COUNTRIES = ["Spain", "Portugal", "Germany", "UK", "Czech Republic", "Greece", "Other"];

// ---- localStorage helper ----
const ASSESSMENT_KEY = "fertility_assessment";
const UNLOCK_KEY = "crowdsourcing_unlocked";
const SUBMITTED_KEY = "quote_submitted";

export const storage = {
  loadAssessment(): AssessmentData | null {
    try {
      const raw = localStorage.getItem(ASSESSMENT_KEY);
      return raw ? (JSON.parse(raw) as AssessmentData) : null;
    } catch {
      return null;
    }
  },
  saveAssessment(data: AssessmentData) {
    localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
  },
  isUnlocked() {
    return localStorage.getItem(UNLOCK_KEY) === "true";
  },
  unlock() {
    localStorage.setItem(UNLOCK_KEY, "true");
  },
  hasSubmitted() {
    return localStorage.getItem(SUBMITTED_KEY) === "true";
  },
  markSubmitted() {
    localStorage.setItem(SUBMITTED_KEY, "true");
  },
};

// Re-export BudgetRange explicitly for convenience
export type { BudgetRange };
