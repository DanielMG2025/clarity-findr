// price-estimate — server-side aggregation of price_observations into a
// PriceEstimate. The client calls this instead of ever reading the RLS-locked
// price_observations table directly (raw rows never reach the browser).
//
// Mirrors the logic in src/modules/provenance/aggregate.ts (kept self-contained
// because Deno can't import the app's TS module / path aliases).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SOURCE_WEIGHT: Record<string, number> = {
  scraped_web: 0.3,
  aggregator: 0.3,
  public_report: 0.5,
  crowd: 0.6,
  b2b: 0.9,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HALF_LIFE_DAYS = 365;
const DEDUP_WINDOW_DAYS = 90;

interface ObsRow {
  source_id: string;
  source_kind: string;
  amount_eur: number;
  parse_confidence: number;
  inclusions: unknown;
  observed_at: string;
}

function timeDecay(observedAt: string, now: number): number {
  const t = new Date(observedAt).getTime();
  if (Number.isNaN(t)) return 0;
  const ageDays = Math.abs(now - t) / DAY_MS;
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
}

function weight(o: ObsRow, now: number): number {
  const kind = SOURCE_WEIGHT[o.source_kind] ?? 0.3;
  const parse = Math.max(0, Math.min(1, Number(o.parse_confidence)));
  const incl = o.inclusions === "unknown" ? 0.7 : 1;
  return kind * parse * timeDecay(o.observed_at, now) * incl;
}

function dedupe(rows: ObsRow[]): ObsRow[] {
  const groups = new Map<string, ObsRow[]>();
  for (const o of rows) {
    const key = o.source_id;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(o);
  }
  const windowMs = DEDUP_WINDOW_DAYS * DAY_MS;
  const out: ObsRow[] = [];
  for (const list of groups.values()) {
    const sorted = [...list].sort(
      (a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime(),
    );
    const kept: ObsRow[] = [];
    for (const o of sorted) {
      const t = new Date(o.observed_at).getTime();
      if (!kept.some((k) => Math.abs(new Date(k.observed_at).getTime() - t) <= windowMs)) kept.push(o);
    }
    out.push(...kept);
  }
  return out;
}

function median(vals: number[]): number {
  if (!vals.length) return 0;
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function inliers(rows: ObsRow[]): ObsRow[] {
  if (rows.length < 4) return rows;
  const m = median(rows.map((r) => r.amount_eur));
  if (m <= 0) return rows;
  return rows.filter((r) => r.amount_eur >= m * 0.35 && r.amount_eur <= m * 2.75);
}

function confidence(rows: ObsRow[]): "low" | "medium" | "high" {
  const kinds = new Set(rows.map((r) => r.source_kind));
  const crowd = rows.filter((r) => r.source_kind === "crowd").length;
  const n = rows.length;
  if (kinds.has("b2b") || crowd >= 5 || (kinds.has("public_report") && n >= 4)) return "high";
  if (n >= 3 && (kinds.has("crowd") || kinds.has("public_report"))) return "medium";
  if (n >= 5) return "medium";
  return "low";
}

const round10 = (n: number) => Math.round(n / 10) * 10;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { treatment, market } = await req.json().catch(() => ({}));
    if (!treatment || !market) {
      return new Response(JSON.stringify({ error: "treatment and market are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const empty = {
      treatment,
      market,
      range_min: 0,
      range_max: 0,
      expected: 0,
      confidence: "low",
      sample_size: 0,
      citations: [],
      empty: true,
    };

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from("price_observations")
      .select("source_id, source_kind, amount_eur, parse_confidence, inclusions, observed_at")
      .eq("treatment", treatment)
      .eq("market", market);

    if (error) {
      console.error("price-estimate query error:", error.message);
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = (data ?? []).filter((r: ObsRow) => Number(r.amount_eur) > 0);
    if (!rows.length) {
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    const kept = inliers(dedupe(rows));
    const weighted = kept.map((o) => ({ o, w: weight(o, now) })).filter((x) => x.w > 0);
    if (!weighted.length) {
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalW = weighted.reduce((s, x) => s + x.w, 0);
    const expected = weighted.reduce((s, x) => s + x.o.amount_eur * x.w, 0) / totalW;
    const amounts = weighted.map((x) => x.o.amount_eur);
    const citations = weighted
      .slice()
      .sort((a, b) => b.w - a.w)
      .slice(0, 6)
      .map(({ o, w }) => ({
        source_id: o.source_id,
        source_kind: o.source_kind,
        observed_at: o.observed_at,
        amount_eur: o.amount_eur,
        weight: Math.round((w / totalW) * 1000) / 1000,
      }));

    const estimate = {
      treatment,
      market,
      range_min: round10(Math.min(...amounts)),
      range_max: round10(Math.max(...amounts)),
      expected: round10(expected),
      confidence: confidence(weighted.map((x) => x.o)),
      sample_size: weighted.length,
      citations,
      empty: false,
    };

    return new Response(JSON.stringify(estimate), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("price-estimate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
