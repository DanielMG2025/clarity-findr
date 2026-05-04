import type { ReactNode } from "react";

/**
 * Centralized explainer content for the SideInfo system.
 * Single source of truth for treatments, components and pricing terminology
 * used across the app (configurator, profile, clinics, services).
 */

export type SideInfoKind = "treatment" | "component" | "pricing";

export interface SideInfoEntry {
  term: string;
  kind: SideInfoKind;
  what: string;
  when?: string;
  priceImpact?: string;
}

export const SIDE_INFO: Record<string, SideInfoEntry> = {
  // --- Treatments ---
  ivf: {
    term: "IVF",
    kind: "treatment",
    what: "In-vitro fertilization. Eggs are retrieved, fertilized in the lab and the resulting embryo is transferred.",
    when: "Most common option after 1+ year trying, tubal factor or unexplained infertility.",
    priceImpact: "Base cycle: €4,500–€7,000 in Spain (excluding medication).",
  },
  icsi: {
    term: "ICSI",
    kind: "treatment",
    what: "A variation of IVF where a single sperm is injected into each egg.",
    when: "Used for male-factor infertility or after a previous IVF with poor fertilization.",
    priceImpact: "Adds roughly €800–€1,500 on top of a base IVF cycle.",
  },
  donor: {
    term: "Egg donation",
    kind: "treatment",
    what: "Treatment using eggs from a donor, often chosen when ovarian reserve is very low.",
    when: "Recommended after 42, very low AMH, or repeated IVF failures.",
    priceImpact: "Typically €6,500–€10,500 in Spain — donor compensation is included.",
  },
  freezing: {
    term: "Egg freezing",
    kind: "treatment",
    what: "Stimulation + retrieval, then vitrification of mature eggs for future use.",
    when: "Fertility preservation before treatment, age-related, or by personal choice.",
    priceImpact: "€2,500–€4,000 per cycle + €250–€450/year of storage.",
  },
  iui: {
    term: "IUI",
    kind: "treatment",
    what: "Intrauterine insemination — prepared sperm is placed directly in the uterus.",
    when: "Mild male factor, unexplained infertility, single women or same-sex couples.",
    priceImpact: "€600–€1,500 per attempt; success per cycle is lower than IVF.",
  },
  study: {
    term: "Initial workup",
    kind: "treatment",
    what: "Full diagnostic panel: hormones, ultrasound, semen analysis, sometimes genetic tests.",
    when: "Always recommended before deciding on a treatment plan.",
    priceImpact: "€200–€600 depending on the clinic and which tests are included.",
  },

  // --- Components ---
  pgt_a: {
    term: "PGT-A",
    kind: "component",
    what: "Pre-implantation genetic testing for chromosomal abnormalities in embryos.",
    when: "Often considered after 38, recurrent miscarriage or failed transfers.",
    priceImpact: "€2,000–€3,500 per cycle, depending on number of embryos tested.",
  },
  vitrification: {
    term: "Vitrification",
    kind: "component",
    what: "Flash-freezing of eggs or embryos so they can be used in future cycles.",
    when: "Standard for any egg-freezing cycle and for surplus embryos after IVF.",
    priceImpact: "€400–€700 per batch + €250–€450/year of storage.",
  },
  medication: {
    term: "Medication",
    kind: "component",
    what: "Hormonal stimulation drugs needed before egg retrieval.",
    when: "Required for IVF, ICSI and egg freezing cycles.",
    priceImpact: "€1,000–€2,800 — almost never included in the headline price.",
  },
  monitoring: {
    term: "Monitoring",
    kind: "component",
    what: "Ultrasounds and blood tests during stimulation to adjust the dose.",
    when: "Throughout every stimulation cycle.",
    priceImpact: "€300–€600 if billed separately.",
  },
  storage: {
    term: "Storage",
    kind: "component",
    what: "Yearly fee for keeping eggs or embryos frozen.",
    when: "After any vitrification when you don't transfer immediately.",
    priceImpact: "€250–€450 per year, billed annually.",
  },

  // --- Pricing concepts ---
  guarantee: {
    term: "Guarantee program",
    kind: "pricing",
    what: "A package that includes multiple cycles with a partial refund if no live birth.",
    when: "Considered after 38, low ovarian reserve, or for budget predictability.",
    priceImpact: "Higher upfront (typically €12,000–€18,000) but capped total exposure.",
  },
  normalized_price: {
    term: "Normalized price",
    kind: "pricing",
    what: "The total price you can actually expect, with medication and add-ons included.",
    when: "Use it to compare clinics fairly — headline prices often hide costs.",
    priceImpact: "Usually 30–60% above the published 'from' price.",
  },
  hidden_costs: {
    term: "Hidden costs",
    kind: "pricing",
    what: "Items rarely shown on quotes: medication, monitoring, second transfers, storage.",
    when: "Always ask the clinic to itemize these before signing.",
    priceImpact: "Can double the published price in some cases.",
  },
};

export function getSideInfo(key: keyof typeof SIDE_INFO): SideInfoEntry {
  return SIDE_INFO[key];
}

export type SideInfoKey = keyof typeof SIDE_INFO;
