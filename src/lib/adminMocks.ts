// Centralized seeded mock data for the admin shell.
// Used everywhere a real Supabase table doesn't exist yet.
// Numbers are demo-realistic and internally consistent across tabs.

// ---------- Patients ----------
export type FunnelStage = "free_discovery" | "intent_decision" | "full_access" | "advanced" | "premium_referral";
export type PatientStatus = "active" | "dormant" | "converted" | "lost";

export interface AdminPatient {
  ref: string; // anonymized
  age: number;
  country: string;
  treatment: string;
  budget_band: string;
  funnel_stage: FunnelStage;
  status: PatientStatus;
  match_score: number;          // 0-100
  conversion_probability: number; // 0-100
  modules: { advanced: boolean; genetic: boolean; home_kit: boolean };
  spent_eur: number;            // cumulative patient spend
  joined_days_ago: number;
}

export const FUNNEL_LABEL: Record<FunnelStage, string> = {
  free_discovery: "Free discovery",
  intent_decision: "Intent decision",
  full_access: "Full access",
  advanced: "Advanced matching",
  premium_referral: "Premium referral",
};

export const PATIENTS: AdminPatient[] = [
  { ref: "P-2041", age: 34, country: "Spain", treatment: "IVF", budget_band: "€5–8k", funnel_stage: "premium_referral", status: "converted", match_score: 92, conversion_probability: 78, modules: { advanced: true, genetic: true, home_kit: false }, spent_eur: 19, joined_days_ago: 2 },
  { ref: "P-2039", age: 38, country: "France", treatment: "Egg Donation", budget_band: "€8–12k", funnel_stage: "advanced", status: "active", match_score: 88, conversion_probability: 71, modules: { advanced: true, genetic: false, home_kit: true }, spent_eur: 19, joined_days_ago: 4 },
  { ref: "P-2037", age: 31, country: "Spain", treatment: "Social Freezing", budget_band: "€3–5k", funnel_stage: "full_access", status: "active", match_score: 81, conversion_probability: 54, modules: { advanced: false, genetic: false, home_kit: false }, spent_eur: 19, joined_days_ago: 6 },
  { ref: "P-2035", age: 29, country: "Portugal", treatment: "IVF", budget_band: "<€5k", funnel_stage: "intent_decision", status: "active", match_score: 73, conversion_probability: 42, modules: { advanced: false, genetic: false, home_kit: false }, spent_eur: 0, joined_days_ago: 1 },
  { ref: "P-2032", age: 41, country: "UK", treatment: "IVF", budget_band: "€8–12k", funnel_stage: "premium_referral", status: "active", match_score: 76, conversion_probability: 48, modules: { advanced: true, genetic: false, home_kit: false }, spent_eur: 49, joined_days_ago: 3 },
  { ref: "P-2028", age: 29, country: "Portugal", treatment: "IVF", budget_band: "<€5k", funnel_stage: "full_access", status: "lost", match_score: 64, conversion_probability: 22, modules: { advanced: false, genetic: false, home_kit: false }, spent_eur: 7, joined_days_ago: 12 },
  { ref: "P-2024", age: 36, country: "Spain", treatment: "ICSI", budget_band: "€5–8k", funnel_stage: "advanced", status: "converted", match_score: 84, conversion_probability: 62, modules: { advanced: true, genetic: true, home_kit: false }, spent_eur: 19, joined_days_ago: 8 },
  { ref: "P-2018", age: 33, country: "Germany", treatment: "IVF", budget_band: "€5–8k", funnel_stage: "intent_decision", status: "dormant", match_score: 70, conversion_probability: 35, modules: { advanced: false, genetic: false, home_kit: false }, spent_eur: 0, joined_days_ago: 21 },
  { ref: "P-2011", age: 39, country: "Spain", treatment: "Egg Donation", budget_band: "€8–12k", funnel_stage: "free_discovery", status: "active", match_score: 0, conversion_probability: 0, modules: { advanced: false, genetic: false, home_kit: false }, spent_eur: 0, joined_days_ago: 0 },
  { ref: "P-1998", age: 27, country: "Spain", treatment: "Social Freezing", budget_band: "€3–5k", funnel_stage: "premium_referral", status: "converted", match_score: 89, conversion_probability: 70, modules: { advanced: true, genetic: false, home_kit: true }, spent_eur: 49, joined_days_ago: 11 },
  { ref: "P-1995", age: 42, country: "Italy", treatment: "Egg Donation", budget_band: "€8–12k", funnel_stage: "advanced", status: "active", match_score: 79, conversion_probability: 55, modules: { advanced: true, genetic: true, home_kit: true }, spent_eur: 19, joined_days_ago: 5 },
  { ref: "P-1989", age: 35, country: "Spain", treatment: "IVF", budget_band: "€5–8k", funnel_stage: "free_discovery", status: "active", match_score: 0, conversion_probability: 0, modules: { advanced: false, genetic: false, home_kit: false }, spent_eur: 0, joined_days_ago: 0 },
];

// ---------- Clinic subscriptions / monetization ----------
export type SubscriptionTier = "starter" | "growth" | "elite" | "per_lead";

export interface ClinicSubscription {
  clinic_name: string;
  city: string;
  country: string;
  tier: SubscriptionTier;
  mrr_eur: number;          // 0 for per_lead
  leads_mtd: number;
  consultations_mtd: number;
  status: "active" | "trial" | "paused";
  joined_months_ago: number;
}

export const TIER_LABEL: Record<SubscriptionTier, string> = {
  starter: "Starter · €200/mo",
  growth: "Growth · €499/mo",
  elite: "Elite · €1,000/mo",
  per_lead: "Per-lead",
};

export const CLINIC_SUBSCRIPTIONS: ClinicSubscription[] = [
  { clinic_name: "Clínica Demo Madrid", city: "Madrid", country: "Spain", tier: "growth", mrr_eur: 499, leads_mtd: 24, consultations_mtd: 9, status: "active", joined_months_ago: 7 },
  { clinic_name: "IVI Barcelona", city: "Barcelona", country: "Spain", tier: "elite", mrr_eur: 1000, leads_mtd: 41, consultations_mtd: 17, status: "active", joined_months_ago: 14 },
  { clinic_name: "Reproclinic", city: "Barcelona", country: "Spain", tier: "growth", mrr_eur: 499, leads_mtd: 19, consultations_mtd: 6, status: "active", joined_months_ago: 4 },
  { clinic_name: "Eugin Lisboa", city: "Lisbon", country: "Portugal", tier: "per_lead", mrr_eur: 0, leads_mtd: 12, consultations_mtd: 4, status: "active", joined_months_ago: 2 },
  { clinic_name: "Ginefiv Madrid", city: "Madrid", country: "Spain", tier: "starter", mrr_eur: 200, leads_mtd: 8, consultations_mtd: 2, status: "trial", joined_months_ago: 0 },
  { clinic_name: "Pronatal Praha", city: "Prague", country: "Czech Republic", tier: "growth", mrr_eur: 499, leads_mtd: 16, consultations_mtd: 5, status: "active", joined_months_ago: 3 },
  { clinic_name: "Embriogyn Tarragona", city: "Tarragona", country: "Spain", tier: "starter", mrr_eur: 200, leads_mtd: 6, consultations_mtd: 1, status: "paused", joined_months_ago: 9 },
];

// ---------- Partners ----------
export type PartnerType = "genetic" | "home_kit" | "financing" | "consultation";

export interface Partner {
  name: string;
  type: PartnerType;
  category_label: string;
  referrals_mtd: number;
  revenue_share_eur: number;     // commission paid to platform MTD
  conversion_rate: number;       // %
  status: "active" | "paused";
}

export const PARTNERS: Partner[] = [
  { name: "Igenomix",          type: "genetic",      category_label: "Genetic screening",      referrals_mtd: 38, revenue_share_eur: 1140, conversion_rate: 28, status: "active" },
  { name: "CooperGenomics",    type: "genetic",      category_label: "Genetic screening",      referrals_mtd: 22, revenue_share_eur: 660,  conversion_rate: 24, status: "active" },
  { name: "Hertility",         type: "home_kit",     category_label: "Home fertility tests",   referrals_mtd: 54, revenue_share_eur: 810,  conversion_rate: 41, status: "active" },
  { name: "Modern Fertility",  type: "home_kit",     category_label: "Home fertility tests",   referrals_mtd: 31, revenue_share_eur: 465,  conversion_rate: 37, status: "active" },
  { name: "Future Family",     type: "financing",    category_label: "Financing & insurance",  referrals_mtd: 17, revenue_share_eur: 1700, conversion_rate: 19, status: "active" },
  { name: "Carrot Fertility",  type: "financing",    category_label: "Financing & insurance",  referrals_mtd: 9,  revenue_share_eur: 900,  conversion_rate: 22, status: "paused" },
  { name: "Fertility Coach EU", type: "consultation", category_label: "Expert consultation",   referrals_mtd: 14, revenue_share_eur: 280,  conversion_rate: 51, status: "active" },
];

// ---------- Payments (patient unlocks & advanced) ----------
export type PaymentSource = "peek_unlock" | "full_unlock" | "advanced_module" | "premium_referral";

export interface Payment {
  id: string;
  patient_ref: string;
  amount_eur: number;
  source: PaymentSource;
  status: "captured" | "refunded";
  created_days_ago: number;
}

export const PAYMENT_SOURCE_LABEL: Record<PaymentSource, string> = {
  peek_unlock: "Peek unlock (€7)",
  full_unlock: "Full unlock (€19)",
  advanced_module: "Advanced module (€39)",
  premium_referral: "Premium referral (clinic-paid)",
};

export const PAYMENTS: Payment[] = [
  { id: "PAY-3041", patient_ref: "P-2041", amount_eur: 19, source: "full_unlock",     status: "captured", created_days_ago: 2 },
  { id: "PAY-3040", patient_ref: "P-2039", amount_eur: 19, source: "full_unlock",     status: "captured", created_days_ago: 4 },
  { id: "PAY-3038", patient_ref: "P-2037", amount_eur: 19, source: "full_unlock",     status: "captured", created_days_ago: 6 },
  { id: "PAY-3036", patient_ref: "P-2032", amount_eur: 19, source: "full_unlock",     status: "captured", created_days_ago: 3 },
  { id: "PAY-3035", patient_ref: "P-2032", amount_eur: 30, source: "advanced_module", status: "captured", created_days_ago: 3 },
  { id: "PAY-3033", patient_ref: "P-2028", amount_eur: 7,  source: "peek_unlock",     status: "captured", created_days_ago: 12 },
  { id: "PAY-3031", patient_ref: "P-2024", amount_eur: 19, source: "full_unlock",     status: "captured", created_days_ago: 8 },
  { id: "PAY-3028", patient_ref: "P-1998", amount_eur: 19, source: "full_unlock",     status: "captured", created_days_ago: 11 },
  { id: "PAY-3027", patient_ref: "P-1998", amount_eur: 30, source: "advanced_module", status: "captured", created_days_ago: 11 },
  { id: "PAY-3025", patient_ref: "P-1995", amount_eur: 19, source: "full_unlock",     status: "captured", created_days_ago: 5 },
];

// ---------- Leads (admin-wide, all clinics) ----------
export type LeadQuality = "high" | "medium" | "low";
export type LeadStatus = "new" | "contacted" | "consultation" | "lost";

export interface AdminLead {
  id: string;
  patient_ref: string;
  clinic_name: string;
  treatment: string;
  match_score: number;
  conversion_probability: number;
  quality: LeadQuality;
  status: LeadStatus;
  source: "free_referral" | "paid_unlock" | "premium_referral";
  fee_eur: number;            // what clinic pays for this lead
  received_days_ago: number;
}

export const LEADS: AdminLead[] = [
  { id: "L-2041", patient_ref: "P-2041", clinic_name: "IVI Barcelona",        treatment: "IVF",            match_score: 92, conversion_probability: 78, quality: "high",   status: "consultation", source: "premium_referral", fee_eur: 850, received_days_ago: 2 },
  { id: "L-2039", patient_ref: "P-2039", clinic_name: "Clínica Demo Madrid",  treatment: "Egg Donation",   match_score: 88, conversion_probability: 71, quality: "high",   status: "contacted",    source: "free_referral",    fee_eur: 220, received_days_ago: 4 },
  { id: "L-2037", patient_ref: "P-2037", clinic_name: "Reproclinic",          treatment: "Social Freezing", match_score: 81, conversion_probability: 54, quality: "medium", status: "consultation", source: "paid_unlock",      fee_eur: 180, received_days_ago: 6 },
  { id: "L-2032", patient_ref: "P-2032", clinic_name: "IVI Barcelona",        treatment: "IVF",            match_score: 76, conversion_probability: 48, quality: "medium", status: "new",          source: "premium_referral", fee_eur: 700, received_days_ago: 3 },
  { id: "L-2028", patient_ref: "P-2028", clinic_name: "Eugin Lisboa",         treatment: "IVF",            match_score: 64, conversion_probability: 22, quality: "low",    status: "lost",         source: "paid_unlock",      fee_eur: 150, received_days_ago: 12 },
  { id: "L-2024", patient_ref: "P-2024", clinic_name: "Clínica Demo Madrid",  treatment: "ICSI",           match_score: 84, conversion_probability: 62, quality: "high",   status: "consultation", source: "premium_referral", fee_eur: 600, received_days_ago: 8 },
  { id: "L-1998", patient_ref: "P-1998", clinic_name: "Pronatal Praha",       treatment: "Social Freezing", match_score: 89, conversion_probability: 70, quality: "high",   status: "contacted",    source: "premium_referral", fee_eur: 550, received_days_ago: 11 },
  { id: "L-1995", patient_ref: "P-1995", clinic_name: "IVI Barcelona",        treatment: "Egg Donation",   match_score: 79, conversion_probability: 55, quality: "medium", status: "new",          source: "free_referral",    fee_eur: 280, received_days_ago: 5 },
];

// ---------- Funnel (platform-wide, MTD) ----------
export const FUNNEL = [
  { stage: "Landing visit",      count: 12480 },
  { stage: "Free discovery",     count: 4210 },
  { stage: "Intent decision",    count: 1685 },
  { stage: "Full access (paid)", count: 612 },
  { stage: "Advanced matching",  count: 248 },
  { stage: "Premium referral",   count: 132 },
  { stage: "Consultation",       count: 71 },
];

// ---------- Time series (last 6 months) ----------
export const REVENUE_TIMESERIES = [
  { month: "Nov", patient: 2100, clinic_subs: 5800, partner: 4200 },
  { month: "Dec", patient: 2480, clinic_subs: 6300, partner: 4900 },
  { month: "Jan", patient: 2950, clinic_subs: 7100, partner: 5400 },
  { month: "Feb", patient: 3520, clinic_subs: 7400, partner: 5950 },
  { month: "Mar", patient: 4080, clinic_subs: 8200, partner: 6800 },
  { month: "Apr", patient: 4620, clinic_subs: 9500, partner: 7600 },
];

// ---------- Top-level platform KPIs ----------
export const PLATFORM_KPIS = {
  arpu_eur: 12.4,
  cac_eur: 4.8,
  ltv_to_cac: 6.2,
  monthly_active_patients: 4210,
  monthly_active_clinics: 38,
  partner_payouts_pct: 0.23, // share of partner revenue passed back as subsidy
  matching_accuracy_pct: 82,
};
