import { z } from "zod";

export const TREATMENT_TYPES = ["IVF", "Egg Donation", "Social Freezing", "ICSI", "Other"] as const;
export type TreatmentType = (typeof TREATMENT_TYPES)[number];

export const TARGET_FIELDS = [
  { key: "clinic_name", label: "Clinic name", required: true },
  { key: "country", label: "Country", required: true },
  { key: "treatment_type", label: "Treatment type", required: true },
  { key: "base_price", label: "Base price (€)", required: true },
  { key: "medication_cost", label: "Medication (€)", required: false },
  { key: "extras_cost", label: "Extras (€)", required: false },
  { key: "date_received", label: "Date received", required: false },
  { key: "notes", label: "Notes", required: false },
] as const;

export type TargetKey = (typeof TARGET_FIELDS)[number]["key"];

// Synonyms (lowercase, no accents) → field key
const SYNONYMS: Record<TargetKey, string[]> = {
  clinic_name: ["clinic", "clinic name", "clinica", "clínica", "centro", "nombre clinica", "nombre de la clinica", "provider"],
  country: ["country", "pais", "país", "nacion"],
  treatment_type: ["treatment", "treatment type", "tratamiento", "tipo tratamiento", "tipo de tratamiento", "procedure"],
  base_price: ["base price", "base", "precio base", "precio", "price", "coste base", "tarifa", "fee"],
  medication_cost: ["medication", "medication cost", "meds", "medicacion", "medicación", "coste medicacion"],
  extras_cost: ["extras", "extras cost", "extras_cost", "addons", "add-ons", "extra", "additional", "coste extras"],
  date_received: ["date", "date received", "fecha", "fecha cotizacion", "quote date"],
  notes: ["notes", "comment", "comments", "notas", "observaciones", "comentario"],
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export function autoMapColumns(headers: string[]): Record<TargetKey, string | null> {
  const result = {} as Record<TargetKey, string | null>;
  const used = new Set<string>();
  for (const { key } of TARGET_FIELDS) {
    const syns = SYNONYMS[key];
    let match: string | null = null;
    // exact synonym match first
    for (const h of headers) {
      if (used.has(h)) continue;
      if (syns.includes(norm(h))) { match = h; break; }
    }
    // fallback: contains
    if (!match) {
      for (const h of headers) {
        if (used.has(h)) continue;
        const nh = norm(h);
        if (syns.some((s) => nh.includes(s) || s.includes(nh))) { match = h; break; }
      }
    }
    if (match) used.add(match);
    result[key] = match;
  }
  return result;
}

const COUNTRY_ALIASES: Record<string, string> = {
  spain: "Spain", españa: "Spain", espana: "Spain", es: "Spain",
  portugal: "Portugal", pt: "Portugal",
  "czech republic": "Czech Republic", czechia: "Czech Republic", chequia: "Czech Republic", cz: "Czech Republic",
  greece: "Greece", grecia: "Greece", gr: "Greece",
  "united kingdom": "UK", uk: "UK", "reino unido": "UK", "great britain": "UK",
  germany: "Germany", alemania: "Germany", de: "Germany",
  france: "France", francia: "France", fr: "France",
  italy: "Italy", italia: "Italy", it: "Italy",
};

const TREATMENT_ALIASES: Record<string, TreatmentType> = {
  ivf: "IVF", fiv: "IVF", "in vitro": "IVF",
  "egg donation": "Egg Donation", "ovodonacion": "Egg Donation", "ovodonación": "Egg Donation", "donacion ovulos": "Egg Donation", "ovule donation": "Egg Donation",
  "social freezing": "Social Freezing", "freezing": "Social Freezing", "vitrificacion": "Social Freezing", "vitrificación": "Social Freezing", "egg freezing": "Social Freezing",
  icsi: "ICSI",
  other: "Other", otro: "Other",
};

const parseNumber = (raw: unknown): number | null => {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") return Math.round(raw);
  let s = String(raw).trim().replace(/[€$£\s]/g, "");
  // handle "1.234,56" (eu) vs "1,234.56" (us)
  if (s.includes(",") && s.includes(".")) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
};

const parseDate = (raw: unknown): string | null => {
  if (!raw) return null;
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  if (typeof raw === "number") {
    // Excel serial date
    const d = new Date(Date.UTC(1899, 11, 30) + raw * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(raw).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
};

export const quoteSchema = z.object({
  clinic_name: z.string().trim().min(1, "Clinic required").max(200),
  country: z.string().trim().min(1, "Country required").max(80),
  treatment_type: z.enum(TREATMENT_TYPES, { errorMap: () => ({ message: "Invalid treatment" }) }),
  base_price: z.number().int().min(100, "Base price too low (≥100)").max(100000, "Base price too high (≤100k)"),
  medication_cost: z.number().int().min(0).max(50000),
  extras_cost: z.number().int().min(0).max(50000),
  date_received: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type ValidatedQuote = z.infer<typeof quoteSchema>;

export type RowOutcome =
  | { ok: true; index: number; data: ValidatedQuote }
  | { ok: false; index: number; errors: string[]; raw: Record<string, unknown> };

export function transformRow(raw: Record<string, unknown>, mapping: Record<TargetKey, string | null>, index: number): RowOutcome {
  const get = (k: TargetKey) => (mapping[k] ? raw[mapping[k] as string] : undefined);

  const countryRaw = String(get("country") ?? "").trim();
  const country = COUNTRY_ALIASES[norm(countryRaw)] ?? countryRaw;

  const trtRaw = String(get("treatment_type") ?? "").trim();
  const treatment_type = TREATMENT_ALIASES[norm(trtRaw)] ?? (trtRaw as TreatmentType);

  const candidate = {
    clinic_name: String(get("clinic_name") ?? "").trim(),
    country,
    treatment_type,
    base_price: parseNumber(get("base_price")) ?? NaN,
    medication_cost: parseNumber(get("medication_cost")) ?? 0,
    extras_cost: parseNumber(get("extras_cost")) ?? 0,
    date_received: parseDate(get("date_received")),
    notes: get("notes") ? String(get("notes")).slice(0, 500) : null,
  };

  const parsed = quoteSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      index,
      raw,
      errors: parsed.error.issues.map((i) => `${i.path.join(".") || "row"}: ${i.message}`),
    };
  }
  return { ok: true, index, data: parsed.data };
}
