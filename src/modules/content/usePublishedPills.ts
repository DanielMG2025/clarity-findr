import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { sortedPills } from "./pills";
import type { Audience, Mold, Pill } from "./types";

export type PillRow = Tables<"pills">;

export function rowToPill(r: PillRow): Pill {
  const note = r.source_note_en || r.source_note_es
    ? { en: r.source_note_en ?? r.source_note_es ?? "", es: r.source_note_es ?? r.source_note_en ?? "" }
    : undefined;
  return {
    id: r.id,
    date: r.date,
    mold: r.mold as Mold,
    audiences: r.audiences as Audience[],
    title: { en: r.title_en, es: r.title_es },
    body: { en: r.body_en, es: r.body_es },
    source: {
      name: r.source_name,
      url: r.source_url ?? undefined,
      date: r.source_date ?? undefined,
      confidence: r.source_confidence as Pill["source"]["confidence"],
      note,
    },
  };
}

/** Published pills from the database, newest first. Falls back to the static seed on error or empty result. */
export function usePublishedPills(): Pill[] {
  const { data } = useQuery({
    queryKey: ["pills", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pills").select("*").eq("status", "published")
        .order("date", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToPill);
    },
    retry: 1,
    staleTime: 60_000,
  });
  return data && data.length > 0 ? data : sortedPills();
}
