import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { accessBody, accessOrigin, clients, neutral, reply } from "../_shared/access.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(neutral);
  try {
    const parsed = accessBody.safeParse(await req.json());
    if (!parsed.success) return reply(neutral);
    const { email, origin } = parsed.data;
    const { admin, sender } = clients();
    const { data: allowed, error } = await admin.rpc("access_email_allowed", { candidate: email });
    if (error || !allowed) return reply(neutral);
    // Atomic per-address cooldown prevents parallel requests from flooding an authorized mailbox.
    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const { data: claimed, error: claimError } = await admin.from("allowed_users")
      .update({ last_link_sent_at: new Date().toISOString() }).eq("email", email)
      .or(`last_link_sent_at.is.null,last_link_sent_at.lt.${cutoff}`).select("id");
    if (claimError || !claimed?.length) {
      // Admins remain eligible even if their access-list row was deleted; avoid a public bypass of cooldown.
      return reply(neutral);
    }
    const { error: sendError } = await sender.auth.signInWithOtp({ email, options: { emailRedirectTo: accessOrigin(origin), shouldCreateUser: true } });
    if (sendError) {
      await admin.from("allowed_users").update({ last_link_sent_at: null }).eq("email", email);
      console.error("Access email delivery failed", sendError.status);
    }
  } catch { console.error("Access request unavailable"); }
  // Never expose membership, delivery errors, or credentials to a public caller.
  return reply(neutral);
});