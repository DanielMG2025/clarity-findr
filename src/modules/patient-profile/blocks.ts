import type { ProfileState } from "@/modules/profile/store";
import type { PatientProfileState } from "./store";
import { User2, Stethoscope, History, SlidersHorizontal, FileText, Receipt, type LucideIcon } from "lucide-react";

export type BlockKey = "basic" | "medical" | "history" | "preferences" | "documents" | "quotes";

export interface BlockMeta {
  key: BlockKey;
  title: string;
  subtitle: string;
  required: boolean;
  icon: LucideIcon;
  unlocks: string[];
  weight: number;
}

export const BLOCKS: BlockMeta[] = [
  {
    key: "basic",
    title: "Basic info",
    subtitle: "Age, country, treatment of interest, budget.",
    required: true,
    icon: User2,
    unlocks: ["Pricing estimate", "Clinic shortlist"],
    weight: 25,
  },
  {
    key: "medical",
    title: "Medical context",
    subtitle: "AMH, FSH, AFC, BMI, cycle regularity, diagnosis.",
    required: false,
    icon: Stethoscope,
    unlocks: ["Higher confidence pricing", "Personalised success indicators"],
    weight: 20,
  },
  {
    key: "history",
    title: "Treatment history",
    subtitle: "Past cycles, outcomes and clinics.",
    required: false,
    icon: History,
    unlocks: ["Avoid repeating ineffective protocols", "Better matching"],
    weight: 15,
  },
  {
    key: "preferences",
    title: "Preferences",
    subtitle: "Priorities, travel openness, language, donor openness.",
    required: false,
    icon: SlidersHorizontal,
    unlocks: ["Personalised clinic ranking", "Why-you-see-this reasoning"],
    weight: 15,
  },
  {
    key: "documents",
    title: "Documents",
    subtitle: "Upload quotes, lab reports or summaries.",
    required: false,
    icon: FileText,
    unlocks: ["Automatic quote parsing", "Cross-clinic comparison"],
    weight: 10,
  },
  {
    key: "quotes",
    title: "Shared quotes",
    subtitle: "Add real prices you've received from clinics.",
    required: false,
    icon: Receipt,
    unlocks: ["Crowd-validated pricing", "Helps other patients"],
    weight: 15,
  },
];

export function basicCompleted(p: ProfileState): boolean {
  return !!(p.age && p.treatment && p.country && p.budget);
}

export function medicalCompleted(m: PatientProfileState["medical"]): boolean {
  return Object.values(m).some((v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true));
}

export function blockProgress(
  key: BlockKey,
  profile: ProfileState,
  pp: PatientProfileState,
): number {
  switch (key) {
    case "basic": {
      const fields = [profile.age, profile.treatment, profile.country, profile.budget, profile.trying];
      const filled = fields.filter((x) => x !== "" && x !== undefined && x !== null && x !== 0).length;
      return Math.round((filled / fields.length) * 100);
    }
    case "medical": {
      const m = pp.medical;
      const fields = [m.amh, m.fsh, m.afc, m.bmi_band, m.cycle_regularity, m.diagnosis?.length, m.partner_sperm_quality];
      const filled = fields.filter((x) => x !== undefined && x !== 0).length;
      return Math.round((filled / fields.length) * 100);
    }
    case "history":
      return pp.history.length === 0 ? 0 : Math.min(100, pp.history.length * 50);
    case "preferences": {
      const p = pp.preferences;
      const fields = [p.priority, p.travel, p.language, p.donor_openness, p.pgt_interest];
      const filled = fields.filter((x) => x !== undefined && x !== "").length;
      return Math.round((filled / fields.length) * 100);
    }
    case "documents":
      return pp.documents.length === 0 ? 0 : Math.min(100, pp.documents.length * 50);
    case "quotes":
      return pp.sharedQuotes.length === 0 ? 0 : Math.min(100, pp.sharedQuotes.length * 50);
  }
}

export function overallCompletion(profile: ProfileState, pp: PatientProfileState): number {
  const total = BLOCKS.reduce((sum, b) => sum + (blockProgress(b.key, profile, pp) / 100) * b.weight, 0);
  return Math.round(total);
}

export type Confidence = "low" | "medium" | "high";

export function profileConfidence(score: number): Confidence {
  if (score >= 70) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export interface UnlockedFeature {
  id: string;
  label: string;
  description: string;
  threshold: number;
}

export const FEATURES: UnlockedFeature[] = [
  { id: "pricing", label: "Pricing estimate", description: "See indicative cost ranges across scenarios.", threshold: 15 },
  { id: "matching", label: "Clinic matching", description: "Personalised clinic shortlist with ranking.", threshold: 25 },
  { id: "high_confidence", label: "High-confidence pricing", description: "Tighter ranges and better tier matching.", threshold: 50 },
  { id: "personalised_ranking", label: "Personalised ranking", description: "Reasoning takes preferences into account.", threshold: 60 },
  { id: "concierge", label: "Concierge handoff", description: "Skip the queue with a complete profile.", threshold: 80 },
];
