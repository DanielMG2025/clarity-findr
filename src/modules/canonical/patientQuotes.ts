/**
 * Canonical patient-quotes layer — the shared "opacity" vocabulary.
 *
 * `user_submitted_quotes` holds individual patient-held price quotes, so its
 * precise canonical home is the sibling project's `patient_quotes` (distinct
 * from aggregated/published `price_records`). ./pricing.ts also maps these
 * rows to a PriceRecord as a convenience; both lenses coexist.
 *
 * Pure adapter: row in → canonical record out, no I/O. The database is
 * unchanged and existing consumers are untouched. The community_* and
 * matches tables are Fertility-specific and have NO canonical counterpart in
 * the sibling model, so they are intentionally not mapped.
 */
import {
  canonicalProcedureId,
  type AlcanceDeclarado,
  type UserSubmittedQuoteRow,
} from "./pricing";

export type { UserSubmittedQuoteRow };

export interface PatientQuote {
  id: string;
  procedure_id: string; // from treatment_type
  clinic_name_as_typed: string; // from clinic_name
  jurisdiction: string | null; // from country
  amount: number | null; // from total_price
  currency: string; // "EUR"
  alcance_declarado: AlcanceDeclarado; // "no_especificado"
  iva_declarado: boolean; // false
  date_received: string | null;
  consented_at: string | null; // not tracked in our table → null
  notes: string | null;
}

export function userQuoteToPatientQuote(row: UserSubmittedQuoteRow): PatientQuote {
  return {
    id: row.id,
    procedure_id: canonicalProcedureId(row.treatment_type),
    clinic_name_as_typed: row.clinic_name,
    jurisdiction: row.country ?? null,
    amount: row.total_price,
    currency: "EUR",
    alcance_declarado: "no_especificado",
    iva_declarado: false,
    date_received: row.date_received,
    consented_at: null,
    notes: row.notes,
  };
}
