import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Pull aggregated stats grouped per country/treatment
    const [{ data: clinics }, { data: agg }] = await Promise.all([
      supabase.from("clinics").select("name, country, tier, total_estimated_price"),
      supabase
        .from("aggregated_pricing")
        .select("clinic_name, treatment_type, avg_price, sample_size, price_volatility"),
    ]);

    if (!clinics || !agg) {
      return new Response(JSON.stringify({ error: "Could not load data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build country/treatment summary
    const clinicCountry = new Map(clinics.map((c) => [c.name, c.country]));
    const clinicTier = new Map(clinics.map((c) => [c.name, c.tier]));

    type Bucket = { country: string; treatment: string; prices: number[]; volatilities: number[]; samples: number };
    const buckets = new Map<string, Bucket>();
    for (const row of agg) {
      const country = clinicCountry.get(row.clinic_name) ?? "Unknown";
      const key = `${country}__${row.treatment_type}`;
      let b = buckets.get(key);
      if (!b) {
        b = { country, treatment: row.treatment_type, prices: [], volatilities: [], samples: 0 };
        buckets.set(key, b);
      }
      b.prices.push(Number(row.avg_price));
      b.volatilities.push(Number(row.price_volatility ?? 0));
      b.samples += row.sample_size ?? 0;
    }

    const summary = Array.from(buckets.values()).map((b) => {
      const avg = b.prices.reduce((s, n) => s + n, 0) / b.prices.length;
      const min = Math.min(...b.prices);
      const max = Math.max(...b.prices);
      const avgVol = b.volatilities.reduce((s, n) => s + n, 0) / b.volatilities.length;
      return {
        country: b.country,
        treatment: b.treatment,
        avg_price: Math.round(avg),
        min_price: Math.round(min),
        max_price: Math.round(max),
        avg_volatility_pct: Math.round(avgVol * 100),
        sample_size: b.samples,
        clinic_count: b.prices.length,
      };
    });

    // Tier averages
    const tierBuckets = new Map<string, number[]>();
    for (const c of clinics) {
      if (!c.total_estimated_price) continue;
      const arr = tierBuckets.get(c.tier) ?? [];
      arr.push(c.total_estimated_price);
      tierBuckets.set(c.tier, arr);
    }
    const tierStats = Array.from(tierBuckets.entries()).map(([tier, prices]) => ({
      tier,
      avg_price: Math.round(prices.reduce((s, n) => s + n, 0) / prices.length),
      count: prices.length,
    }));

    const systemPrompt = `You are a fertility market analyst. Generate sharp, data-grounded insights about fertility treatment pricing across countries and clinic tiers. Every insight must reference numbers from the provided data. Never invent statistics. No medical advice.`;

    const userPrompt = `Here is the current aggregated market data.

By country & treatment:
${JSON.stringify(summary, null, 2)}

By clinic tier:
${JSON.stringify(tierStats, null, 2)}

Generate exactly 5 short market insights. Each:
- One single sentence, max 22 words
- Must cite at least one number (€ amount, %, or sample size)
- Cover different angles: cross-country price gaps, tier differences, volatility, value clinics, age/treatment dynamics
- Start with a strong noun phrase, no fluff intro

Return ONLY a JSON object: { "insights": ["...", "...", ...] }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_insights",
              description: "Return the list of market insights.",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    minItems: 3,
                    maxItems: 6,
                    items: { type: "string" },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_insights" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    let insights: string[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        insights = Array.isArray(parsed.insights) ? parsed.insights : [];
      } catch (e) {
        console.error("Failed to parse tool args:", e);
      }
    }

    return new Response(JSON.stringify({ insights, summary, tierStats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
