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
        .eq("status", "published").order("created_at", { ascending: false }).limit(6);
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
