/**
 * Canonical pricing layer — the shared "opacity" vocabulary.
 *
 * This module expresses our existing pricing tables (aggregated_pricing,
 * scraped_pricing, user_submitted_quotes) in the canonical PriceRecord +
 * PriceComponent shape used by the sibling aesthetic project (whose DB has
 * price_records + price_components). It does so through PURE adapter
 * functions: row in → canonical record out, no I/O.
 *
 * - The database is unchanged: no schema change, no data migration.
 * - Existing pricing consumers (PricingLab, reports, admin dashboards…) are
 *   untouched and do not import this module.
 * - Migrating consumers onto this layer, and later the DB itself, are
 *   deliberate follow-up steps.
 */

export type AlcanceDeclarado = "todo_incluido" | "solo_honorarios" | "no_especificado";
export type UnitModel = "per_procedure" | "per_cycle" | "per_graft" | "per_session" | "per_area";
export type PriceConfidence = "high" | "medium" | "low";

export interface PriceComponent {
  component_name: string;
  amount: number | null;
  is_included: boolean;
  note?: string | null;
}

export interface PriceRecord {
  id: string;
  procedure_id: string; // from treatment_type
  jurisdiction: string | null; // country where available
  centre_id: string | null; // null for now (no centres table yet)
  centre_name: string | null; // carried from clinic_name until centres exist
  amount_min: number | null;
  amount_max: number | null;
  currency: string; // default "EUR"
  alcance_declarado: AlcanceDeclarado;
  iva_declarado: boolean;
  iva_rate: number | null;
  unit_model: UnitModel;
  source_name: string;
  source_url: string | null;
  captured_at: string | null; // ISO date/datetime
  confidence: PriceConfidence;
  note: string | null;
  components: PriceComponent[];
}

/* ---------- Row input types (mirror existing table columns) ---------- */

export interface AggregatedPricingRow {
  id: string;
  clinic_name: string;
  treatment_type: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  sample_size: number | null;
  updated_at: string;
  price_volatility: number;
}

export interface ScrapedPricingRow {
  id: string;
  clinic_name: string;
  treatment_type: string;
  scraped_price: number;
  currency: string | null;
  source_url: string;
  source_domain: string | null;
  parse_confidence: number;
  scraped_at: string;
  notes: string | null;
  raw_text: string | null;
  raw_price: number | null;
  pricing_type: string;
  detected_keywords: string[];
  base_price: number | null;
  medication_estimate: number | null;
  extras_estimate: number | null;
  normalization_rule: string | null;
  country: string | null;
}

export interface UserSubmittedQuoteRow {
  id: string;
  clinic_name: string;
  country: string | null;
  treatment_type: string;
  base_price: number | null;
  medication_cost: number | null;
  extras_cost: number | null;
  total_price: number | null;
  date_received: string | null;
  notes: string | null;
  created_at: string;
  user_id: string | null;
  is_verified: boolean;
}

/**
 * TODO seam: identity for now. Later this maps our free-text
 * treatment_type values onto the shared canonical procedures vocabulary.
 */
export function canonicalProcedureId(treatment_type: string): string {
  return treatment_type;
}

function components(
  base: number | null | undefined,
  medication: number | null | undefined,
  extras: number | null | undefined,
): PriceComponent[] {
  const out: PriceComponent[] = [];
  if (base != null) out.push({ component_name: "base", amount: base, is_included: true });
  if (medication != null) out.push({ component_name: "medication", amount: medication, is_included: false });
  if (extras != null) out.push({ component_name: "extras", amount: extras, is_included: false });
  return out;
}

export function aggregatedToPriceRecord(row: AggregatedPricingRow): PriceRecord {
  return {
    id: row.id,
    procedure_id: canonicalProcedureId(row.treatment_type),
    jurisdiction: null,
    centre_id: null,
    centre_name: row.clinic_name,
    amount_min: row.min_price,
    amount_max: row.max_price,
    currency: "EUR",
    alcance_declarado: "no_especificado",
    iva_declarado: false,
    iva_rate: null,
    unit_model: "per_cycle",
    source_name: "aggregated",
    source_url: null,
    captured_at: row.updated_at,
    confidence: row.sample_size != null && row.sample_size >= 10 ? "medium" : "low",
    note: row.sample_size != null ? `n=${row.sample_size}` : null,
    components: [],
  };
}

export function scrapedToPriceRecord(row: ScrapedPricingRow): PriceRecord {
  const pc = row.parse_confidence;
  return {
    id: row.id,
    procedure_id: canonicalProcedureId(row.treatment_type),
    jurisdiction: row.country ?? null,
    centre_id: null,
    centre_name: row.clinic_name,
    amount_min: row.base_price ?? row.scraped_price,
    amount_max: row.scraped_price,
    currency: row.currency ?? "EUR",
    alcance_declarado: "no_especificado",
    iva_declarado: false,
    iva_rate: null,
    unit_model: "per_cycle",
    source_name: row.source_domain ?? "scraped",
    source_url: row.source_url,
    captured_at: row.scraped_at,
    confidence: pc >= 0.8 ? "high" : pc >= 0.5 ? "medium" : "low",
    note: row.notes,
    components: components(row.base_price, row.medication_estimate, row.extras_estimate),
  };
}

export function userQuoteToPriceRecord(row: UserSubmittedQuoteRow): PriceRecord {
  return {
    id: row.id,
    procedure_id: canonicalProcedureId(row.treatment_type),
    jurisdiction: row.country ?? null,
    centre_id: null,
    centre_name: row.clinic_name,
    amount_min: row.total_price,
    amount_max: row.total_price,
    currency: "EUR",
    alcance_declarado: "no_especificado",
    iva_declarado: false,
    iva_rate: null,
    unit_model: "per_cycle",
    source_name: "patient-submitted",
    source_url: null,
    captured_at: row.date_received,
    confidence: row.is_verified ? "high" : "low",
    note: row.notes,
    components: components(row.base_price, row.medication_cost, row.extras_cost),
  };
}
