import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { NoObjectGeneratedError, Output, streamText } from "npm:ai@6";
import { z } from "npm:zod@4";
import { json, requireAdmin } from "../_shared/listenAuth.ts";

const MAX_SIGNALS = 125; // cost cap: posts sent to the model per run
const SNIPPET = 240;
const AUD = ["planners", "first-steps", "experienced", "men", "lgbt"] as const;

const Topic = z.object({
  question_en: z.string(), question_es: z.string(),
  answer_en: z.string(), answer_es: z.string(),
  audiences: z.array(z.enum(AUD)),
  mentions_estimate: z.number(),
  trend: z.enum(["up", "steady"]),
  source_forum: z.string(),
  source_url: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});
const Schema = z.object({ topics: z.array(Topic) });

const SYSTEM = `You distil anonymous forum posts about fertility into recurring topics for a patient education site.
Voice: a knowledgeable friend who walks beside you — warm, light, no judgement, never selling, never giving a diagnosis.
Rules:
- Return 5 or 6 topics. Each is a question MANY people ask, written in your own words.
- SYNTHESISE. Never copy sentences from posts. Never include usernames, names, ages+places, or any identifiable personal story.
- answer: 2–3 short sentences, plain non-idiomatic English; general, honest, and suggest talking to their medical team where relevant. No numbers you were not given.
- Spanish fields: natural Spanish from Spain, same warm tone.
- audiences: subset of planners (egg freezing / planning ahead), first-steps (just starting), experienced (several cycles / failures), men (male factor), lgbt (LGBTI+ family building).
- mentions_estimate: how many of the given posts touch this topic (integer).
- trend: "up" if it seems to be gaining attention this week, else "steady".
- source_forum: the subreddit where it appears most, like "r/IVF". source_url: the url of ONE representative post from the list (copy the url exactly).
- confidence: high if many posts across forums, medium if several, low if few.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = await requireAdmin(req);
  if (db instanceof Response) return db;
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured" }, 500);

  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const { data: signals, error } = await db.from("raw_signals")
    .select("subreddit,title,body,url").gte("fetched_at", since)
    .order("created_utc", { ascending: false }).limit(MAX_SIGNALS);
  if (error) return json({ error: error.message }, 500);
  if (!signals?.length) return json({ error: "No recent signals. Run ingest first." }, 400);

  const { data: run, error: runErr } = await db.from("listening_runs")
    .insert({ signals_fetched: signals.length, note: "manual run" }).select("id").single();
  if (runErr) return json({ error: runErr.message }, 500);

  const list = signals.map((s, i) =>
    `#${i + 1} [${s.subreddit}] ${s.url}\n${s.title}\n${(s.body ?? "").replace(/\s+/g, " ").slice(0, SNIPPET)}`).join("\n\n");

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  let topics: z.infer<typeof Topic>[] = [];
  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: SYSTEM,
      messages: [{ role: "user", content: `Posts (${signals.length}):\n\n${list}` }],
      output: Output.object({ schema: Schema }),
      abortSignal: req.signal,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] } },
    });
    for await (const _ of result.textStream) { /* drain stream */ }
    topics = (await result.output).topics;
  } catch (e) {
    const status = (e as any)?.statusCode ?? (e as any)?.lastError?.statusCode;
    const msg = NoObjectGeneratedError.isInstance(e) ? "The AI returned an unreadable result." : (e as Error).message;
    await db.from("listening_runs").update({ finished_at: new Date().toISOString(), note: `failed: ${msg}`.slice(0, 500) }).eq("id", run.id);
    return json({ error: msg }, status === 402 || status === 403 || status === 429 ? status : 500);
  }

  const validUrls = new Set(signals.map((s) => s.url));
  const rows = topics.slice(0, 6).map((t) => ({
    run_id: run.id,
    question_en: t.question_en.trim(), question_es: t.question_es.trim(),
    answer_en: t.answer_en.trim(), answer_es: t.answer_es.trim(),
    audiences: [...new Set(t.audiences)],
    mentions_estimate: Math.max(1, Math.round(t.mentions_estimate)),
    trend: t.trend, confidence: t.confidence,
    source_forum: t.source_forum.slice(0, 60),
    source_url: validUrls.has(t.source_url) ? t.source_url : null,
    status: "draft",
  }));
  const { error: insErr } = await db.from("conversation_topics").insert(rows);
  if (insErr) return json({ error: insErr.message }, 500);
  await db.from("listening_runs").update({ finished_at: new Date().toISOString(), topics_created: rows.length }).eq("id", run.id);
  return json({ run_id: run.id, signals_used: signals.length, topics_created: rows.length });
});
