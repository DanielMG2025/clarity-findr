import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  emptyRecord,
  type MasterPatientRecord,
  type Identity,
  type Intent,
  type Clinical,
  type Derived,
  type HistoryItem,
  type ProfileDocument,
  type SharedQuote,
} from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

export interface MasterRecordStore extends MasterPatientRecord {
  patchIdentity: (p: Partial<Identity>) => void;
  patchIntent: (p: Partial<Intent>) => void;
  patchClinical: (p: Partial<Clinical>) => void;
  patchDerived: (p: Partial<Derived>) => void;
  addHistory: (h: Omit<HistoryItem, "id">) => void;
  removeHistory: (id: string) => void;
  addDocument: (d: Omit<ProfileDocument, "id" | "added_at">) => void;
  removeDocument: (id: string) => void;
  addSharedQuote: (q: Omit<SharedQuote, "id" | "added_at">) => void;
  removeSharedQuote: (id: string) => void;
  reset: () => void;
}

/**
 * The single Master Patient Record store — the source of truth for the whole
 * patient journey. Replaces the legacy profile / patient-profile / pricing stores.
 */
export const useMasterRecord = create<MasterRecordStore>()(
  persist(
    (set) => ({
      ...emptyRecord(),
      patchIdentity: (p) => set((s) => ({ identity: { ...s.identity, ...p } })),
      patchIntent: (p) => set((s) => ({ intent: { ...s.intent, ...p } })),
      patchClinical: (p) => set((s) => ({ clinical: { ...s.clinical, ...p } })),
      patchDerived: (p) => set((s) => ({ derived: { ...s.derived, ...p } })),
      addHistory: (h) => set((s) => ({ history: [...s.history, { ...h, id: uid() }] })),
      removeHistory: (id) => set((s) => ({ history: s.history.filter((x) => x.id !== id) })),
      addDocument: (d) =>
        set((s) => ({ documents: [...s.documents, { ...d, id: uid(), added_at: new Date().toISOString() }] })),
      removeDocument: (id) => set((s) => ({ documents: s.documents.filter((x) => x.id !== id) })),
      addSharedQuote: (q) =>
        set((s) => ({ shared_quotes: [...s.shared_quotes, { ...q, id: uid(), added_at: new Date().toISOString() }] })),
      removeSharedQuote: (id) => set((s) => ({ shared_quotes: s.shared_quotes.filter((x) => x.id !== id) })),
      reset: () => set({ ...emptyRecord() }),
    }),
    { name: "fc:mpr", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
