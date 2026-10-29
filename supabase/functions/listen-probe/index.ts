// One-off feasibility probe for candidate forum RSS/Atom feeds (fixed URL list, writes via service role).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { json } from "../_shared/listenAuth.ts";

const URLS = [
  "https://boards.hellobee.com/rss/board/ivf/topics",
  "https://boards.hellobee.com/rss/board/ttc/topics",
  "https://boards.hellobee.com/rss/board/pregnancy-amp-if/topics",
  "https://www.ohbaby.co.nz/forum/rss",
  "https://www.ohbaby.co.nz/ttc-ivf-pregnancy-loss/rss",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clean = (s: string) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  // No caller input is used: it only probes the fixed list above, so it runs without a sign-in.
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const rows: Record<string, unknown>[] = [];
  for (const url of URLS) {
    const row: Record<string, unknown> = { url, http_status: null, content_type: null, body_len: null, is_feed: false, item_count: 0, sample_titles: [], error: null };
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(25_000),
        headers: {
          "User-Agent": "FertilityCompass-listener/0.1 (feasibility probe)",
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
        },
      });
      const body = await res.text();
      row.http_status = res.status;
      row.content_type = res.headers.get("content-type");
      row.body_len = body.length;
      const items = body.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) ?? [];
      const looksFeed = /<rss|<feed|<entry|<item/i.test(body) && !/^\s*<!doctype html/i.test(body);
      row.is_feed = looksFeed && items.length >= 0 && /<rss|<feed/i.test(body);
      row.item_count = items.length;
      row.sample_titles = items.slice(0, 3).map((it) => clean(it.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")).filter(Boolean);
    } catch (e) {
      row.error = e instanceof Error ? e.message : String(e);
    }
    rows.push(row);
    await sleep(1500);
  }

  await admin.from("feed_probes").delete().in("url", URLS);
  const { error } = await admin.from("feed_probes").insert(rows);

  return json({
    db_error: error?.message ?? null,
    results: rows.map((r) => ({
      url: r.url, status: r.http_status, is_feed: r.is_feed, item_count: r.item_count,
      first_title: (r.sample_titles as string[])[0] ?? null, ...(r.error ? { error: r.error } : {}),
    })),
  });
});
