import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

export const accessBody = z.object({ email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()), origin: z.string().optional() });
export const neutral = { message: "If your email is authorized, you'll receive an access link." };
export const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
export function clients() {
  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !service || !anon) throw new Error("Auth configuration unavailable");
  return { admin: createClient(url, service), sender: createClient(url, anon) };
}
export function accessOrigin(candidate?: string) {
  const fallback = "https://clarity-findr.lovable.app";
  if (!candidate) return fallback;
  try {
    const u = new URL(candidate);
    const preview = /^id-preview(?:[^.]*)--4fda3506-d608-461c-b6cf-e4e0499d7c41(?:\.[a-z0-9-]+)?\.lovable\.app$/.test(u.hostname);
    return (u.origin === fallback || u.origin === "http://localhost:8080" || (u.protocol === "https:" && preview)) ? u.origin : fallback;
  } catch { return fallback; }
}
type AccessClients = ReturnType<typeof clients>;
/**
 * The single magic-link sender used by request-access and join-via-referral.
 * Sends only to eligible addresses, with an atomic 60 s per-address cooldown.
 */
export async function sendAccessLink({ admin, sender }: AccessClients, email: string, origin?: string) {
  const { data: allowed, error } = await admin.rpc("access_email_allowed", { candidate: email });
  if (error || !allowed) return false;
  // An admin remains eligible even if their access-list entry was deleted.
  // Insert only when absent; do not reactivate a deliberately inactive row.
  await admin.from("allowed_users").upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  // Atomic per-address cooldown prevents parallel requests from flooding an authorized mailbox.
  const cutoff = new Date(Date.now() - 60_000).toISOString();
  const { data: claimed, error: claimError } = await admin.from("allowed_users")
    .update({ last_link_sent_at: new Date().toISOString() }).eq("email", email)
    .or(`last_link_sent_at.is.null,last_link_sent_at.lt.${cutoff}`).select("id");
  if (claimError || !claimed?.length) return false;
  const { error: sendError } = await sender.auth.signInWithOtp({ email, options: { emailRedirectTo: accessOrigin(origin), shouldCreateUser: true } });
  if (sendError) {
    await admin.from("allowed_users").update({ last_link_sent_at: null }).eq("email", email);
    console.error("Access email delivery failed", sendError.status);
    return false;
  }
  return true;
}
