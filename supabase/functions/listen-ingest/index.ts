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
      let rows: Row[];
      let via = "json";
      if (res.ok) {
        rows = fromJson(await res.json(), sub);
      } else {
        // Reddit often blocks server IPs on .json; the public Atom feed is the fallback.
        await res.body?.cancel();
        const rss = await fetch(`https://www.reddit.com/r/${sub}/top/.rss?t=week&limit=${LIMIT}`, {
          headers: { "User-Agent": UA, Accept: "application/atom+xml" },
        });
        if (!rss.ok) { perSub[sub] = `json HTTP ${res.status}, rss HTTP ${rss.status}`; await rss.body?.cancel(); continue; }
        rows = fromAtom(await rss.text(), sub);
        via = "rss";
      }
      if (rows.length) {
        const { error, count } = await db.from("raw_signals")
          .upsert(rows, { onConflict: "source,external_id", ignoreDuplicates: true, count: "exact" });
        if (error) { perSub[sub] = `db: ${error.message}`; continue; }
        stored += count ?? 0;
      }
      perSub[sub] = `${rows.length} via ${via}`;
    } catch (e) {
      perSub[sub] = `error: ${(e as Error).message}`;
    }
  }
  return json({ fetched: perSub, new_signals: stored });
});

type Row = { source: string; subreddit: string; external_id: string; title: string; body: string; url: string; created_utc: string | null };

// Anonymised: author / username fields are never read or stored.
function fromJson(payload: any, sub: string): Row[] {
  return (payload?.data?.children ?? [])
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
}

const decode = (t: string) => t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#32;/g, " ").replace(/&amp;/g, "&");
const strip = (h: string) => decode(h).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// Atom fallback. The <author> element is deliberately ignored; the "submitted by /u/..." footer is cut from content.
function fromAtom(xml: string, sub: string): Row[] {
  const entries = xml.split("<entry>").slice(1);
  return entries.map((e) => {
    const pick = (tag: string) => e.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? "";
    const id = pick("id").replace(/^t3_/, "");
    const link = e.match(/<link href="([^"]+)"/)?.[1] ?? "";
    const content = strip(pick("content")).replace(/submitted by\s+\/u\/\S+.*$/i, "").replace(/\[link\]|\[comments\]/g, "").trim();
    const when = pick("published") || pick("updated");
    return {
      source: "reddit", subreddit: `r/${sub}`, external_id: id,
      title: strip(pick("title")).slice(0, 300), body: content.slice(0, BODY_MAX), url: decode(link),
      created_utc: when ? new Date(when).toISOString() : null,
    };
  }).filter((r) => r.external_id && r.title);
}
