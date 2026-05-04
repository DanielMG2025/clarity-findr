import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface MedicalContext {
  amh?: number;
  fsh?: number;
  afc?: number;
  bmi_band?: "under" | "normal" | "over" | "obese";
  cycle_regularity?: "regular" | "irregular" | "absent";
  diagnosis?: string[];
  partner_sperm_quality?: "normal" | "mild" | "severe" | "unknown";
}

export interface TreatmentHistoryItem {
  id: string;
  treatment: string;
  year?: number;
  clinic?: string;
  outcome?: "none" | "chemical" | "miscarriage" | "live_birth";
  notes?: string;
}

export interface ProfilePreferences {
  priority?: "cost" | "success" | "speed" | "balanced";
  travel?: "home_only" | "regional" | "europe" | "global";
  language?: string;
  donor_openness?: "no" | "maybe" | "yes";
  pgt_interest?: boolean;
}

export interface ProfileDocument {
  id: string;
  name: string;
  category: "quote" | "lab" | "report" | "other";
  size?: number;
  added_at: string;
}

export interface SharedQuote {
  id: string;
  clinic_name: string;
  treatment_type: string;
  total_price: number;
  country?: string;
  added_at: string;
}

export interface PatientProfileState {
  medical: MedicalContext;
  history: TreatmentHistoryItem[];
  preferences: ProfilePreferences;
  documents: ProfileDocument[];
  sharedQuotes: SharedQuote[];
  patchMedical: (m: Partial<MedicalContext>) => void;
  patchPreferences: (p: Partial<ProfilePreferences>) => void;
  addHistory: (h: Omit<TreatmentHistoryItem, "id">) => void;
  removeHistory: (id: string) => void;
  addDocument: (d: Omit<ProfileDocument, "id" | "added_at">) => void;
  removeDocument: (id: string) => void;
  addSharedQuote: (q: Omit<SharedQuote, "id" | "added_at">) => void;
  removeSharedQuote: (id: string) => void;
  reset: () => void;
}

const DEFAULTS = {
  medical: {} as MedicalContext,
  history: [] as TreatmentHistoryItem[],
  preferences: {} as ProfilePreferences,
  documents: [] as ProfileDocument[],
  sharedQuotes: [] as SharedQuote[],
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const usePatientProfileStore = create<PatientProfileState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      patchMedical: (m) => set((s) => ({ medical: { ...s.medical, ...m } })),
      patchPreferences: (p) => set((s) => ({ preferences: { ...s.preferences, ...p } })),
      addHistory: (h) => set((s) => ({ history: [...s.history, { ...h, id: uid() }] })),
      removeHistory: (id) => set((s) => ({ history: s.history.filter((x) => x.id !== id) })),
      addDocument: (d) =>
        set((s) => ({ documents: [...s.documents, { ...d, id: uid(), added_at: new Date().toISOString() }] })),
      removeDocument: (id) => set((s) => ({ documents: s.documents.filter((x) => x.id !== id) })),
      addSharedQuote: (q) =>
        set((s) => ({ sharedQuotes: [...s.sharedQuotes, { ...q, id: uid(), added_at: new Date().toISOString() }] })),
      removeSharedQuote: (id) => set((s) => ({ sharedQuotes: s.sharedQuotes.filter((x) => x.id !== id) })),
      reset: () => set({ ...DEFAULTS }),
    }),
    { name: "fc:patient-profile", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
