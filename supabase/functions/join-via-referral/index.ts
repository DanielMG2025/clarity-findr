import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { clients, reply, sendAccessLink } from "../_shared/access.ts";

const code = z.string().trim().regex(/^[A-Za-z0-9_-]{4,32}$/);
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("info"), code }),
  z.object({ action: z.literal("join"), code, email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()), origin: z.string().max(200).optional() }),
  // No-email beta join (client flag FEATURES.noEmailBetaJoin): returns a one-time sign-in token instead of emailing it.
  z.object({ action: z.literal("join_direct"), code, name: z.string().trim().min(1).max(80), email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()), origin: z.string().max(200).optional() }),
]);
const closed = { active: false, has_capacity: false };
const ATTEMPTS_PER_HOUR = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ ok: false, reason: "invalid" }, 405);
  let action = "info";
  try {
    const raw = await req.json().catch(() => null);
    action = raw?.action === "join" || raw?.action === "join_direct" ? "join" : "info";
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
    const direct = parsed.data.action === "join_direct";
    // Simple per-email throttle; the seat cap itself is enforced inside referral_join.
    const since = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await admin.from("referral_join_attempts").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", since);
    if ((count ?? 0) >= ATTEMPTS_PER_HOUR) return reply({ ok: false, reason: "limited" });
    await admin.from("referral_join_attempts").insert({ email });

    if (direct) {
      const name = (parsed.data as { name: string }).name;
      const { data: existing } = await admin.from("allowed_users").select("id, active, no_email_join").eq("email", email).maybeSingle();
      let ownCode: string | undefined;
      if (existing) {
        // Only people who first joined this way may re-enter without email; everyone else keeps the magic link.
        if (!existing.active || !existing.no_email_join) { await sendAccessLink(access, email, origin); return reply({ ok: true, already: true, emailed: true }); }
      } else {
        const { data, error } = await admin.rpc("referral_join", { p_code: parsed.data.code, p_email: email });
        const result = data as { ok: boolean; reason?: string; already?: boolean; ownCode?: string } | null;
        if (error || !result) return reply({ ok: false, reason: "error" });
        if (!result.ok) return reply({ ok: false, reason: result.reason ?? "invalid" });
        ownCode = result.ownCode;
        await admin.from("allowed_users").update({ no_email_join: true, name }).eq("email", email).is("name", null);
        await admin.from("allowed_users").update({ no_email_join: true }).eq("email", email);
      }
      await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { name, full_name: name } }).catch(() => null);
      const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
      if (linkError || !link?.user || !link.properties?.hashed_token) return reply({ ok: false, reason: "error" });
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: link.user.id, _role: "admin" });
      if (isAdmin) { await sendAccessLink(access, email, origin); return reply({ ok: true, already: true, emailed: true }); }
      return reply({ ok: true, token_hash: link.properties.hashed_token, ownCode });
    }

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
