import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ExplainRequest {
  assessment: {
    age: number;
    treatment_interest: string;
    budget_range: string;
    country_preference: string;
    diagnosis?: string[];
  };
  match: {
    clinic_name: string;
    country: string;
    city?: string | null;
    tier: string;
    estimated_price: number;
    price_low?: number;
    price_high?: number;
    success_rate?: number | null;
    rating?: number | null;
    sample_size: number;
    confidence: string;
    pricing_percentile: number;
    vs_country_avg_pct: number | null;
    volatility: number;
    composite_score: number;
    treatments_available: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as ExplainRequest;
    if (!body?.assessment || !body?.match) {
      return new Response(JSON.stringify({ error: "Missing assessment or match" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { assessment: a, match: m } = body;

    const systemPrompt = `You are a fertility decision assistant. Write concise, factual, empathetic explanations for why a specific clinic is a good (or weak) match for a patient. You never give medical advice. You always ground claims in the data provided. Output 3 short bullets, each under 20 words, in plain English. Use € for prices. Be honest if confidence is low.`;

    const userPrompt = `Patient profile:
- Age: ${a.age}
- Treatment of interest: ${a.treatment_interest}
- Budget range: ${a.budget_range}
- Country preference: ${a.country_preference}
${a.diagnosis?.length ? `- Diagnosis: ${a.diagnosis.join(", ")}` : ""}

Clinic match data:
- Clinic: ${m.clinic_name} (${m.city ?? ""}, ${m.country})
- Tier: ${m.tier}
- Estimated total: €${m.estimated_price.toLocaleString()}${
      m.price_low && m.price_high ? ` (community range €${m.price_low.toLocaleString()}–€${m.price_high.toLocaleString()})` : ""
    }
- Success rate: ${m.success_rate ?? "n/a"}%
- Rating: ${m.rating ?? "n/a"}/5
- Composite clinic score: ${m.composite_score}/100
- Pricing percentile vs candidates: ${m.pricing_percentile} (0=cheapest, 100=most expensive)
- vs country average: ${m.vs_country_avg_pct === null ? "n/a" : `${m.vs_country_avg_pct}%`}
- Price volatility (CV): ${(m.volatility * 100).toFixed(0)}%
- Data confidence: ${m.confidence} (based on ${m.sample_size} patient quotes)
- Treatments offered: ${m.treatments_available.join(", ")}

Write exactly 3 bullets explaining the fit. Order: (1) price/value, (2) clinical fit, (3) data confidence or geography. Return only the bullets, each starting with "• ".`;

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
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in workspace usage." }), {
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
    const explanation: string = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("clinic-explainer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
