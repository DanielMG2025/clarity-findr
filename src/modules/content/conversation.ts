import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type TopicRow = Tables<"conversation_topics">;

export function useListeningForumCount(): number {
  const { data } = useQuery({ queryKey: ["listening-forum-count"], queryFn: async () => {
    const { data, error } = await supabase.rpc("listening_forum_count");
    if (error) throw error;
    return data;
  } });
  return data ?? 0;
}

/** Published forum-listening topics, newest first. Empty on error (the public section then hides). */
export function usePublishedTopics(): TopicRow[] {
  const { data } = useQuery({
    queryKey: ["topics", "published"],
    queryFn: async () => {
      const { data, error } = await supabase.from("conversation_topics").select("*")
        .eq("status", "published").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return data ?? [];
    },
    retry: 1,
    staleTime: 60_000,
  });
  return data ?? [];
}

const STOP = new Set(("the a an and or but if of to in on for with at by from is are was were be been am i im i'm my me we our you your it its this that these those so just not no do did does have has had can could would should will what when how why who about after before any all more most some than then there their they them also get got really very still now one two out up as like know think feel any ive i've dont don't doesnt didnt been being into over only even much because anyone else here week day days time first back going want need help thanks thank please".split(" ")));

/** Basic word frequency across signal titles + bodies; returns the top N terms. */
export function topKeywords(texts: string[], n = 20): { word: string; count: number }[] {
  const freq = new Map<string, number>();
  for (const t of texts) {
    const seen = new Set<string>();
    for (const w of t.toLowerCase().replace(/https?:\/\/\S+/g, " ").match(/[a-zà-ÿ0-9+-]{3,}/g) ?? []) {
      const word = w.replace(/^[-+]+|[-+]+$/g, "");
      if (word.length < 3 || STOP.has(word) || /^\d+$/.test(word) || seen.has(word)) continue;
      seen.add(word); // count once per post
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([word, count]) => ({ word, count }));
}

export type Period = "week" | "3m";
export interface TopicFilter { query: string; period: Period; platform: string | null; audience: string | null; treatment: string | null }

/** Platform family shown in the "listening to" header: "Reddit r/DOR" -> "Reddit". */
export function platformFamily(p: string): string {
  return p.split(/\s+r\/|\s*\/\s*/)[0].replace(/ ORG$/, "").trim();
}

/** Groups platforms by family for the forum dropdown; items keep the full platform value and a short label ("r/IVF"). */
export function groupPlatforms(platforms: string[]): { family: string; items: { value: string; label: string }[] }[] {
  const map = new Map<string, { value: string; label: string }[]>();
  for (const p of [...new Set(platforms)].sort((a, b) => a.localeCompare(b))) {
    const fam = platformFamily(p);
    const label = p.startsWith(`${fam} r/`) ? p.slice(fam.length + 1) : p;
    map.set(fam, [...(map.get(fam) ?? []), { value: p, label }]);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([family, items]) => ({ family, items }));
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Client-side filter: "week" shows only period=week; "3m" shows week + 3m; a non-empty query ignores period. Search is accent-insensitive substring. */
export function filterTopics<T extends Pick<TopicRow, "period" | "source_platform" | "audiences" | "treatment" | "treatment_en" | "question_en" | "question_es" | "answer_en" | "answer_es" | "geography">>(rows: T[], f: TopicFilter): T[] {
  const q = norm(f.query.trim());
  return rows.filter((r) =>
    (!!q || f.period === "3m" || r.period === "week") &&
    (!f.platform || r.source_platform === f.platform) &&
    (!f.audience || r.audiences.includes(f.audience)) &&
    (!f.treatment || r.treatment === f.treatment) &&
    (!q || norm([r.question_en, r.question_es, r.answer_en, r.answer_es, r.treatment, r.treatment_en, r.geography ?? ""].join(" ")).includes(q)));
}
