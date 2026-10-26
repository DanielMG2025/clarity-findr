import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { accessBody, accessOrigin, clients, reply } from "../_shared/access.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const { admin } = clients();
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return reply({ error: "Not signed in" }, 401);
    const { data: identity, error: authError } = await admin.auth.getUser(token);
    if (authError || !identity.user) return reply({ error: "Not signed in" }, 401);
    const { data: isAdmin, error: roleError } = await admin.rpc("has_role", { _user_id: identity.user.id, _role: "admin" });
    if (roleError || !isAdmin) return reply({ error: "Admin role required" }, 403);
    const parsed = accessBody.safeParse(await req.json());
    if (!parsed.success) return reply({ error: "Valid email required" }, 400);
    const { email, origin } = parsed.data;
    const { data: allowed, error } = await admin.rpc("access_email_allowed", { candidate: email });
    if (error) return reply({ error: "Access check unavailable" }, 503);
    if (!allowed) return reply({ error: "User is not active" }, 403);
    const redirect = accessOrigin(origin);
    const { data, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo: redirect } });
    if (linkError || !data.properties?.hashed_token) return reply({ error: "Could not create access link" }, 503);
    // Same-origin redemption avoids hosted redirect allow-list differences and never exposes the backend URL.
    const link = new URL(redirect);
    link.searchParams.set("access_token_hash", data.properties.hashed_token);
    await admin.from("allowed_users").update({ last_link_sent_at: new Date().toISOString() }).eq("email", email);
    return reply({ link: link.toString() });
  } catch { return reply({ error: "Could not create access link" }, 503); }
});