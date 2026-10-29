import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { json, requireAdmin } from "../_shared/listenAuth.ts";
import { parseFeed, safeUrl } from "../_shared/rssSignals.ts";

// Manual, low-volume RSS listening. Respect source terms before scaling.
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = await requireAdmin(req);
  if (db instanceof Response) return db;
  const { data: sources, error } = await db.from("listen_sources").select("*").eq("active", true).order("created_at").limit(20);
  if (error) return json({ error: error.message }, 500);
  const results = [];
  let stored = 0;
  for (const source of sources ?? []) {
    const { data: run, error: runError } = await db.from("listening_runs").insert({ source: source.name, note: "manual RSS ingest" }).select("id").single();
    if (runError || !run) return json({ error: runError?.message ?? "Run could not be recorded" }, 500);
    let found = 0, added = 0, status = "failed", note = "";
    try {
      const url = safeUrl(source.feed_url);
      if (!url) throw new Error("A public HTTPS feed URL is required");
      const response = await fetch(url, { headers: { "User-Agent": "FertilityCompass-listener/0.1", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" }, signal: AbortSignal.timeout(10000), redirect: "error" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = await response.text();
      if (xml.length > 2000000 || !/<(rss|feed)\b/i.test(xml)) throw new Error("Not a supported feed");
      const items = parseFeed(xml, source.lang);
      found = items.length;
      for (const item of items) {
        const { count, error: existsError } = await db.from("raw_signals").select("id", { count: "exact", head: true }).eq("url", item.url);
        if (existsError) throw existsError;
        if (count) continue;
        const { error: insertError } = await db.from("raw_signals").insert({ ...item, source: "rss", source_name: source.name, lang: source.lang, subreddit: "", external_id: item.url, body: "" });
        if (insertError && insertError.code !== "23505") throw insertError;
        if (!insertError) added++;
      }
      status = "completed";
      note = "Anonymized thematic titles only; mentions are feed items, not unique people.";
    } catch (e) { note = e instanceof Error ? e.message : "Fetch failed"; }
    const { error: updateError } = await db.from("listening_runs").update({ items_found: found, items_new: added, signals_fetched: added, status, finished_at: new Date().toISOString(), note }).eq("id", run.id);
    if (updateError) return json({ error: updateError.message }, 500);
    stored += added;
    results.push({ source: source.name, items_found: found, items_new: added, status, note });
    await new Promise(r => setTimeout(r, 700));
  }
  return json({ sources: results, new_signals: stored });
});
