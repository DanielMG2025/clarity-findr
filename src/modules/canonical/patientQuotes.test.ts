import { describe, it, expect } from "vitest";
import { userQuoteToPatientQuote, type UserSubmittedQuoteRow } from "./patientQuotes";

const row: UserSubmittedQuoteRow = {
  id: "q1", clinic_name: "Clínica X (as typed)", country: "Spain", treatment_type: "ivf",
  base_price: 4500, medication_cost: 1200, extras_cost: 300, total_price: 6000,
  date_received: "2026-08-20", notes: "quote by email", created_at: "2026-08-21T00:00:00Z",
  user_id: null, is_verified: false,
};

describe("userQuoteToPatientQuote", () => {
  it("maps a quote row to the canonical PatientQuote", () => {
    expect(userQuoteToPatientQuote(row)).toEqual({
      id: "q1", procedure_id: "ivf", clinic_name_as_typed: "Clínica X (as typed)",
      jurisdiction: "Spain", amount: 6000, currency: "EUR",
      alcance_declarado: "no_especificado", iva_declarado: false,
      date_received: "2026-08-20", consented_at: null, notes: "quote by email",
    });
  });

  it("handles null country, date and notes", () => {
    const q = userQuoteToPatientQuote({ ...row, country: null, date_received: null, notes: null });
    expect(q.jurisdiction).toBeNull();
    expect(q.date_received).toBeNull();
    expect(q.notes).toBeNull();
    expect(q.consented_at).toBeNull();
  });
});
