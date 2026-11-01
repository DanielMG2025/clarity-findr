import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { clients, reply, sendAccessLink } from "../_shared/access.ts";

const code = z.string().trim().regex(/^[A-Za-z0-9_-]{4,32}$/);
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("info"), code }),
  z.object({ action: z.literal("join"), code, email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()), origin: z.string().max(200).optional() }),
]);
const closed = { active: false, has_capacity: false };
const ATTEMPTS_PER_HOUR = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ ok: false, reason: "invalid" }, 405);
  let action = "info";
  try {
    const raw = await req.json().catch(() => null);
    action = raw?.action === "join" ? "join" : "info";
    const parsed = Body.safeParse(raw);
    if (!parsed.success) return reply(action === "join" ? { ok: false, reason: "invalid" } : closed);
    const access = clients();
    const { admin } = access;

    if (parsed.data.action === "info") {
      const { data, error } = await admin.rpc("referral_code_info", { p_code: parsed.data.code });
      const row = Array.isArray(data) ? data[0] : null;
      if (error || !row) return reply(closed);
      return reply({ owner_label: row.owner_label, type: row.type, active: row.active, has_capacity: row.has_capacity });
    }

    const { email, origin } = parsed.data;
    // Simple per-email throttle; the seat cap itself is enforced inside referral_join.
    const since = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await admin.from("referral_join_attempts").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", since);
    if ((count ?? 0) >= ATTEMPTS_PER_HOUR) return reply({ ok: false, reason: "limited" });
    await admin.from("referral_join_attempts").insert({ email });

    // Atomic: locks the inviter row, checks pause/active/cap, inserts access + new code, increments seats.
    const { data, error } = await admin.rpc("referral_join", { p_code: parsed.data.code, p_email: email });
    if (error || !data) return reply({ ok: false, reason: "error" });
    const result = data as { ok: boolean; reason?: string; already?: boolean; ownCode?: string };
    if (!result.ok) return reply({ ok: false, reason: result.reason ?? "invalid" });
    await sendAccessLink(access, email, origin);
    // An existing person's own code is never returned: the caller has not proven they own that email.
    return reply(result.already ? { ok: true, already: true } : { ok: true, ownCode: result.ownCode });
  } catch {
    console.error("Referral join unavailable");
    return reply(action === "join" ? { ok: false, reason: "error" } : closed);
  }
});
