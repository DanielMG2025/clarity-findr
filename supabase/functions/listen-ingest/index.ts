import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { json, requireAdmin } from "../_shared/listenAuth.ts";

// PROTOTYPE-GRADE: this reads Reddit's PUBLIC JSON endpoints with no OAuth app.
// It is fine for a low-volume, manual-trigger MVP only. Before any commercial or
// scaled use it MUST move to the official Reddit Data API (OAuth app, rate limits, ToS).
const SUBREDDITS = ["IVF", "infertility", "eggfreezing", "maleinfertility", "queerception"];
const LIMIT = 25;
const BODY_MAX = 1200;
const UA = "web:fertility-compass-listening:0.1 (prototype; low-volume manual research)";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = await requireAdmin(req);
  if (db instanceof Response) return db;

  const perSub: Record<string, number | string> = {};
  let stored = 0;
  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/top.json?t=week&limit=${LIMIT}`, {
        headers: { "User-Agent": UA, Accept: "application/json" },
      });
      if (!res.ok) { perSub[sub] = `HTTP ${res.status}`; await res.body?.cancel(); continue; }
      const payload = await res.json();
      // Anonymised: author / username fields are never read or stored.
      const rows = (payload?.data?.children ?? [])
        .map((c: any) => c?.data)
        .filter((p: any) => p && p.id && !p.stickied && !p.over_18)
        .map((p: any) => ({
          source: "reddit",
          subreddit: `r/${sub}`,
          external_id: String(p.id),
          title: String(p.title ?? "").slice(0, 300),
          body: String(p.selftext ?? "").slice(0, BODY_MAX),
          url: `https://www.reddit.com${p.permalink ?? ""}`,
          created_utc: p.created_utc ? new Date(p.created_utc * 1000).toISOString() : null,
        }));
      if (rows.length) {
        const { error, count } = await db.from("raw_signals")
          .upsert(rows, { onConflict: "source,external_id", ignoreDuplicates: true, count: "exact" });
        if (error) { perSub[sub] = `db: ${error.message}`; continue; }
        stored += count ?? 0;
      }
      perSub[sub] = rows.length;
    } catch (e) {
      perSub[sub] = `error: ${(e as Error).message}`;
    }
  }
  return json({ fetched: perSub, new_signals: stored });
});
